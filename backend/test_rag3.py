import sys, asyncio, json
os.chdir(r'D:\Telegram Desktop\cheminement-main\cheminement-main\backend')
sys.path.insert(0, r'D:\Telegram Desktop\cheminement-main\cheminement-main')
from backend.rag_system import AutismRAG

async def test():
    rag = AutismRAG('./chroma_db')
    await rag.initialize()
    
    # Test get_context_for_llm step by step
    query = 'What causes autism?'
    results = rag.hybrid_search(query, top_k=3)
    print(f'hybrid_search returned {len(results)} results')
    
    max_tokens = 2000
    context_parts = []
    total_chars = 0
    
    for i, r in enumerate(results):
        doc = r['document']
        meta = r['metadata']
        sem = r['semantic_score']
        doc_text = f"[Relevant Knowledge - Relevance: {sem:.2f}]\n{doc}"
        doc_chars = len(doc_text)
        print(f"\nResult {i}: LEN={len(doc)} CTX_LEN={doc_chars} SEM={sem:.3f} SCORE={r['score']:.3f}")
        print(f"  CAT={meta.get('category')}")
        print(f"  PREVIEW: {doc[:150]}")
        remaining = max_tokens * 4 - total_chars
        print(f"  total_chars={total_chars} remaining={remaining}")
        check = total_chars + doc_chars > max_tokens * 4
        print(f"  would_exceed={check}")
        if check:
            print(f"  SKIPPING - document too large")
        else:
            context_parts.append(doc_text)
            total_chars += doc_chars
            print(f"  ADDED, total={total_chars}")
    
    ctx = "\n\n".join(context_parts)
    print(f"\nFINAL_CONTEXT_LEN={len(ctx)}")
    print(f"PREVIEW: {ctx[:300]!r}")

asyncio.run(test())
