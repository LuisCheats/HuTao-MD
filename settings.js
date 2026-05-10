import fs from 'fs';
import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath } from 'url'

global.owner = ['50765836410', '']
global.botNumber = ''

global.sessionName = 'Sessions/Owner'
global.version = '^1.0 - Beta'
global.dev = "LuisCheats"
global.links = {
api: 'celest.qzz.io',
channel: "",
github: "https://github.com/LuisCheats"
}
global.my = {
  ch: '120363427395193986@newsletter',
  name: '𝓗𝓾𝓣𝓪𝓸-𝓜𝓓 𝓒𝓱𝓪𝓷𝓷𝓮𝓵'
}

global.mess = {
socket: '《✧》 Este comando solo puede ser ejecutado por un Socket.',
admin: '《✧》 Este comando solo puede ser ejecutado por los Administradores del Grupo.',
botAdmin: '《✧》 Este comando solo puede ser ejecutado si el Socket es Administrador del Grupo.'
}

global.api = {
  url: 'https://kyoko.qzz.io',
  key: 'KYO-oFKYxF7H-XhO3IDxH'
}

global.APIs = {
kyoko: { url: "https://kyoko.qzz.io", key: "KYO-oFKYxF7H-XhO3IDxH" },
axi: { url: "https://apiaxi.i11.eu", key: null },
vreden: { url: "https://api.vreden.web.id", key: null },
nekolabs: { url: "https://api.nekolabs.web.id", key: null },
siputzx: { url: "https://api.siputzx.my.id", key: null },
delirius: { url: "https://api.delirius.store", key: null },
ootaizumi: { url: "https://api.ootaizumi.web.id", key: null },
stellar: { url: "https://api.yuki-wabot.my.id", key: "YukiBot-MD" },
apifaa: { url: "https://api-faa.my.id", key: null },
xyro: { url: "https://api.xyro.site", key: null },
yupra: { url: "https://api.yupra.my.id", key: null }
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  import(`${file}?update=${Date.now()}`)
})
