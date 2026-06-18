import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";

const { GET: keystaticGET, POST: keystaticPOST } = makeRouteHandler({ config });

function rewriteRequest(request: Request): Request {
  const originalUrl = request.url;
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  console.log("[keystatic-route] original URL:", originalUrl);
  console.log("[keystatic-route] x-forwarded-host:", forwardedHost);
  console.log("[keystatic-route] x-forwarded-proto:", forwardedProto);

  if (forwardedHost) {
    const url = new URL(request.url);
    url.hostname = forwardedHost;
    if (forwardedProto) url.protocol = forwardedProto + ":";
    const newUrl = url.toString();
    console.log("[keystatic-route] rewritten URL:", newUrl);
    return new Request(newUrl, request);
  }

  return request;
}

export const GET = async (request: Request, context: any) => {
  const rewritten = rewriteRequest(request);
  return keystaticGET(rewritten);
};

export const POST = async (request: Request, context: any) => {
  const rewritten = rewriteRequest(request);
  return keystaticPOST(rewritten);
};

export const dynamic = "force-dynamic";
