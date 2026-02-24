import React, { useState } from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import ProfileSetupModal from './components/ProfileSetupModal';
import StripeSetupModal from './components/StripeSetupModal';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsStripeConfigured } from './hooks/useQueries';
import { useActor } from './hooks/useActor';

function Layout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const { actor } = useActor();
  const { data: stripeConfigured, isFetched: stripeFetched } = useIsStripeConfigured();
  const [stripeModalDismissed, setStripeModalDismissed] = useState(false);

  const showProfileSetup = !!identity && !isLoading && isFetched && userProfile === null;

  // Show Stripe setup modal to admins when Stripe is not yet configured
  const [isAdmin, setIsAdmin] = React.useState(false);
  React.useEffect(() => {
    if (actor && identity) {
      actor.isCallerAdmin().then(setIsAdmin).catch(() => setIsAdmin(false));
    } else {
      setIsAdmin(false);
    }
  }, [actor, identity]);

  const showStripeSetup =
    isAdmin &&
    stripeFetched &&
    stripeConfigured === false &&
    !stripeModalDismissed &&
    !showProfileSetup;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <ProfileSetupModal open={showProfileSetup} />
      <StripeSetupModal
        open={showStripeSetup}
        onClose={() => setStripeModalDismissed(true)}
      />
      <Toaster richColors position="top-right" />
    </div>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'kodinar-bazaar'
  );

  return (
    <footer className="bg-deep-brown text-white/80 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/assets/generated/kodinar-bazaar-logo.dim_256x256.png"
                alt="Kodinar Bazaar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-display font-bold text-white text-lg">Kodinar Bazaar</span>
            </div>
            <p className="text-sm font-body text-white/60 leading-relaxed">
              Your trusted local marketplace for fresh, authentic products from Kodinar, Gujarat.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm font-body text-white/60">
              <li><a href="/" className="hover:text-saffron transition-colors">Home</a></li>
              <li><a href="/products" className="hover:text-saffron transition-colors">Browse Products</a></li>
              <li><a href="/seller/dashboard" className="hover:text-saffron transition-colors">Seller Dashboard</a></li>
              <li><a href="/cart" className="hover:text-saffron transition-colors">My Cart</a></li>
            </ul>
          </div>

          {/* Location */}
          <div>
            <h4 className="font-display font-semibold text-white mb-3">Location</h4>
            <p className="text-sm font-body text-white/60 leading-relaxed">
              🏙️ Kodinar, Gir Somnath District<br />
              Gujarat, India — 362720
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-body text-white/40">
            © {year} Kodinar Bazaar. All rights reserved.
          </p>
          <p className="text-xs font-body text-white/40 flex items-center gap-1">
            Built with{' '}
            <span className="text-saffron">♥</span>
            {' '}using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-saffron hover:text-turmeric transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

// Routes
const rootRoute = createRootRoute({ component: Layout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: ProductsPage,
  validateSearch: (search: Record<string, unknown>) => ({
    category: search.category as string | undefined,
  }),
});

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products/$productId',
  component: ProductDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-confirmation/$orderId',
  component: OrderConfirmationPage,
});

const sellerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/seller/dashboard',
  component: SellerDashboardPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailurePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  productDetailRoute,
  cartRoute,
  orderConfirmationRoute,
  sellerDashboardRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
