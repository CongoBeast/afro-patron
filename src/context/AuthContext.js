/**
 * AuthContext.js
 *
 * Provides authentication state to the whole app via React context.
 * State is persisted to localStorage so a page reload keeps the user logged in.
 *
 * Exposed values:
 *   user      — the current demo user object, or null
 *   role      — 'creator' | 'supporter' | null
 *   isLoading — true while an auth action is in flight
 *   loginAs(role)  — sets the demo user for that role, stores in localStorage
 *   logout()       — clears user state and localStorage
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import { DEMO_USERS } from '../mockData/users';

const AUTH_STORAGE_KEY = 'ap_auth_user';

// ─── State shape ───────────────────────────────────────────────────────────
const INITIAL_STATE = { user: null, role: null, isLoading: false };

function readStoredState() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    // Validate shape before trusting stored state
    if (parsed?.user?.id && parsed?.role) return parsed;
    return INITIAL_STATE;
  } catch {
    return INITIAL_STATE;
  }
}

// ─── Reducer ───────────────────────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        user:      action.payload.user,
        role:      action.payload.role,
        isLoading: false,
      };
    case 'LOGOUT':
      return INITIAL_STATE;
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, undefined, readStoredState);

  // Sync to localStorage whenever state changes
  useEffect(() => {
    if (state.user && state.role) {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user: state.user, role: state.role }),
      );
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [state.user, state.role]);

  /**
   * loginAs — picks the first demo user for the given role and logs in.
   * Returns the user object so callers can navigate immediately.
   */
  const loginAs = useCallback((role) => {
    const demoUser = DEMO_USERS.find(u => u.role === role);
    if (!demoUser) {
      throw new Error(`No demo user found for role: "${role}"`);
    }
    dispatch({ type: 'LOGIN', payload: { user: demoUser, role } });
    return demoUser;
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const value = {
    user:      state.user,
    role:      state.role,
    isLoading: state.isLoading,
    loginAs,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook — throws if used outside AuthProvider */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>');
  return ctx;
}

export default AuthContext;
