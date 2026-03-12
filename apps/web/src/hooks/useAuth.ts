import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../store/store';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  logout as logoutAction,
  setCredentials,
} from '../store/authSlice';
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
} from '../services/authApi';
import type { LoginRequest, RegisterRequest } from '@inithium/shared';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegistering }] =
    useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await loginMutation(credentials).unwrap();
      dispatch(setCredentials(response));
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error };
    }
  };

  const register = async (credentials: RegisterRequest) => {
    try {
      const response = await registerMutation(credentials).unwrap();
      dispatch(setCredentials(response));
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logoutAction());
      return { success: true };
    } catch (error) {
      dispatch(logoutAction());
      return { success: false, error };
    }
  };

  return {
    user,
    isAuthenticated,
    isLoggingIn,
    isRegistering,
    login,
    register,
    logout,
  };
};
