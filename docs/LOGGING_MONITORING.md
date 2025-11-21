# Logging & Monitoring Strategy

This document describes the logging and monitoring approach for containerized services.

## Logging Strategy

### Overview

All containers follow the **12-factor app logging principle**: applications write logs to stdout/stderr, and Docker handles log collection and routing.

### Log Drivers

#### Default: JSON File Driver

The `docker-compose.yml` configures the `json-file` log driver for all services:

```yaml
logging:
  driver: 'json-file'
  options:
    max-size: '10m' # Rotate log files at 10MB
    max-file: '3' # Keep last 3 rotated files
    labels: 'service' # Include service labels
```

**Benefits:**

- Logs persist on the host filesystem
- Automatic log rotation prevents disk space issues
- Easy to tail: `docker compose logs -f [service-name]`

#### Production: External Log Drivers

For production deployments, configure external log drivers in `docker-compose.prod.yml`:

**Example: CloudWatch Logs (AWS)**

```yaml
logging:
  driver: 'awslogs'
  options:
    awslogs-group: '/codex/production'
    awslogs-region: 'us-east-1'
    awslogs-stream-prefix: 'server'
```

**Example: ELK Stack (syslog)**

```yaml
logging:
  driver: 'syslog'
  options:
    syslog-address: 'tcp://logstash:5000'
    tag: '{{.Name}}/{{.ID}}'
```

**Example: GCP Cloud Logging**

```yaml
logging:
  driver: 'gcplogs'
  options:
    gcp-project: 'your-project-id'
    labels: 'service,environment'
```

### Application Logging

#### Fastify Server

Fastify uses its built-in logger (Pino-based) which outputs structured JSON logs:

```typescript
const fastify = Fastify({
  logger: true, // Enables Pino logger
  // Logger outputs to stdout as JSON
})
```

**Log Format:**

```json
{
  "level": 30,
  "time": 1234567890,
  "pid": 123,
  "hostname": "server",
  "msg": "Server listening on http://0.0.0.0:4000"
}
```

**Log Levels:**

- `fatal` (60): Application crashes
- `error` (50): Errors requiring attention
- `warn` (40): Warning conditions
- `info` (30): Informational messages
- `debug` (20): Debug-level messages
- `trace` (10): Very detailed tracing

#### Nginx Access Logs

Nginx logs access requests to stdout (configured in `client/docker/nginx/default.conf`):

```
access_log /dev/stdout combined;
error_log /dev/stderr warn;
```

**Log Format:** Standard Nginx combined format

```
127.0.0.1 - - [25/Dec/2024:10:00:00 +0000] "GET /api/healthz HTTP/1.1" 200 15 "-" "curl/7.68.0"
```

### Viewing Logs

**All services:**

```bash
docker compose logs -f
```

**Specific service:**

```bash
docker compose logs -f server
docker compose logs -f web
```

**Last 100 lines:**

```bash
docker compose logs --tail=100 server
```

**Since timestamp:**

```bash
docker compose logs --since 30m server
```

**Filter by log level (if using structured JSON):**

```bash
docker compose logs server | jq 'select(.level >= 40)'  # Errors and warnings
```

## Monitoring

### Health Checks

Both services expose health check endpoints for monitoring:

#### Server Health Endpoint

**Endpoint:** `GET /healthz`

**Response:**

```json
{
  "ok": true
}
```

**Docker Compose Configuration:**

```yaml
healthcheck:
  test: ['CMD', 'curl', '-fsS', 'http://localhost:4000/healthz']
  interval: 30s
  timeout: 5s
  retries: 3
  start_period: 10s
```

**Usage:**

- Docker Compose automatically waits for `service_healthy` before starting dependent services
- External monitoring tools can poll `/healthz` endpoint
- Load balancers can use this for health checks

#### Web Health Endpoint

**Endpoint:** `GET /healthz`

**Response:**

```
ok
```

**Docker Compose Configuration:**

```yaml
healthcheck:
  test: ['CMD', 'wget', '-qO-', 'http://localhost:3000/healthz']
  interval: 30s
  timeout: 5s
  retries: 3
  start_period: 10s
```

### Metrics (Optional)

#### Fastify Metrics Endpoint

To enable Prometheus-style metrics, add a metrics plugin:

