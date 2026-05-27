const API_BASE_URL = "https://api.getitsju.com";

type ApiResponse<T> = {
  code: string;
  message: string;
  result: T;
};

async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }
  const text = await res.text();
  if (!text) return undefined as T;
  const data: ApiResponse<T> = JSON.parse(text);
  return data.result;
}

export const api = {
  get: <T>(path: string, token: string) =>
    request<T>(path, token, { method: "GET" }),

  patch: <T>(path: string, token: string, body: unknown) =>
    request<T>(path, token, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  post: <T>(path: string, token: string, body: unknown) =>
    request<T>(path, token, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  delete: (path: string, token: string) =>
    request<void>(path, token, { method: "DELETE" }),
};
