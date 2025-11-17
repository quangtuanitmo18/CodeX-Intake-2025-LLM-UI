-- CreateIndex
CREATE INDEX "Conversation_accountId_deletedAt_idx" ON "Conversation"("accountId", "deletedAt");
