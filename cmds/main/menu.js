import fetch from 'node-fetch';
import { getDevice } from '@whiskeysockets/baileys';
import fs from 'fs';
import axios from 'axios';
import moment from 'moment-timezone';
import { bodyMenu, menuObject } from '../../core/commands.js';

function normalize(text = '') {
  text = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  return text.endsWith('s') ? text.slice(0, -1) : text;
}

function formatearMs(ms) {
  const segundos = Math.floor(ms / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  return [dias && `\( {dias}d`, ` \){horas % 24}h`, `\( {minutos % 60}m`, ` \){segundos % 60}s`].filter(Boolean).join(" ");
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
      const botname = botSettings.botname || 'Mi Bot';
      const namebot = botSettings.namebot || '';
      const banner = botSettings.banner || '';
      const owner = botSettings.owner || '';
      const canalId = botSettings.id || '';
      const canalName = botSettings.nameid || '';

      const isOficialBot = botId === global.client.user.id.split(':')[0] + '@s.whatsapp.net';
      const botType = isOficialBot ? 'Principal' : 'Sub Bot';
      const users = Object.keys(global.db.data.users).length;
      const device = getDevice(m.key.id);
      const sender = global.db.data.users[m.sender]?.name || 'Usuario';
      const time = client.uptime ? formatearMs(Date.now() - client.uptime) : "Desconocido";

      const alias = {
        anime: ['anime', 'reacciones'],
        downloads: ['downloads', 'descargas'],
        economia: ['economia', 'economy', 'eco'],
        gacha: ['gacha', 'rpg'],
        grupo: ['grupo', 'group'],
        nsfw: ['nsfw', '+18'],
        profile: ['profile', 'perfil'],
        sockets: ['sockets', 'bots'],
        stickers: ['stickers', 'sticker'],
        utils: ['utils', 'utilidades', 'herramientas']
      };

      const input = normalize(args[0] || '');
      const cat = Object.keys(alias).find(k => alias[k].map(normalize).includes(input));

      if (args[0] && !cat) {
        return m.reply(`《✧》 La categoria *\( {args[0]}* no existe, las categorias disponibles son: * \){Object.keys(alias).join(', ')}*.\n> Usa *${usedPrefix}menu* para ver todo.`);
      }

      // ==================== MENÚ CON BOTONES ====================
      const sections = menuObject;
      let content = cat ? String(sections[cat] || '') : Object.values(sections).map(s => String(s || '')).join('\n\n');

      let menuText = bodyMenu ? String(bodyMenu || '') + '\n\n' + content : content;

      const replacements = {
        $owner: owner ? (global.db.data.users[owner]?.name || owner.split('@')[0]) : 'Owner',
        $botType: botType,
        $device: device,
        $tiempo: tiempo,
        $tempo: tempo,
        $users: users.toLocaleString(),
        $sender: sender,
        $botname: botname,
        $namebot: namebot,
        $prefix: usedPrefix,
        $uptime: time
      };

      for (const [key, value] of Object.entries(replacements)) {
        menuText = menuText.replace(new RegExp(`\\${key}`, 'g'), value);
      }

      // Botones interactivos
      const buttons = [
        {
          buttonId: `${usedPrefix}menu`,
          buttonText: { displayText: "📋 MENÚ COMPLETO" },
          type: 1
        },
        {
          buttonId: `${usedPrefix}status`,
          buttonText: { displayText: "📊 ESTADO DEL BOT" },
          type: 1
        },
        {
          buttonId: `${usedPrefix}owner`,
          buttonText: { displayText: "👑 OWNER" },
          type: 1
        }
      ];

      // Si quieres un menú de selección por categorías (más avanzado como el segundo archivo):
      const listButton = {
        buttonId: "select_menu",
        buttonText: { displayText: "☰ VER CATEGORÍAS" },
        type: 4,
        nativeFlowInfo: {
          name: "single_select",
          paramsJson: JSON.stringify({
            title: "📌 Selecciona una categoría",
            sections: [
              {
                title: "Categorías Disponibles",
                rows: Object.keys(alias).map(cat => ({
                  title: cat.toUpperCase(),
                  description: `Ver comandos de ${cat}`,
                  id: `${usedPrefix}menu ${cat}`
                }))
              }
            ]
          })
        }
      };

      const finalButtons = [listButton, ...buttons];

      const messageOptions = banner.includes('.mp4') || banner.includes('.webm') ? {
        video: { url: banner },
        gifPlayback: true,
        caption: menuText,
        footer: `© ${botname}`,
        buttons: finalButtons,
        contextInfo: {
          mentionedJid: [m.sender],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: canalId,
            serverMessageId: '',
            newsletterName: canalName
          }
        }
      } : {
        text: menuText,
        footer: `© ${botname}`,
        buttons: finalButtons,
        contextInfo: {
          mentionedJid: [m.sender],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: canalId,
            serverMessageId: '',
            newsletterName: canalName
          },
          externalAdReply: {
            title: botname,
            body: namebot || "Bot de WhatsApp",
            thumbnailUrl: banner,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      };

      await client.sendMessage(m.chat, messageOptions, { quoted: m });

    } catch (e) {
      console.error(e);
      await m.reply(`Ocurrió un error al mostrar el menú.\n${e.message}`);
    }
  }
};