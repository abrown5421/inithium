export { useAuth } from './lib/useAuth.js';
export { validateLogin, validateRegister } from './lib/validators.js';
export type { ValidationResult } from './lib/validators.js';
export {
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  isTokenExpired,
} from './lib/storage.js';
