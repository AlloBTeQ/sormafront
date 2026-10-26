'use client';

import { APP_URL } from '@/lib/site';
import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Search, Filter, Eye, ShoppingCart, Check, Star,
  FileText, Receipt, PenTool, Calculator, ArrowRight,
  Tag, MapPin, Zap, TrendingUp, ChevronDown, X
} from 'lucide-react';
import { 
  ALL_PRODUCTS, 
  getProductsByCategory, 
  searchProducts,
  Product,
  ProductCategory,
  Jurisdiction,
  Currency
} from '@/lib/store/product-catalog';

type SortOption = 'price-low' | 'price-high' | 'popular' | 'newest';

const AdvancedStore = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('GBP');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const searchParams = useSearchParams();

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && ['payslip', 'invoice', 'agreement', 'schedule'].includes(cat)) {
      setSelectedCategory(cat as ProductCategory);
    }
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Jurisdiction | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<string[]>([]);

  const currencySymbols: Record<Currency, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€',
    ZAR: 'R'
  };

  const categories = [
    { id: 'all' as const, name: 'All Products', icon: <Zap className="h-5 w-5" />, count: ALL_PRODUCTS.length },
    { id: 'payslip' as const, name: 'Payslips', icon: <Calculator className="h-5 w-5" />, count: getProductsByCategory('payslip').length },
    { id: 'invoice' as const, name: 'Invoices', icon: <Receipt className="h-5 w-5" />, count: getProductsByCategory('invoice').length },
    { id: 'agreement' as const, name: 'Agreements', icon: <PenTool className="h-5 w-5" />, count: getProductsByCategory('agreement').length },
    { id: 'schedule' as const, name: 'Schedules', icon: <FileText className="h-5 w-5" />, count: getProductsByCategory('schedule').length },
  ];

  const jurisdictions = [
    { id: 'all' as const, name: 'All Regions', flag: '🌍' },
    { id: 'UK' as const, name: 'United Kingdom', flag: '🇬🇧' },
    { id: 'RSA' as const, name: 'South Africa', flag: '🇿🇦' },
    { id: 'USA' as const, name: 'United States', flag: '🇺🇸' },
    { id: 'EU' as const, name: 'European Union', flag: '🇪🇺' },
    { id: 'STANDARD' as const, name: 'Universal', flag: '🌐' },
  ];

  const getFilteredProducts = () => {
    let filtered = ALL_PRODUCTS;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedJurisdiction !== 'all') {
      filtered = filtered.filter(p => p.jurisdiction === selectedJurisdiction);
    }

    if (searchQuery) {
      filtered = searchProducts(searchQuery);
    }

    switch (sortBy) {
      case 'price-low':
        filtered = [...filtered].sort((a, b) => a.price[selectedCurrency] - b.price[selectedCurrency]);
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => b.price[selectedCurrency] - a.price[selectedCurrency]);
        break;
      case 'popular':
        break;
      case 'newest':
        break;
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  const addToCart = (productId: string) => {
    setCart([...cart, productId]);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(id => id !== productId));
  };

  const handleBuyNow = (productId: string) => {
    const product = ALL_PRODUCTS.find(p => p.id === productId);
    if (product) {
      window.location.href =
        `${APP_URL}/store/checkout?product=${encodeURIComponent(productId)}&currency=${selectedCurrency}`;
    }
  };

  const handlePreview = (product: Product) => {
    setPreviewProduct(product);
  };

  const closePreview = () => {
    setPreviewProduct(null);
  };

  const getCurrencySymbol = () => currencySymbols[selectedCurrency];

  const getComplexityBadge = (complexity: string) => {
    const badges = {
      simple: { color: 'bg-green-100 text-green-800', label: 'Simple' },
      standard: { color: 'bg-blue-100 text-blue-800', label: 'Standard' },
      complex: { color: 'bg-purple-100 text-purple-800', label: 'Professional' }
    };
    return badges[complexity as keyof typeof badges] || badges.standard;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black mb-4">Document Store</h1>
            <p className="text-xl text-blue-100">
              Professional templates • Preview before purchase • Instant download
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-lg p-1">
              {(['GBP', 'USD', 'EUR', 'ZAR'] as Currency[]).map((currency) => (
                <button
                  key={currency}
                  onClick={() => setSelectedCurrency(currency)}
                  className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                    selectedCurrency === currency
                      ? 'bg-white text-blue-600'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {currencySymbols[currency]} {currency}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates... (e.g., 'RSA payslip', 'UK VAT invoice')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur text-white placeholder-white/60 focus:outline-none focus:border-white/40"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap items-center gap-2 w-full sm:flex-1 min-w-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedCategory === cat.id ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative">
              <select
                value={selectedJurisdiction}
                onChange={(e) => setSelectedJurisdiction(e.target.value as Jurisdiction | 'all')}
                className="pl-4 pr-10 py-2 border-2 border-gray-200 rounded-lg font-medium text-gray-700 focus:border-blue-600 focus:outline-none appearance-none"
              >
                {jurisdictions.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.flag} {j.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="pl-4 pr-10 py-2 border-2 border-gray-200 rounded-lg font-medium text-gray-700 focus:border-blue-600 focus:outline-none appearance-none"
              >
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {(searchQuery || selectedCategory !== 'all' || selectedJurisdiction !== 'all') && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-blue-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-blue-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedJurisdiction !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {jurisdictions.find(j => j.id === selectedJurisdiction)?.name}
                  <button onClick={() => setSelectedJurisdiction('all')} className="hover:text-blue-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedJurisdiction('all');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-gray-600">
          Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'template' : 'templates'}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex flex-wrap items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedJurisdiction('all');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const isInCart = cart.includes(product.id);
              const complexity = getComplexityBadge(product.complexity);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all overflow-hidden group"
                >
                  <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="absolute inset-0 flex flex-wrap items-center justify-center">
                      <div className="text-6xl opacity-10">
                        {product.category === 'payslip' && '💰'}
                        {product.category === 'invoice' && '📄'}
                        {product.category === 'agreement' && '📝'}
                        {product.category === 'schedule' && '📊'}
                      </div>
                    </div>
                    
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${complexity.color}`}>
                        {complexity.label}
                      </span>
                      {product.jurisdiction !== 'STANDARD' && (
                        <span className="px-2 py-1 bg-white rounded-full text-xs font-bold text-gray-700 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {product.jurisdiction}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handlePreview(product)}
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-wrap items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                      <span className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg font-semibold">
                        <Eye className="h-4 w-4" />
                        Preview Template
                      </span>
                    </button>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

                    <div className="space-y-2 mb-4">
                      {product.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {product.features.length > 3 && (
                        <button
                          onClick={() => handlePreview(product)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          +{product.features.length - 3} more features
                        </button>
                      )}
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <div className="flex flex-wrap gap-y-2 items-center justify-between mb-3">
                        <div>
                          <div className="text-3xl font-black text-gray-900">
                            {getCurrencySymbol()}{product.price[selectedCurrency].toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">One-time payment</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBuyNow(product.id)}
                          className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                        >
                          Buy Now
                        </button>
                        <button
                          onClick={() => isInCart ? removeFromCart(product.id) : addToCart(product.id)}
                          className={`px-4 py-3 rounded-lg border-2 transition-all ${
                            isInCart
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600'
                          }`}
                        >
                          <ShoppingCart className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {previewProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-wrap items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex flex-wrap gap-y-2 items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{previewProduct.name}</h2>
                <p className="text-gray-600">{previewProduct.description}</p>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-100 rounded-lg p-8 mb-6 text-center">
                <div className="text-8xl mb-4">
                  {previewProduct.category === 'payslip' && '💰'}
                  {previewProduct.category === 'invoice' && '📄'}
                  {previewProduct.category === 'agreement' && '📝'}
                  {previewProduct.category === 'schedule' && '📊'}
                </div>
                <p className="text-gray-600">Template preview will be displayed here</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">What's Included:</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {previewProduct.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Editable Fields:</h3>
                <div className="flex flex-wrap gap-2">
                  {previewProduct.editableFields.map((field, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {field}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex flex-wrap gap-y-2 items-center justify-between mb-4">
                  <div>
                    <div className="text-4xl font-black text-gray-900">
                      {getCurrencySymbol()}{previewProduct.price[selectedCurrency].toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">One-time payment • Instant access</div>
                  </div>
                  <button
                    onClick={() => handleBuyNow(previewProduct.id)}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Buy Now
                    <ArrowRight className="inline ml-2 h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-blue-600 shadow-2xl py-4 px-4 z-40">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-y-2 items-center justify-between">
            <div className="flex items-center gap-4">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-bold text-gray-900">
                  {cart.length} item{cart.length > 1 ? 's' : ''} in cart
                </p>
                <p className="text-sm text-gray-600">
                  Total: {getCurrencySymbol()}
                  {cart.reduce((total, id) => {
                    const product = ALL_PRODUCTS.find(p => p.id === id);
                    return total + (product?.price[selectedCurrency] || 0);
                  }, 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setCart([])}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Clear Cart
              </button>
              <button
                onClick={() => window.location.href = `${APP_URL}/store/checkout?items=${cart.map(encodeURIComponent).join(',')}&currency=${selectedCurrency}`}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700"
              >
                Checkout
                <ArrowRight className="inline ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function StorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <AdvancedStore />
    </Suspense>
  );
}
