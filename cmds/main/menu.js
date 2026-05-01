import fetch from 'node-fetch';
import { getDevice } from '@whiskeysockets/baileys';
import fs from 'fs';
import moment from 'moment-timezone';
import { bodyMenu, menuObject } from '../../core/commands.js';
import { categoryImages, categoryAliases, mainMenuImage } from '../../core/menuConfig.js';

import { exec } from 'child_process';
import { promisify } from 'util';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const execAsync = promisify(exec);
const ptvCache = new Map();

async function toVideoNote(url) {
  if (ptvCache.has(url)) return ptvCache.get(url);
  
  const tmpIn = `./tmp/ptv_in_${Date.now()}.mp4`;
  const tmpOut = `./tmp/ptv_out_${Date.now()}.mp4`;
  try {
    const res = await fetch(url);
    await pipeline(res.body, createWriteStream(tmpIn));
    await execAsync(
      `ffmpeg -y -threads 1 -i ${tmpIn} -t 60 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=480:480" -c:v libx264 -preset ultrafast -crf 28 -c:a aac -b:a 64k -movflags +faststart ${tmpOut}`
    );
    const buf = fs.readFileSync(tmpOut);
    ptvCache.set(url, buf);
    return buf;
  } finally {
    if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn);
    if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
  }
}

// Precargar el video principal
toVideoNote(mainMenuImage).catch(() => {});

function normalize(text = '') {
  text = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  return text.endsWith('s') ? text.slice(0, -1) : text;
}

const menuRun = async (client, m, args, usedPrefix, command) => {
  try {
    const now = new Date();
    const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Caracas' }));
    const tiempo = colombianTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/,/g, '');
    const tempo = moment.tz('America/Caracas').format('hh:mm A');
    
    const botId = client?.user?.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = global.db.data.settings[botId] || {};
    const botname = botSettings.botname || 'Hatsune Miku Bot';
    const namebot = botSettings.namebot || '';
    const banner = botSettings.banner || '';
    const owner = botSettings.owner || '';
    const canalId = botSettings.id || '';
    const canalName = botSettings.nameid || '';
    const link = botSettings.link || '';
    
    const isOficialBot = botId === global.client.user.id.split(':')[0] + '@s.whatsapp.net';
    const botType = isOficialBot ? 'Principal/Owner' : 'Sub Bot';
    const users = Object.keys(global.db.data.users).length;
    const device = getDevice(m.key.id);
    const sender = global.db.data.users[m.sender]?.name || 'Usuario';
    const time = client.uptime ? formatearMs(Date.now() - client.uptime) : "Desconocido";
    
    const input = normalize(args[0] || '');
    let cat = Object.keys(categoryAliases).find(k => categoryAliases[k].map(normalize).includes(input));
    
    if (!cat && args[0] && categoryAliases[args[0]]) cat = args[0];
    
    const category = cat ? ` para \`${cat}\`` : '. *(˶ᵔ ᵕ ᵔ˶)*';
    
    if (args[0] && !cat) {
      return m.reply(`💙 La categoría *\( {args[0]}* no existe.\n\nCategorías disponibles: * \){Object.keys(categoryAliases).join(', ')}*\n\n> Usa: *${usedPrefix}menu [categoría]*`);
    }
    
    const sections = menuObject;
    const content = cat ? String(sections[cat] || '') : Object.values(sections).map(s => String(s || '')).join('\n\n');
    let menuText = cat ? content : (bodyMenu ? String(bodyMenu || '') + '\n\n' + content : content);
    
    // Reemplazos
    const replacements = {
      $owner: owner ? (global.db.data.users[owner]?.name || owner.split('@')[0]) : 'Oculto',
      $botType: botType,
      $device: device,
      $tiempo: tiempo,
      $tempo: tempo,
      $users: users.toLocaleString(),
      $link: link,
      $cat: category,
      $sender: sender,
      $botname: botname,
      $namebot: namebot,
      $prefix: usedPrefix,
      $uptime: time
    };
    
    for (const [key, value] of Object.entries(replacements)) {
      menuText = menuText.replace(new RegExp(`\\${key}`, 'g'), value);
    }
    
    const categoryBanner = cat ? (categoryImages[cat] || banner) : mainMenuImage;
    
    if (cat) {
      // Menú de categoría específica
      if (categoryBanner.includes('.mp4') || categoryBanner.includes('.webm')) {
        const ptvBuffer = await toVideoNote(categoryBanner);
        const ptvMsg = await client.sendMessage(m.chat, { video: ptvBuffer, ptv: true, mimetype: 'video/mp4' }, { quoted: m });
        
        await client.sendMessage(m.chat, {
          text: menuText,
          contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardedNewsletterMessageInfo: { newsletterJid: canalId, newsletterName: canalName }
          }
        }, { quoted: ptvMsg });
      } else {
        await client.sendMessage(m.chat, {
          text: menuText,
          contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardedNewsletterMessageInfo: { newsletterJid: canalId, newsletterName: canalName },
            externalAdReply: {
              title: botname,
              body: namebot,
              thumbnailUrl: categoryBanner,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: m });
      }
    } else {
      // Menú principal con botones
      const ptvBuffer = await toVideoNote(mainMenuImage);
      const ptvMsg = await client.sendMessage(m.chat, {
        video: ptvBuffer,
        ptv: true,
        mimetype: 'video/mp4'
      }, { quoted: m });
      
      const categoryButtons = Object.keys(sections).map(key => ({
        buttonId: `menu_${key}`,
        buttonText: { displayText: `📌 ${key.toUpperCase()}` },
        type: 1
      }));
      
      const buttons = [
        ...categoryButtons,
        { buttonId: 'menu_all', buttonText: { displayText: '📋 VER MENÚ COMPLETO' }, type: 1 }
      ];
      
      const mainMessage = `╭━💙 MENU PRINCIPAL 💙━╮\n` +
        `│\n` +
        `│ 💙 *${botname}*\n` +
        `│ 👤 *Usuarios:* ${users.toLocaleString()}\n` +
        `│ ⏱️ *Uptime:* ${time}\n` +
        `│ 📱 *Tipo:* ${botType}\n` +
        `│\n` +
        `│ 💙 Selecciona una categoría:\n` +
        `╰━━━━━━━━━━━━━━━━━╯`;
      
      await client.sendMessage(m.chat, {
        image: { url: 'https://file.garden/ae-9DPf0ekWVe7ex/menu.png' },
        caption: mainMessage,
        footer: '💙 Hatsune Miku Bot',
        buttons: buttons,
        headerType: 4,
        contextInfo: {
          mentionedJid: [m.sender],
          isForwarded: true,
          forwardedNewsletterMessageInfo: { newsletterJid: canalId, newsletterName: canalName }
        }
      }, { quoted: ptvMsg });
    }
  } catch (e) {
    console.error(e);
    await m.reply(`> Ocurrió un error al mostrar el menú.\n> ${e.message}`);
  }
};

