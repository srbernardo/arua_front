const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

export interface AdminUser {
  id: number
  email: string
  created_at?: string
}

export interface PaginationMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ApiError extends Error {
  status: number
  data: unknown
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof Error && "status" in err
}

export function errorMessage(err: unknown, fallback: string): string {
  if (!isApiError(err)) return fallback
  const data = err.data as { error?: string; errors?: string[] } | null
  if (data?.error) return data.error
  if (data?.errors?.length) return data.errors.join(". ")
  return fallback
}

// Authentication is session/cookie based: the browser stores the HttpOnly
// session cookie and sends it automatically. Nothing is persisted here —
// no JWT, no token, no password in localStorage.
let csrfToken: string | null = null
let onUnauthorized: (() => void) | null = null
// Set while a logout is in progress (or failed). While set, session checks
// report "not logged in" so the login screen / guards never bounce back to
// the dashboard; cleared again by a successful login.
let loggedOut = false

// Called whenever any request comes back 401 (expired/invalid session).
export function setOnUnauthorized(handler: (() => void) | null) {
  onUnauthorized = handler
}

export function clearAuthState() {
  csrfToken = null
}

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase()

  const headers: Record<string, string> = {}
  // multipart/form-data must NOT set Content-Type: the browser generates it
  // (with the correct boundary) automatically.
  const isFormData = options.body instanceof FormData
  if (!isFormData) {
    headers["Content-Type"] = "application/json"
  }

  if (method !== "GET" && method !== "HEAD" && csrfToken) {
    headers["X-CSRF-Token"] = csrfToken
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> | undefined),
    },
    credentials: "include",
  })

  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    /* not json */
  }

  // A 401 clears the cached token first; the fresh csrf_token in the body
  // (every 401 response carries one) is then stored, so the login POST can
  // authenticate against the current session.
  if (res.status === 401) {
    clearAuthState()
    onUnauthorized?.()
  }

  if (data && typeof (data as { csrf_token?: unknown }).csrf_token === "string") {
    csrfToken = (data as { csrf_token: string }).csrf_token
  }

  if (!res.ok) {
    const err = new Error(`API ${res.status}: ${text}`) as ApiError
    err.status = res.status
    err.data = data
    throw err
  }

  return data as T
}

async function ensureCsrfToken() {
  try {
    await request("/admin/me")
  } catch {
    // 401 is expected without a session; the response carries csrf_token.
  }
}

function buildQuery(params?: Record<string, string | number | undefined | null>) {
  if (!params) return ""
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value))
    }
  }
  const str = qs.toString()
  return str ? `?${str}` : ""
}

export const adminApi = {
  async login(email: string, password: string): Promise<AdminUser> {
    await ensureCsrfToken()
    const data = await request<{ admin: AdminUser }>("/admin/sign_in", {
      method: "POST",
      body: JSON.stringify({ admin: { email, password } }),
    })
    loggedOut = false
    return data.admin
  },

  async logout(): Promise<void> {
    // Flag immediately (before the network round-trip) so concurrent session
    // checks never treat the session as valid again until the next login.
    loggedOut = true
    try {
      await request("/admin/sign_out", { method: "DELETE" })
    } finally {
      clearAuthState()
    }
  },

  async getCurrentAdmin(): Promise<AdminUser | null> {
    if (loggedOut) return null
    try {
      const data = await request<{ admin: AdminUser }>("/admin/me")
      return data.admin
    } catch (err) {
      if (isApiError(err) && err.status === 401) return null
      throw err
    }
  },

  get: <T = unknown>(path: string, params?: Record<string, string | number | undefined | null>) =>
    request<T>(`${path}${buildQuery(params)}`),

  post: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),

  // Sends a multipart/form-data body (product creation/update with images).
  // No Content-Type header: the browser sets it with the correct boundary.
  upload: <T = unknown>(path: string, formData: FormData, method: "POST" | "PATCH" = "POST") =>
    request<T>(path, { method, body: formData }),

  patch: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),

  delete: <T = unknown>(path: string) => request<T>(path, { method: "DELETE" }),
}