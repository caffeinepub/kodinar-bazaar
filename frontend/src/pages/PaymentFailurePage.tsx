import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { XCircle, ShoppingCart, Home, RefreshCw } from 'lucide-react';

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-saffron/15 shadow-warm-lg p-8 text-center">
          {/* Failure Icon */}
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="font-display text-2xl font-bold text-deep-brown mb-2">
            Payment Cancelled
          </h1>
          <p className="text-muted-foreground font-body mb-6">
            Your payment was not completed. Don't worry — your order has been saved and you can try again.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-body text-amber-800 font-medium mb-1">What happened?</p>
            <ul className="text-xs font-body text-amber-700 space-y-1 list-disc list-inside">
              <li>Payment was cancelled or declined</li>
              <li>Your cart items are still reserved</li>
              <li>No charges were made to your account</li>
            </ul>
          </div>

          {/* Decorative divider */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 h-px bg-saffron/20" />
            <span className="text-saffron text-lg">🪔</span>
            <div className="flex-1 h-px bg-saffron/20" />
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate({ to: '/cart' })}
              className="w-full bg-saffron hover:bg-saffron-dark text-white font-body font-semibold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/products', search: { category: undefined } })}
              className="w-full border-saffron/30 text-deep-brown font-body"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate({ to: '/' })}
              className="w-full text-muted-foreground font-body"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
