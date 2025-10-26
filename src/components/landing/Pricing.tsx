import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';

const includedFeatures = [
    'Complete PDF Guide',
    'Actionable Wealth Strategies',
    'Millionaire Mindset Hacks',
    'Lifetime Access & Updates',
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-card">
      <div className="container">
        <Card className="max-w-xl mx-auto text-center shadow-2xl bg-background/50 border-primary border-2">
            <CardHeader>
                <CardTitle className="text-4xl font-extrabold tracking-tight">Start Your Journey Today</CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-2">
                    A small investment in yourself for a lifetime of returns.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                <div className="my-6">
                    <span className="text-5xl font-bold">₹50</span>
                    <span className="text-muted-foreground text-xl">/ one-time</span>
                </div>
                <ul className="grid gap-3 text-left w-full max-w-xs mx-auto">
                    {includedFeatures.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-500" />
                            <span className="text-muted-foreground">{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-7 transition-transform hover:scale-105">
                    <Link href="/success">Invest ₹50 In Yourself And Start Your Journey!</Link>
                </Button>
            </CardFooter>
        </Card>
      </div>
    </section>
  );
}
