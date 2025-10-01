import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Stone, WishlistItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export function StoneDetailPage() {
  const [, params] = useRoute('/stones/:slug');
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: stone, isLoading } = useQuery({
    queryKey: ['stones', 'slug', params?.slug],
    queryFn: () => apiRequest<Stone>(`/api/stones/slug/${params?.slug}`),
    enabled: !!params?.slug,
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => apiRequest<WishlistItem[]>('/api/wishlist'),
    enabled: isAuthenticated,
  });

  const addToCartMutation = useMutation({
    mutationFn: (stoneId: number) =>
      apiRequest('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ stoneId, quantity: 1 }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: 'Added to cart',
        description: 'Item has been added to your cart',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: (stoneId: number) =>
      apiRequest('/api/wishlist', {
        method: 'POST',
        body: JSON.stringify({ stoneId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({
        title: 'Added to wishlist',
        description: 'Item has been added to your wishlist',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: (stoneId: number) =>
      apiRequest(`/api/wishlist/${stoneId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({
        title: 'Removed from wishlist',
        description: 'Item has been removed from your wishlist',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to cart',
        variant: 'destructive',
      });
      return;
    }
    if (stone) {
      addToCartMutation.mutate(stone.id);
    }
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to wishlist',
        variant: 'destructive',
      });
      return;
    }
    if (stone) {
      if (isInWishlist) {
        removeFromWishlistMutation.mutate(stone.id);
      } else {
        addToWishlistMutation.mutate(stone.id);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  if (!stone) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground mb-4">Stone not found</p>
        <Button onClick={() => setLocation('/shop')}>Back to Shop</Button>
      </div>
    );
  }

  const displayImage = stone.images[selectedImage] || stone.images[0];
  const isInWishlist = wishlist.some(item => item.stone.id === stone.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => setLocation('/shop')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Shop
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="aspect-square bg-muted relative">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={stone.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No image</p>
                  </div>
                )}
                {stone.stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <span className="text-white text-2xl font-bold bg-red-600 px-6 py-3 rounded-lg">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {stone.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {stone.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square border-2 rounded-lg overflow-hidden ${
                    selectedImage === idx
                      ? 'border-primary'
                      : 'border-transparent'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${stone.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold">{stone.name}</h1>
              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded">
                {stone.type}
              </span>
            </div>
            <p className="text-2xl font-bold text-primary mb-4">
              {formatPrice(stone.price, stone.currency)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Color</p>
              <p className="font-semibold">{stone.color}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Weight</p>
              <p className="font-semibold">{stone.weight} carats</p>
            </div>
            <div>
              <p className="text-muted-foreground">Origin</p>
              <p className="font-semibold">{stone.origin}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Stock</p>
              <p className="font-semibold">
                {stone.stock > 0 ? `${stone.stock} available` : 'Out of stock'}
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">{stone.description}</p>
          </div>

          <div className="flex gap-4">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={stone.stock === 0 || addToCartMutation.isPending}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {stone.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleToggleWishlist}
              disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
              className={isInWishlist ? 'bg-red-50 border-red-200' : ''}
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-2 text-sm">
              <p className="font-semibold">What's Included:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Certificate of authenticity</li>
                <li>Secure packaging</li>
                <li>Gemological report</li>
                <li>30-day return policy</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}