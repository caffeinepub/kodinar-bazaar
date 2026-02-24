import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetProduct, useAddToCart } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Zap,
  Package,
  MapPin,
  Minus,
  Plus,
  ArrowLeft,
  Store,
  Loader2,
} from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { productId } = useParams({ from: '/products/$productId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [quantity, setQuantity] = useState(1);
  const addToCart = useAddToCart();

  const { data: product, isLoading, error } = useGetProduct(
    productId ? BigInt(productId) : null
  );

  const isOutOfStock = product ? product.stock === BigInt(0) : false;
  const maxQty = product ? Number(product.stock) : 0;

  const handleAddToCart = async () => {
    if (!identity) {
      toast.error('Please login to add items to cart');
      return;
    }
    if (!product) return;
    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: BigInt(quantity) });
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate({ to: '/cart' });
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Package className="w-16 h-16 text-saffron/30 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-deep-brown mb-2">Product Not Found</h2>
        <p className="text-muted-foreground font-body mb-6">This product may have been removed.</p>
        <Button
          onClick={() => navigate({ to: '/products', search: { category: undefined } })}
          className="bg-saffron hover:bg-saffron-dark text-white font-body"
        >
          Browse Products
        </Button>
      </main>
    );
  }

  const imageUrl = product.blob.getDirectURL();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate({ to: '/products', search: { category: undefined } })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-saffron font-body mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-cream border border-saffron/15 shadow-warm">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-20 h-20 text-saffron/20" />
                </div>
              )}
            </div>
            {isOutOfStock && (
              <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                <span className="bg-white text-deep-brown font-body font-bold px-6 py-2 rounded-full text-lg">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <Badge className="w-fit bg-terracotta text-white border-0 font-body mb-3">
              {product.category}
            </Badge>

            <h1 className="font-display text-3xl font-bold text-deep-brown mb-2">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-saffron" />
              <span className="text-sm text-muted-foreground font-body">{product.city}</span>
            </div>

            <div className="text-3xl font-bold text-saffron font-body mb-4">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </div>

            <p className="text-muted-foreground font-body leading-relaxed mb-6">
              {product.description}
            </p>

            <Separator className="mb-6" />

            {/* Stock info */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-destructive' : 'bg-green-500'}`} />
              <span className={`text-sm font-body font-medium ${isOutOfStock ? 'text-destructive' : 'text-green-600'}`}>
                {isOutOfStock ? 'Out of Stock' : `${Number(product.stock)} in stock`}
              </span>
            </div>

            {/* Seller info */}
            <div className="flex items-center gap-3 p-3 bg-cream rounded-xl mb-6">
              <div className="w-9 h-9 rounded-full bg-saffron/20 flex items-center justify-center">
                <Store className="w-4 h-4 text-saffron" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-body">Sold by</p>
                <p className="text-sm font-body font-semibold text-deep-brown truncate max-w-[200px]">
                  {product.seller.toString().slice(0, 20)}...
                </p>
              </div>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-body font-medium text-deep-brown">Quantity:</span>
                <div className="flex items-center gap-2 border border-saffron/30 rounded-full px-2 py-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded-full hover:bg-saffron/10 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3 h-3 text-deep-brown" />
                  </button>
                  <span className="w-8 text-center font-body font-semibold text-deep-brown">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                    className="w-7 h-7 rounded-full hover:bg-saffron/10 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3 h-3 text-deep-brown" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                size="lg"
                disabled={isOutOfStock || addToCart.isPending}
                onClick={handleAddToCart}
                variant="outline"
                className="flex-1 border-saffron text-saffron hover:bg-saffron/10 font-body font-semibold"
              >
                {addToCart.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4 mr-2" />
                )}
                Add to Cart
              </Button>
              <Button
                size="lg"
                disabled={isOutOfStock || addToCart.isPending}
                onClick={handleBuyNow}
                className="flex-1 bg-saffron hover:bg-saffron-dark text-white font-body font-semibold"
              >
                <Zap className="w-4 h-4 mr-2" />
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
