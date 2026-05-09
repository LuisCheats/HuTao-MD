import fetch from 'node-fetch'

const API_KEY = '7nonnly'
const BASE_URL = 'https://kyoko.qzz.io/api/ai/gemini'

export default {
  command: ['ia', 'chatgpt'],
  category: 'ai',
  run: async (client, m, args, usedPrefix, command) => {
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const isOficialBot = botId === global.client.user.id.split(':')[0] + '@s.whatsapp.net'
    const isPremiumBot = global.db.data.settings[botId]?.botprem === true
    const isModBot = global.db.data.settings[botId]?.botmod === true
    if (!isOficialBot && !isPremiumBot && !isModBot) {
      return client.reply(m.chat, `《✧》 El comando *${command}* no está disponible en *Sub-Bots.*`, m)
    }
    const text = args.join(' ').trim()
    if (!text) {
      return m.reply(`《✧》 Escriba una *petición* para que *Gemini* le responda.`)
    }
    try {
      const { key } = await client.sendMessage(m.chat, { text: `🧠 *Gemini* está procesando tu respuesta...` }, { quoted: m })
      await m.react('🔄')
      
      // Enviamos solo la pregunta del usuario, sin prompt base
      const responseText = await getGeminiResponse(text)
      
      if (!responseText) {
        return client.reply(m.chat, '《✧》 No se pudo obtener una *respuesta* válida desde Gemini.', m)
      }
      
      await client.sendMessage(m.chat, { text: responseText.trim(), edit: key })
      await m.react('✅')
    } catch (e) {
      await m.reply(`> Error inesperado al ejecutar *${usedPrefix + command}*.\n> [Error: *${e.message}*]`)
    }
  },
}

async function getGeminiResponse(pregunta) {
  const endpoint = `${BASE_URL}?apiKey=${API_KEY}&text=${encodeURIComponent(pregunta)}`
  try {
    const res = await fetch(endpoint)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    console.log('Respuesta de Kyoko Gemini:', JSON.stringify(json, null, 2)) // Log para depurar
    if (json?.status === true && json.data?.response) {
      return json.data.response
    }
  } catch (e) {
    console.error('Kyoko Gemini error:', e)
  }
  return null
}