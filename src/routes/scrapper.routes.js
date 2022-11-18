import { Router } from 'express'
import { scrapperGame, cool } from '../controllers/scrapper.controller.js'

const router = Router()

router.get('/scrapper/', scrapperGame)
router.get('/cool', cool)

export default router
