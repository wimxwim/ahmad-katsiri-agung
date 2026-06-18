import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";

const { GET: keystaticGET, POST: keystaticPOST } = makeRouteHandler({ config });

function rewriteRequest(request: Request): Request {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedHost && url.hostname !== forwardedHost) {
    url.hostname = forwardedHost;
    if (forwardedProto) url.protocol = forwardedProto + ":";
    return new Request(url.toString(), request);
  }

  return request;
}

export const GET = async (request: Request) => {
  const rewritten = rewriteRequest(request);
  return keystaticGET(rewritten);
};

export const POST = async (request: Request) => {
  const rewritten = rewriteRequest(request);
  return keystaticPOST(rewritten);
};

export const dynamic = "force-dynamic";
