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

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return undefined as T;
  }
}

export const apiClient = {
  get: async <T>(path: string) => {
    const response = await request(path);
    return parseJsonResponse<T>(response);
  },
  post: async <T>(path: string, body: unknown) => {
    const response = await request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return parseJsonResponse<T>(response);
  },
  patch: async <T>(path: string, body: unknown) => {
    const response = await request(path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return parseJsonResponse<T>(response);
  },
  delete: async <T>(path: string) => {
    const response = await request(path, {
      method: 'DELETE'
    });
    return parseJsonResponse<T>(response);
  },
  postForm: async <T>(path: string, formData: FormData) => {
    const response = await request(path, {
      method: 'POST',
      body: formData
    });
    return parseJsonResponse<T>(response);
  },
  download: async (path: string) => {
    const response = await request(path);
    return response.blob();
  }
};
