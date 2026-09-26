import { loadProtocol } from "../../../../../lib/server/intel";
import { intelResponse } from "../../../../../lib/server/intelRoute";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return intelResponse(req, () => loadProtocol(slug), 60);
}