```typescript
// server/src/plugins/metrics.plugin.ts
import fastifyPlugin from 'fastify-plugin'

async function metricsPlugin(fastify: any) {
  fastify.get('/metrics', async (request: any, reply: any) => {
    // Return Prometheus-formatted metrics
    return {
      http_requests_total: 1234,
      http_request_duration_seconds: 0.5,
      // ... more metrics
    }
  })
}

export default fastifyPlugin(metricsPlugin)
```

**Scraping with Prometheus:**

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'codex-server'
    static_configs:
      - targets: ['server:4000']
```

#### Nginx Metrics

Nginx metrics can be exported using `nginx-prometheus-exporter` or by parsing access logs with Promtail/Logstash.

## Integration with External Stacks

### ELK Stack (Elasticsearch, Logstash, Kibana)

1. **Configure Logstash to receive Docker logs:**

```yaml
# docker-compose.yml (add to production override)
logging:
  driver: 'syslog'
  options:
    syslog-address: 'tcp://logstash:5000'
    tag: '{{.Name}}'
```

2. **Logstash pipeline configuration:**

```ruby
input {
  tcp {
    port => 5000
    codec => json_lines
  }
}

filter {
  if [tag] == "codex-server" {
    json {
      source => "message"
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "codex-logs-%{+YYYY.MM.dd}"
  }
}
```

3. **Visualize in Kibana:**

- Create index pattern: `codex-logs-*`
- Build dashboards for error rates, request counts, response times

### AWS CloudWatch

1. **Install CloudWatch agent or use AWS Logs driver:**

```yaml
# docker-compose.prod.yml
logging:
  driver: 'awslogs'
  options:
    awslogs-group: '/codex/production'
    awslogs-region: 'us-east-1'
    awslogs-stream-prefix: 'server'
    awslogs-create-group: 'true'
```

2. **Query logs in CloudWatch:**

```bash
# Find errors
fields @timestamp, @message
| filter @message like /error/
| sort @timestamp desc
| limit 100
```

### Datadog

1. **Install Datadog agent:**

```yaml
# docker-compose.prod.yml
services:
  datadog:
    image: datadog/agent:latest
    environment:
      - DD_API_KEY=${DD_API_KEY}
      - DD_LOGS_ENABLED=true
      - DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL=true
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /proc/:/host/proc/:ro
      - /sys/fs/cgroup/:/host/sys/fs/cgroup:ro
```

2. **Configure log labels:**

```yaml
logging:
  driver: 'json-file'
  options:
    labels: 'service,environment,datadog.logs.collect'
```

### Prometheus + Grafana

1. **Add Prometheus scrape config** (see Metrics section above)

2. **Create Grafana dashboards:**

- HTTP request rates
- Error rates (4xx, 5xx)
- Response time percentiles
- Container resource usage (CPU, memory)

3. **Alert rules:**

```yaml
# prometheus/alerts.yml
groups:
  - name: codex
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        annotations:
          summary: 'High error rate detected'
```

## Best Practices

### Structured Logging

- Use JSON format for easy parsing
- Include contextual fields: `requestId`, `userId`, `timestamp`
- Use appropriate log levels
- Avoid logging sensitive data (passwords, tokens)

### Log Rotation

- Configure log rotation to prevent disk space exhaustion
- Keep last N rotated files (default: 3)
- Set maximum file size (default: 10MB)

### Monitoring Alerts

- Set up alerts for:
  - High error rates (> 5% of requests)
  - Health check failures
  - High response times (p95 > 1s)
  - Container crashes/restarts

### Performance Impact

- Logging to stdout has minimal performance impact
- Avoid verbose logging in production (`level: 'info'` or higher)
- Use log sampling for high-traffic endpoints if needed

## Troubleshooting

### Logs Not Appearing

1. **Check service is running:**

   ```bash
   docker compose ps
   ```

2. **Check log driver:**

   ```bash
   docker inspect codex-server | jq '.[0].HostConfig.LogConfig'
   ```

3. **Check container logs directly:**
   ```bash
   docker logs codex-server
   ```

### High Disk Usage

1. **Check log file sizes:**

   ```bash
   docker system df
   ```

2. **Reduce log retention:**

   ```yaml
   logging:
     options:
       max-size: '5m' # Reduce from 10m
       max-file: '2' # Reduce from 3
   ```

3. **Clean old logs:**
   ```bash
   docker compose down
   docker system prune -a --volumes
   ```

### Missing Logs in External Systems

1. **Verify log driver configuration**
2. **Check network connectivity to log aggregator**
3. **Verify credentials/permissions for external services**
4. **Check log aggregator logs for errors**
