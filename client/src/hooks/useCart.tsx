import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { CartItem } from '../types';
import { useAuth } from './useAuth';

export function useCart() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      return apiRequest<CartItem[]>('/api/cart');
    },
    enabled: isAuthenticated,
  });

  const addToCartMutation = useMutation({
    mutationFn: (data: { stoneId: number; quantity?: number }) =>
      apiRequest('/api/cart', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateCartMutation = useMutation({
    mutationFn: ({ stoneId, quantity }: { stoneId: number; quantity: number }) =>
      apiRequest(`/api/cart/${stoneId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (stoneId: number) =>
      apiRequest(`/api/cart/${stoneId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => apiRequest('/api/cart', { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.stone.price) * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    isLoading,
    cartTotal,
    cartCount,
    addToCart: addToCartMutation.mutate,
    updateCart: updateCartMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
  };
}