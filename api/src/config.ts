/**
 * Config from process.env (loaded by dotenv-cli or Bun in dev).
 */
export interface EnvConfig {
  SOUNDCLOUD_CLIENT_ID: string
  SOUNDCLOUD_SECRET: string
  PORT: number
}

export function getConfig(): EnvConfig {
  const clientId = process.env.SOUNDCLOUD_CLIENT_ID ?? ""
  const secret = process.env.SOUNDCLOUD_SECRET ?? ""
  const port = process.env.PORT ? Number(process.env.PORT) : 3000
  return { SOUNDCLOUD_CLIENT_ID: clientId, SOUNDCLOUD_SECRET: secret, PORT: port }
}
