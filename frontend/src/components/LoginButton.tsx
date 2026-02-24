import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={isLoggingIn}
      variant={isAuthenticated ? 'outline' : 'default'}
      size="sm"
      className={
        isAuthenticated
          ? 'border-saffron text-saffron hover:bg-saffron/10 font-body'
          : 'bg-saffron hover:bg-saffron-dark text-white font-body'
      }
    >
      {isLoggingIn ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Logging in...
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </>
      ) : (
        <>
          <LogIn className="w-4 h-4 mr-2" />
          Login
        </>
      )}
    </Button>
  );
}
