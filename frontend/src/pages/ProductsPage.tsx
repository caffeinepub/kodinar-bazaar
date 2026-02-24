import React, { useState, useMemo } from 'react';
import { useSearch } from '@tanstack/react-router';
import { useGetAllProducts } from '../hooks/useQueries';
import ProductCard from '../components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, SlidersHorizontal, X, Package } from 'lucide-react';

const ALL_CATEGORIES = [
  'All',
  'Vegetables & Fruits',
  'Groceries',
  'Dairy & Eggs',
  'Clothing',
  'Electronics',
  'Home & Kitchen',
  'Handicrafts',
  'Medicines',
  'Stationery',
  'Other',
];

export default function ProductsPage() {
  const search = useSearch({ from: '/products' }) as { category?: string };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(search?.category || 'All');
  const [showFilters, setShowFilters] = useState(false);

  const { data: products, isLoading, error } = useGetAllProducts();

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <main className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-white border-b border-saffron/15 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl font-bold text-deep-brown mb-4">
            Browse Products
            {selectedCategory !== 'All' && (
              <span className="text-saffron"> — {selectedCategory}</span>
            )}
          </h1>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 font-body"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden border-saffron/30 text-deep-brown font-body"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Category Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-52 flex-shrink-0`}>
            <div className="bg-white rounded-xl border border-saffron/15 p-4 sticky top-24">
              <h3 className="font-display font-semibold text-deep-brown mb-3 text-sm uppercase tracking-wide">
                Categories
              </h3>
              <div className="space-y-1">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-body transition-all ${
                      selectedCategory === cat
                        ? 'bg-saffron text-white font-semibold'
                        : 'text-deep-brown hover:bg-saffron/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {/* Active filters */}
            {(selectedCategory !== 'All' || searchQuery) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategory !== 'All' && (
                  <Badge
                    variant="secondary"
                    className="font-body cursor-pointer bg-saffron/10 text-saffron border-saffron/20"
                    onClick={() => setSelectedCategory('All')}
                  >
                    {selectedCategory} <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="font-body cursor-pointer bg-saffron/10 text-saffron border-saffron/20"
                    onClick={() => setSearchQuery('')}
                  >
                    "{searchQuery}" <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
              </div>
            )}

            {/* Results count */}
            {!isLoading && (
              <p className="text-sm text-muted-foreground font-body mb-4">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </p>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[4/3] rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="text-center py-16">
                <p className="text-destructive font-body">Failed to load products. Please try again.</p>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-saffron/10 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-saffron/50" />
                </div>
                <h3 className="font-display text-xl font-semibold text-deep-brown mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground font-body text-sm">
                  {searchQuery || selectedCategory !== 'All'
                    ? 'Try adjusting your search or filters'
                    : 'Be the first to list a product in Kodinar Bazaar!'}
                </p>
              </div>
            )}

            {/* Products */}
            {!isLoading && !error && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id.toString()} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
