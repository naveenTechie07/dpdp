import { Prisma } from '@prisma/client';
import { prisma, isDbConnected } from '../../lib/prisma';
import { hashPassword } from '../../lib/password';
import { RegisterInput, LoginInput } from './auth.schema';
import { recordAuditEvent } from '../audit/audit.service';
import { getSupabaseAdmin } from '../../lib/supabase';

function requireDb() {
  if (!isDbConnected()) {
    const error: any = new Error('Database not connected. Please configure DATABASE_URL in your environment.');
    error.status = 503;
    error.code = 'DATABASE_NOT_CONNECTED';
    throw error;
  }
}

export async function register(input: RegisterInput, ipAddress?: string, userAgent?: string) {
  requireDb();
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existingUser) {
    const error: any = new Error('An account with this email address already exists');
    error.status = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  const isCitizen = input.userType === 'CITIZEN';
  const defaultWorkspaceName = isCitizen
    ? `${input.firstName.trim()}'s Personal Vault`
    : `${input.firstName.trim()}'s MSME Workspace`;
  const workspaceName = input.tenantName?.trim() || defaultWorkspaceName;

  // 1. Create user in Supabase Auth
  const supabase = getSupabaseAdmin();
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email.toLowerCase().trim(),
    password: input.password,
    email_confirm: true,
    user_metadata: {
      user_type: isCitizen ? 'CITIZEN' : 'MSME',
      first_name: input.firstName.trim(),
      last_name: input.lastName ? input.lastName.trim() : null,
      phone: input.phone || null,
    },
  });

  if (authError || !authData?.user) {
    const error: any = new Error(authError?.message || 'Failed to create account');
    error.status = 400;
    error.code = 'SUPABASE_AUTH_ERROR';
    throw error;
  }

  const authUserId = authData.user.id;

  // 2. Execute multi-entity creation in atomic transaction
  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const tenant = await tx.tenant.create({
      data: {
        name: workspaceName,
        plan: isCitizen ? 'CITIZEN' : 'STARTER',
        status: 'ACTIVE',
      },
    });

    const roleCode = isCitizen ? 'CITIZEN' : 'ADMIN';
    const roleName = isCitizen ? 'Individual Data Principal' : 'Workspace Administrator';

    const primaryRole = await tx.role.create({
      data: {
        tenantId: tenant.id,
        roleCode: roleCode,
        name: roleName,
        isSystem: true,
      },
    });

    if (!isCitizen) {
      await tx.role.createMany({
        data: [
          {
            tenantId: tenant.id,
            roleCode: 'COMPLIANCE_OFFICER',
            name: 'Data Protection Officer / Compliance Admin',
            isSystem: true,
          },
          {
            tenantId: tenant.id,
            roleCode: 'VIEWER',
            name: 'Read-only Auditor',
            isSystem: true,
          },
        ],
      });
    }

    const user = await tx.user.create({
      data: {
        id: authUserId,
        tenantId: tenant.id,
        email: input.email.toLowerCase().trim(),
        passwordHash: '', // Password managed by Supabase Auth
        firstName: input.firstName.trim(),
        lastName: input.lastName ? input.lastName.trim() : null,
        isPlatformAdmin: false,
      },
    });

    await tx.userRole.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        roleCode: primaryRole.roleCode,
      },
    });

    return { tenant, user, roleCode };
  });

  // 3. Record Audit Event
  await recordAuditEvent({
    tenantId: result.tenant.id,
    actorId: result.user.id,
    action: isCitizen ? 'AUTH_REGISTER_CITIZEN' : 'AUTH_REGISTER_MSME',
    resourceType: 'TENANT',
    resourceId: result.tenant.id,
    diffJson: {
      tenantName: result.tenant.name,
      email: result.user.email,
      userType: isCitizen ? 'CITIZEN' : 'MSME',
      phone: input.phone || null,
    },
    ipAddress,
    userAgent,
  });

  // 4. Generate Supabase Auth session token
  const { data: sessionData } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: input.email.toLowerCase().trim(),
  });

  // Get a fresh token by signing in via admin API
  const { data: tokenData } = await supabase.auth.admin.generateLink({
    type: 'invite',
    email: input.email.toLowerCase().trim(),
  });

  // Use the Supabase user JWT by creating a session
  const { data: authResponse } = await supabase.auth.signInWithPassword({
    email: input.email.toLowerCase().trim(),
    password: input.password,
  });

  const token = authResponse?.session?.access_token || '';

  return {
    token,
    user: {
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      role: result.roleCode,
      userType: isCitizen ? ('CITIZEN' as const) : ('MSME' as const),
      phone: input.phone,
    },
    tenant: {
      id: result.tenant.id,
      name: result.tenant.name,
      plan: result.tenant.plan,
      status: result.tenant.status,
    },
  };
}

