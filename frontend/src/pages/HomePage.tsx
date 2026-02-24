import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Store, MapPin, Star, ArrowRight, Sparkles } from 'lucide-react';

const FEATURED_CATEGORIES = [
  { name: 'Vegetables & Fruits', emoji: '🥦', color: 'bg-green-50 text-green-700 border-green-200' },
  { name: 'Groceries', emoji: '🛒', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { name: 'Dairy & Eggs', emoji: '🥛', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Clothing', emoji: '👗', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { name: 'Handicrafts', emoji: '🏺', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'Electronics', emoji: '📱', color: 'bg-purple-50 text-purple-700 border-purple-200' },
];

const FEATURES = [
  {
    icon: <MapPin className="w-6 h-6 text-saffron" />,
    title: 'Local First',
    desc: 'Shop from trusted sellers right here in Kodinar',
  },
  {
    icon: <Star className="w-6 h-6 text-turmeric" />,
    title: 'Fresh & Authentic',
    desc: 'Direct from local farms and artisans to your doorstep',
  },
  {
    icon: <Store className="w-6 h-6 text-terracotta" />,
    title: 'Support Local',
    desc: 'Every purchase supports a Kodinar family business',
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative h-[420px] sm:h-[500px]">
          <img
            src="/assets/generated/hero-banner.dim_1400x500.png"
            alt="Kodinar Bazaar marketplace"
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-deep-brown/80 via-deep-brown/50 to-transparent" />

          {/* Hero Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-xl">
                <Badge className="bg-saffron/90 text-white border-0 font-body mb-4 text-xs tracking-wider uppercase">
                  <MapPin className="w-3 h-3 mr-1" />
                  Kodinar, Gujarat
                </Badge>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
                  Your Local
                  <span className="block text-turmeric">Bazaar Online</span>
                </h1>
                <p className="text-white/85 font-body text-base sm:text-lg mb-8 leading-relaxed">
                  Discover fresh produce, handcrafted goods, and everyday essentials from trusted sellers in Kodinar.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    onClick={() => navigate({ to: '/products', search: { category: undefined } })}
                    className="bg-saffron hover:bg-saffron-dark text-white font-body font-semibold shadow-warm-lg"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Shop Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate({ to: '/seller/dashboard' })}
                    className="border-white text-white hover:bg-white/10 font-body font-semibold backdrop-blur-sm"
                  >
                    <Store className="w-5 h-5 mr-2" />
                    Sell Here
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-12 border-b border-saffron/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-4 p-4 rounded-xl hover:bg-cream transition-colors">
                <div className="w-12 h-12 rounded-full bg-saffron/10 flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-deep-brown mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground font-body">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 bg-cream/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-saffron" />
              <span className="text-saffron font-body font-semibold text-sm uppercase tracking-wider">
                What We Offer
              </span>
            </div>
            <h2 className="font-display text-3xl font-bold text-deep-brown">
              Shop by Category
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {FEATURED_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate({ to: '/products', search: { category: cat.name } })}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 ${cat.color} hover:scale-105 transition-all duration-200 shadow-xs hover:shadow-warm`}
              >
                <span className="text-3xl">{cat.emoji}</span>
                <span className="text-xs font-body font-semibold text-center leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              onClick={() => navigate({ to: '/products', search: { category: undefined } })}
              className="bg-saffron hover:bg-saffron-dark text-white font-body font-semibold px-8"
            >
              View All Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bazaar-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Are You a Local Seller?
          </h2>
          <p className="text-white/85 font-body text-lg mb-8 max-w-xl mx-auto">
            Join Kodinar Bazaar and reach hundreds of local customers. List your products for free!
          </p>
          <Button
            size="lg"
            onClick={() => navigate({ to: '/seller/dashboard' })}
            className="bg-white text-saffron hover:bg-cream font-body font-bold shadow-warm-lg"
          >
            <Store className="w-5 h-5 mr-2" />
            Start Selling Today
          </Button>
        </div>
      </section>
    </main>
  );
}
