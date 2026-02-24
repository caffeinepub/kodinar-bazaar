import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  useGetCart,
  useGetAllProducts,
  useRemoveFromCart,
  useAddToCart,
  usePlaceOrder,
  useCreateCheckoutSession,
  useIsStripeConfigured,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  Package,
  Loader2,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Product, ShoppingItem } from '../backend';

export default function CartPage() {
  const navigate = useNavigate();
  const { data: cartItems, isLoading: cartLoading } = useGetCart();
  const { data: allProducts, isLoading: productsLoading } = useGetAllProducts();
  const { data: stripeConfigured } = useIsStripeConfigured();
  const removeFromCart = useRemoveFromCart();
  const addToCart = useAddToCart();
  const placeOrder = usePlaceOrder();
  const createCheckoutSession = useCreateCheckoutSession();

  const isLoading = cartLoading || productsLoading;
  const isProcessing = placeOrder.isPending || createCheckoutSession.isPending;

  const cartWithProducts = React.useMemo(() => {
    if (!cartItems || !allProducts) return [];
    return cartItems
      .map((item) => {
        const product = allProducts.find((p) => p.id === item.productId);
        return product ? { item, product } : null;
      })
      .filter(Boolean) as { item: typeof cartItems[0]; product: Product }[];
  }, [cartItems, allProducts]);

  const subtotal = cartWithProducts.reduce(
    (sum, { item, product }) => sum + Number(product.price) * Number(item.quantity),
    0
  );

  const handleRemove = async (productId: bigint) => {
    try {
      await removeFromCart.mutateAsync(productId);
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to remove item');
    }
  };

  const handleQuantityChange = async (productId: bigint, newQty: number) => {
    if (newQty < 1) {
      await handleRemove(productId);
      return;
    }
    try {
      await addToCart.mutateAsync({ productId, quantity: BigInt(newQty) });
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to update quantity');
    }
  };

  const handleCheckout = async () => {
    try {
      // Step 1: Place the order (creates a pending order and clears cart)
      const orderId = await placeOrder.mutateAsync();

      if (stripeConfigured) {
        // Step 2: Build shopping items for Stripe
        const shoppingItems: ShoppingItem[] = cartWithProducts.map(({ item, product }) => ({
          productName: product.name,
          productDescription: product.description || product.name,
          currency: 'inr',
          // Stripe expects amount in smallest currency unit (paise for INR)
          priceInCents: BigInt(Number(product.price) * 100),
          quantity: item.quantity,
        }));

        // Step 3: Create Stripe checkout session and redirect
        const session = await createCheckoutSession.mutateAsync(shoppingItems);
        if (!session?.url) throw new Error('Stripe session missing url');
        // Redirect to Stripe hosted checkout
        window.location.href = session.url;
      } else {
        // Stripe not configured — go directly to confirmation
        toast.success('Order placed successfully! 🎉');
        navigate({ to: '/order-confirmation/$orderId', params: { orderId: orderId.toString() } });
      }
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to process order');
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate({ to: '/products', search: { category: undefined } })}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-saffron font-body transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </button>
        </div>

        <h1 className="font-display text-2xl font-bold text-deep-brown mb-6 flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-saffron" />
          Your Cart
          {cartItems && cartItems.length > 0 && (
            <span className="text-base font-body font-normal text-muted-foreground">
              ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
            </span>
          )}
        </h1>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-saffron/15">
                <Skeleton className="w-20 h-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && cartWithProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-saffron/10 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-saffron/40" />
            </div>
            <h2 className="font-display text-xl font-semibold text-deep-brown mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground font-body mb-6">
              Discover amazing local products from Kodinar sellers
            </p>
            <Button
              onClick={() => navigate({ to: '/products', search: { category: undefined } })}
              className="bg-saffron hover:bg-saffron-dark text-white font-body"
            >
              Browse Products
            </Button>
          </div>
        )}

        {!isLoading && cartWithProducts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {cartWithProducts.map(({ item, product }) => {
                const imageUrl = product.blob.getDirectURL();
                const lineTotal = Number(product.price) * Number(item.quantity);

                return (
                  <div
                    key={product.id.toString()}
                    className="flex gap-4 p-4 bg-white rounded-xl border border-saffron/15 shadow-xs hover:shadow-warm transition-shadow"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                      {imageUrl ? (
                        <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-saffron/20" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-deep-brown text-sm leading-tight mb-1 truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-body mb-2">{product.category}</p>

                      <div className="flex items-center justify-between">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 border border-saffron/30 rounded-full px-2 py-0.5">
                          <button
                            onClick={() => handleQuantityChange(product.id, Number(item.quantity) - 1)}
                            disabled={isProcessing}
                            className="w-6 h-6 rounded-full hover:bg-saffron/10 flex items-center justify-center disabled:opacity-50"
                          >
                            <Minus className="w-3 h-3 text-deep-brown" />
                          </button>
                          <span className="w-6 text-center text-sm font-body font-semibold text-deep-brown">
                            {Number(item.quantity)}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(product.id, Number(item.quantity) + 1)}
                            disabled={isProcessing}
                            className="w-6 h-6 rounded-full hover:bg-saffron/10 flex items-center justify-center disabled:opacity-50"
                          >
                            <Plus className="w-3 h-3 text-deep-brown" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-body font-bold text-saffron">
                            ₹{lineTotal.toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => handleRemove(product.id)}
                            disabled={isProcessing}
                            className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-saffron/15 p-5 sticky top-24 shadow-warm">
                <h2 className="font-display font-bold text-deep-brown text-lg mb-4">Order Summary</h2>

                <div className="space-y-2 mb-4">
                  {cartWithProducts.map(({ item, product }) => (
                    <div key={product.id.toString()} className="flex justify-between text-sm font-body">
                      <span className="text-muted-foreground truncate max-w-[140px]">
                        {product.name} × {Number(item.quantity)}
                      </span>
                      <span className="text-deep-brown font-medium">
                        ₹{(Number(product.price) * Number(item.quantity)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center mb-6">
                  <span className="font-body font-semibold text-deep-brown">Total</span>
                  <span className="font-body font-bold text-xl text-saffron">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full bg-saffron hover:bg-saffron-dark text-white font-body font-semibold text-base py-5"
                >
                  {placeOrder.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : createCheckoutSession.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirecting to Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      {stripeConfigured ? 'Pay Now' : 'Place Order'}
                    </>
                  )}
                </Button>

                {stripeConfigured && (
                  <p className="text-xs text-muted-foreground font-body text-center mt-3 flex items-center justify-center gap-1">
                    🔒 Secure payment powered by Stripe
                  </p>
                )}
                {!stripeConfigured && (
                  <p className="text-xs text-muted-foreground font-body text-center mt-3">
                    🔒 Secure checkout powered by Kodinar Bazaar
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
