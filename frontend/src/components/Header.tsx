import React from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import CartIcon from './CartIcon';
import LoginButton from './LoginButton';
import { Badge } from '@/components/ui/badge';
import { Store, LayoutDashboard, ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { UserRole } from '../backend';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = [
    { label: 'Browse', path: '/products', icon: <ShoppingBag className="w-4 h-4" /> },
    ...(identity && userProfile?.role === UserRole.seller
      ? [{ label: 'My Shop', path: '/seller/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 shadow-warm">
      {/* Top gradient bar */}
      <div className="h-1 bazaar-gradient" />

      <div className="bg-white border-b border-saffron/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-3 group"
            >
              <img
                src="/assets/generated/kodinar-bazaar-logo.dim_256x256.png"
                alt="Kodinar Bazaar Logo"
                className="w-10 h-10 rounded-full object-cover shadow-sm"
              />
              <div className="hidden sm:block">
                <h1 className="font-display text-xl font-bold text-deep-brown leading-tight">
                  Kodinar Bazaar
                </h1>
                <p className="text-xs text-saffron font-body font-medium tracking-wide">
                  Local • Fresh • Authentic
                </p>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate({ to: link.path })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-body font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-saffron text-white shadow-sm'
                      : 'text-deep-brown hover:bg-saffron/10 hover:text-saffron'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* User info */}
              {identity && userProfile && (
                <div className="hidden sm:flex items-center gap-2 mr-1">
                  <div className="w-8 h-8 rounded-full bg-saffron/20 flex items-center justify-center">
                    <Store className="w-4 h-4 text-saffron" />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-xs font-body font-semibold text-deep-brown leading-tight">
                      {userProfile.name}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs px-1.5 py-0 border-0 font-body ${
                        userProfile.role === UserRole.seller
                          ? 'bg-terracotta/10 text-terracotta'
                          : 'bg-saffron/10 text-saffron'
                      }`}
                    >
                      {userProfile.role === UserRole.seller ? 'Seller' : 'Buyer'}
                    </Badge>
                  </div>
                </div>
              )}

              <CartIcon onClick={() => navigate({ to: '/cart' })} />
              <LoginButton />

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-full hover:bg-saffron/10 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-deep-brown" />
                ) : (
                  <Menu className="w-5 h-5 text-deep-brown" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-saffron/20 bg-cream px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate({ to: link.path });
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-body font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-saffron text-white'
                    : 'text-deep-brown hover:bg-saffron/10'
                }`}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
            {identity && userProfile && (
              <div className="pt-2 border-t border-saffron/20 mt-2">
                <p className="text-xs font-body text-muted-foreground px-4">
                  Signed in as <span className="font-semibold text-deep-brown">{userProfile.name}</span>
                  {' '}({userProfile.role === UserRole.seller ? 'Seller' : 'Buyer'})
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
