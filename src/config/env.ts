import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

function buildDatabaseUrl(): string | null {
    if (process.env.DATABASE_URL) {
        return null
    }

    const dbType = process.env.DB_TYPE || 'mysql'
    const dbUser = process.env.DB_USER
    const dbPassword = process.env.DB_PASSWORD
    const dbHost = process.env.DB_HOST || 'localhost'
    const dbPort = process.env.DB_PORT || '3306'
    const dbName = process.env.DB_NAME || 'portal_dbs_tst'

    if (dbUser && dbPassword) {
        const encodedPassword = encodeURIComponent(dbPassword)
        return `${dbType}://${dbUser}:${encodedPassword}@${dbHost}:${dbPort}/${dbName}`
    }
    return null
}

const builtUrl = buildDatabaseUrl()
if (builtUrl && !process.env.DATABASE_URL) {
    process.env.DATABASE_URL = builtUrl
}

const envSchema = z.object({
    PORT: z.string().default('3333'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required. Provide either DATABASE_URL or DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME'),

    DB_TYPE: z.string().default('mysql'),
    DB_HOST: z.string().default('localhost'),
    DB_PORT: z.string().default('3306'),
    DB_USER: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_NAME: z.string().default('portal_dbs'),

    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

    APP_NAME: z.string().default('mobile-backend-base'),
    APP_URL: z.string().optional(),

    BCRYPT_ROUNDS: z.string().default('10'),
    CORS_ORIGIN: z.string(),

    TOTVS_API_BASE_URL: z.string().default('http://totvs-homolog.asperbras.com/dts/datasul-rest'),
    TOTVS_API_ENVIRONMENT: z.enum(['homolog', 'production']).default('homolog'),
})

function loadEnv() {
    try {
        return envSchema.parse(process.env)
    } catch (err) {
        if (err instanceof z.ZodError) {
            console.error('Invalid environment variables:\n')
            for (const issue of err.issues) {
                console.error(`- ${issue.path.join('.')}: ${issue.message}`)
            }
            console.error('\nCorrija o arquivo .env e tente novamente.\n')
            process.exit(1)
        }
        throw err
    }
}

export const env = loadEnv()
