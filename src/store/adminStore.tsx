"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from "react";

const API_BASE = "/api/admin/auth";

// ─── Types ──────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "superadmin" | "manager" | "support";
  avatar?: string;
}

interface AdminState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  loginAttempts: number;
  isLocked: boolean;
  lockUntil: number | null;
  loading: boolean;
  error: string | null;
}

type AdminAction =
  | { type: "ADMIN_LOGIN"; payload: AdminUser }
  | { type: "ADMIN_LOGOUT" }
  | { type: "ADMIN_LOGIN_FAIL"; payload: string }
  | { type: "ADMIN_RESET_LOCK" }
  | { type: "ADMIN_SET_LOADING"; payload: boolean }
  | { type: "ADMIN_SET_ERROR"; payload: string | null };

const initialAdminState: AdminState = {
  isAuthenticated: false,
  user: null,
  loginAttempts: 0,
  isLocked: false,
  lockUntil: null,
  loading: false,
  error: null,
};

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case "ADMIN_LOGIN":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loginAttempts: 0,
        isLocked: false,
        lockUntil: null,
        loading: false,
        error: null,
      };
    case "ADMIN_LOGOUT":
      return { ...initialAdminState, loginAttempts: 0, loading: false };
    case "ADMIN_LOGIN_FAIL": {
      const attempts = state.loginAttempts + 1;
      const shouldLock = attempts >= 5;
      return {
        ...state,
        loginAttempts: attempts,
        isLocked: shouldLock,
        lockUntil: shouldLock ? Date.now() + 15 * 60 * 1000 : null,
        loading: false,
        error: action.payload,
      };
    }
    case "ADMIN_RESET_LOCK":
      return { ...state, isLocked: false, lockUntil: null, loginAttempts: 0 };
    case "ADMIN_SET_LOADING":
      return { ...state, loading: action.payload };
    case "ADMIN_SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

interface AdminContextType {
  adminState: AdminState;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminState, dispatch] = useReducer(adminReducer, initialAdminState);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/session`, { credentials: "include" });
      const data = await res.json();
      if (data.user) {
        dispatch({
          type: "ADMIN_LOGIN",
          payload: data.user,
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const adminLogin = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      if (adminState.isLocked && adminState.lockUntil && Date.now() < adminState.lockUntil) {
        dispatch({ type: "ADMIN_SET_ERROR", payload: "Account locked. Try again in 15 minutes." });
        return false;
      }

      dispatch({ type: "ADMIN_SET_LOADING", payload: true });

      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok && data.user) {
          dispatch({
            type: "ADMIN_LOGIN",
            payload: data.user,
          });
          return true;
        }

        dispatch({ type: "ADMIN_LOGIN_FAIL", payload: data.error || "Invalid credentials" });
        return false;
      } catch (err: any) {
        dispatch({ type: "ADMIN_LOGIN_FAIL", payload: err.message || "Login failed" });
        return false;
      }
    },
    [adminState.isLocked, adminState.lockUntil]
  );

  const adminLogout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    dispatch({ type: "ADMIN_LOGOUT" });
  }, []);

  return (
    <AdminContext.Provider value={{ adminState, adminLogin, adminLogout, checkSession }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within an AdminProvider");
  return context;
}
