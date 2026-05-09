import fetch from 'node-fetch'

const API_KEY = '7nonnly'
const BASE_URL = 'https://kyoko.qzz.io/api/tools/qr'

export default {
  command: ['qr', 'qrcode', 'generatorqr'],
  category: 'tools',
  run: async (client, m, args, usedPrefix, command) => {
    const text = args.join(' ')
    if (!text) {
      return m.reply(`《✧》 Ingresa el texto o enlace que deseas convertir en código QR.

• *Ejemplo:* ${usedPrefix + command} https://github.com
• *Ejemplo:* ${usedPrefix + command} Hola Mundo`)
    }

    try {
      await m.react('🔄')
      
      const qrUrl = `${BASE_URL}?apiKey=${API_KEY}&text=${encodeURIComponent(text)}`
      
      // Verificar que la API responda correctamente
      const testRes = await fetch(qrUrl, { method: 'HEAD' })
      if (!testRes.ok) throw new Error(`API respondió con ${testRes.status}`)
      
      const caption = `*➩ Código QR generado*

> ✩ Texto › ${text}
> ❀ Tamaño › 500x500
> ⴵ Formato › PNG
> ❖ Fuente › Kyoko API
> ☁︎ Creado por › *${global.botname || 'Bot'}*`

      await client.sendMessage(m.chat, {
        image: { url: qrUrl },
        caption: caption
      }, { quoted: m })
      
      await m.react('✅')
    } catch (e) {
      console.error('Error QR:', e)
      await m.reply(`《✧》 No se pudo generar el código QR.

> *Motivo:* ${e.message}
> *Sugerencia:* Verifica que el texto no sea demasiado largo o contenga caracteres especiales.`)
    }
  }
}