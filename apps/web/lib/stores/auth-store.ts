"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserDto } from "@/lib/generated/api";

interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

type Role = "super_admin" | "org_admin" | "hr_manager" | "employee" | "SUPER_ADMIN" | "ORG_ADMIN" | "EMPLOYEE";

interface AuthState {
  user: User | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, role: Role) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setRole: (role: Role) => void;
  loginFromApiResponse: (apiUser: UserDto, accessToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      login: (user, token, role) =>
        set({ user, token, role, isAuthenticated: true }),
      logout: () =>
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
        }),
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setRole: (role) => set({ role }),
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
    { name: "auth-storage" }
  )
);
