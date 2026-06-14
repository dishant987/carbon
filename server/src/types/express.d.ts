import type { JwtPayload } from './index';

declare global {
  namespace Express {
    interface Request {
      /** Authenticated user payload set by auth middleware */
      user?: JwtPayload;
    }
  }
}
