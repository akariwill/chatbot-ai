🔍 Algoritma & Formula yang Digunakan
Embedding (text-embedding-ada-002 dari OpenAI)

Fungsi: Mengubah teks (query dan dokumen) menjadi vektor angka berdimensi tinggi.

Algoritma: Transformer-based embedding model.

Tidak ada formula langsung di sisi Anda, tapi di balik layar menggunakan representasi dense vector untuk semantik.

Vector Similarity Search (FAISS)

Fungsi: Menemukan dokumen yang paling mirip dengan query dalam bentuk vektor.

Formula utama:
🔹 Cosine Similarity

similarity
(
𝐴
⃗
,
𝐵
⃗
)
=
𝐴
⃗
⋅
𝐵
⃗
∥
𝐴
⃗
∥
∥
𝐵
⃗
∥
similarity( 
A
 , 
B
 )= 
∥ 
A
 ∥∥ 
B
 ∥
A
 ⋅ 
B
 
​
 
Tapi karena FAISS menggunakan Inner Product untuk efisiensi (jika vektor dinormalisasi, inner product = cosine similarity).

Prompt Engineering (Chain Prompting)

Anda menggunakan stuff atau retrieval chain di LangChain.

Ini bukan algoritma matematis, tapi desain sistem:

Menggabungkan hasil retrieval (jawaban sebelumnya) ke dalam prompt.

Menyusun instruksi LLM agar merespons seperti CS (dengan sopan, informatif, dll.).

LLM Chat Completion (gpt-3.5-turbo)

Fungsi: Menghasilkan jawaban berdasarkan prompt.

Di balik layar menggunakan:

Transformer-based architecture

Token likelihood modeling (tidak eksplisit bagi user, tapi berbasis probabilitas setiap token sebagai output).

⚙️ Alur Ringkas Proses:
pgsql
Copy
Edit
User input
    ↓
Embed (OpenAI text-embedding-ada-002)
    ↓
Similarity Search (FAISS w/ Cosine / Inner Product)
    ↓
Ambil jawaban dari data (FAQ/retrieval)
    ↓
Gabungkan ke dalam prompt template
    ↓
LLM inference (ChatGPT)
    ↓
Keluarkan jawaban ke user

Model text-embedding-ada-002 dari OpenAI bekerja dengan cara mengubah teks menjadi representasi numerik berdimensi tinggi yang disebut embedding — yaitu vektor floating point yang mewakili makna semantik teks.

Berikut penjelasan cara kerjanya secara konseptual:

📌 1. Input: Potongan Teks
Teks yang dimasukkan bisa berupa:

Kalimat, paragraf, atau dokumen

Contoh: "assalamualaikum kak, ini wifinya ngelag ya?"

📌 2. Tokenisasi
Model memecah teks menjadi token (biasanya kata atau bagian dari kata), lalu mengubahnya menjadi angka berdasarkan kamus token OpenAI.

📌 3. Pemrosesan oleh Transformer
text-embedding-ada-002 adalah model transformer encoder-only, mirip dengan BERT, tapi disesuaikan untuk embedding.

Setiap token diproses dalam konteks keseluruhan teks, menghasilkan representasi vektor per-token yang saling terkait secara semantik.

📌 4. Pooling (Rata-rata atau strategi lain)
Vektor-vektor token diubah menjadi satu vektor berdimensi tetap (contohnya 1536 dimensi).

OpenAI tidak mengungkap detail persisnya, tapi kemungkinan besar menggunakan mean pooling:

𝑒
⃗
𝑡
𝑒
𝑥
𝑡
=
1
𝑛
∑
𝑖
=
1
𝑛
𝑡
⃗
𝑖
e
  
text
​
 = 
n
1
​
  
i=1
∑
n
​
  
t
  
i
​
 
Di mana 
𝑡
⃗
𝑖
t
  
i
​
  adalah embedding tiap token, dan 
𝑛
n adalah jumlah token.

📌 5. Output: Vektor Embedding
Output akhir: vektor float[] berdimensi 1536

Contoh: [0.023, -0.187, 0.004, ..., 0.031]

Vektor ini digunakan untuk:

Retrieval (miripnya dengan dokumen lain)

Clustering / Classification

Semantic Search

⚠️ Ciri Khas text-embedding-ada-002

