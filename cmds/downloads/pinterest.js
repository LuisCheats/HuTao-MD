import fetch from 'node-fetch'

export default {
  command: ['pinterest', 'pin'],
  category: 'search',
  run: async (client, m, args, command) => {
    const text = args.join(' ')
    const isPinterestUrl = /^https?:\/\//.test(text)
    if (!text) {
      return m.reply('《✧》 Por favor, ingresa un término de búsqueda o un enlace de Pinterest.')
    }
    try {
      if (isPinterestUrl) {
        // Descarga desactivada (solo se usa la API de Kyoko para búsqueda)
        const data = await getPinterestDownload(text)
        if (!data) return m.reply('ꕥ No se pudo obtener el contenido (solo se soporta búsqueda con la API de Kyoko).')
        // El resto del código de descarga se mantiene pero nunca se ejecutará porque data es null
        const caption = `ㅤ۟∩　ׅ　★　ׅ　🅟𝖨𝖭 🅓ownload　ׄᰙ　\n\n` + `${data.title ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Título* › ${data.title}\n` : ''}` + `${data.description ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Descripción* › ${data.description}\n` : ''}` + `${data.author ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Autor* › ${data.author}\n` : ''}` + `${data.username ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Usuario* › ${data.username}\n` : ''}` + `${data.followers ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Seguidores* › ${data.followers}\n` : ''}` + `${data.uploadDate ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Fecha* › ${data.uploadDate}\n` : ''}` + `${data.likes ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Likes* › ${data.likes}\n` : ''}` + `${data.comments ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Comentarios* › ${data.comments}\n` : ''}` + `${data.views ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Vistas* › ${data.views}\n` : ''}` + `${data.saved ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Guardados* › ${data.saved}\n` : ''}` + `${data.format ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Formato* › ${data.format}\n` : ''}` + `𖣣ֶㅤ֯⌗ ☆  ⬭ *Enlace* › ${text}`
        if (data.type === 'video') {
          await client.sendMessage(m.chat, { video: { url: data.url }, caption, mimetype: 'video/mp4', fileName: 'pin.mp4' }, { quoted: m })
        } else if (data.type === 'image') {
          await client.sendMessage(m.chat, { image: { url: data.url }, caption }, { quoted: m })
        } else {
          throw new Error('Contenido no soportado.')
        }
      } else {
        const results = await getPinterestSearch(text)
        if (!results || results.length === 0) {
          return m.reply(`《✧》 No se encontraron resultados para *${text}*.`)
        }
        const medias = results.slice(0, 10).map(r => ({ type: r.type === 'video' ? 'video' : 'image', data: { url: r.image }, caption: `ㅤ۟∩　ׅ　★　ׅ　🅟𝖨𝖭 🅢earch　ׄᰙ　\n\n` + `${r.title ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Título* › ${r.title}\n` : ''}` + `${r.description ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Descripción* › ${r.description}\n` : ''}` + `${r.name ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Autor* › ${r.name}\n` : ''}` + `${r.username ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Usuario* › ${r.username}\n` : ''}` + `${r.followers ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Seguidores* › ${r.followers}\n` : ''}` + `${r.likes ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Likes* › ${r.likes}\n` : ''}` + `${r.created_at ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Fecha* › ${r.created_at}\n` : ''}` }))
        await client.sendAlbumMessage(m.chat, medias, { quoted: m })
      }
    } catch (e) {
      await m.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`)
    }
  }
}

// Descarga desactivada (siempre retorna null)
async function getPinterestDownload(url) {
  return null
}

// Búsqueda exclusiva con la API de Kyoko
async function getPinterestSearch(query) {
  const endpoint = `https://kyoko.qzz.io/api/search/pinterest?apiKey=KYO-oFKYxF7H-XhO3IDxH&query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(endpoint).then(r => r.json());
    if (res?.status === true && Array.isArray(res.data) && res.data.length) {
      const mapped = res.data
        .filter(item => item.image_url || item.video_url)
        .map(item => {
          const isVideo = item.video_url && item.video_url.trim() !== '';
          return {
            type: isVideo ? 'video' : 'image',
            title: item.grid_title || null,
            description: item.description || null,
            name: item.pinner?.full_name || null,
            username: item.pinner?.username || null,
            followers: item.pinner?.follower_count || null,
            likes: null,
            created_at: item.created_at || null,
            image: isVideo ? item.video_url : item.image_url
          };
        });
      if (mapped.length) return mapped;
    }
  } catch (e) {
    console.error('Error fetching from Kyoko API:', e);
  }
  return [];
}