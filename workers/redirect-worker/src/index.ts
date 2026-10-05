/**
 * Cloudflare Worker for Fast NFC Redirects
 */

export interface Env {
  REDIRECTS_KV: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Only handle /r/:code
    if (!url.pathname.startsWith('/r/')) {
      return new Response('Not Found', { status: 404 });
    }

    const code = url.pathname.replace('/r/', '').split('/')[0];

    // Basic validation for code format (5-10 chars, alphanumeric)
    if (!/^[a-zA-Z0-9]{5,10}$/.test(code)) {
      return new Response('Invalid code format', { status: 400 });
    }

    try {
      // Fetch redirect info from KV
      const data = await env.REDIRECTS_KV.get(`card:${code}`, 'json') as { url: string, status: string } | null;

      if (!data) {
        return new Response(
          '<html><head><meta charset="utf-8"><title>NFC 連結失效</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="font-family:sans-serif;text-align:center;padding:50px;color:#333;"><h2>此 NFC 連結不存在或已失效。</h2></body></html>',
          { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }

      // Check status
      if (data.status !== 'active' && data.status !== 'testing') {
        return new Response(
          '<html><head><meta charset="utf-8"><title>NFC 連結無法使用</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="font-family:sans-serif;text-align:center;padding:50px;color:#333;"><h2>此 NFC 連結目前無法使用。</h2></body></html>',
          { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }

      // Valid URL check to prevent malicious injection in KV just in case
      if (!data.url.startsWith('https://')) {
        return new Response('Invalid destination URL configuration', { status: 500 });
      }

      // Perform 302 Redirect
      return Response.redirect(data.url, 302);
    } catch (error) {
      console.error('KV Error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