Fitur	Keterangan
Model name	text-embedding-ada-002
Dimensi output	1536
Akurasi semantik	Lebih baik dari pendahulunya (ada-001)
Kecepatan & Biaya	Murah dan cepat, cocok untuk scale besar
Normalisasi vektor	Perlu Anda lakukan manual (jika perlu cosine similarity)
🚀 Aplikasi di Chatbot Anda
Embedding input user dan dokumen FAQ → dibandingkan pakai FAISS

Semakin dekat (semantik), semakin relevan

Embedding ini tidak tergantung urutan kata, tapi tergantung makna

✅ Konsep Dasar FAISS
FAISS (Facebook AI Similarity Search) adalah pustaka untuk pencarian vektor yang cepat dan efisien. Di chatbot Anda, FAISS digunakan untuk mencari dokumen paling relevan dengan membandingkan vektor embedding dari pertanyaan user terhadap vektor dokumen yang sudah disimpan.

🧠 Cara Kerja FAISS di Chatbot Anda
1. Dokumen Diembedding
Sebelum FAISS digunakan:

Semua dokumen FAQ dimasukkan ke text-embedding-ada-002

Hasil embedding → vektor 1536 dimensi

Vektor ini dimasukkan ke dalam index FAISS

python
Copy
Edit
index = FAISS.from_documents(docs, embedding_model)
2. Pertanyaan User Diembedding
Saat user mengirim pertanyaan seperti:

arduino
Copy
Edit
"assalamualaikum kak, ini wifinya ngelag ya?"
Langkahnya:

Embedding pertanyaan dihitung → vektor 1536 dimensi

python
Copy
Edit
query_vector = embedding_model.embed_query(user_input)
3. Pencocokan Vektor (Similarity Search)
FAISS mencari vektor dokumen dalam index yang paling mirip (dekat) dengan query vector.

Kemiripan dihitung pakai:

Cosine similarity (biasa digunakan)

Kadang juga L2 (Euclidean) distance tergantung konfigurasi index

FAISS mengembalikan dokumen dengan skor tertinggi

python
Copy
Edit
retrieved_docs = retriever.get_relevant_documents(user_input)
🔍 Visual Ilustrasi
yaml
Copy
Edit
Query vector:      [0.01, -0.2, 0.03, ...]
Dokumen 1 vector:  [0.01, -0.19, 0.03, ...]   → Cosine ≈ 0.98
Dokumen 2 vector:  [0.4, 0.1, -0.3, ...]      → Cosine ≈ 0.65
→ Hasil: Dokumen 1 dipilih sebagai paling relevan
⚙️ FAISS Index
FAISS menyimpan vektor dokumen dalam struktur data khusus (flat, HNSW, IVF, dsb.) untuk efisiensi pencarian:

Default: IndexFlatL2 atau IndexFlatIP (cosine similarity)

Anda kemungkinan memakai FAISS.from_documents(...) bawaan dari LangChain, yang default-nya pakai cosine similarity

🔁 Alur Sederhana
pgsql
Copy
Edit
User input → Embedding → FAISS Search → Dokumen Relevan → Prompt LLM
📌 Kesimpulan
FAISS memungkinkan chatbot Anda:

Menjawab pertanyaan berdasarkan semantik

Tidak hanya cocokkan kata, tapi makna

Cepat & scalable (bisa >10.000+ dokumen)

🧠 1. Apa Itu Prompt Engineering?
Prompt engineering adalah seni menyusun input (prompt) yang diberikan ke LLM agar hasilnya:

Akurat

Relevan

Ramah dan sesuai gaya bahasa

Konsisten sesuai tugas chatbot

Contoh prompt di chatbot Anda:

text
Copy
Edit
Anda adalah asisten pelanggan layanan WiFi yang profesional dan ramah. Gunakan informasi berikut (pertanyaan dan jawaban customer service sebelumnya) untuk membantu pelanggan. Jangan langsung menyalin jawaban. Pahami dulu konteks sebelum menjawab. Jika informasi tidak cukup relevan, jawab dengan sopan dan tawarkan bantuan tambahan.
Fungsi Prompt Ini:
Memberikan role: Asisten pelanggan profesional dan ramah

Menentukan aturan main: Jangan salin mentah, pahami dulu

Menangani fallback: Jika tidak cukup relevan, tawarkan bantuan lanjut

