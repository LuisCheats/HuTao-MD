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
      const data = await getInstagramMedia(args[0])
      if (!data) return m.reply('《✧》 No se pudo obtener el contenido.')

      const caption =
        `ㅤ۟∩　ׅ　★ ໌　ׅ　🅘𝖦 🅓ownload　ׄᰙ\n\n` +
        `${data.title ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Usuario* › ${data.title}\n` : ''}` +
        `${data.caption ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Descripción* › ${data.caption}\n` : ''}` +
        `${data.like ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Likes* › ${data.like}\n` : ''}` +
        `${data.comment ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Comentarios* › ${data.comment}\n` : ''}` +
        `${data.views ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Vistas* › ${data.views}\n` : ''}` +
        `${data.duration ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Duración* › ${data.duration}\n` : ''}` +
        `${data.resolution ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Resolución* › ${data.resolution}\n` : ''}` +
        `${data.format ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Formato* › ${data.format}\n` : ''}` +
        `𖣣ֶㅤ֯⌗ ❀  ⬭ *Enlace* › ${args[0]}`

      if (data.type === 'video') {
        await client.sendMessage(
          m.chat,
          {
            video: { url: data.url },
            caption,
            mimetype: 'video/mp4',
            fileName: 'ig.mp4'
          },
          { quoted: m }
        )
      } else if (data.type === 'image') {
        await client.sendMessage(
          m.chat,
          {
            image: { url: data.url },
            caption
          },
          { quoted: m }
        )
      } else {
        throw new Error('Contenido no soportado.')
      }
    } catch (e) {
      await m.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`)
    }
  }
}

// 🔹 Función exclusiva con Kyoko para Instagram (detección mejorada)
async function getInstagramMedia(url) {
  const endpoint = `${BASE_URL}/instagram?apiKey=${API_KEY}&url=${encodeURIComponent(url)}`
  try {
    const res = await fetch(endpoint)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (json?.status === true && Array.isArray(json.data) && json.data.length) {
      const item = json.data[0]
      if (!item.url) return null
      
      // 🔥 Detección precisa de video vs imagen
      const urlLower = item.url.toLowerCase()
      const isVideo = urlLower.includes('.mp4') || 
                      urlLower.includes('.mov') || 
                      urlLower.includes('/video/') || 
                      urlLower.includes('?video') ||
                      /\.mp4\?/i.test(urlLower)
      
      return {
        type: isVideo ? 'video' : 'image',
        title: null,
        caption: null,
        like: null,
        comment: null,
        views: null,
        duration: null,
        resolution: null,
        format: isVideo ? 'mp4' : 'jpg',
        url: item.url,
        thumbnail: item.thumbnail || null
      }
    }
  } catch (e) {
    console.error('Kyoko Instagram error:', e)
  }
  return null
}