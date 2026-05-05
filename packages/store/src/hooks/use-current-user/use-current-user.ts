import { useSelector } from 'react-redux';
import type { RootState } from '../../store.js';
import { useGetMeQuery } from '../../apis/users-api.js';
import { User } from '@inithium/types';

export interface UseCurrentUserResult {
  user: User | null | undefined;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export const useCurrentUser = (): UseCurrentUserResult => {
  const userId = useSelector((state: RootState) => state.auth.userId);

  const { data: user, isLoading, isError, refetch } = useGetMeQuery(
    userId as string,
    { skip: !userId }
  );

  return {
    user: userId ? user : null,
    userId,
    isAuthenticated: !!userId,
    isLoading: !!userId && isLoading,
    isError,
    refetch,
  };
};