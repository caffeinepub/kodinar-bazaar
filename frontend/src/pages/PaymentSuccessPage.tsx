import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetStripeSessionStatus } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, ShoppingBag, Home, Loader2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();

  // Extract session_id from URL query params
  const sessionId = React.useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('session_id');
  }, []);

  const { data: sessionStatus, isLoading } = useGetStripeSessionStatus(sessionId);

  const isCompleted = sessionStatus?.__kind__ === 'completed';
  const isFailed = sessionStatus?.__kind__ === 'failed';

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-saffron/15 shadow-warm-lg p-8 text-center">
          {isLoading && (
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-saffron/10 flex items-center justify-center mx-auto">
                <Loader2 className="w-10 h-10 text-saffron animate-spin" />
              </div>
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
          )}

          {!isLoading && isCompleted && (
            <>
              {/* Success Icon */}
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>

              <h1 className="font-display text-2xl font-bold text-deep-brown mb-2">
                Payment Successful! 🎉
              </h1>
              <p className="text-muted-foreground font-body mb-6">
                Your payment has been confirmed. Thank you for shopping at Kodinar Bazaar!
              </p>

              <div className="bg-cream rounded-xl p-4 mb-6">
                <p className="text-xs text-muted-foreground font-body mb-1">Payment Status</p>
                <p className="font-body font-bold text-green-600 text-lg">Confirmed ✓</p>
              </div>

              {/* Decorative divider */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex-1 h-px bg-saffron/20" />
                <span className="text-saffron text-lg">🪔</span>
                <div className="flex-1 h-px bg-saffron/20" />
              </div>

              <p className="text-sm text-muted-foreground font-body mb-6">
                The seller will prepare your order. Thank you for supporting local businesses in Kodinar!
              </p>
            </>
          )}

          {!isLoading && isFailed && (
            <>
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">❌</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-deep-brown mb-2">
                Payment Verification Failed
              </h1>
              <p className="text-muted-foreground font-body mb-6">
                We could not verify your payment. Please contact support if you were charged.
              </p>
            </>
          )}

          {!isLoading && !sessionId && (
            <>
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="font-display text-2xl font-bold text-deep-brown mb-2">
                Order Placed! 🎉
              </h1>
              <p className="text-muted-foreground font-body mb-6">
                Your order has been placed successfully. Thank you for shopping at Kodinar Bazaar!
              </p>
            </>
          )}

          {!isLoading && (
            <div className="flex flex-col gap-3 mt-4">
              <Button
                onClick={() => navigate({ to: '/products', search: { category: undefined } })}
                className="w-full bg-saffron hover:bg-saffron-dark text-white font-body font-semibold"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/' })}
                className="w-full border-saffron/30 text-deep-brown font-body"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
