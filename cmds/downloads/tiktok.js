import fetch from 'node-fetch';

export default {
  command: ['tiktok', 'tt', 'tiktoksearch', 'ttsearch', 'tts'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {
    if (!args.length) {
      return m.reply(`《✧》 Por favor, ingresa un término de búsqueda o un enlace de TikTok.`)
    }
    const text = args.join(" ")
    const isUrl = /(?:https:?\/{2})?(?:w{3}|vm|vt|t)?\.?tiktok.com\/([^\s&]+)/gi.test(text)
    
    try {
      if (isUrl) {
        // 📥 Descarga por enlace usando API Kyoko
        const data = await getTikTokDownload(text)
        if (!data || !data.video_url) {
          return m.reply('ꕥ No se pudo obtener el video. Verifica el enlace o intenta más tarde.')
        }
        
        const caption = `ㅤ۟∩　ׅ　★ ໌　ׅ　🅣𝗂𝗄𝖳𝗈𝗄 🅓ownload　ׄᰙ

𖣣ֶㅤ֯⌗ ✎  ׄ ⬭ *Título:* ${data.title || 'Sin título'}
𖣣ֶㅤ֯⌗ ꕥ  ׄ ⬭ *Autor:* ${data.author || 'Desconocido'} ${data.username ? `@${data.username}` : ''}
𖣣ֶㅤ֯⌗ ⴵ  ׄ ⬭ *Duración:* ${data.duration || 'N/A'} s
𖣣ֶㅤ֯⌗ ❖  ׄ ⬭ *Likes:* ${(data.likes || 0).toLocaleString()}
𖣣ֶㅤ֯⌗ ❀  ׄ ⬭ *Comentarios:* ${(data.comments || 0).toLocaleString()}
𖣣ֶㅤ֯⌗ ✿  ׄ ⬭ *Vistas:* ${(data.views || 0).toLocaleString()}
𖣣ֶㅤ֯⌗ ☆  ׄ ⬭ *Compartidos:* ${(data.shares || 0).toLocaleString()}
𖣣ֶㅤ֯⌗ ☁︎  ׄ ⬭ *Fecha:* ${data.published || 'N/A'}
𖣣ֶㅤ֯⌗ ❒  ׄ ⬭ *Audio:* ${data.music || 'No disponible'}`.trim()
        
        await client.sendMessage(m.chat, { video: { url: data.video_url }, caption, mimetype: 'video/mp4', fileName: 'tiktok.mp4' }, { quoted: m })
        
        // Opcional: enviar también el audio si está disponible
        if (data.audio_url) {
          await client.sendMessage(m.chat, { audio: { url: data.audio_url }, mimetype: 'audio/mpeg', fileName: 'tiktok_audio.mp3' }, { quoted: m })
        }
      } else {
        // 🔍 Búsqueda por texto usando API Kyoko
        const results = await getTikTokSearch(text)
        if (!results || results.length === 0) {
          return m.reply(`《✧》 No se encontraron resultados para *${text}*.`)
        }
        
        const medias = results.slice(0, 10).map(v => {
          const caption = `ㅤ۟∩　ׅ　★ ໌　ׅ　🅣𝗂𝗄𝖳𝗈𝗄 🅢earch　ׄᰙ

𖣣ֶㅤ֯⌗ ✎  ׄ ⬭ *Título:* ${v.title || 'Sin título'}
𖣣ֶㅤ֯⌗ ꕥ  ׄ ⬭ *Autor:* ${v.author || 'Desconocido'} ${v.username ? `@${v.username}` : ''}
𖣣ֶㅤ֯⌗ ⴵ  ׄ ⬭ *Duración:* ${v.duration || 'N/A'} s
𖣣ֶㅤ֯⌗ ❖  ׄ ⬭ *Likes:* ${(v.likes || 0).toLocaleString()}
𖣣ֶㅤ֯⌗ ❀  ׄ ⬭ *Comentarios:* ${(v.comments || 0).toLocaleString()}
𖣣ֶㅤ֯⌗ ✿  ׄ ⬭ *Vistas:* ${(v.views || 0).toLocaleString()}
𖣣ֶㅤ֯⌗ ☆  ׄ ⬭ *Compartidos:* ${(v.shares || 0).toLocaleString()}
𖣣ֶㅤ֯⌗ ☁︎  ׄ ⬭ *Fecha:* ${v.published || 'N/A'}
𖣣ֶㅤ֯⌗ ❒  ׄ ⬭ *Audio:* ${v.music || 'No disponible'}`.trim()
          return { type: 'video', data: { url: v.video_url }, caption }
        })
        
        await client.sendAlbumMessage(m.chat, medias, { quoted: m })
      }
    } catch (e) {
      await m.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`)
    }
  },
}

// ========== FUNCIONES EXCLUSIVAS CON KYOKO API ==========

// 🔹 Descarga por enlace
async function getTikTokDownload(url) {
  
  const endpoint = `${api.url}/api/download/tiktok?apiKey=${api.key}&url=${encodeURIComponent(url)}`
  
  try {
    const res = await fetch(endpoint)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    
    if (json?.status === true && json.data) {
      const d = json.data
      // Formatear fecha Unix a string
      let fecha = ''
      if (d.published) {
        const date = new Date(d.published * 1000)
        fecha = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
      }
      return {
        title: d.title || '',
        author: d.author?.nickname || '',
        username: d.author?.username ? d.author.username.replace('@', '') : '',
        duration: d.duration || null,
        likes: d.stats?.likes || 0,
        comments: d.stats?.comments || 0,
        views: d.stats?.plays || 0,
        shares: d.stats?.shares || 0,
        published: fecha,
        music: d.music?.title ? `${d.music.title} - ${d.music.author}` : null,
        audio_url: d.music?.url || null,
        video_url: d.media?.no_watermark || d.media?.watermark || null
      }
    }
  } catch (e) {
    console.error('Error en descarga TikTok Kyoko:', e)
  }
  return null
}

// 🔹 Búsqueda por texto
async function getTikTokSearch(query) {
  const API_KEY = 'KYO-oFKYxF7H-XhO3IDxH'
  const endpoint = `https://kyoko.qzz.io/api/search/tiktok?apiKey=${API_KEY}&query=${encodeURIComponent(query)}`
  
  try {
    const res = await fetch(endpoint)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    
    if (json?.status === true && Array.isArray(json.data) && json.data.length) {
      return json.data.map(item => {
        let fecha = ''
        if (item.create_time) {
          const date = new Date(item.create_time * 1000)
          fecha = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
        }
        return {
          title: item.title || item.content_desc?.join(' ') || '',
          author: item.author?.nickname || '',
          username: item.author?.unique_id || '',
          duration: item.duration || null,
          likes: item.digg_count || 0,
          comments: item.comment_count || 0,
          views: item.play_count || 0,
          shares: item.share_count || 0,
          published: fecha,
          music: item.music_info?.title ? `${item.music_info.title} - ${item.music_info.author}` : null,
          video_url: item.play || item.wmplay || null
        }
      }).filter(v => v.video_url)
    }
  } catch (e) {
    console.error('Error en búsqueda TikTok Kyoko:', e)
  }
  return []
}