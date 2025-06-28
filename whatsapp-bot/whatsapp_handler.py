import subprocess
import sys
import json
import asyncio
from main import chatbot_response 

async def start_whatsapp_bot():
    print("🚀 Menjalankan WhatsApp Bot dengan Baileys...")

    process = await asyncio.create_subprocess_exec(
        "node", "whatsapp/bot.js",
        stdout=subprocess.PIPE,
        stdin=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    while True:
        line = await process.stdout.readline()
        if not line:
            break
        try:
            message_data = json.loads(line.decode().strip())
            sender = message_data.get("from")
            message = message_data.get("message")

            # Kirim ke model RAG untuk mendapatkan respon
            response = chatbot_response(message)

            # Kirim respon ke stdin Baileys
            response_json = json.dumps({"to": sender, "message": response})
            process.stdin.write((response_json + "\n").encode())    
            await process.stdin.drain()

        except Exception as e:
            print("❌ Error saat memproses pesan:", e)

if __name__ == "__main__":
    asyncio.run(start_whatsapp_bot())
