import fetch from 'node-fetch';
import { getDevice } from '@whiskeysockets/baileys';
import fs from 'fs';
import axios from 'axios';
import moment from 'moment-timezone';
import { bodyMenu, menuObject } from '../../nucleo/commands.js';
import { categoryImages, categoryAliases, mainMenuImage } from '../../nucleo/menuConfig.js';

import { exec } from 'child_process';
import { promisify } from 'util';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
const execAsync = promisify(exec);

const ptvCache = new Map();

async function toVideoNote(url) {
  if (ptvCache.has(url)) return ptvCache.get(url);
  
  if (!fs.existsSync('./tmp')) {
    fs.mkdirSync('./tmp');
  }
  
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
    
    const botId = client?.user?.id?.split(':')[0] + '@s.whatsapp.net';
    const botSettings = global?.db?.data?.settings?.[botId] || {};
    
    const botname = botSettings.botname || 'Bot';
    const namebot = botSettings.namebot || 'Bot';
    const banner = botSettings.banner || '';
    const owner = botSettings.owner || '';
    const canalId = botSettings.id || '';
    const canalName = botSettings.nameid || '';
    const prefix = botSettings.prefix || '.';
    const link = botSettings.link || (global.links?.api?.channel || '');
    
    const isOficialBot = botId === global?.client?.user?.id?.split(':')[0] + '@s.whatsapp.net';
    const botType = isOficialBot ? 'Principal/Owner' : 'Sub Bot';
    
    const users = Object.keys(global?.db?.data?.users || {}).length;
    const device = getDevice(m.key.id);
    
    const sender = global?.db?.data?.users?.[m.sender]?.name || 'Usuario';
    
    const time = client.uptime ? formatearMs(Date.now() - client.uptime) : "Desconocido";
    
    const input = normalize(args[0] || '');
    let cat = Object.keys(categoryAliases).find(k => categoryAliases[k].map(normalize).includes(input));
    
    if (!cat && args[0] && categoryAliases[args[0]]) {
      cat = args[0];
    }
    
    const category = cat ? ` para ${cat}` : '. *(˶ᵔ ᵕ ᵔ˶)*';
    
    if (args[0] && !cat) {
      return m.reply(`💙 La categoria *${args[0]}* no existe.\nCategorias: ${Object.keys(categoryAliases).join(', ')}`);
    }
    
    const sections = menuObject || {};
    const content = cat ?
      String(sections[cat] || '') :
      Object.values(sections).map(s => String(s || '')).join('\n\n');
    
    let menu = cat ?
      content :
      (bodyMenu ? String(bodyMenu) + '\n\n' + content : content);
    
    const categoryButtons = Object.keys(sections).map(key => ({
      buttonId: `menu_${key}`,
      buttonText: { displayText: key.toUpperCase() },
      type: 1
    }));
    
    const buttons = [
      ...categoryButtons,
      { buttonId: 'menu_all', buttonText: { displayText: '📋 COMPLETO' }, type: 1 }
    ];
    
    const replacements = {
      $owner: owner || 'Privado',
      $botType: botType,
      $device: device,
      $tiempo: tiempo,
      $tempo: tempo,
      $users: users.toString(),
      $link: link,
      $cat: category,
      $sender: sender,
      $botname: botname,
      $namebot: namebot,
      $prefix: usedPrefix,
      $uptime: time
    };
    
    for (const [key, value] of Object.entries(replacements)) {
      if (typeof menu === 'string') {
        menu = menu.replace(new RegExp(`\\${key}`, 'g'), value ?? '');
      }
    }
    
    const messageContent = cat ? menu : `╭━💙 MENU 💙━╮
│ 👤 Usuarios: ${users}
│ ⏱️ Uptime: ${time}
│ 📱 Tipo: ${botType}
╰━━━━━━━━━━`;
    
    const categoryBanner = cat ? (categoryImages?.[cat] || banner) : mainMenuImage;
    
    if (cat) {
      await client.sendMessage(m.chat, { text: messageContent }, { quoted: m });
    } else {
      const ptvBuffer = await toVideoNote(mainMenuImage);
      
      const ptvMsg = await client.sendMessage(m.chat, {
        video: ptvBuffer,
        ptv: true
      }, { quoted: m });
      
      await client.sendMessage(m.chat, {
        image: { url: 'https://file.garden/ae-9DPf0ekWVe7ex/menu.png' },
        caption: messageContent,
        buttons
      }, { quoted: ptvMsg });
    }
    
  } catch (e) {
    await m.reply(`Error: ${e.message}`);
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

function formatearMs(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  return `${d}d ${h%24}h ${m%60}m ${s%60}s`;
}