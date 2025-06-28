const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    DisconnectReason,
    downloadMediaMessage
} = require('@whiskeysockets/baileys');

const { Boom } = require('@hapi/boom');
const P = require('pino');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { info } = require('console');

function getGreetingResponse(text) {
    const greetings = ['hi', 'halo', 'hai', 'assalamualaikum', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam', 'misi', 'permisi'];
    const normalized = text?.toLowerCase()?.trim();

    if (!normalized) return null;

    for (const greet of greetings) {
        if (normalized.includes(greet)) {
            const hour = new Date().getHours();
            let waktu = 'malam';
            if (hour >= 5 && hour < 11) waktu = 'pagi';
            else if (hour >= 11 && hour < 15) waktu = 'siang';
            else if (hour >= 15 && hour < 18) waktu = 'sore';

            return `Selamat ${waktu} juga! 😊 Ada yang bisa aku bantu? Kamu bisa tanya misalnya:\n- Paket WiFi yang tersedia\n- Cara pembayaran\n- Hubungi teknisi\n\nSilakan tanyakan ya~`;
        }
    }
    return null;
}

function getInfoResponse(text) {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('alamat') || lowerText.includes('lokasi') || lowerText.includes('kantor')) {
        return `📍 Lokasi kantor kami:\nPT. Telemedia Prima Nusantara\nhttps://www.google.com/maps/place/PT.+Telemedia+Prima+Nusantara/@-2.9325764,104.7025048,17z`;
    }

    if (lowerText.includes('teknisi') || lowerText.includes('perbaikan') || lowerText.includes('gangguan')) {
        return `🔧 Untuk perbaikan atau gangguan, silakan hubungi teknisi kami di: 0851-7205-1808`;
    }

    return null;
}


async function saveMedia(msg, sock, sender) {
    const mediaType = Object.keys(msg.message).find(key =>
        ['imageMessage', 'videoMessage', 'documentMessage', 'audioMessage', 'locationMessage'].includes(key)
    );
    if (!mediaType) return;

    const mediaMessage = msg.message[mediaType];
    const folderPath = path.join(__dirname, 'media', sender.replace(/[@:\.]/g, '_'));
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    let fileName = '';
    if (mediaType === 'locationMessage') {
        fileName = 'location_' + Date.now() + '.json';
        const locationData = {
            latitude: mediaMessage.degreesLatitude,
            longitude: mediaMessage.degreesLongitude,
            name: mediaMessage.name || '',
            address: mediaMessage.address || ''
        };
        fs.writeFileSync(path.join(folderPath, fileName), JSON.stringify(locationData, null, 2));
        console.log(`📍 Lokasi dari ${sender} disimpan.`);
        return;
    }

    const stream = await downloadMediaMessage(msg, "buffer", {}, {
        logger: P({ level: 'silent' }),
        reuploadRequest: sock.updateMediaMessage
    });

    switch (mediaType) {
        case 'imageMessage':
            fileName = 'image_' + Date.now() + '.jpg';
            break;
        case 'videoMessage':
            fileName = 'video_' + Date.now() + '.mp4';
            break;
        case 'audioMessage':
            fileName = 'audio_' + Date.now() + '.mp3';
            break;
        case 'documentMessage':
            fileName = mediaMessage.fileName || 'document_' + Date.now();
            break;
    }

    if (fileName) {
        const filePath = path.join(folderPath, fileName);
        fs.writeFileSync(filePath, stream);
        console.log(`💾 ${mediaType} dari ${sender} disimpan sebagai ${fileName}`);
    }
}


async function startSock() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' }))
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const isGroup = sender.endsWith('@g.us');
        if (isGroup) return; 

        await saveMedia(msg, sock, sender); 

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (!text) return;

        console.log(`📩 Pesan diterima dari ${sender}: ${text}`);

        const greetingReply = getGreetingResponse(text);
        if (greetingReply) {
            await sock.sendMessage(sender, { text: greetingReply });
            return;
        }

        const infoReply = getInfoResponse(text);
        if (infoReply) {
            await sock.sendMessage(sender, { text: infoReply });
            return;
        }

        const python = spawn('python3', ['../run_chatbot.py', text]);

        let output = '';
        python.stdout.on('data', (data) => {
            output += data.toString();
            console.log(`✅ Output dari Python: ${data.toString()}`);
        });

        python.stderr.on('data', (data) => {
            console.error(`❌ Error dari Python: ${data.toString()}`);
        });


        python.on('close', () => {
            const friendlyOutput = output.trim()
                .replace(/^/gm, '👉 ')
                .concat('\n\nKalau ada pertanyaan lain, tinggal chat aja ya 😊');
            sock.sendMessage(sender, { text: friendlyOutput });
        });
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect =
                lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Koneksi terputus. Reconnect?', shouldReconnect);
            if (shouldReconnect) {
                startSock();
            }
        } else if (connection === 'open') {
            console.log('✅ Terhubung ke WhatsApp!');
        }
    });
}

startSock();
