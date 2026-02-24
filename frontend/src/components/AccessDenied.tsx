import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ShieldX, Home } from 'lucide-react';

interface AccessDeniedProps {
  message?: string;
}

export default function AccessDenied({ message }: AccessDeniedProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-full bg-terracotta/10 flex items-center justify-center mb-6">
        <ShieldX className="w-10 h-10 text-terracotta" />
      </div>
      <h2 className="font-display text-2xl font-bold text-deep-brown mb-3">Access Denied</h2>
      <p className="text-muted-foreground font-body max-w-sm mb-6">
        {message || 'You do not have permission to access this page. Only registered sellers can view this section.'}
      </p>
      <Button
        onClick={() => navigate({ to: '/' })}
        className="bg-saffron hover:bg-saffron-dark text-white font-body"
      >
        <Home className="w-4 h-4 mr-2" />
        Go Home
      </Button>
    </div>
  );
}
