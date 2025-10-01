import { QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './hooks/useAuth';
import { Header } from './components/layout/header';
import { Footer } from './components/layout/footer';
import { Toaster } from './components/ui/toaster';
import { HomePage } from './pages/home';
import { ShopPage } from './pages/shop';
import { StoneDetailPage } from './pages/stone-detail';
import { CartPage } from './pages/cart';
import { CheckoutPage } from './pages/checkout';
import { ProfilePage } from './pages/profile';
import { ContactPage } from './pages/contact';
import { FAQPage } from './pages/faq';
import { AdminDashboard } from './pages/admin/dashboard';
import { AdminStonesPage } from './pages/admin/stones';
import { AdminOrdersPage } from './pages/admin/orders';
import { NotFoundPage } from './pages/not-found';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/shop" component={ShopPage} />
              <Route path="/stones/:slug" component={StoneDetailPage} />
              <Route path="/cart" component={CartPage} />
              <Route path="/checkout" component={CheckoutPage} />
              <Route path="/profile" component={ProfilePage} />
              <Route path="/contact" component={ContactPage} />
              <Route path="/faq" component={FAQPage} />
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/stones" component={AdminStonesPage} />
              <Route path="/admin/orders" component={AdminOrdersPage} />
              <Route component={NotFoundPage} />
            </Switch>
          </main>
          <Footer />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;