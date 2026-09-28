import type { PassportCompletion } from "../intel";

/**
 * Arcway's own indexer (Envio HyperIndex, see /indexer). Optional: when ARCWAY_INDEXER_URL is not set,
 * or the indexer can't be reached, callers fall back to the Arc explorer.
 */
const URL = process.env.ARCWAY_INDEXER_URL?.trim() || "";
export const INDEXER_ENABLED = URL.length > 0;

const PAGE = 1000;
const MAX_ROWS = 20_000;
const TIMEOUT_MS = 6_000;

type CompletionRow = { user: string; questId: string; xp: string | number; timestamp: number };

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate: 30 }
  });
  if (!res.ok) throw new Error(`indexer ${res.status}`);
  const body = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (body.errors?.length || !body.data) throw new Error(`indexer: ${body.errors?.[0]?.message ?? "no data"}`);
  return body.data;
}

const COMPLETIONS = `query Completions($limit: Int!, $offset: Int!) {
  Completion(order_by: { timestamp: asc }, limit: $limit, offset: $offset) { user questId xp timestamp }
}`;

/** Every recorded quest completion, oldest first, in pages. Marks `truncated` past MAX_ROWS. */
export async function getIndexedCompletions(): Promise<{ rows: PassportCompletion[]; truncated: boolean }> {
  const rows: PassportCompletion[] = [];
  for (let offset = 0; offset < MAX_ROWS; offset += PAGE) {
    const { Completion } = await gql<{ Completion: CompletionRow[] }>(COMPLETIONS, { limit: PAGE, offset });
    for (const c of Completion) rows.push(toCompletion(c));
    if (Completion.length < PAGE) return { rows, truncated: false };
  }
  return { rows, truncated: true };
}

export function toCompletion(c: CompletionRow): PassportCompletion {
  return { user: c.user.toLowerCase(), quest: c.questId.toLowerCase(), xp: Number(c.xp), at: new Date(c.timestamp * 1000).toISOString().replace(".000Z", "Z") };
}
