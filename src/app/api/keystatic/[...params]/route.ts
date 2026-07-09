import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";

/**
 * LEGACY ONLY: Keystatic tetap hidup untuk maintenance konten lama.
 * Fitur baru AKAL Center wajib DB/ImageKit-driven, bukan menulis ke content/*.
 */

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
