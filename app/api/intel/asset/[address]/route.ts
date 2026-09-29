import { loadAsset } from "../../../../../lib/server/intel";
import { intelResponse } from "../../../../../lib/server/intelRoute";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return intelResponse(req, () => loadAsset(address), 60);
}
