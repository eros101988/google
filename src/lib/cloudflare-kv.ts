export interface RedirectData {
  url: string;
  status: string;
}

function getKvApiUrl(key: string) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
  
  if (!accountId || !namespaceId) {
    throw new Error('Missing Cloudflare KV configuration');
  }

  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`;
}

function getHeaders() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  
  if (!token) {
    throw new Error('Missing Cloudflare API Token');
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function setRedirect(code: string, data: RedirectData) {
  const key = `card:${code}`;
  const url = getKvApiUrl(key);
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({
      url: data.url,
      status: data.status,
      updated_at: new Date().toISOString()
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudflare KV Error: ${errorText}`);
  }

  return true;
}

export async function deleteRedirect(code: string) {
  const key = `card:${code}`;
  const url = getKvApiUrl(key);
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudflare KV Error: ${errorText}`);
  }

  return true;
}

export async function getRedirect(code: string): Promise<RedirectData | null> {
  const key = `card:${code}`;
  const url = getKvApiUrl(key);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudflare KV Error: ${errorText}`);
  }

  return await response.json();
}
