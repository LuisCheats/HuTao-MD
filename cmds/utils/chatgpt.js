import fetch from 'node-fetch'

const API_KEY = '7nonnly' // Tu API key de Kyoko
const BASE_URL = 'https://kyoko.qzz.io/api/ai/gemini'

export default {
  command: ['ia', 'gemini'],
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
    const botname = global.db.data.settings[botId]?.botname || 'Bot'
    const username = global.db.data.users[m.sender].name || 'usuario'
    const version = '2.0' // o la versión que uses
    const basePrompt = `Tu nombre es ${botname} y parece haber sido creada por 7Noonly. Tu versión actual es ${version}, Tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser divertida, y te encanta aprender. Lo más importante es que debes ser amigable con la persona con la que estás hablando. ${username}`
    try {
      const { key } = await client.sendMessage(m.chat, { text: `🧠 *Gemini* está procesando tu respuesta...` }, { quoted: m })
      await m.react('🔄')
      
      // Construir el prompt completo
      const fullPrompt = `${basePrompt}. Responde: ${text}`
      
      // Llamar a la API de Kyoko Gemini
      const responseText = await getGeminiResponse(fullPrompt)
      
      if (!responseText) {
        return client.reply(m.chat, '《✧》 No se pudo obtener una *respuesta* válida desde Gemini.', m)
      }
      
      await client.sendMessage(m.chat, { text: responseText.trim(), edit: key })
      await m.react('✅')
    } catch (e) {
      await m.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`)
    }
  },
}

// 🔹 Función exclusiva con Kyoko Gemini
async function getGeminiResponse(prompt) {
  const endpoint = `${BASE_URL}?apiKey=${API_KEY}&text=${encodeURIComponent(prompt)}`
  try {
    const res = await fetch(endpoint)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (json?.status === true && json.data?.response) {
      return json.data.response
    }
  } catch (e) {
    console.error('Kyoko Gemini error:', e)
  }
  return null
}