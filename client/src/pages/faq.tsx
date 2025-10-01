import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { FAQ } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

export function FAQPage() {
  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => apiRequest<FAQ[]>('/api/faqs'),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading FAQs...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <HelpCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground">
            Find answers to common questions about our gemstones and services
          </p>
        </div>

        {faqs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No FAQs available at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-8 bg-muted/50">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Still have questions? We're here to help!
            </p>
            <a href="/contact" className="text-primary hover:underline font-semibold">
              Contact Us
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}