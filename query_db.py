import chromadb
from chromadb.utils import embedding_functions

def query_knowledge_base(user_question):
    # 1. Connect to the existing persistent database
    client = chromadb.PersistentClient(path="./portfolio_db")
    
    # 2. Load the same embedding model
    embedding_func = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )
    
    # 3. Access your collection
    collection = client.get_collection(
        name="harshit_portfolio",
        embedding_function=embedding_func
    )

    # 4. Perform the semantic search
    results = collection.query(
        query_texts=[user_question],
        n_results=2 # Return the top 2 most relevant chunks
    )

    print(f"\nUser Question: {user_question}")
    print("-" * 50)
    for i, doc in enumerate(results['documents'][0]):
        print(f"Retrieved Context {i+1}: {doc}")

if __name__ == "__main__":
    # Test it with a question a recruiter might ask
    query_knowledge_base("What kind of work did Harshit do at ISRO?")