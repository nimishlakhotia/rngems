import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { useLocation, Link } from 'wouter';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { SHIPPING_FEE } from '@/lib/constants';

export function CartPage() {
  const { cartItems, cartTotal, updateCart, removeFromCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">
          Please sign in to view your cart
        </p>
        <Button onClick={() => setLocation('/')}>Continue Shopping</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">
          Start shopping to add items to your cart
        </p>
        <Button onClick={() => setLocation('/shop')}>Browse Gemstones</Button>
      </div>
    );
  }

  const subtotal = cartTotal;
  const shipping = SHIPPING_FEE;
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Link href={`/stones/${item.stone.slug}`}>
                    <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0 cursor-pointer">
                      {item.stone.images[0] ? (
                        <img
                          src={item.stone.images[0]}
                          alt={item.stone.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1">
                    <Link href={`/stones/${item.stone.slug}`}>
                      <h3 className="font-semibold hover:text-primary cursor-pointer">
                        {item.stone.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {item.stone.type} • {item.stone.weight} ct
                    </p>
                    <p className="text-lg font-bold text-primary mt-2">
                      {formatPrice(item.stone.price, item.stone.currency)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.stone.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateCart({
                            stoneId: item.stone.id,
                            quantity: Math.max(1, item.quantity - 1),
                          })
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateCart({
                            stoneId: item.stone.id,
                            quantity: item.quantity + 1,
                          })
                        }
                        disabled={item.quantity >= item.stone.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold">Order Summary</h2>

              <div className="space-y-2">
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
                onClick={() => setLocation('/checkout')}
              >
                Proceed to Checkout
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setLocation('/shop')}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}