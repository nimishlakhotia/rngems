import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Stone, Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Package, ShoppingCart, DollarSign, Gem } from 'lucide-react';

export function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stones = [] } = useQuery({
    queryKey: ['admin', 'stones'],
    queryFn: () => apiRequest<Stone[]>('/api/stones'),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () => apiRequest<Order[]>('/api/admin/orders'),
  });

  if (!isAdmin) {
    setLocation('/');
    return null;
  }

  const totalRevenue = orders.reduce(
    (sum, order) => sum + parseFloat(order.total),
    0
  );

  const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
  const totalStones = stones.length;
  const lowStockStones = stones.filter((s) => s.stock < 5).length;

  const stats = [
    {
      title: 'Total Revenue',
      value: formatPrice(totalRevenue, 'USD'),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Orders',
      value: orders.length.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending Orders',
      value: pendingOrders.toString(),
      icon: Package,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Total Stones',
      value: totalStones.toString(),
      icon: Gem,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No orders yet
              </p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => setLocation('/admin/orders')}
                  >
                    <div>
                      <p className="font-semibold">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.user?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice(order.total, 'USD')}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : order.status === 'PAID'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Low Stock Alert</CardTitle>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setLocation('/admin/stones')}
              >
                Manage Stones
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {lowStockStones === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                All stones have adequate stock
              </p>
            ) : (
              <div className="space-y-3">
                {stones
                  .filter((s) => s.stock < 5)
                  .slice(0, 5)
                  .map((stone) => (
                    <div
                      key={stone.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => setLocation('/admin/stones')}
                    >
                      <div>
                        <p className="font-semibold">{stone.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {stone.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-sm font-semibold px-2 py-1 rounded ${
                            stone.stock === 0
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {stone.stock === 0 ? 'Out of Stock' : `${stone.stock} left`}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}