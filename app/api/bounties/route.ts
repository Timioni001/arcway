import { bountyActivity } from "../../../lib/server/bountyActivity";
import { intelResponse } from "../../../lib/server/intelRoute";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  return intelResponse(req, bountyActivity, 30);
}
