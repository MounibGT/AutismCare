import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";

// Absolute path to the metrics file shipped alongside the backend
const METRICS_PATH = "D:\\telechargement\\cheminement-main (3)\\cheminement-main\\cheminement-main\\IA-chatboot\\model_metrics.json";

export async function GET(_req: NextRequest) {
  try {
    if (!existsSync(METRICS_PATH)) {
      return NextResponse.json(
        { ok: false, error: `Metrics file not found: ${METRICS_PATH}` },
        { status: 404 },
      );
    }
    const raw  = readFileSync(METRICS_PATH, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json({ ok: true, metrics: data });
  } catch (err) {
    console.error("model-metrics GET error:", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
