import { Request } from 'express';

export interface AuthRequest extends Request {
  userRecord?: any;
}