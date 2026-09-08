const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export async function backendFetch(path: string, init?: RequestInit) {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let errorBody = '';
    try {
      errorBody = await response.text();
    } catch (e) {
      // Ignore text parsing errors
    }
    throw new Error(`Backend fetch failed: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  return response.json();
}
