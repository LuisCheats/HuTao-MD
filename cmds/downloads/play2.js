import axios from 'axios'
import { ytDownload, ytSearch } from '../../core/scrapers/youtube.js'

const newsletterJid = '120363427395193986@newsletter'
const newsletterName = '𝓗𝓾𝓣𝓪𝓸-𝓜𝓓 𝓒𝓱𝓪𝓷𝓷𝓮𝓵'

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',

  run: async (client, m, args, usedPrefix, command) => {

    if (!args[0]) {
      return m.reply(`╔══════════════════╗\n║  YOUTUBE VIDEO   ║\n╠══════════════════╣\n║ Ingrese video o enlace\n╚══════════════════╝`)
    }

    try {
      await client.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

      let url = args.join(' ')
      if (!url.includes('youtu')) {
        const search = await ytSearch(url)
        if (!search || !search[0]) throw new Error('No encontré resultados.')
        url = search[0].url
      }

      let data = await ytDownload(url, 'video', '360p').catch(() => null)
      
      if (!data || !data.url) {
        data = await ytDownload(url, 'video', '720p').catch(() => null)
      }
      
      if (!data || !data.url) {
        data = await ytDownload(url, 'video', 'auto').catch(() => null)
      }

      if (!data || !data.url) throw new Error('Sin formatos disponibles en este momento.')

      const caption = `╔══════════════════╗
║  YOUTUBE VIDEO   ║
╠══════════════════╣
║ Titulo   : ${data.title || 'Desconocido'}
║ Canal    : ${data.author || 'Desconocido'}
║ Calidad  : ${data.quality || 'Procesando'}
║ Tamaño   : ${data.size || '---'}
╠══════════════════╣
║ Enlace   : ${url}
╚══════════════════╝`

      const contextInfo = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid,
          newsletterName,
          serverMessageId: 1
        }
      }

      await client.sendMessage(m.chat, { 
        image: { url: data.thumb }, 
        caption,
        contextInfo
      }, { quoted: m })

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

      await client.sendMessage(m.chat, { 
        video: { url: data.url }, 
        mimetype: 'video/mp4',
        fileName: `${data.title}.mp4`,
        contextInfo
      }, { quoted: m })

    } catch (e) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      await m.reply(`╔══════════════════╗\n║      ERROR       ║\n╠══════════════════╣\n║ Motivo: ${e.message}\n╚══════════════════╝`)
    }
  }
}
