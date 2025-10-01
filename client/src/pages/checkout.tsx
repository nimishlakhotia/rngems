import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useCart } from '@/hooks/useCart';
import { apiRequest } from '@/lib/queryClient';
import { Address } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { SHIPPING_FEE } from '@/lib/constants';

export function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [paymentRef, setPaymentRef] = useState('');

  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => apiRequest<Address[]>('/api/addresses'),
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) =>
      apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      clearCart();
      toast({
        title: 'Order placed successfully',
        description: 'Thank you for your purchase!',
      });
      setLocation('/profile?tab=orders');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (cartItems.length === 0) {
    setLocation('/cart');
    return null;
  }

  const subtotal = cartTotal;
  const shipping = SHIPPING_FEE;
  const total = subtotal + shipping;

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      toast({
        title: 'Address required',
        description: 'Please select a delivery address',
        variant: 'destructive',
      });
      return;
    }

    if (!paymentRef.trim()) {
      toast({
        title: 'Payment reference required',
        description: 'Please enter a payment reference',
        variant: 'destructive',
      });
      return;
    }

    const items = cartItems.map((item) => ({
      stoneId: item.stone.id,
      quantity: item.quantity,
      unitPrice: parseFloat(item.stone.price),
      lineTotal: parseFloat(item.stone.price) * item.quantity,
    }));

    createOrderMutation.mutate({
      items,
      subtotal,
      shippingFee: shipping,
      total,
      paymentRef,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No addresses found
                  </p>
                  <Button onClick={() => setLocation('/profile?tab=addresses')}>
                    Add Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedAddress === address.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedAddress(address.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{address.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.line1}
                          </p>
                          {address.line2 && (
                            <p className="text-sm text-muted-foreground">
                              {address.line2}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.country}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Phone: {address.phone}
                          </p>
                        </div>
                        {address.isDefault && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    For demo purposes, please enter any reference number to complete
                    your order.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentRef">Payment Reference</Label>
                  <Input
                    id="paymentRef"
                    placeholder="Enter payment reference"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.stone.name} × {item.quantity}
                    </span>
                    <span className="font-semibold">
                      {formatPrice(
                        parseFloat(item.stone.price) * item.quantity,
                        'USD'
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">
                    {formatPrice(subtotal, 'USD')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">
                    {formatPrice(shipping, 'USD')}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary">
                    {formatPrice(total, 'USD')}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={
                  !selectedAddress ||
                  !paymentRef.trim() ||
                  createOrderMutation.isPending
                }
              >
                {createOrderMutation.isPending
                  ? 'Processing...'
                  : 'Place Order'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}