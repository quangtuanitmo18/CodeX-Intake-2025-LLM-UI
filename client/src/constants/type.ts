export const TokenType = {
  AccessToken: 'AccessToken',
  RefreshToken: 'RefreshToken',
} as const

export const Role = {
  Admin: 'admin',
  User: 'user',
} as const

export const RoleValues = [Role.Admin, Role.User] as const
