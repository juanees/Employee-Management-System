const DEFAULT_API_BASE_URL = 'http://localhost:3333';
const DEFAULT_REQUEST_TIMEOUT_MS = 1000;

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? DEFAULT_API_BASE_URL;
const parsedTimeout = Number(
  process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? DEFAULT_REQUEST_TIMEOUT_MS
);
const requestTimeoutMs = Number.isFinite(parsedTimeout)
  ? parsedTimeout
  : DEFAULT_REQUEST_TIMEOUT_MS;

function createTimeoutSignal(init?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);

  let originalSignalCleanup: (() => void) | undefined;
  const originalSignal = init?.signal;

  if (originalSignal) {
    if (originalSignal.aborted) {
      controller.abort(originalSignal.reason);
    } else {
      const abortHandler = () => controller.abort(originalSignal.reason);
      originalSignal.addEventListener('abort', abortHandler, { once: true });
      originalSignalCleanup = () => originalSignal.removeEventListener('abort', abortHandler);
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeoutId);
      originalSignalCleanup?.();
    }
  };
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  const { signal, cleanup } = createTimeoutSignal(init);

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      cache: 'no-store',
      ...init,
      signal
    });
  } catch (error) {
    if ((error as DOMException)?.name === 'AbortError') {
      throw new Error(`Request timed out after ${requestTimeoutMs}ms`);
    }
    throw error;
  } finally {
    cleanup();
  }

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
