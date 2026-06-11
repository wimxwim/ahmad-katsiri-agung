export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = 'https://ahmad-katsiri-agung.vercel.app';

    const upstreamUrl = origin + url.pathname + url.search;

    const headers = new Headers(request.headers);
    headers.set('Host', new URL(origin).hostname);

    const isApi = url.pathname.startsWith('/api/');
    const isStatic = url.pathname.startsWith('/_next/static/');
    const isPdf = url.pathname.startsWith('/pdf/');
    const isAsset = /\.(ico|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|eot)$/i.test(url.pathname);

    const upstreamRequest = new Request(upstreamUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
    });

    let response = await fetch(upstreamRequest);

    if (isStatic) {
      response = new Response(response.body, response);
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (isPdf || isAsset) {
      response = new Response(response.body, response);
      response.headers.set('Cache-Control', 'public, max-age=604800');
    } else if (!isApi) {
      response = new Response(response.body, response);
      response.headers.set('Cache-Control', 'public, max-age=300');
    }

    return response;
  },
};
