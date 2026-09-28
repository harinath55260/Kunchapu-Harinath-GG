import { auth } from './config';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// User-friendly translator for UI display
export function getFriendlyErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred.';
  const msg = error instanceof Error ? error.message : String(error);

  if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
    return 'Invalid email or password. Please check your credentials.';
  }
  if (msg.includes('auth/email-already-in-use')) {
    return 'An account with this email already exists. Try logging in instead.';
  }
  if (msg.includes('auth/weak-password')) {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (msg.includes('auth/popup-closed-by-user')) {
    return 'Sign-in popup was closed before completing.';
  }
  if (msg.includes('auth/network-request-failed')) {
    return 'Network connection issue. Please verify your internet connection.';
  }
  if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
    return 'Action not permitted by security rules. Ensure you are signed in.';
  }
  if (msg.includes('offline')) {
    return 'You appear to be offline. Some cultural content may be unavailable.';
  }
  return msg.length < 120 ? msg : 'Something went wrong. Please try again.';
}
