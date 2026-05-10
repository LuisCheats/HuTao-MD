import yts from 'yt-search'
import fetch from 'node-fetch'
import { getBuffer } from '../../core/message.js'

// Configuración del newsletter
const newsletterJid = '120363427395193986@newsletter'
const newsletterName = '𝓚𝔂𝓸𝓴𝓸-𝓜𝓓 𝓒𝓱𝓪𝓷𝓷𝓮𝓵'

const API_KEY = 'KYO-oFKYxF7H-XhO3IDxH'
const BASE_URL = 'https://kyoko.qzz.io/api/download'

export default {
  command: ['play', 'mp3', 'ytmp3', 'ytaudio', 'playaudio'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      if (!args[0]) {
        return m.reply('《✧》 Por favor, ingresa el nombre o URL del video.')
      }
      const text = args.join(' ')
      const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
      let url = null
      let title = null
      let thumbBuffer = null
      
      if (videoMatch) {
        url = `https://youtu.be/${videoMatch[1]}`
        const search = await yts(url)
        if (search.all.length) {
          const info = search.all[0]
          title = info.title
          thumbBuffer = await getBuffer(info.image)
        }
      } else {
        const search = await yts(text)
        if (!search.all.length) throw new Error('No se encontraron resultados')
        const first = search.all[0]
        url = first.url
        title = first.title
        thumbBuffer = await getBuffer(first.image)
      }
      
      if (!url) return m.reply('《✧》 No se pudo obtener una URL válida.')
      
      const audioData = await getKyokoAudio(url)
      if (!audioData || !audioData.download_url) {
        return m.reply('《✧》 No se pudo obtener el audio desde la api.')
      }
      
      // ✅ Mensaje original SIN decoración de caja
      const infoMessage = `➩ Descargando audio › *${title || audioData.title}*

> ⴵ Duración › *${audioData.duration || 'N/A'} s*
> ❀ Formato › *mp3*
> ✩ Fuente › *Kyoko API*
> ❒ Enlace original › *${url}*`
      
      // Contexto del newsletter (solo esto se añade)
      const contextInfo = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid,
          newsletterName,
          serverMessageId: 1
        }
      }
      
      // Enviar imagen + caption con contexto
      if (thumbBuffer) {
        await client.sendMessage(m.chat, {
          image: thumbBuffer,
          caption: infoMessage,
          contextInfo
        }, { quoted: m })
      } else {
        await client.sendMessage(m.chat, { text: infoMessage, contextInfo }, { quoted: m })
      }
      
      // Enviar audio con el mismo contexto
      const audioBuffer = await getBuffer(audioData.download_url)
      await client.sendMessage(m.chat, {
        audio: audioBuffer,
        fileName: `${(title || audioData.title || 'audio').replace(/[^\w\s]/gi, '')}.mp3`,
        mimetype: 'audio/mpeg',
        contextInfo
      }, { quoted: m })
      
    } catch (e) {
      await m.reply(`> Error: ${e.message}`)
    }
  }
}

async function getKyokoAudio(url) {
  const endpoint = `${api.url}/api/download/ytaudio?apiKey=${api.key}&url=${encodeURIComponent(url)}`
  try {
    const res = await fetch(endpoint)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (json?.status === true && json.result?.download_url) {
      return {
        title: json.result.title,
        duration: json.result.duration,
        thumbnail: json.result.thumbnail,
        download_url: json.result.download_url
      }
    }
  } catch (e) {
    console.error('Kyoko error:', e)
  }
  return null
}