import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role?: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserResponse {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AccessTokenPayload extends JwtPayload {
  type: 'access';
  exp: number;
  iat: number;
}

export interface RefreshTokenPayload extends JwtPayload {
  type: 'refresh';
  exp: number;
  iat: number;
}
