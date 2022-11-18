import axios from 'axios'

const API_URL = 'https:quiniela-api.fly.dev/api/partidos'

export async function fetchDatabase () {
  try {
    const { data } = await axios.get(API_URL)

    const date = new Date()

    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()

    const today = month < 10 ? `${day}/0${month}/${year}` : `${day}/${month}/${year}`
    const todayGames = data.filter(game => game.date === today)

    const filteredData = todayGames.filter(game => game.status === true)

    return filteredData
  } catch (error) {
    console.error(error)
  }
}
