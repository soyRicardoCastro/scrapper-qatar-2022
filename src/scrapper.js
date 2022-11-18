import puppeteer from 'puppeteer'
import { formatString, fetchDatabase } from './utils/index.js'
import axios from 'axios'
import { GOLES_LOCAL, GOLES_VISITA, NAME_LOCAL, NAME_VISITA } from './utils/selectors.js'

const browser = await puppeteer.launch()
const page = await browser.newPage()

await page.setViewport({ width: 1280, height: 800 })

const todayGames = await fetchDatabase()

for (let i = 0; i < todayGames.length; i++) {
  const { equipoLocal, equipoVisita, golesLocal, golesVisita, isPlaying, isFinish, status, _id } = todayGames[i]
  const { nombre: nombreL } = equipoLocal
  const { nombre: nombreV } = equipoVisita
  const nombreLocal = formatString(nombreL)
  const nombreVisita = formatString(nombreV)

  await page.goto(`https://www.google.com/search?q=${nombreLocal}+${nombreVisita}`)
  const data = await page.waitForSelector('#sports-app')

  if (data) {
    console.log('👍 hay data')
    const statusGame = await page.$eval('#sports-app > div > div.imso-hov.imso-mh.PZPZlf > div > div > div > div > div.imso_mh__tm-scr.imso_mh__mh-bd.imso-hov.imso_mh__nma > div:nth-child(1) > div.imso_mh__stts-l.imso-ani.imso_mh__stts-l-cont > div > span', el => el.innerText)

    if (statusGame) {
      console.log('😁 hay status')
      const isPlaying = statusGame !== 'Finalizado'

      const nameLocalData = await page.$eval(NAME_LOCAL, el => el.innerText)
      const nameVisitaData = await page.$eval(NAME_VISITA, el => el.innerText)
      const golesLocalData = await page.$eval(GOLES_LOCAL, el => el.innerText)
      const golesVisitaData = await page.$eval(GOLES_VISITA, el => el.innerText)

      if (isPlaying) {
        const dataToSend = {
          status: false,
          isPlaying: true
        }

        if (nombreLocal === nameLocalData && nombreVisita === nameVisitaData) {
          dataToSend.golesLocal = golesLocalData
          dataToSend.golesVisita = golesVisitaData
        } else {
          dataToSend.golesLocal = golesVisitaData
          dataToSend.golesVisita = golesLocalData
        }

        console.log('😍 se esta jugando el partido, esto se esta enviando a la bd')

        await axios.put(`https://quiniela-api.fly.dev/api/updatePartido/${_id}`, dataToSend)
      } else if (status === false) {
        console.log('😂 jaja ya se sumaron antes')
      } else {
        const dataToSend = {
          status: false,
          isPlaying: false
        }

        if (nombreLocal === nameLocalData && nombreVisita === nameVisitaData) {
          dataToSend.golesLocal = golesLocalData
          dataToSend.golesVisita = golesVisitaData
        } else {
          dataToSend.golesLocal = golesVisitaData
          dataToSend.golesVisita = golesLocalData
        }

        await axios.put(`https://quiniela-api.fly.dev/api/updatePartido/${_id}`, dataToSend)
        await axios.put(`https://quiniela-api.fly.dev/api/finishPartido/${_id}`)
        console.log('😘 se ha sumado todo')
      }
    } else {
      console.log('😒 no existe el partido asi bro')
    }
  } else {
    console.log('🫥 no hay data')
  }

  console.log({ golesLocal, golesVisita, isPlaying, isFinish, status, nombreLocal, nombreVisita })
}
