import { api } from "./api";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  date_joined: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

const TOKEN_KEY = "mm_access";
const REFRESH_KEY = "mm_refresh";

export const tokenStorage = {
  getAccess: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (tokens: Pick<AuthTokens, "access" | "refresh">) => {
    localStorage.setItem(TOKEN_KEY, tokens.access);
    localStorage.setItem(REFRESH_KEY, tokens.refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = tokenStorage.getRefresh();
      if (refresh) {
        try {
          const { data } = await api.post("/auth/refresh/", { refresh });
          tokenStorage.set({ access: data.access, refresh: data.refresh ?? refresh });
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          tokenStorage.clear();
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthTokens>("/auth/login/", payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    api.post<User>("/auth/register/", payload).then((r) => r.data),

  me: () => api.get<User>("/auth/me/").then((r) => r.data),
};
