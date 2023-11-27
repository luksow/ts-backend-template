import { AsyncLocalStorage } from 'async_hooks';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { Email, Role, UserId } from '../user/domain';
import { TracingContext } from '../utils/http/middleware';
import { AuthContext } from './domain';

interface FirebaseConfig {
  credentials: string;
}

export interface Authenticator {
  authenticateOpt(req: { headers: { authorization?: string | undefined } }): Promise<AuthenticationResult | undefined>;
  authenticate(req: { headers: { authorization: string } }): Promise<AuthenticationResult>;
  authenticateOrThrow(req: { headers: { authorization: string } }): Promise<AuthContext>;
}

export class AuthenticationError extends Error {
  status = 'AuthenticationError' as const;
  result: AuthenticationResult;
  constructor(result: AuthenticationResult) {
    const cause = `Could not authenticate: ${result.status}`;
    super(cause);
    this.result = result;
    this.cause = cause;
  }
}

export type AuthenticationResult =
  | { status: 'Authenticated'; authContext: AuthContext }
  | { status: 'MissingEmail' }
  | { status: 'InvalidRoles' }
  | { status: 'InvalidToken'; error: unknown };

export function makeAuthenticator(firebaseConfig: FirebaseConfig, asyncLocalStorage: AsyncLocalStorage<TracingContext>): Authenticator {
  const app = initializeApp({
    credential: cert(JSON.parse(firebaseConfig.credentials)),
  });
  const auth = getAuth(app);
  async function authenticate(token: string): Promise<AuthenticationResult> {
    try {
      if (!token.startsWith('Bearer ')) return { status: 'InvalidToken', error: Error('Missing Bearer scheme') };

      const decoded = await auth.verifyIdToken(token.split(' ')[1] || '');
      if (!decoded.email) return { status: 'MissingEmail' };
      const email = decoded.email;

      const rolesOpt = decoded['roles'];
      if (!Array.isArray(rolesOpt) || !rolesOpt.every((role) => Role.parse(role))) return { status: 'InvalidRoles' };
      const roles: Array<Role> = rolesOpt;

      const store = asyncLocalStorage.getStore();
      if (store) {
        store.userId = UserId.parse(decoded.uid);
      }
      return { status: 'Authenticated', authContext: new AuthContext(UserId.parse(decoded.uid), Email.parse(email), roles) };
    } catch (e) {
      return { status: 'InvalidToken', error: e };
    }
  }
  return {
    async authenticateOpt(req: { headers: { authorization?: string | undefined } }): Promise<AuthenticationResult | undefined> {
      const token = req.headers['authorization'];
      if (!token) return undefined;
      return authenticate(token);
    },
    async authenticate(req: { headers: { authorization: string } }): Promise<AuthenticationResult> {
      const token = req.headers['authorization'];
      return authenticate(token);
    },
    async authenticateOrThrow(req: { headers: { authorization: string } }): Promise<AuthContext> {
      const authResult = await authenticate(req.headers['authorization']);
      if (authResult.status === 'Authenticated') return authResult.authContext;
      else throw new AuthenticationError(authResult);
    },
  };
}
