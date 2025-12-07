"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

type Role =
  | "super_admin"
  | "org_admin"
  | "hr_manager"
  | "employee"
  | "SUPER_ADMIN"
  | "ORG_ADMIN"
  | "EMPLOYEE";

interface AuthState {
  user: User | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  login: (user: User, token: string, role: Role) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setRole: (role: Role) => void;
  loginFromApiResponse: (apiUser: ApiUser, accessToken: string) => void;
  setHasHydrated: (state: boolean) => void;
}

const getStorage = () => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  try {
    return {
      getItem: (name: string): string | null => {
        const sessionValue = window.sessionStorage.getItem(name);
        if (sessionValue) return sessionValue;
        return window.localStorage.getItem(name);
      },
      setItem: (name: string, value: string): void => {
        window.sessionStorage.setItem(name, value);
        window.localStorage.setItem(name, value);
      },
      removeItem: (name: string): void => {
        window.sessionStorage.removeItem(name);
        window.localStorage.removeItem(name);
      },
    };
  } catch (error) {
    console.error("Storage error:", error);
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
};

const storage = createJSONStorage(() => getStorage());

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      _hasHydrated: false,
      login: (user, token, role) =>
        set({ user, token, role, isAuthenticated: true }),
      logout: () => {
        if (typeof document !== "undefined") {
          document.cookie = "auth-storage=; path=/; max-age=0; SameSite=Lax";
        }
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
        });
      },
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setRole: (role) => set({ role }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      loginFromApiResponse: (apiUser, accessToken) =>
        set({
          user: {
            id: apiUser.id,
            email: apiUser.email,
            name: `${apiUser.firstName} ${apiUser.lastName}`,
            firstName: apiUser.firstName,
            lastName: apiUser.lastName,
            role: apiUser.role,
          },
          token: accessToken,
          role: apiUser.role as Role,
          isAuthenticated: true,
        }),
    }),
    {
      name: "auth-storage",
      storage: storage,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
