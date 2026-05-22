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
  const data: ApiResponse<T> = await res.json();
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

  delete: <T>(path: string, token: string) =>
    request<T>(path, token, { method: "DELETE" }),
};
