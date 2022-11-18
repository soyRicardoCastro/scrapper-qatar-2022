import puppeteer from 'puppeteer'

function formatString (str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z 0-9.]+/g, '')
}

export async function fetchDatabase () {
  try {
    const data = await fetch('https:quiniela-api.fly.dev/api/partidos')
      .then(data => data.json())

    const filteredData = data.filter(game => game.status === true)

    const date = new Date()

    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()

    const today = month < 10 ? `${day}/0${month}/${year}` : `${day}/${month}/${year}`

    const todayGames = filteredData.filter(game => game.date === today)

    return todayGames
  } catch (error) {
    console.error(error)
  }
}

export async function cool (req, res) {
  const todayGames = await fetchDatabase()

  await todayGames.forEach(game => {
    console.log(game)
    fetch('https://quiniela-api.fly.dev/api/scrapper',
      {
        equipoLocal: game.equipoLocal,
        equipoVisita: game.equipoVisita
      }, {
        method: 'POST'
      }).then(res => console.log('xs'))
  })
  console.log('xd')
  return res.status(200).send('xd')
}

export async function scrapperGame (req, res) {
  try {
    const { equipoLocal: local, equipoVisita: visita } = req.body

    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.setViewport({ width: 1280, height: 800 })
    await page.goto(`https://www.google.com/search?q=${local}+${visita}`)

    const data = await page.waitForSelector('#sports-app')

    if (data) {
      const nameLocal = await page.$eval('#sports-app > div > div.imso-hov.imso-mh.PZPZlf > div > div > div > div > div.imso_mh__tm-scr.imso_mh__mh-bd.imso-hov.imso_mh__nma > div > div.imso_mh__tm-a-sts > div.imso-ani.imso_mh__tas > div > div.imso_mh__first-tn-ed.imso_mh__tnal-cont.imso-tnol > div.imso_mh__tm-nm.imso-medium-font.imso_mh__tm-nm-ew > div > span', el => el.innerText)

      const nameVisita = await page.$eval('#sports-app > div > div.imso-hov.imso-mh.PZPZlf > div > div > div > div > div.imso_mh__tm-scr.imso_mh__mh-bd.imso-hov.imso_mh__nma > div > div.imso_mh__tm-a-sts > div.imso-ani.imso_mh__tas > div > div.imso_mh__second-tn-ed.imso_mh__tnal-cont.imso-tnol > div.imso_mh__tm-nm.imso-medium-font.imso_mh__tm-nm-ew > div > div', el => el.innerText)

      const golesLocal = await page.$eval('#sports-app > div > div.imso-hov.imso-mh.PZPZlf > div > div > div > div > div.imso_mh__tm-scr.imso_mh__mh-bd.imso-hov.imso_mh__nma > div:nth-child(1) > div.imso_mh__tm-a-sts > div.imso-ani.imso_mh__tas > div > div.imso_mh__scr-sep > div > div > div.imso_mh__l-tm-sc.imso_mh__scr-it.imso-light-font', el => el.innerText)

      const golesVisita = await page.$eval('#sports-app > div > div.imso-hov.imso-mh.PZPZlf > div > div > div > div > div.imso_mh__tm-scr.imso_mh__mh-bd.imso-hov.imso_mh__nma > div:nth-child(1) > div.imso_mh__tm-a-sts > div.imso-ani.imso_mh__tas > div > div.imso_mh__scr-sep > div > div > div.imso_mh__r-tm-sc.imso_mh__scr-it.imso-light-font', el => el.innerText)

      const statusGame = await page.$eval('#sports-app > div > div.imso-hov.imso-mh.PZPZlf > div > div > div > div > div.imso_mh__tm-scr.imso_mh__mh-bd.imso-hov.imso_mh__nma > div:nth-child(1) > div.imso_mh__stts-l.imso-ani.imso_mh__stts-l-cont > div > span', el => el.innerText)

      const isPlaying = statusGame !== 'Finalizado'
      const isFinishGame = statusGame === 'Finalizado'

      console.log({
        equipoLocal: formatString(nameLocal),
        equipoVisita: formatString(nameVisita),
        golesLocal,
        golesVisita,
        isPlaying,
        isFinishGame,
        statusGame
      })

      await browser.close()
    }
    return res.status(200).send('ok')
  } catch (error) {
    return res.status(201).send({
      isPlaying: false,
      isFinish: false
    })
  }
}