🔗 2. Apa Itu Prompt Chaining / Chain Prompting?
Chain prompting di LangChain (atau struktur serupa) adalah proses menyusun pipeline pemrosesan seperti ini:

🔄 Langkah-Langkah:
User Input ➜ "kak ini wifi ngelag ya"

Embedding ➜ Hasilkan vektor dari pertanyaan

FAISS Retrieval ➜ Ambil dokumen-dokumen relevan (top-K)

Gabungkan Dokumen + Pertanyaan User ke Prompt Template

Kirim ke LLM (GPT-3.5-turbo) ➜ Dapatkan jawaban final

Contoh Prompt Final yang Dikirim:
text
Copy
Edit
Anda adalah asisten pelanggan layanan WiFi yang profesional dan ramah.
Berikut pertanyaan dari pelanggan: assalamualaikum kak, ini wifinya ngelag ya?
Berikut informasi terkait dari basis data:
- Q: ini wifinya kenapa kok lag A: baik selamat malam pak
- Q: Assalamualaikum kak <Pesan ini diedit> Wifi nya gangguan ya dari tadi pagi A: waalaikumsalam pak ada yang bisa kami bantu

Gunakan informasi ini untuk menjawab, namun jangan menyalin. Pahami dan jawab dengan sopan.
⚙️ 3. Komponen Prompt Engineering di LangChain
LangChain memungkinkan pembuatan prompt chain dengan:

PromptTemplate ➜ Untuk menyusun prompt dengan variabel ({context}, {question})

LLMChain ➜ Untuk menjalankan LLM dengan prompt ini

RetrievalQA ➜ Untuk menggabungkan retrieval + LLM dalam satu alur

Atau: RunnableSequence ➜ Versi baru dari LangChain

📦 Ringkasan Alur Prompt Engineering + Chain
mermaid
Copy
Edit
flowchart LR
    A[User Question] --> B[Embedding]
    B --> C[Vector Search (FAISS)]
    C --> D[Retrieved Docs]
    D --> E[Prompt Template + Docs + Question]
    E --> F[LLM (GPT-3.5)]
    F --> G[Jawaban Akhir]
🧩 Kenapa Ini Penting?
Tanpa prompt engineering:

Jawaban bisa salah, tidak relevan, atau terlalu general

LLM bisa menebak-nebak tanpa cukup konteks

Tidak bisa mengatur gaya bicara (formal, sopan, ramah)

Dengan prompt engineering: ✅ Jawaban lebih sesuai konteks
✅ Gaya bahasa sesuai brand
✅ Bisa tambah aturan seperti fallback & batasan jawaban

🧠 Cara Kerja ChatCompletion di OpenAI GPT-3.5-turbo
📌 Ringkasan Alur:
Prompt akhir (berisi: role, context hasil retrieval, pertanyaan user) dikirim ke endpoint:
https://api.openai.com/v1/chat/completions

Endpoint ini memproses input berbasis format chat (bukan prompt teks biasa), yaitu format multi-message seperti ini:

json
Copy
Edit
[
  {"role": "system", "content": "Anda adalah asisten layanan pelanggan WiFi yang ramah..."},
  {"role": "user", "content": "assalamualaikum kak, ini wifinya ngelag ya?"},
  {"role": "assistant", "content": "[optional - bisa dikosongkan untuk permintaan baru]"}
]
LLM akan menganalisis seluruh konteks: instruksi + pertanyaan user + hasil retrieval (yang biasanya ditaruh di dalam sistem atau user message)

LLM membangkitkan respons secara auto-regresif berdasarkan konteks dan gaya yang diinginkan

Respons dikembalikan ke aplikasi Anda, kemudian ditampilkan ke pengguna.

🛠️ Detail Teknis di Kode Anda
Chatbot Anda kemungkinan besar memanggil fungsi seperti:

python
Copy
Edit
response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": final_prompt_with_retrieved_context}
    ],
    temperature=0.3,
    stream=False,  # atau True untuk streaming
)
🔍 Parameter Penting:
model: gpt-3.5-turbo (digunakan oleh Anda)

messages: Format percakapan, bukan single string prompt

temperature: Pengatur kreativitas jawaban (0 = deterministik, 1 = lebih variatif)

stream: Jika True, chatbot menerima respon secara bertahap (streaming)

💡 Mengapa LLM Bisa Memberi Jawaban Kontekstual?
Karena:

