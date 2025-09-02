import { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';

// Types for authorization
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'business';
  walletAddress?: string;
}

export interface ResourceAccess {
  resourceType: 'user' | 'wallet' | 'transaction' | 'business';
  resourceId: string;
  ownerId?: string;
  allowedRoles?: string[];
}

// JWT verification (if using JWT tokens)
const verifyJWT = (token: string): AuthenticatedUser | null => {
  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'fallback-secret');
    return decoded as AuthenticatedUser;
  } catch (error) {
    return null;
  }
};

// Extract user from request (supports multiple auth methods)
const extractUser = async (req: NextApiRequest): Promise<AuthenticatedUser | null> => {
  // Try JWT token first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = verifyJWT(token);
    if (user) return user;
  }

  // Try API key (for service-to-service calls)
  const apiKey = req.headers['x-api-key'];
  if (apiKey === process.env.INTERNAL_API_KEY) {
    return {
      id: 'system',
      email: 'system@madhouse-wallet.com',
      role: 'admin'
    };
  }

  // For now, return a mock user for testing - this should be replaced with real auth
  // In production, you would implement proper session management
  if (req.headers['x-test-user']) {
    return {
      id: req.headers['x-test-user'] as string,
      email: req.headers['x-test-email'] as string || 'test@example.com',
      role: 'user'
    };
  }

  return null;
};

// Resource ownership verification
const verifyResourceAccess = async (
  user: AuthenticatedUser,
  resourceAccess: ResourceAccess,
  req: NextApiRequest
): Promise<boolean> => {
  const { resourceType, resourceId, ownerId, allowedRoles } = resourceAccess;

  // Admin override
  if (user.role === 'admin') return true;

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return false;
  }

  // Check resource ownership
  switch (resourceType) {
    case 'user':
      // Users can only access their own data
      return user.id === resourceId || user.email === resourceId;
    
    case 'wallet':
      // Users can only access wallets they own
      if (ownerId) {
        return user.id === ownerId;
      }
      // If no ownerId provided, verify through database lookup
      return await verifyWalletOwnership(user, resourceId, req);
    
    case 'transaction':
      // Users can only access their own transactions
      if (ownerId) {
        return user.id === ownerId;
      }
      return await verifyTransactionOwnership(user, resourceId, req);
    
    case 'business':
      // Business users can access their own business accounts
      if (user.role === 'business') {
        return await verifyBusinessOwnership(user, resourceId, req);
      }
      return false;
    
    default:
      return false;
  }
};

// Database verification helpers
const verifyWalletOwnership = async (
  user: AuthenticatedUser, 
  walletId: string, 
  req: NextApiRequest
): Promise<boolean> => {
  try {
    // This would typically query your database
    // For now, we'll use a placeholder that should be implemented
    const { lambdaInvokeFunction } = await import('../../lib/apiCall');
    
    const response = await lambdaInvokeFunction(
      { email: user.email },
      "madhouse-backend-production-getUser"
    );
    
    if (response?.status === "success") {
      const userData = response.data;
      // Check if user owns this wallet
      return userData.lnbitWalletId === walletId || 
             userData.lnbitWalletId_2 === walletId ||
             userData.lnbitWalletId_3 === walletId;
    }
    return false;
  } catch (error) {
    console.error('Wallet ownership verification failed:', error);
    return false;
  }
};

const verifyTransactionOwnership = async (
  user: AuthenticatedUser, 
  transactionId: string, 
  req: NextApiRequest
): Promise<boolean> => {
  try {
    // This would typically query your database
    // For now, return false to be safe
    return false;
  } catch (error) {
    console.error('Transaction ownership verification failed:', error);
    return false;
  }
};

const verifyBusinessOwnership = async (
  user: AuthenticatedUser, 
  businessId: string, 
  req: NextApiRequest
): Promise<boolean> => {
  try {
    // This would typically query your database
    // For now, return false to be safe
    return false;
  } catch (error) {
    console.error('Business ownership verification failed:', error);
    return false;
  }
};

// Main authorization middleware
export const withAuth = (
  resourceAccess?: ResourceAccess,
  options: {
    requireAuth?: boolean;
    allowedRoles?: string[];
  } = {}
) => {
  return async (req: NextApiRequest, res: NextApiResponse, next?: () => void) => {
    try {
      const { requireAuth = true, allowedRoles } = options;

      // Extract authenticated user
      const user = await extractUser(req);

      // Check if authentication is required
      if (requireAuth && !user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in to access this resource'
        });
      }

      // Check role-based access
      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: 'You do not have permission to access this resource'
        });
      }

      // Check resource-specific access
      if (resourceAccess && user) {
        const hasAccess = await verifyResourceAccess(user, resourceAccess, req);
        if (!hasAccess) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'You do not have permission to access this resource'
          });
        }
      }

      // Attach user to request for route handlers
      (req as any).user = user;

      // Call next if using Express-style middleware
      if (next) {
        next();
      }

      return true;
    } catch (error) {
      console.error('Authorization middleware error:', error);
      return res.status(500).json({
        error: 'Authorization failed',
        message: 'Internal server error during authorization'
      });
    }
  };
};

// Helper function to extract resource identifiers from request
export const extractResourceIdentifiers = (req: NextApiRequest): ResourceAccess | null => {
  const { body, query, params } = req;
  
  // Check for common identifier patterns
  const identifiers = {
    id: body?.id || query?.id || params?.id,
    userId: body?.userId || query?.userId || params?.userId,
    accountId: body?.accountId || query?.accountId || params?.accountId,
    email: body?.email || query?.email || params?.email,
    walletId: body?.walletId || query?.walletId || params?.walletId,
    tposId: body?.tposId || query?.tposId || params?.tposId,
    lnbitId: body?.lnbitId || query?.lnbitId || params?.lnbitId
  };

  // Determine resource type and ID
  if (identifiers.email) {
    return {
      resourceType: 'user',
      resourceId: identifiers.email
    };
  }

  if (identifiers.userId || identifiers.id) {
    return {
      resourceType: 'user',
      resourceId: identifiers.userId || identifiers.id
    };
  }

  if (identifiers.walletId) {
    return {
      resourceType: 'wallet',
      resourceId: identifiers.walletId
    };
  }

  if (identifiers.tposId) {
    return {
      resourceType: 'business',
      resourceId: identifiers.tposId
    };
  }

  return null;
};

// Higher-order function to wrap API routes with authorization
export const withAuthorization = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  options: {
    resourceType?: 'user' | 'wallet' | 'transaction' | 'business';
    requireAuth?: boolean;
    allowedRoles?: string[];
    customAccessCheck?: (user: AuthenticatedUser, req: NextApiRequest) => Promise<boolean>;
  } = {}
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { resourceType, requireAuth = true, allowedRoles, customAccessCheck } = options;

      // Extract resource identifiers
      const resourceAccess = resourceType ? extractResourceIdentifiers(req) : null;

      // Run authorization middleware
      const authResult = await withAuth(resourceAccess, { requireAuth, allowedRoles })(
        req, res, () => {}
      );

      // If authorization failed, the middleware already sent a response
      if (authResult !== true) {
        return;
      }

      // Run custom access check if provided
      if (customAccessCheck && (req as any).user) {
        const hasCustomAccess = await customAccessCheck((req as any).user, req);
        if (!hasCustomAccess) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'Custom access check failed'
          });
        }
      }

      // Call the original handler
      await handler(req, res);
    } catch (error) {
      console.error('Authorization wrapper error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Authorization processing failed'
      });
    }
  };
}; 