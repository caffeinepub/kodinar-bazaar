import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, Loader2 } from 'lucide-react';
import type { Product } from '../backend';
import { useAddToCart } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const addToCart = useAddToCart();

  const imageUrl = product.blob.getDirectURL();
  const isOutOfStock = product.stock === BigInt(0);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!identity) {
      toast.error('Please login to add items to cart');
      return;
    }
    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: BigInt(1) });
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to add to cart');
    }
  };

  return (
    <Card
      className="group cursor-pointer overflow-hidden border border-saffron/15 hover:border-saffron/40 hover:shadow-warm transition-all duration-200 bg-white"
      onClick={() => navigate({ to: '/products/$productId', params: { productId: product.id.toString() } })}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden bg-cream aspect-[4/3]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-saffron/30" />
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-deep-brown text-xs font-body font-bold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        <Badge className="absolute top-2 left-2 bg-terracotta text-white text-xs font-body border-0 shadow-sm">
          {product.category}
        </Badge>
      </div>

      <CardContent className="p-4">
        <h3 className="font-display font-semibold text-deep-brown text-base leading-tight mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground font-body mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-saffron font-body">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            {!isOutOfStock && (
              <p className="text-xs text-muted-foreground font-body">
                {Number(product.stock)} left
              </p>
            )}
          </div>

          <Button
            size="sm"
            disabled={isOutOfStock || addToCart.isPending}
            onClick={handleAddToCart}
            className="bg-saffron hover:bg-saffron-dark text-white font-body text-xs px-3"
          >
            {addToCart.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-3 h-3 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
