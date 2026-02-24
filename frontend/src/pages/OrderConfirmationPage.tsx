import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetOrder } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, ShoppingBag, Home, Clock, XCircle } from 'lucide-react';
import { OrderStatus } from '../backend';

export default function OrderConfirmationPage() {
  const { orderId } = useParams({ from: '/order-confirmation/$orderId' });
  const navigate = useNavigate();
  const { data: order, isLoading } = useGetOrder(orderId ? BigInt(orderId) : null);

  const isPaid = order?.status === OrderStatus.paid;
  const isPending = order?.status === OrderStatus.pending;
  const isFailed = order?.status === OrderStatus.failed;

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-saffron/15 shadow-warm-lg p-8 text-center">

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="w-20 h-20 rounded-full mx-auto" />
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : (
            <>
              {/* Status Icon */}
              {isPaid && (
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
              )}
              {isPending && (
                <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-amber-500" />
                </div>
              )}
              {isFailed && (
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
              )}
              {!order && (
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
              )}

              <h1 className="font-display text-2xl font-bold text-deep-brown mb-2">
                {isPaid ? 'Order Confirmed! 🎉' : isPending ? 'Order Pending Payment' : isFailed ? 'Payment Failed' : 'Order Placed! 🎉'}
              </h1>
              <p className="text-muted-foreground font-body mb-6">
                {isPaid
                  ? 'Your payment was successful. Thank you for shopping at Kodinar Bazaar!'
                  : isPending
                  ? 'Your order is awaiting payment confirmation.'
                  : isFailed
                  ? 'Your payment could not be processed. Please try again.'
                  : 'Thank you for shopping at Kodinar Bazaar. Your order has been received.'}
              </p>

              {/* Order ID */}
              <div className="bg-cream rounded-xl p-4 mb-6">
                <p className="text-xs text-muted-foreground font-body mb-1">Order ID</p>
                <p className="font-body font-bold text-deep-brown text-lg">#{orderId}</p>
              </div>

              {/* Order Details */}
              {order && (
                <div className="text-left mb-6">
                  <Separator className="mb-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-body">
                      <span className="text-muted-foreground">Items</span>
                      <span className="text-deep-brown font-medium">{order.items.length}</span>
                    </div>
                    <div className="flex justify-between text-sm font-body">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="text-saffron font-bold">
                        ₹{Number(order.total).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-body">
                      <span className="text-muted-foreground">Payment Status</span>
                      <span
                        className={`font-semibold capitalize ${
                          isPaid ? 'text-green-600' : isPending ? 'text-amber-600' : 'text-red-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    {order.timestamp && (
                      <div className="flex justify-between text-sm font-body">
                        <span className="text-muted-foreground">Placed On</span>
                        <span className="text-deep-brown font-medium">
                          {new Date(Number(order.timestamp) / 1_000_000).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Decorative divider */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex-1 h-px bg-saffron/20" />
                <span className="text-saffron text-lg">🪔</span>
                <div className="flex-1 h-px bg-saffron/20" />
              </div>

              {isPending && (
                <p className="text-sm text-amber-700 font-body bg-amber-50 rounded-lg p-3 mb-4">
                  ⏳ Payment is being processed. If you completed payment via Stripe, it will be confirmed shortly.
                </p>
              )}

              {!isPending && (
                <p className="text-sm text-muted-foreground font-body mb-6">
                  The seller will prepare your order. Thank you for supporting local businesses in Kodinar!
                </p>
              )}

              <div className="flex flex-col gap-3">
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
            </>
          )}
        </div>
      </div>
    </main>
  );
}
