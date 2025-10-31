import os
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import PyPDFLoader
from openai import OpenAI

CHROMA_DIR = "chroma_store"

def build_knowledge_base(api_key: str, docs_folder: str = "security_docs"):
    """Load PDFs from security_docs/ and store embeddings in Chroma."""
    os.makedirs(CHROMA_DIR, exist_ok=True)
    loader = PyPDFLoader(os.path.join(docs_folder, "nist_basics.pdf"))
    docs = loader.load_and_split()

    embeddings = OpenAIEmbeddings(api_key=api_key)
    Chroma.from_documents(docs, embeddings, persist_directory=CHROMA_DIR)
    print("✅ Knowledge base built.")

def retrieve_relevant_context(query: str, api_key: str, k: int = 3) -> str:
    """Return top-k most relevant text snippets for the user query."""
    vectordb = Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=OpenAIEmbeddings(api_key=api_key),
    )
    results = vectordb.similarity_search(query, k=k)
    return "\n\n".join([r.page_content for r in results])