Anda menyisipkan hasil retrieval ke dalam user message atau system prompt

LLM telah dilatih dengan miliaran percakapan dan mampu merespons secara kontekstual dan natural

🔁 Integrasi dengan LangChain (jika digunakan)
Jika Anda menggunakan LangChain, LLM-nya dibungkus dalam ChatOpenAI dan dijalankan dengan semacam RunnableSequence seperti:

python
Copy
Edit
chain = prompt | ChatOpenAI()
result = chain.invoke({"context": retrieved_docs, "question": user_question})
⚠️ Risiko Tanpa Prompt & Context
Jika Anda mengirim pertanyaan tanpa context hasil retrieval, maka:

Jawaban bisa bersifat umum, tidak spesifik ke masalah pelanggan

Bisa hallucinate (mengarang jawaban)

Tidak sesuai SOP atau gaya bahasa brand Anda

📦 Penutup
Jadi, LLM Chat Completion bekerja dengan:

Menerima prompt akhir dalam format chat

Menganalisis instruksi dan isi pertanyaan serta context dari retrieval

Memberi jawaban yang paling relevan secara kontekstual dan natural

Langkah ini adalah jantung dari kecerdasan chatbot Anda.


Metode yang Anda gunakan untuk mengelola data histori pelanggan tersebut adalah data preprocessing dan ekstraksi percakapan terstruktur dari data tidak terstruktur (unstructured data). Secara lebih spesifik, metode yang digunakan mencakup:

Text Parsing
Anda menggunakan ekspresi reguler (regex) untuk mem-parsing teks chat WhatsApp berdasarkan pola waktu, pengirim, dan isi pesan.

Filtering
Anda menerapkan proses filtering untuk mengabaikan pesan yang tidak relevan seperti invoice, notifikasi pembayaran, dan pesan sistem.

Role Assignment dan Conversation Structuring
Dengan menggunakan logika kondisional, Anda memisahkan percakapan berdasarkan peran customer dan customer service (CS), lalu mengelompokkan satu unit percakapan menjadi pasangan tanya-jawab.

Data Aggregation
Anda menggabungkan hasil dari beberapa file chat menjadi satu dataset terstruktur dalam format JSON yang dapat digunakan untuk keperluan Retrieval Augmented Generation (RAG).

Data Cleaning
Anda juga menyatukan baris pesan dari peran yang sama menjadi satu kalimat panjang, yang merupakan bentuk sederhana dari data cleaning dan message merging.

Nama Metode Keseluruhan:
Rule-Based Text Preprocessing untuk Dataset Conversational AI

Metode ini umum digunakan pada tahapan awal data pipeline untuk chatbot berbasis LLM + RAG.

Tabel 3.1 — Alur Pengolahan Data Chatbot
No.	Tahapan	Deskripsi Proses	Output
1	Pengumpulan Data	Mengumpulkan file chat history pelanggan dari berbagai folder (Chat-1, Chat-2, dst) dalam format .txt.	File teks chat mentah (.txt)
2	Membaca File Chat	Membuka dan membaca baris per baris isi file chat menggunakan Python.	List baris chat
3	Ekstraksi Tanggal, Pengirim, Pesan	Menggunakan regex untuk mengekstrak format: tanggal - pengirim: pesan.	Format terstruktur per baris
4	Filtering Pesan Tidak Relevan	Menghapus pesan yang mengandung kata kunci seperti "invoice", "INV-", atau notifikasi otomatis lainnya.	Hanya menyisakan pesan relevan
5	Identifikasi Pengirim	Membedakan antara pengirim customer dan cs (customer service) berdasarkan nama atau label pada chat.	Pesan dikategorikan sebagai customer atau cs
6	Penggabungan Sesi Percakapan	Mengelompokkan pesan menjadi pasangan tanya-jawab (customer dan cs) agar membentuk satu konteks dialog.	Struktur pasangan QA
7	Penyimpanan Data ke Format JSON	Semua data yang telah diproses disimpan ke dalam file retrieval_data.json dalam format list of dicts.	File retrieval_data.json
8	Kesiapan untuk Proses Embedding	File JSON ini digunakan dalam proses embedding menggunakan text-embedding-ada-002 sebelum dimasukkan ke FAISS untuk pencarian semantik.	Data siap untuk indexing dan retrieval