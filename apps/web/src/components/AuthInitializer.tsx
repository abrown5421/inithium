import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAccessToken } from '../store/authSlice';
import { setUser } from '../store/authSlice';
import { useGetMeQuery } from '../services/authApi';
import type { AppDispatch } from '../store/store';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({
  children,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector(selectAccessToken);

  const { data: user, isSuccess } = useGetMeQuery(undefined, {
    skip: !accessToken,
  });

  useEffect(() => {
    if (isSuccess && user) {
      dispatch(setUser(user));
    }
  }, [isSuccess, user, dispatch]);

  return <>{children}</>;
};