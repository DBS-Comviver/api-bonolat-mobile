import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { env } from './config/env'
import routes from './routes'
import { errorMiddleware } from './middlewares/error.middleware'
import { swaggerSpec } from './config/swagger'

export const app = express()

const corsOptions: cors.CorsOptions = {
    origin:
        env.CORS_ORIGIN === '*'
            ? '*'
            : env.CORS_ORIGIN.includes(',')
                ? env.CORS_ORIGIN.split(',').map((o) => o.trim())
                : env.CORS_ORIGIN,
    credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
	customCss: '.swagger-ui .topbar { display: none }',
}))

app.use(routes)

app.get('/', (_, res) => {
    res.json({
        status: 'ok',
        message: `${env.APP_NAME} is running`,
        environment: env.NODE_ENV,
        docs: '/api-docs',
    })
})

app.use(errorMiddleware)
