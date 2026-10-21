import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { loginSchema, registrationSchema, type RegistrationInput } from '../../schemas/auth';
import { supabaseClient, supabaseConfigStatus } from '../../services/supabase';
import { AuthContext } from './authContext';

function errorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (/invalid login credentials/i.test(message)) return 'That email and password combination was not recognised. Check your details and try again.';
  if (/email not confirmed/i.test(message)) return 'Confirm your email before signing in. Check your inbox for the verification message.';
  if (/already registered|user already exists/i.test(message)) return 'An account already uses that email. Try signing in instead.';
  if (/fetch|network|timeout|failed to connect/i.test(message)) return 'SEATS could not reach Supabase. Check your connection and project configuration, then retry.';
  return message || 'The authentication request could not be completed. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(supabaseClient !== null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    if (!supabaseClient) {
      setSession(null);
      setLoadingSession(false);
      return;
    }
    setLoadingSession(true);
    setError(null);
    try {
      const { data, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError) throw sessionError;
      setSession(data.session);
    } catch (sessionError) {
      setSession(null);
      setError(errorMessage(sessionError));
    } finally {
      setLoadingSession(false);
    }
  }, []);

  useEffect(() => {
    if (!supabaseClient) return;
    let active = true;
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setLoadingSession(false);
    });

    void supabaseClient.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) throw sessionError;
      setSession(data.session);
      setLoadingSession(false);
    }).catch((sessionError: unknown) => {
      if (!active) return;
      setSession(null);
      setError(errorMessage(sessionError));
      setLoadingSession(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const clearFeedback = useCallback(() => {
    setError(null);
    setNotice(null);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    clearFeedback();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the email and password.');
      return false;
    }
    if (!supabaseClient) {
      setError('Supabase Auth is not configured. Demo browsing remains available.');
      return false;
    }
    setSubmitting(true);
    try {
      const { error: authError } = await supabaseClient.auth.signInWithPassword(parsed.data);
      if (authError) throw authError;
      setNotice('Signed in. No booking or ticket has been created.');
      return true;
    } catch (authError) {
      setError(errorMessage(authError));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [clearFeedback]);

  const signUp = useCallback(async (input: RegistrationInput) => {
    clearFeedback();
    const parsed = registrationSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the registration details.');
      return false;
    }
    if (!supabaseClient) {
      setError('Supabase Auth is not configured. Demo browsing remains available.');
      return false;
    }
    setSubmitting(true);
    try {
      const { data, error: authError } = await supabaseClient.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: { data: { display_name: parsed.data.displayName } },
      });
      if (authError) throw authError;
      setNotice(data.session
        ? 'Account created and signed in. No booking or ticket has been created.'
        : 'Registration received. Check your email for any required confirmation.');
      return true;
    } catch (authError) {
      setError(errorMessage(authError));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [clearFeedback]);

  const signOut = useCallback(async () => {
    clearFeedback();
    if (!supabaseClient) return false;
    setSubmitting(true);
    try {
      const { error: authError } = await supabaseClient.auth.signOut();
      if (authError) throw authError;
      setNotice('You are signed out.');
      return true;
    } catch (authError) {
      setError(errorMessage(authError));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [clearFeedback]);

  const value = useMemo(() => ({
    configured: supabaseConfigStatus.configured,
    configurationMessage: supabaseConfigStatus.message,
    session,
    loadingSession,
    submitting,
    error,
    notice,
    signIn,
    signUp,
    signOut,
    refreshSession,
    clearFeedback,
  }), [session, loadingSession, submitting, error, notice, signIn, signUp, signOut, refreshSession, clearFeedback]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
