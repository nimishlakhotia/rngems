import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Address, Order, WishlistItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';


export function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [, forceUpdate] = useState(0);

  // Get active tab from URL
  const activeTab = new URLSearchParams(window.location.search).get('tab') || 'account';

  // Force component to re-render when URL changes
  useEffect(() => {
    forceUpdate(prev => prev + 1);
  }, [location]);


  
  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiRequest<Order[]>('/api/orders'),
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => apiRequest<WishlistItem[]>('/api/wishlist'),
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => apiRequest<Address[]>('/api/addresses'),
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: (stoneId: number) =>
      apiRequest(`/api/wishlist/${stoneId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({ title: 'Removed from wishlist' });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (addressId: number) =>
      apiRequest(`/api/addresses/${addressId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast({ title: 'Address deleted' });
    },
  });

  if (!user) {
    setLocation('/');
    return null;
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <Tabs value={activeTab} onValueChange={(value) => setLocation(`/profile?tab=${value}`)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Name</Label>
                <p className="text-lg">{user.name}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-lg">{user.email}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Button onClick={() => setLocation('/shop')}>
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Order #{order.id}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded ${
                        order.status === 'DELIVERED'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold">
                        {formatPrice(order.total, 'USD')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setLocation(`/orders/${order.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="wishlist" className="space-y-4">
          {wishlist.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Your wishlist is empty
                </p>
                <Button onClick={() => setLocation('/shop')}>
                  Browse Gemstones
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div
                      className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden cursor-pointer"
                      onClick={() => setLocation(`/stones/${item.stone.slug}`)}
                    >
                      {item.stone.images[0] ? (
                        <img
                          src={item.stone.images[0]}
                          alt={item.stone.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Heart className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">{item.stone.name}</h3>
                    <p className="text-lg font-bold text-primary mb-3">
                      {formatPrice(item.stone.price, item.stone.currency)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => setLocation(`/stones/${item.stone.slug}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          removeFromWishlistMutation.mutate(item.stone.id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Saved Addresses</h2>
            <Button onClick={() => setShowAddressForm(!showAddressForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </div>

          {showAddressForm && (
            <AddressForm
              onClose={() => {
                setShowAddressForm(false);
                setEditingAddress(null);
              }}
              address={editingAddress}
            />
          )}

          {addresses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No addresses saved</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <Card key={address.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{address.fullName}</h3>
                      {address.isDefault && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
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
                    <p className="text-sm text-muted-foreground mb-4">
                      Phone: {address.phone}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAddressMutation.mutate(address.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Address Form Component
function AddressForm({
  onClose,
  address,
}: {
  onClose: () => void;
  address: Address | null;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: address?.fullName || '',
    phone: address?.phone || '',
    line1: address?.line1 || '',
    line2: address?.line2 || '',
    city: address?.city || '',
    state: address?.state || '',
    postalCode: address?.postalCode || '',
    country: address?.country || '',
    isDefault: address?.isDefault || false,
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      address
        ? apiRequest(`/api/addresses/${address.id}`, {
            method: 'PUT',
            body: JSON.stringify(formData),
          })
        : apiRequest('/api/addresses', {
            method: 'POST',
            body: JSON.stringify(formData),
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast({ title: address ? 'Address updated' : 'Address added' });
      onClose();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{address ? 'Edit Address' : 'Add New Address'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="line1">Address Line 1</Label>
            <Input
              id="line1"
              value={formData.line1}
              onChange={(e) =>
                setFormData({ ...formData, line1: e.target.value })
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="line2">Address Line 2 (Optional)</Label>
            <Input
              id="line2"
              value={formData.line2}
              onChange={(e) =>
                setFormData({ ...formData, line2: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) =>
                setFormData({ ...formData, postalCode: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="isDefault"
            checked={formData.isDefault}
            onChange={(e) =>
              setFormData({ ...formData, isDefault: e.target.checked })
            }
          />
          <Label htmlFor="isDefault">Set as default address</Label>
        </div>
        <div className="flex gap-2 mt-6">
          <Button onClick={() => saveMutation.mutate()}>
            {address ? 'Update' : 'Add'} Address
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}