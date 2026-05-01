import PhoneNumber from 'awesome-phonenumber';

export default {
  command: ['owner', 'creador'],
  category: 'info',
  run: async (client, m, args) => {
    if (!m?.sender) return;

    try {
      const number = '50765836410';
      const jid = number + '@s.whatsapp.net';

      const contact = {
        number,
        name: 'Creador Principal',
        org: 'HuTao',
        email: 'jxmpier207oficial@gmail.com',
        region: 'Ni 🇳🇮',
        note: '🌱 Creador oficial de HuTao-MD.'
      };

      const generateVCard = ({ number, name, org, email, region, note }) => {
        const phone = new PhoneNumber('+' + number);
        const intl = phone.getNumber('international') || '+' + number;
        const clean = (text) => String(text).replace(/\n/g, '\\n').trim();

        return `
BEGIN:VCARD
VERSION:3.0
FN:${clean(name)}
ORG:${clean(org)}
TEL;type=CELL;waid=${number}:${intl}
EMAIL:${clean(email)}
ADR:;;${clean(region)};;;;
NOTE:${clean(note)}
END:VCARD`.trim();
      };

      const vcard = generateVCard(contact);

      await client.sendMessage(
        m.chat,
        {
          contacts: {
            displayName: contact.name,
            contacts: [{ vcard, displayName: contact.name }]
          },
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363427395193986@newsletter",
              newsletterName: "",
              serverMessageId: 1
            }
          }
        },
        { quoted: m }
      );

    } catch (e) {
      console.log(e);
      await client.reply(m.chat, '🌱 Ocurrió un error al enviar los contacto de mi owner.', m);
    }
  }
}; 
