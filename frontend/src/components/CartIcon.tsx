import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useGetCart } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface CartIconProps {
  onClick: () => void;
}

export default function CartIcon({ onClick }: CartIconProps) {
  const { identity } = useInternetIdentity();
  const { data: cartItems } = useGetCart();

  const itemCount = identity ? (cartItems?.length ?? 0) : 0;

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-saffron/10 transition-colors"
      aria-label="Shopping cart"
    >
      <ShoppingCart className="w-6 h-6 text-deep-brown" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta text-white text-xs font-bold rounded-full flex items-center justify-center font-body">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
}
