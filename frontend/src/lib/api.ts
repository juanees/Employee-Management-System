const DEFAULT_API_BASE_URL = 'http://localhost:3333';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? DEFAULT_API_BASE_URL;

async function request(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    cache: 'no-store',
    ...init
  });

  if (!response.ok) {
    let message: string | undefined;

    try {
      const payload = await response.clone().json();
      message = payload?.message ?? payload?.error;
    } catch {
      try {
        message = (await response.clone().text()) || undefined;
      } catch {
        message = undefined;
      }
    }

    throw new Error(message?.trim() || `Request failed with status ${response.status}`);
  }

  return response;
}

export const apiClient = {
  get: async <T>(path: string) => {
    const response = await request(path);
    return response.json() as Promise<T>;
  },
  post: async <T>(path: string, body: unknown) => {
    const response = await request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return response.json() as Promise<T>;
  },
  postForm: async <T>(path: string, formData: FormData) => {
    const response = await request(path, {
      method: 'POST',
      body: formData
    });
    return response.json() as Promise<T>;
  },
  download: async (path: string) => {
    const response = await request(path);
    return response.blob();
  }
};
