import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Stone } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Gem, Search } from 'lucide-react';
import { STONE_TYPES, STONE_COLORS } from '@/lib/constants';

export function ShopPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const { data: stones = [], isLoading } = useQuery({
    queryKey: ['stones', { search, type, color, priceMin, priceMax }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (type) params.append('type', type);
      if (color) params.append('color', color);
      if (priceMin) params.append('priceMin', priceMin);
      if (priceMax) params.append('priceMax', priceMax);
      return apiRequest<Stone[]>(`/api/stones?${params.toString()}`);
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Shop Gemstones</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Filters</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search stones..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Stone Type</Label>
                <select
                  id="type"
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {STONE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <select
                  id="color"
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                >
                  <option value="">All Colors</option>
                  {STONE_COLORS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Price Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                  />
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearch('');
                  setType('');
                  setColor('');
                  setPriceMin('');
                  setPriceMax('');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading stones...</p>
            </div>
          ) : stones.length === 0 ? (
            <div className="text-center py-12">
              <Gem className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No stones found matching your criteria</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Showing {stones.length} {stones.length === 1 ? 'stone' : 'stones'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stones.map((stone) => (
                  <Link key={stone.id} href={`/stones/${stone.slug}`}>
                    <Card className={`hover:shadow-lg transition-shadow cursor-pointer h-full relative ${stone.stock === 0 ? 'opacity-75' : ''}`}>
                      <CardContent className="p-0">
                        <div className="aspect-square bg-muted relative overflow-hidden rounded-t-xl">
                          {stone.images[0] ? (
                            <img
                              src={stone.images[0]}
                              alt={stone.name}
                              className="object-cover w-full h-full hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Gem className="h-16 w-16 text-muted-foreground" />
                            </div>
                          )}
                          {stone.stock === 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white font-bold text-lg bg-red-600 px-4 py-2 rounded-lg">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold">{stone.name}</h3>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {stone.type}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{stone.shortInfo}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-primary">
                              {formatPrice(stone.price, stone.currency)}
                            </p>
                            <p className="text-xs text-muted-foreground">{stone.weight} ct</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}