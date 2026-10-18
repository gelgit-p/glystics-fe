let refreshPromise: Promise<boolean> | undefined;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = fetch(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) return false;
        const result: unknown = await response.json();
        if (
          typeof result !== 'object' ||
          result === null ||
          !('accessToken' in result) ||
          typeof result.accessToken !== 'string' ||
          !('refreshToken' in result) ||
          typeof result.refreshToken !== 'string'
        ) {
          return false;
        }
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('refreshToken', result.refreshToken);
        if (
          'user' in result &&
          typeof result.user === 'object' &&
          result.user !== null &&
          'id' in result.user &&
          typeof result.user.id === 'string'
        ) {
          localStorage.setItem('userId', result.user.id);
        }
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = undefined;
      });
  }
  return refreshPromise;
}

function withBearerToken(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(
    input instanceof Request ? input.headers : undefined,
  );
  new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  const token = localStorage.getItem('accessToken');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return { ...init, headers };
}

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const apiOrigin = new URL(
    import.meta.env.VITE_API_URL,
    window.location.origin,
  ).origin;
  const requestUrl =
    input instanceof Request ? input.url : input.toString();
  if (new URL(requestUrl, window.location.origin).origin !== apiOrigin) {
    return fetch(input, init);
  }

  const request = withBearerToken(input, init);
  let response = await fetch(input, request);
  if (response.status !== 401) return response;

  if (await refreshAccessToken()) {
    response = await fetch(input, withBearerToken(input, init));
    return response;
  }

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
  return response;
}
