import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import scrapperRoutes from './routes/scrapper.routes.js'

const app = express()

app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

app.use(scrapperRoutes)

export default app
