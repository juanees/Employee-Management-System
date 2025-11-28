const DEFAULT_API_BASE_URL = 'http://localhost:3333';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? DEFAULT_API_BASE_URL;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    cache: 'no-store',
    ...init
  });

  if (!response.ok) {
    const message = await response
      .json()
      .catch(() => ({ message: response.statusText }));

    throw new Error(
      typeof message?.message === 'string'
        ? message.message
        : `Request failed with status ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body)
    })
};
