import { getDevice } from '@whiskeysockets/baileys';
import moment from 'moment-timezone';
import { bodyMenu, menuObject } from '../../core/commands.js';

function normalize(text = '') {
  text = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  return text.endsWith('s') ? text.slice(0, -1) : text;
}

// ==================== CONFIGURACIÓN DE IMÁGENES ====================
const mainMenuImage = 'https://file.garden/ae-9DPf0ekWVe7ex/TikVid.io_7633242534839356692-hd.mp4';

const categoryImages = {
  anime: 'https://i.pinimg.com/736x/53/13/9a/53139a45b8a098588a4e1b6557ee8492.jpg',
  downloads: 'https://i.pinimg.com/736x/60/64/bb/6064bb9466503fd9e752f8db55d92ced.jpg',
  economia: 'https://pbs.twimg.com/media/Fi_HBmFUAAY6L9i.jpg',
  gacha: 'https://img.anmosugoi.com/file/media-sugoi/2023/06/Hatsune-Miku-celebra-sus-16-anos-con-un-festival-de-sorpresas-1.jpg',
  grupo: 'https://e0.pxfuel.com/wallpaper/459/137/desktop-wallpaper-the-vocaloid-crew-suits-crew-hatsune-miku-rin-and-len-kagamine-vocaloid-people-team-anime-group-megurine-luka.jpg',
  nsfw: 'https://i.pinimg.com/736x/95/92/63/95926316fbc8708df3245d45fabf3393.jpg',
  profile: 'https://i.pinimg.com/736x/cf/4f/bd/cf4fbdccb346330efd7f02c60f52c6d0.jpg',
  sockets: 'https://i.pinimg.com/736x/46/8d/e3/468de3ae91716d0b8033fc2b0d85772f.jpg',
  stickers: 'https://i.pinimg.com/236x/7f/f1/04/7ff10431e8ab905b86498cbe94a0dbf1.jpg',
  utils: 'https://e1.pxfuel.com/desktop-wallpaper/532/937/desktop-wallpaper-hatsune-miku-1920x1080-hatsune-miku-thumbnail.jpg'
};

const categoryAliases = {
  anime: ['anime', 'reacciones'],
  downloads: ['downloads', 'descargas'],
  economia: ['economia', 'economy', 'eco'],
  gacha: ['gacha', 'rpg'],
  grupo: ['grupo', 'group'],
  nsfw: ['nsfw', '+18'],
  profile: ['profile', 'perfil'],
  sockets: ['sockets', 'bots', 'config'],
  stickers: ['stickers', 'sticker'],
  utils: ['utils', 'utilidades', 'herramientas']
};

const categoryNames = {
  anime: 'ANIME',
  downloads: 'DESCARGAS',
  economia: 'ECONOMÍA',
  gacha: 'GACHA',
  grupo: 'GRUPO',
  nsfw: 'NSFW',
  profile: 'PERFIL',
  sockets: 'CONFIG',
  stickers: 'STICKERS',
  utils: 'UTILIDADES'
};
// =================================================================

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const now = new Date();
      const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Caracas' }));
      const tiempo = colombianTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/,/g, '');
      const tempo = moment.tz('America/Caracas').format('hh:mm A');
      
      const botId = client?.user?.id.split(':')[0] + '@s.whatsapp.net';
      const botSettings = global.db.data.settings[botId] || {};
      
      const botname = botSettings.botname || '';
      const namebot = botSettings.namebot || '';
      const banner = botSettings.banner || '';
      const canalId = botSettings.id || '';
      const canalName = botSettings.nameid || '';
      
      const isOficialBot = botId === global.client.user.id.split(':')[0] + '@s.whatsapp.net';
      const botType = isOficialBot ? 'Principal/Owner' : 'Sub Bot';
      
      const users = Object.keys(global.db.data.users).length;
      const time = client.uptime ? formatearMs(Date.now() - client.uptime) : "Desconocido";
      
      const input = normalize(args[0] || '');
      const cat = Object.keys(categoryAliases).find(k =>
        categoryAliases[k].map(normalize).includes(input)
      );
      
      if (args[0] && !cat) {
        return m.reply(`《✧》 La categoría *${args[0]}* no existe.\n\nCategorías disponibles: ${Object.keys(categoryAliases).join(', ')}`);
      }
      
      let messageContent = '';
      let finalBanner = banner;
      
      if (cat) {
        // Menú por categoría
        const content = String(menuObject[cat] || '');
        let menu = bodyMenu ? String(bodyMenu) + '\n\n' + content : content;
        
        const replacements = {
          $botType: botType,
          $users: users.toLocaleString(),
          $uptime: time,
          $botname: botname,
          $namebot: namebot,
          $prefix: usedPrefix,
        };
        
        for (const [key, value] of Object.entries(replacements)) {
          menu = menu.replace(new RegExp(`\\${key}`, 'g'), value);
        }
        
        messageContent = menu;
        finalBanner = categoryImages[cat] || banner;
      } else {
        // Menú Principal con Botones
        messageContent =
          `╭━💙 MENU PRINCIPAL 💙━╮
│
│ 💙 *${botname || namebot || 'Bot'}*
│
│ 👤 *Usuarios:* ${users.toLocaleString()}
│ ⏱️ *Uptime:* ${time}
│ 📱 *Tipo:* ${botType}
│
│ 💙 Selecciona una categoría:
╰━━━━━━━━━━━━━━━━━╯`;
        
        finalBanner = mainMenuImage;
      }
      
      const contextInfo = {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: canalId,
          serverMessageId: '',
          newsletterName: canalName
        }
      };
      
      if (!cat) {
        // === MENÚ CON BOTONES ===
        const sections = [{
          title: "📋 Categorías Disponibles",
          rows: Object.keys(categoryAliases).map(key => ({
            title: `📌 ${categoryNames[key]}`,
            description: `Ver comandos de ${categoryNames[key]}`,
            rowId: `${usedPrefix}menu ${key}`
          }))
        }];
        
        await client.sendMessage(m.chat, {
          text: messageContent,
          footer: `${botname || namebot} • ${tempo}`,
          buttonText: "Selecciona una categoría",
          sections,
          viewOnce: true,
          contextInfo
        });
      } else {
        // Envío normal para categorías
        const isVideo = finalBanner?.includes('.mp4') || finalBanner?.includes('.webm');
        
        await client.sendMessage(m.chat, isVideo ? {
          video: { url: finalBanner },
          gifPlayback: true,
          caption: messageContent,
          contextInfo
        } : {
          text: messageContent,
          contextInfo: {
            ...contextInfo,
            externalAdReply: {
              title: botname || namebot,
              body: namebot,
              thumbnailUrl: finalBanner,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        });
      }
      
    } catch (e) {
      console.error(e);
      await m.reply(`> Error al mostrar el menú:\n${e.message}`);
    }
  }
};

function formatearMs(ms) {
  const segundos = Math.floor(ms / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  return [dias && `\( {dias}d`, ` \){horas % 24}h`, `\( {minutos % 60}m`, ` \){segundos % 60}s`].filter(Boolean).join(" ");
}