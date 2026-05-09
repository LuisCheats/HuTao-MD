let isNumber = (x) => typeof x === 'number' && !isNaN(x)

function initDB(m, client) {
  const jid = client.user.id.split(':')[0] + '@s.whatsapp.net'

  const settings = global.db.data.settings[jid] ||= {}
  settings.self ??= false
  settings.prefix ??= ['/', '!', '.', '#']
  settings.commandsejecut ??= isNumber(settings.commandsejecut) ? settings.commandsejecut : 0
  settings.id ??= '120363427395193986@newsletter'
settings.nameid ??= "𝓚𝔂𝓸𝓴𝓸-𝓜𝓓 𝓒𝓱𝓪𝓷𝓷𝓮𝓵"
settings.type ??= 'Owner'
settings.link ??= 'kyoko.qzz.io'
settings.banner ??= 'https://raw.githubusercontent.com/LuisCheats/upload/refs/heads/main/3117052ddfa60199310cb51c069065db.jpg'
settings.icon ??= 'https://raw.githubusercontent.com/LuisCheats/upload/refs/heads/main/3117052ddfa60199310cb51c069065db.jpg'
settings.currency ??= 'Yenes'
settings.namebot ??= '𝓚𝔂𝓸𝓴𝓸'
settings.botname ??= '𝓚𝔂𝓸𝓴𝓸 - 𝓜𝓓'
settings.owner ??= '𝟕𝑵𝒐𝒐𝒏𝒍𝒚'

  const user = global.db.data.users[m.sender] ||= {}
  user.name ??= m.pushName
  user.exp = isNumber(user.exp) ? user.exp : 0
  user.level = isNumber(user.level) ? user.level : 0
  user.usedcommands = isNumber(user.usedcommands) ? user.usedcommands : 0
  user.pasatiempo ??= ''
  user.description ??= ''
  user.marry ??= ''
  user.genre ??= ''
  user.birth ??= ''
  user.metadatos ??= null
  user.metadatos2 ??= null

  const chat = global.db.data.chats[m.chat] ||= {}
  chat.users ||= {}
  chat.isBanned ??= false
  chat.welcome ??= false
  chat.goodbye ??= false
  chat.sWelcome ??= ''
  chat.sGoodbye ??= ''
  chat.nsfw ??= false
  chat.alerts ??= true
  chat.gacha ??= true
  chat.economy ??= true
  chat.adminonly ??= false
  chat.primaryBot ??= null
  chat.antilinks ??= true

  chat.users[m.sender] ||= {}
  chat.users[m.sender].stats ||= {}
  chat.users[m.sender].usedTime ??= null
  chat.users[m.sender].lastCmd = isNumber(chat.users[m.sender].lastCmd) ? chat.users[m.sender].lastCmd : 0
  chat.users[m.sender].coins = isNumber(chat.users[m.sender].coins) ? chat.users[m.sender].coins : 0
  chat.users[m.sender].bank = isNumber(chat.users[m.sender].bank) ? chat.users[m.sender].bank : 0
  chat.users[m.sender].afk = isNumber(chat.users[m.sender].afk) ? chat.users[m.sender].afk : -1
  chat.users[m.sender].afkReason ??= ''
  chat.users[m.sender].characters = Array.isArray(chat.users[m.sender].characters) ? chat.users[m.sender].characters : []
}

export default initDB;