export async function login(input: LoginInput, ipAddress?: string, userAgent?: string) {
  requireDb();
  const supabase = getSupabaseAdmin();

  // 1. Authenticate via Supabase Auth
  const { data: authResponse, error: authError } = await supabase.auth.signInWithPassword({
    email: input.email.toLowerCase().trim(),
    password: input.password,
  });

  if (authError || !authResponse?.user || !authResponse.session) {
    const error: any = new Error('Invalid email or password');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const authUser = authResponse.user;
  const userMetadata = authUser.user_metadata || {};

  // 2. Fetch user record from our database with tenant info
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      tenant: true,
      userRoles: true,
    },
  });

  if (!user) {
    const error: any = new Error('User account not found in workspace');
    error.status = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  if (user.tenant.status === 'SUSPENDED' || user.tenant.status === 'DEACTIVATED') {
    const error: any = new Error('This business workspace has been suspended. Please contact support.');
    error.status = 403;
    error.code = 'TENANT_SUSPENDED';
    throw error;
  }

  const isCitizen = user.tenant.plan === 'CITIZEN' || user.userRoles.some((ur) => ur.roleCode === 'CITIZEN');
  const userType: 'MSME' | 'CITIZEN' = isCitizen ? 'CITIZEN' : 'MSME';
  const primaryRole = user.userRoles[0]?.roleCode || (isCitizen ? 'CITIZEN' : 'ADMIN');

  if (input.userType && input.userType !== userType) {
    if (input.userType === 'CITIZEN' && userType === 'MSME') {
      const error: any = new Error(
        'Access Denied: This account is registered as an MSME Business Administrator and cannot log into the Citizen Privacy Portal.',
      );
      error.status = 403;
      error.code = 'ROLE_MISMATCH';
      throw error;
    } else if (input.userType === 'MSME' && userType === 'CITIZEN') {
      const error: any = new Error(
        'Access Denied: This account is registered as an Individual Citizen and cannot log into the MSME Business Portal.',
      );
      error.status = 403;
      error.code = 'ROLE_MISMATCH';
      throw error;
    }
  }

  await recordAuditEvent({
    tenantId: user.tenantId,
    actorId: user.id,
    action: 'AUTH_LOGIN',
    resourceType: 'USER',
    resourceId: user.id,
    ipAddress,
    userAgent,
  });

  return {
    token: authResponse.session.access_token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: primaryRole,
      userType,
      isPlatformAdmin: user.isPlatformAdmin,
    },
    tenant: {
      id: user.tenant.id,
      name: user.tenant.name,
      plan: user.tenant.plan,
      status: user.tenant.status,
    },
  };
}

export async function getCurrentUser(userId: string, tenantId: string) {
  requireDb();
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      tenantId: tenantId,
    },
    include: {
      tenant: true,
      userRoles: true,
    },
  });

  if (!user) {
    const error: any = new Error('User not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  const isCitizen = user.tenant.plan === 'CITIZEN' || user.userRoles.some((ur) => ur.roleCode === 'CITIZEN');
  const userType: 'MSME' | 'CITIZEN' = isCitizen ? 'CITIZEN' : 'MSME';
  const primaryRole = user.userRoles[0]?.roleCode || (isCitizen ? 'CITIZEN' : 'ADMIN');

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: primaryRole,
      userType,
      isPlatformAdmin: user.isPlatformAdmin,
    },
    tenant: {
      id: user.tenant.id,
      name: user.tenant.name,
      plan: user.tenant.plan,
      status: user.tenant.status,
    },
  };
}
