import { Request, Response } from 'express';
import { User } from '../models/User';
import { isValidEmail, isStrongPassword } from '@inithium/shared';
import { signToken } from '../models/jwt';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, displayName } = req.body;

    if (!isValidEmail(email)) {
      res
        .status(400)
        .json({ success: false, error: 'Invalid email', statusCode: 400 });
      return;
    }
    if (!isStrongPassword(password)) {
      res.status(400).json({
        success: false,
        error:
          'Password must be at least 8 characters with uppercase, lowercase, and a number',
        statusCode: 400,
      });
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({
        success: false,
        error: 'Email already registered',
        statusCode: 409,
      });
      return;
    }

    const user = await User.create({ email, password, displayName });

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ success: true, data: { user, token } });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: 'Registration failed', statusCode: 500 });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        statusCode: 401,
      });
      return;
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        statusCode: 401,
      });
      return;
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, data: { user, token } });
  } catch {
    res
      .status(500)
      .json({ success: false, error: 'Login failed', statusCode: 500 });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('token');
  res.json({ success: true, data: null, message: 'Logged out' });
}

export async function me(req: Request, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.user!.sub);
    if (!user) {
      res
        .status(404)
        .json({ success: false, error: 'User not found', statusCode: 404 });
      return;
    }
    res.json({ success: true, data: { user } });
  } catch {
    res
      .status(500)
      .json({ success: false, error: 'Could not fetch user', statusCode: 500 });
  }
}
