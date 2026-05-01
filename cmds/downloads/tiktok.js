import { tiktokDownload } from '../../core/scrapers/tiktok.js'

export default {
  command: ['tiktok', 'tt'],
  category: 'downloader',

  run: async (client, m, args, usedPrefix, command) => {

    if (!args[0]) {
      return m.reply(
`╭──────────────
│ Ingrese enlace de TikTok
╰──────────────`)
    }

    if (!args[0].match(/tiktok\.com/)) {
      return m.reply(
`╭──────────────
│ Enlace no válido
╰──────────────`)
    }

    try {
      const data = await tiktokDownload(args[0])

      const caption =
`╭──────────────
│ TIKTOK DOWNLOAD
├──────────────
│ Titulo     :: ${data.title || '-'}
│ Autor      :: ${data.author || '-'}
│ Duracion   :: ${data.duration || 0}s
│ Likes      :: ${data.likes.toLocaleString()}
│ Vistas     :: ${data.plays.toLocaleString()}
│ Comentarios:: ${data.comments.toLocaleString()}
│ Compartidos:: ${data.shares.toLocaleString()}
├──────────────
│ Fuente     :: ${data.source}
╰──────────────`

      if (data.images && data.images.length) {

        const media = data.images.slice(0, 10).map(img => ({
          type: 'image',
          data: { url: img },
          caption
        }))

        return await client.sendAlbumMessage(m.chat, media, { quoted: m })
      }

      const video = data.nowatermark || data.watermark
      if (!video) throw new Error('No hay video disponible')

      await client.sendMessage(
        m.chat,
        {
          video: { url: video },
          caption,
          mimetype: 'video/mp4',
          fileName: 'tiktok.mp4'
        },
        { quoted: m }
      )

    } catch (e) {
      await m.reply(
`╭──────────────
│ Error en ${usedPrefix + command}
│ ${e.message}
╰──────────────`)
    }
  }
}