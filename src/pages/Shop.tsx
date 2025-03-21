
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, Search, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchProducts, StockItem } from '@/services/api';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

const Shop: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSize, setSelectedSize] = useState<string | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const { itemCount } = useCart();

  // Fetch products using React Query with retry and longer staleTime
  const { data: products, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (isError && error instanceof Error) {
      toast.error(`Shop error: ${error.message}`);
    }
  }, [isError, error]);

  // Extract all available sizes from products
  const availableSizes = useMemo(() => {
    if (!products) return [];
    
    const sizes = new Set<string>();
    products.forEach(product => {
      product.sizes.forEach(sizeObj => {
        if (sizeObj.count > 0) {
          sizes.add(sizeObj.size);
        }
      });
    });
    
    return Array.from(sizes).sort();
  }, [products]);

  // Filter products based on search term and selected size
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter(product => {
      // Filter by search term
      const matchesSearch = product.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.color_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by size
      const matchesSize = selectedSize === 'all' || 
                          product.sizes.some(sizeObj => 
                            sizeObj.size === selectedSize && sizeObj.count > 0
                          );
      
      return matchesSearch && matchesSize;
    });
  }, [products, searchTerm, selectedSize]);

  return (
    <PageLayout>
      <div className="p-4">
        <header className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold">Shop</h1>
            <Link 
              to="/cart" 
              className="relative p-2 bg-telegram-blue text-white rounded-full"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
          
          {/* Search bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="w-full p-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-telegram-blue focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filters button */}
          <button
            className="flex items-center gap-2 text-sm text-gray-700 mb-4"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            <span>{showFilters ? 'Hide filters' : 'Show filters'}</span>
          </button>
          
          {/* Size filters */}
          {showFilters && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg animate-slide-down">
              <h3 className="text-sm font-medium mb-2">Filter by Size</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    selectedSize === 'all' ? 'bg-telegram-blue text-white border-telegram-blue' : 'bg-white border-gray-300'
                  }`}
                  onClick={() => setSelectedSize('all')}
                >
                  All Sizes
                </button>
                {availableSizes.map(size => (
                  <button
                    key={size}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      selectedSize === size ? 'bg-telegram-blue text-white border-telegram-blue' : 'bg-white border-gray-300'
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Debug information - remove in production */}
        {isError && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-lg mb-4">
            <h3 className="text-sm font-medium text-red-700">Error Loading Products:</h3>
            <p className="text-xs text-red-600">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        )}

        {/* Products grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : isError ? (
          <div className="text-center py-10">
            <h2 className="text-lg font-medium text-red-600 mb-2">Error loading products</h2>
            <p className="text-gray-600 mb-4">Please try again later</p>
            <button 
              className="px-4 py-2 bg-telegram-blue text-white rounded-lg"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-lg font-medium text-gray-700">No products found</h2>
            <p className="text-gray-500 mt-2">Try changing your filters or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.sku} 
                product={product}
                className="animate-fade-in"
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Shop;
