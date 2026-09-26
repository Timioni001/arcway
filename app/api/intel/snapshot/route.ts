import { loadSnapshot } from "../../../../lib/server/intel";
import { intelResponse } from "../../../../lib/server/intelRoute";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  return intelResponse(req, loadSnapshot, 30);
}
