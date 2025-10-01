import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Stone } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { Gem, Shield, Truck, Award } from 'lucide-react';

export function HomePage() {
  const { data: featuredStones = [] } = useQuery({
    queryKey: ['stones', 'featured'],
    queryFn: () => apiRequest<Stone[]>('/api/stones/featured'),
  });

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 to-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Discover the World's Finest Gemstones
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Curated collection of premium, ethically sourced gemstones for collectors and enthusiasts
          </p>
          <Link href="/shop">
            <Button size="lg" className="text-lg">
              Explore Collection
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Gem className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Premium Quality</h3>
            <p className="text-sm text-muted-foreground">
              Hand-selected gemstones with certificates of authenticity
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Secure Purchase</h3>
            <p className="text-sm text-muted-foreground">
              Safe and encrypted transactions for your peace of mind
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Worldwide Shipping</h3>
            <p className="text-sm text-muted-foreground">
              Fast and secure delivery to collectors around the globe
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Expert Curation</h3>
            <p className="text-sm text-muted-foreground">
              Decades of experience in gemstone evaluation and selection
            </p>
          </div>
        </div>
      </section>

      {/* Featured Stones */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Gemstones</h2>
          <p className="text-muted-foreground">
            Explore our handpicked selection of exceptional stones
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredStones.map((stone) => (
            <Link key={stone.id} href={`/stones/${stone.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-0">
                  <div className="aspect-square bg-muted relative overflow-hidden">
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
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{stone.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{stone.shortInfo}</p>
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(stone.price, stone.currency)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/shop">
            <Button variant="outline" size="lg">
              View All Stones
            </Button>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">About StoneVault</h2>
            <p className="text-lg text-muted-foreground mb-4">
              For over two decades, StoneVault has been the trusted source for premium gemstones. 
              Our expert gemologists carefully select each stone, ensuring exceptional quality, 
              authenticity, and ethical sourcing.
            </p>
            <p className="text-lg text-muted-foreground">
              Whether you're a seasoned collector or just beginning your journey, we're here to 
              help you find the perfect gemstone that speaks to you.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}