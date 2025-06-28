import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")

def get_llm():
    return ChatOpenAI(
        model="gpt-3.5-turbo",
        temperature=0,
        openai_api_key=openai_api_key,
    )

def get_embedding_model():
    return OpenAIEmbeddings(
        model="text-embedding-ada-002",
        openai_api_key=openai_api_key,
    )
