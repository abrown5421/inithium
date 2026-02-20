import { ref, computed, readonly } from 'vue';
import type { User } from '@inithium/shared';
import type { LoginCredentials, RegisterCredentials } from '@inithium/shared';
import { validateLogin, validateRegister } from './validators.js';
import {
  clearStoredToken,
  getStoredToken,
  isTokenExpired,
  setStoredToken,
} from './storage.js';

const currentUser = ref<User | null>(null);
const token = ref<string | null>(getStoredToken());
const loading = ref(false);
const error = ref<string | null>(null);
const initialized = ref(false);

export function useAuth(apiBaseUrl: string) {
  const isAuthenticated = computed(() => !!currentUser.value && !!token.value);
  const isAdmin = computed(() => currentUser.value?.role === 'admin');

  async function register(credentials: RegisterCredentials) {
    const validation = validateRegister(credentials);
    if (!validation.valid) {
      error.value = Object.values(validation.errors)[0];
      return { success: false, errors: validation.errors };
    }

    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      currentUser.value = json.data.user;
      token.value = json.data.token;
      setStoredToken(json.data.token);
      return { success: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Registration failed';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      loading.value = false;
    }
  }

  async function login(credentials: LoginCredentials) {
    const validation = validateLogin(credentials);
    if (!validation.valid) {
      error.value = Object.values(validation.errors)[0];
      return { success: false, errors: validation.errors };
    }

    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      currentUser.value = json.data.user;
      token.value = json.data.token;
      setStoredToken(json.data.token);
      return { success: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Login failed';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;
    try {
      await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      currentUser.value = null;
      token.value = null;
      clearStoredToken();
      loading.value = false;
    }
  }

  async function initializeAuth() {
    if (initialized.value) return;
    initialized.value = true;

    const stored = getStoredToken();
    if (!stored || isTokenExpired(stored)) {
      clearStoredToken();
      token.value = null;
      return;
    }

    loading.value = true;
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${stored}` },
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        currentUser.value = json.data.user;
        token.value = stored;
      } else {
        clearStoredToken();
        token.value = null;
      }
    } catch {
      clearStoredToken();
      token.value = null;
    } finally {
      loading.value = false;
    }
  }

  return {
    user: readonly(currentUser),
    token: readonly(token),
    loading: readonly(loading),
    error: readonly(error),
    isAuthenticated,
    isAdmin,
    register,
    login,
    logout,
    initializeAuth,
  };
}
