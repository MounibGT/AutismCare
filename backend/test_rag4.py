import sys, asyncio, os
os.chdir(r'D:\Telegram Desktop\cheminement-main\cheminement-main\backend')
sys.path.insert(0, r'D:\Telegram Desktop\cheminement-main\cheminement-main')

from backend.rag_system import AutismRAG

async def test():
    rag = AutismRAG('./chroma_db')
    await rag.initialize()

    # Step 1: hybrid_search
    query = 'What causes autism?'
    results = rag.hybrid_search(query, top_k=3)
    print(f'hybrid_search: {len(results)} results')
    for i, r in enumerate(results):
        doc = r['document']
        sem = r['semantic_score']
        score = r['score']
        meta = r['metadata']
        doc_text = f"[Relevant Knowledge - Relevance: {sem:.2f}]\n{doc}"
        doc_chars = len(doc_text)
        print(f'  Result {i}: doc_len={len(doc)}, ctx_len={doc_chars}, sem={sem:.4f}, score={score:.4f}')

    # Step 2: get_context_for_llm raw
    max_tokens = 2000
    results2 = rag.hybrid_search(query, top_k=3)
    context_parts = []
    total_chars = 0

    for r in results2:
        doc = r['document']
        sem = r['semantic_score']
        doc_text = f"[Relevant Knowledge - Relevance: {sem:.2f}]\n{doc}"
        doc_chars = len(doc_text)
        # This is the exact logic from get_context_for_llm
        if total_chars + doc_chars > max_tokens * 4:
            remaining = max_tokens * 4 - total_chars
            print(f'  exceeding: total={total_chars} doc_chars={doc_chars} threshold={max_tokens*4} remaining={remaining}')
            if remaining > 200:
                context_parts.append(doc_text[:int(remaining)] + "...")
            break
        context_parts.append(doc_text)
        total_chars += doc_chars

    ctx = "\n\n".join(context_parts)
    print(f'\nctx len={len(ctx)}')
    print(f'ctx: {ctx[:200]!r}')

asyncio.run(test())