export default {
  command: ['menu', 'help', 'ayuda'],
  category: 'main',
  register: true,
  run: menuRun
};

export const menucompleto = {
  command: ['menucompleto', 'allmenu'],
  category: 'main',
  register: true,
  run: menuRun
};

// ==================== PROCESADOR DE BOTONES ====================
export async function processMenuButton(conn, m) {
  let buttonId = null;
  
  if (m.message?.buttonsResponseMessage) {
    buttonId = m.message.buttonsResponseMessage.selectedButtonId;
  } else if (m.message?.templateButtonReplyMessage) {
    buttonId = m.message.templateButtonReplyMessage.selectedId;
  } else if (m.message?.interactiveResponseMessage) {
    try {
      const params = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson || '{}');
      buttonId = params.id;
    } catch {}
  }
  
  if (!buttonId || !buttonId.startsWith('menu_')) return false;
  
  const category = buttonId.replace('menu_', '');
  const usedPrefix = global.prefix || '.';
  
  if (category === 'all') {
    return await menuRun(conn, m, [], usedPrefix, 'menucompleto');
  }
  
  if (categoryAliases[category]) {
    return await menuRun(conn, m, [category], usedPrefix, 'menu');
  }
  
  return false;
}

function formatearMs(ms) {
  const segundos = Math.floor(ms / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  return [dias && `\( {dias}d`, ` \){horas % 24}h`, `\( {minutos % 60}m`, ` \){segundos % 60}s`].filter(Boolean).join(" ");
}