// Centralized HTTP client. Components never call fetch directly: they go through
// src/services (repositories) which use the services in src/services/api.
//
// The API address comes from NEXT_PUBLIC_API_URL (see .env.example). There is
// deliberately no fallback address: when it is missing every request fails with
// a clear message instead of quietly talking to the wrong server.

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const API_URL = RAW_API_URL.replace(/\/+$/, "");
const TOKEN_KEY = "ccs_token";

export const isApiConfigured = API_URL.length > 0;

export class ApiError extends Error {
  status: number;
  errors?: string[];
  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Where the session token lives. "Remember me" keeps it in localStorage so it
 * survives a browser restart; otherwise it stays in sessionStorage and is gone
 * when the tab closes. The API must still validate it on every request.
 */
export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string, remember = true) {
    try {
      this.clear();
      (remember ? window.localStorage : window.sessionStorage).setItem(TOKEN_KEY, token);
    } catch {
      /* storage blocked: the session simply will not persist */
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
      window.sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface ApiResult<T> {
  data: T;
  meta?: ApiMeta;
}

type Params = Record<string, string | number | boolean | undefined | null>;

function buildUrl(path: string, params?: Params) {
  const url = new URL(`${API_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

async function request<T>(method: string, path: string, opts: { params?: Params; body?: unknown } = {}): Promise<ApiResult<T>> {
  if (!isApiConfigured) {
    throw new ApiError("The server address is not configured. Set NEXT_PUBLIC_API_URL and restart the app.", 0);
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.params), {
      method,
      headers,
      credentials: "include",
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Unable to reach the server. Please check your connection and try again.", 0);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok || !json || json.success === false) {
    if (res.status === 401) tokenStore.clear();
    throw new ApiError(json?.message || `Request failed (${res.status})`, res.status, json?.errors);
  }
  return { data: json.data as T, meta: json.meta };
}

/**
 * Sends a file as multipart/form-data. Uses XMLHttpRequest because fetch cannot report upload progress.
 * `onProgress` receives 0-100 while the bytes are being sent.
 */
function upload<T>(path: string, file: File, opts: { field?: string; onProgress?: (percent: number) => void } = {}): Promise<ApiResult<T>> {
  return new Promise((resolve, reject) => {
    if (!isApiConfigured) {
      reject(new ApiError("The server address is not configured. Set NEXT_PUBLIC_API_URL and restart the app.", 0));
      return;
    }
    const form = new FormData();
    form.append(opts.field ?? "image", file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", buildUrl(path));
    xhr.withCredentials = true;
    xhr.setRequestHeader("Accept", "application/json");
    const token = tokenStore.get();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) opts.onProgress?.(Math.min(100, Math.round((e.loaded / e.total) * 100)));
    };
    xhr.onerror = () => reject(new ApiError("Unable to reach the server. Please check your connection and try again.", 0));
    xhr.onabort = () => reject(new ApiError("The upload was cancelled.", 0));
    xhr.ontimeout = () => reject(new ApiError("The upload took too long. Please try again.", 0));
    xhr.timeout = 120_000;
    xhr.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let json: any = null;
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        /* non-JSON response */
      }
      if (xhr.status < 200 || xhr.status >= 300 || !json || json.success === false) {
        if (xhr.status === 401) tokenStore.clear();
        reject(new ApiError(json?.message || `Upload failed (${xhr.status})`, xhr.status, json?.errors));
        return;
      }
      opts.onProgress?.(100);
      resolve({ data: json.data as T, meta: json.meta });
    };
    xhr.send(form);
  });
}

/**
 * Sends multipart/form-data (text fields and files) with POST or PATCH. Uses XMLHttpRequest because fetch cannot
 * report upload progress. `onProgress` receives 0-100 while the bytes are being sent.
 */
function uploadForm<T>(method: "POST" | "PATCH", path: string, form: FormData, opts: { onProgress?: (percent: number) => void } = {}): Promise<ApiResult<T>> {
  return new Promise((resolve, reject) => {
    if (!isApiConfigured) {
      reject(new ApiError("The server address is not configured. Set NEXT_PUBLIC_API_URL and restart the app.", 0));
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open(method, buildUrl(path));
    xhr.withCredentials = true;
    xhr.setRequestHeader("Accept", "application/json");
    const token = tokenStore.get();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) opts.onProgress?.(Math.min(100, Math.round((e.loaded / e.total) * 100)));
    };
    xhr.onerror = () => reject(new ApiError("Unable to reach the server. Please check your connection and try again.", 0));
    xhr.onabort = () => reject(new ApiError("The upload was cancelled.", 0));
    xhr.ontimeout = () => reject(new ApiError("The upload took too long. Please try again.", 0));
    xhr.timeout = 180_000;
    xhr.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let json: any = null;
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        /* non-JSON response */
      }
      if (xhr.status < 200 || xhr.status >= 300 || !json || json.success === false) {
        if (xhr.status === 401) tokenStore.clear();
        reject(new ApiError(json?.message || `Upload failed (${xhr.status})`, xhr.status, json?.errors));
        return;
      }
      opts.onProgress?.(100);
      resolve({ data: json.data as T, meta: json.meta });
    };
    xhr.send(form);
  });
}

/**
 * Downloads a protected file (for example an identity document) with the session's credentials and returns it as a
 * Blob. The caller shows it from an object URL and must revoke that URL; the file is never put behind a public link.
 */
async function download(path: string): Promise<Blob> {
  if (!isApiConfigured) throw new ApiError("The server address is not configured. Set NEXT_PUBLIC_API_URL and restart the app.", 0);
  const headers: Record<string, string> = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(buildUrl(path), { headers, credentials: "include", cache: "no-store" });
  } catch {
    throw new ApiError("Unable to reach the server. Please check your connection and try again.", 0);
  }
  if (!res.ok) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let json: any = null;
    try {
      json = await res.json();
    } catch {
      /* not JSON */
    }
    if (res.status === 401) tokenStore.clear();
    throw new ApiError(json?.message || `Request failed (${res.status})`, res.status);
  }
  return res.blob();
}

export const api = {
  upload,
  uploadForm,
  download,
  get: <T>(path: string, params?: Params) => request<T>("GET", path, { params }),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, { body }),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
