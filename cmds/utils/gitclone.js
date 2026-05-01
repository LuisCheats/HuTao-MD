import fetch from 'node-fetch'

const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i

export default {
  command: ['gitclone'],
  category: 'downloader',

  run: async (client, m, args, command, text, usedPrefix) => {

    if (!args[0]) {
      return m.reply('🌱 Escribe la URL de un repositorio de *GitHub*')
    }

    if (!regex.test(args[0])) {
      return m.reply('🌱 Verifica que la *URL* sea de GitHub')
    }

    const match = args[0].match(regex)
    if (!match) return m.reply('❌ URL inválida')

    const user = match[1]
    const repo = match[2].replace(/\.git$/, '')

    const repoUrl = `https://api.github.com/repos/${user}/${repo}`
    const zipUrl = `https://api.github.com/repos/${user}/${repo}/zipball`

    try {
      await m.reply('🍃 Preparando descarga del repositorio…')

      const [repoRes, zipRes] = await Promise.all([
        fetch(repoUrl),
        fetch(zipUrl)
      ])

      if (!repoRes.ok || !zipRes.ok) {
        return m.reply('🌿 No se pudo obtener el repositorio')
      }

      const repoData = await repoRes.json()
      const buffer = Buffer.from(await zipRes.arrayBuffer())

      const caption =
`╭⎯⎯⎯⎯⎯⎯⎯⎯⎯
│  ⟢ 𝙂𝙄𝙏ℍ𝙐𝘽 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿 ⟣
├────────────────
│ ⟡ Nombre      :: ${repo}
│ ⟡ Autor       :: ${repoData.owner.login}
│ ⡡ Descripción :: ${repoData.description || 'Sin descripción'}
├────────────────
│ ⟡ URL         :: ${args[0]}
╰⎯⎯⎯⎯⎯⎯⎯⎯⎯`

      await client.sendMessage(
        m.chat,
        {
          document: buffer,
          fileName: `${repo}.zip`,
          mimetype: 'application/zip',
          caption
        },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      m.reply(
`╭⎯⎯⎯⎯⎯
│ ⟡ Error al ejecutar ${usedPrefix + command}
│ ⟡ ${e.message}
╰⎯⎯⎯⎯⎯`
      )
    }
  }
}
