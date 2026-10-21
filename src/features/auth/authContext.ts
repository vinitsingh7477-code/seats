import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { RegistrationInput } from '../../schemas/auth';

export interface AuthContextValue {
  configured: boolean;
  configurationMessage: string;
  session: Session | null;
  loadingSession: boolean;
  submitting: boolean;
  error: string | null;
  notice: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (input: RegistrationInput) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  refreshSession: () => Promise<void>;
  clearFeedback: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
