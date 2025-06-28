from langchain_openai import OpenAIEmbeddings
import numpy as np
import os

# Daftar topik relevan
TOPIK_WIFI = [
    "Bagaimana cara pasang wifi?",
    "Berapa harga paket internet?",
    "Saya mengalami gangguan jaringan",
    "Nomor teknisi wifi",
    "Dimana lokasi kantor wifi?",
    "Bagaimana cara bayar tagihan wifi?",
    "Ada promo wifi?",
]

# Inisialisasi model embedding sekali saja
embedding_model = OpenAIEmbeddings(
    openai_api_key=os.getenv("OPENAI_API_KEY"),
    model="text-embedding-ada-002"
)

# Fungsi untuk mendapatkan embedding dari teks
def get_embeddings(texts: list[str]) -> list[list[float]]:
    return embedding_model.embed_documents(texts)

# Fungsi cosine similarity
def cosine_similarity(vec1, vec2):
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

# Fungsi utama untuk mengecek apakah pertanyaan relevan
def is_relevant_question(user_question: str, threshold: float = 0.80) -> bool:
    try:
        user_embedding = get_embeddings([user_question])[0]
        topik_embeddings = get_embeddings(TOPIK_WIFI)

        similarities = [cosine_similarity(user_embedding, topik_emb) for topik_emb in topik_embeddings]
        max_similarity = max(similarities)

        return max_similarity >= threshold
    except Exception as e:
        print("❌ Error dalam proses filtering topik:", e)
        return True  # fallback: izinkan pertanyaan masuk
