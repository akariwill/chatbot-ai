from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

def build_vectorstore(documents):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    split_docs = text_splitter.split_documents(documents)
    embedding_model = OpenAIEmbeddings(
        model="text-embedding-3-small",
        dimensions=768  #512, 768, 1536
    )
    vectorstore = FAISS.from_documents(split_docs, embedding_model)
    return vectorstore
