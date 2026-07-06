import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";

const { GET: keystaticGET, POST: keystaticPOST } = makeRouteHandler({ config });

export const GET = async (request: Request) => {
  const response = await keystaticGET(request);
  return response;
};

export const POST = async (request: Request) => {
  const response = await keystaticPOST(request);
  return response;
};

export const dynamic = "force-dynamic";
