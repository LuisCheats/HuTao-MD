import fetch from 'node-fetch'

// API Kyoko
const API_KEY = 'KYO-oFKYxF7H-XhO3IDxH'
const BASE_URL = 'https://kyoko.qzz.io/api/download'

export default {
  command: ['instagram', 'ig'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {
    if (!args[0]) {
      return m.reply('《✧》 Por favor, ingrese un enlace de Instagram.')
    }
    if (!args[0].match(/instagram\.com\/(p|reel|share|tv|stories)\//)) {
      return m.reply('《✧》 El enlace no parece *válido*. Asegúrate de que sea de *Instagram*.')
    }
    try {
      const videoUrl = await getInstagramVideo(args[0])
      if (!videoUrl) {
        return m.reply('《✧》 No se pudo obtener el video. Verifica el enlace o intenta más tarde.')
      }

      const caption = `ㅤ۟∩　ׅ　★ ໌　ׅ　🅘𝖦 🅓ownload　ׄᰙ\n\n` +
        `𖣣ֶㅤ֯⌗ ❀  ⬭ *Enlace* › ${args[0]}`

      await client.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          caption,
          mimetype: 'video/mp4',
          fileName: 'instagram_video.mp4'
        },
        { quoted: m }
      )
    } catch (e) {
      await m.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`)
    }
  }
}

// 🔹 Función exclusiva con Kyoko para obtener la URL del video
async function getInstagramVideo(url) {
  const endpoint = `${BASE_URL}/instagram?apiKey=${API_KEY}&url=${encodeURIComponent(url)}`
  try {
    const res = await fetch(endpoint)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (json?.status === true && Array.isArray(json.data) && json.data.length) {
      const item = json.data[0]
      // Verificar que la URL sea de un video (contiene .mp4)
      if (item?.url && item.url.includes('.mp4')) {
        return item.url
      }
    }
  } catch (e) {
    console.error('Kyoko Instagram error:', e)
  }
  return null
}