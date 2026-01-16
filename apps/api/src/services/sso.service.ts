import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { AuthenticationError } from '../utils/errors.js';
import type { User, SignedContext, JWTClaims, AuthMode } from '../models/types.js';

export class SSOService {
  private authMode: AuthMode;

  constructor() {
    this.authMode = env.AUTH_MODE;
  }

  async validateAndExtractUser(token?: string, context?: string): Promise<User> {
    switch (this.authMode) {
      case 'DEV':
        return this.getDevUser();
      
      case 'SIGNED_CONTEXT':
        if (!context) {
          throw new AuthenticationError('Context is required in SIGNED_CONTEXT mode');
        }
        return this.validateSignedContext(context);
      
      case 'JWT_SSO':
        if (!token) {
          throw new AuthenticationError('Token is required in JWT_SSO mode');
        }
        return this.validateJWT(token);
      
      default:
        throw new AuthenticationError(`Unknown AUTH_MODE: ${this.authMode}`);
    }
  }

  private getDevUser(): User {
    logger.debug('Using DEV mode - returning dev user');
    return {
      userId: 'dev-user',
      name: 'Dev User',
      email: 'dev@example.com',
      unit: 'TI',
      coligada: 'Matriz',
    };
  }

  private validateSignedContext(context: string): User {
    if (!env.CONTEXT_SIGNING_SECRET) {
      throw new AuthenticationError('CONTEXT_SIGNING_SECRET is required in SIGNED_CONTEXT mode');
    }

    try {
      const [encodedData, signature] = context.split('.');
      if (!encodedData || !signature) {
        throw new AuthenticationError('Invalid context format');
      }

      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', env.CONTEXT_SIGNING_SECRET)
        .update(encodedData)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        throw new AuthenticationError('Invalid context signature');
      }

      // Decode data
      const dataJson = Buffer.from(encodedData, 'base64').toString('utf-8');
      const data: SignedContext = JSON.parse(dataJson);

      // Validate timestamp (replay protection - 5 minutes window)
      const now = Math.floor(Date.now() / 1000);
      const maxAge = 300; // 5 minutes
      if (Math.abs(now - data.timestamp) > maxAge) {
        throw new AuthenticationError('Context timestamp expired or invalid');
      }

      // Extract user
      return {
        userId: data.userId,
        name: data.name,
        email: data.email,
        unit: data.unit,
        coligada: data.coligada,
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      logger.error('Error validating signed context', error);
      throw new AuthenticationError('Invalid context');
    }
  }

  private validateJWT(token: string): User {
    if (!env.JWT_SECRET) {
      throw new AuthenticationError('JWT_SECRET is required in JWT_SSO mode');
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET, {
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      }) as JWTClaims;

      return {
        userId: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        unit: decoded.unit,
        coligada: decoded.coligada,
      };
    } catch (error) {
      logger.error('Error validating JWT', error);
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError(`JWT validation failed: ${error.message}`);
      }
      throw new AuthenticationError('Invalid token');
    }
  }
}
