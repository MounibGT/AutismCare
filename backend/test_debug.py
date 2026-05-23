import os, sys, asyncio

os.chdir(r'D:\Telegram Desktop\cheminement-main\cheminement-main\backend')
sys.path.insert(0, r'D:\Telegram Desktop\cheminement-main\cheminement-main')

# Patch the rag_system to trace execution
import backend.rag_system as rs

original_ctx = rs.AutismRAG.get_context_for_llm
original_hs = rs.AutismRAG.hybrid_search

async def traced_ctx(self, query, max_tokens=2000):
    print(f"[TRACE] get_context_for_llm called: query={query!r}, max_tokens={max_tokens}")
    results = await traced_hs(self, query, top_k=3)
    print(f"[TRACE] hybrid_search returned {len(results)} results")
    for i, r in enumerate(results):
        doc = r['document']
        sem = r['semantic_score']
        score = r['score']
        meta = r['metadata']
        doc_text = f"[Relevant Knowledge - Relevance: {sem:.2f}]\n{doc}"
        doc_chars = len(doc_text)
        total_est = sum(len(f"[Relevant Knowledge - Relevance: {results[j]['semantic_score']:.2f}]\n{results[j]['document']}") for j in range(i))
        threshold = max_tokens * 4
        print(f"[TRACE] Result {i}: doc_len={len(doc)}, ctx_len={doc_chars}, total_so_far={total_est}, threshold={threshold}, would_exceed={total_est + doc_chars > threshold}")
        print(f"[TRACE]   sem={sem:.4f}, score={score:.4f}, cat={meta.get('category')}")
        print(f"[TRACE]   preview: {doc[:120]}")
    return original_ctx(self, query, max_tokens)

async def traced_hs(self, query, top_k=5, semantic_weight=0.7):
    print(f"[TRACE] hybrid_search called: query={query!r}")
    res = await original_hs(self, query, top_k, semantic_weight)
    print(f"[TRACE]   -> {len(res)} results")
    return res

rs.AutismRAG.get_context_for_llm = traced_ctx
rs.AutismRAG.hybrid_search = traced_hs

from backend.api import chat
import asyncio

async def main():
    await chat.initialize_rag()
    ctx = chat.rag_system.get_context_for_llm('What causes autism?')
    print(f'\nFINAL CONTEXT LEN: {len(ctx)}')
    print(f'CONTEXT: {ctx!r}')

asyncio.run(main())
