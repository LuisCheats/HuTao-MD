import { getDevice } from '@whiskeysockets/baileys';
import moment from 'moment-timezone';
import { bodyMenu, menuObject } from '../../core/commands.js';
import {
  mainMenuImage,
  categoryImages,
  categoryAliases,
  categoryNames
} from './menuConfig.js';

function normalize(text = '') {
  text = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  return text.endsWith('s') ? text.slice(0, -1) : text;
}

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
        return m.reply(`《✧》 La categoría *${args[0]}* no existe.\n\nCategorías: ${Object.keys(categoryAliases).join(', ')}`);
      }
      
      let messageContent = '';
      let finalBanner = banner;
      
      if (cat) {
        // Menú por categoría (texto normal)
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
        // === MENÚ PRINCIPAL CON BOTONES ===
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
      
      const isVideo = finalBanner?.includes('.mp4') || finalBanner?.includes('.webm');
      
      const options = {
        quoted: m,
        contextInfo: {
          mentionedJid: [m.sender],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: canalId,
            serverMessageId: '',
            newsletterName: canalName
          }
        }
      };
      
      if (!cat) {
        // Botones solo en el menú principal
        const sections = [{
          title: "📋 Categorías Disponibles",
          rows: Object.keys(categoryAliases).map(key => ({
            title: `📌 ${categoryNames[key] || key.toUpperCase()}`,
            description: `Ver comandos de ${categoryNames[key] || key}`,
            rowId: `${usedPrefix}menu ${key}`
          }))
        }];
        
        await client.sendMessage(m.chat, {
          text: messageContent,
          footer: `${botname || namebot} • ${tempo}`,
          buttonText: "Selecciona una categoría",
          sections,
          viewOnce: true,
          ...options
        });
      } else {
        // Envío normal para categorías
        await client.sendMessage(m.chat, isVideo ? {
          video: { url: finalBanner },
          gifPlayback: true,
          caption: messageContent,
          ...options
        } : {
          text: messageContent,
          ...options,
          contextInfo: {
            ...options.contextInfo,
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