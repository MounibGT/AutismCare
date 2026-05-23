import sys, asyncio
sys.path.insert(0, r'D:\Telegram Desktop\cheminement-main\cheminement-main')
from backend.rag_system import AutismRAG

async def test():
    rag = AutismRAG('./chroma_db')
    await rag.initialize()
    res = rag.hybrid_search('What causes autism?', top_k=3)
    for r in res:
        doc = r['document']
        meta = r['metadata']
        print(f"LEN={len(doc)} SEM={r['semantic_score']:.3f} SCORE={r['score']:.3f}")
        print(f"CAT={meta.get('category')}")
        print(f"PREVIEW: {doc[:200]}")

asyncio.run(test())
