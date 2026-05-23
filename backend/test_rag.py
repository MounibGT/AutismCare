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
        print()

    # Also test get_context_for_llm
    ctx = rag.get_context_for_llm('What causes autism?', max_tokens=2000)
    print(f"CONTEXT_LEN={len(ctx)}")
    print(f"CONTEXT_PREVIEW: {ctx[:300]!r}")

    # Test with smaller max_tokens
    ctx2 = rag.get_context_for_llm('What causes autism?', max_tokens=500)
    print(f"CTX_500_LEN={len(ctx2)}")
    print(f"CTX_500_PREVIEW: {ctx2[:300]!r}")

asyncio.run(test())
