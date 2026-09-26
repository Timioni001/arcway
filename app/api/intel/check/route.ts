import { apiError, parseAddress } from "../../../../lib/server/http";
import { checkContract } from "../../../../lib/server/intel";
import { intelResponse } from "../../../../lib/server/intelRoute";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const address = parseAddress(new URL(req.url).searchParams.get("address"));
  if (!address) return apiError(400, "invalid_request", "That doesn't look like a valid contract address.");
  return intelResponse(req, () => checkContract(address), 60);
}
