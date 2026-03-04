import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest, UserRole } from '@inithium/shared';

export function authorize(
  roles: UserRole[],
): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.session.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}
