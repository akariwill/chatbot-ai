import sys
from main import initialize_chatbot, chatbot_response

def main():
    if len(sys.argv) < 2:
        print("Tidak ada input yang diberikan.")
        return

    query = sys.argv[1].strip()
    if not query:
        print("Pertanyaan kosong.")
        return

    retriever, chat_model = initialize_chatbot()
    if not retriever or not chat_model:
        print("❌ Gagal inisialisasi chatbot.")
        return

    try:
        response = chatbot_response(query)

        if not response or response.strip() == "":
            print("Maaf, aku belum punya jawaban untuk itu 😔\nCoba tanya hal lain, misalnya:\n- Harga paket internet\n- Cara daftar\n- Info teknisi")
        else:
            print(response.strip())
    except Exception as e:
        print(f"❌ Error saat menghasilkan respons: {e}")

if __name__ == "__main__":
    main()
