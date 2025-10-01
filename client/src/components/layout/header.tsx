import { useState } from 'react';
import { Link } from 'wouter';
import { ShoppingCart, Heart, User, Menu, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { LoginForm } from '@/components/auth/login-form';
import { CustomerSignupForm } from '@/components/auth/customer-signup-form';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const [authDialog, setAuthDialog] = useState<'login' | 'signup' | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="border-b sticky top-0 bg-background z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-xl">
              <Gem className="h-6 w-6" />
              StoneVault
            </a>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/shop">
              <a className="text-sm font-medium hover:text-primary">Shop</a>
            </Link>
            <Link href="/faq">
              <a className="text-sm font-medium hover:text-primary">FAQ</a>
            </Link>
            <Link href="/contact">
              <a className="text-sm font-medium hover:text-primary">Contact</a>
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>
                
                <Link href="/profile?tab=wishlist">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>

                <Dialog open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Account</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Signed in as <strong>{user?.email}</strong>
                      </p>
                      <div className="flex flex-col gap-2">
                        <Link href="/profile">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Profile
                          </Button>
                        </Link>
                        {user?.role === 'ADMIN' && (
                          <Link href="/admin">
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              Admin Dashboard
                            </Button>
                          </Link>
                        )}
                        <Button 
                          variant="destructive" 
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                        >
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <>
                <Dialog open={authDialog === 'login'} onOpenChange={(open) => setAuthDialog(open ? 'login' : null)}>
                  <DialogTrigger asChild>
                    <Button variant="ghost">Sign In</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Sign In</DialogTitle>
                    </DialogHeader>
                    <LoginForm onSuccess={() => setAuthDialog(null)} />
                    <p className="text-sm text-center text-muted-foreground">
                      Don't have an account?{' '}
                      <button
                        onClick={() => setAuthDialog('signup')}
                        className="text-primary hover:underline"
                      >
                        Sign up
                      </button>
                    </p>
                  </DialogContent>
                </Dialog>

                <Dialog open={authDialog === 'signup'} onOpenChange={(open) => setAuthDialog(open ? 'signup' : null)}>
                  <DialogTrigger asChild>
                    <Button>Sign Up</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Account</DialogTitle>
                    </DialogHeader>
                    <CustomerSignupForm onSuccess={() => setAuthDialog(null)} />
                    <p className="text-sm text-center text-muted-foreground">
                      Already have an account?{' '}
                      <button
                        onClick={() => setAuthDialog('login')}
                        className="text-primary hover:underline"
                      >
                        Sign in
                      </button>
                    </p>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}