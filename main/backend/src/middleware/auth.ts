import { Request, Response, NextFunction } from 'express';
import { getSupabaseAdmin } from '../lib/supabase';
import { prisma } from '../lib/prisma';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    tenantId: string;
    email: string;
    isPlatformAdmin?: boolean;
    userType?: 'MSME' | 'CITIZEN';
    role?: string;
  };
  tenantId?: string;
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const rawAuthHeader = req.headers.authorization;

  if (!rawAuthHeader) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[Auth] 401 UNAUTHORIZED: Missing Authorization header on ${req.method} ${req.originalUrl}`);
    }
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token required. Please provide "Authorization: Bearer <token>"',
      },
    });
    return;
  }

  const jwtRegex = /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/;
  const match = String(rawAuthHeader).match(jwtRegex);
  const token = match ? match[0] : String(rawAuthHeader).replace(/^bearer\s+/i, '').replace(/^["']|["']$/g, '').trim();

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      throw new Error(error?.message || 'Invalid token');
    }

    const supabaseUser = data.user;
    const userMetadata = supabaseUser.user_metadata || {};

    let effectiveUserId = supabaseUser.id;
    let effectiveTenantId = userMetadata.tenant_id || '';

    // Align effective IDs with database tenant
    try {
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: supabaseUser.id },
            { email: supabaseUser.email?.toLowerCase().trim() },
          ],
        },
      });
      if (dbUser) {
        effectiveUserId = dbUser.id;
        effectiveTenantId = dbUser.tenantId || effectiveTenantId;
      }
    } catch {
      // non-blocking fallback
    }

    (req as AuthenticatedRequest).user = {
      userId: effectiveUserId,
      tenantId: effectiveTenantId,
      email: supabaseUser.email || '',
      isPlatformAdmin: userMetadata.is_platform_admin === true,
      userType: userMetadata.user_type as 'MSME' | 'CITIZEN' | undefined,
      role: userMetadata.role || undefined,
    };
    (req as AuthenticatedRequest).tenantId = effectiveTenantId;

    next();
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[Auth] 401 INVALID_TOKEN on ${req.method} ${req.originalUrl}: ${error.message}`);
    }
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired authentication token',
        detail: error.message,
      },
    });
    return;
  }
}
