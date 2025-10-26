import { Sparkles, Twitter, Instagram, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

export default function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 font-bold text-lg">
                <Sparkles className="h-6 w-6 text-primary" />
                <span>Millionaire Mindset</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
                © {new Date().getFullYear()} Millionaire Mindset. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="#" aria-label="Twitter"><Twitter className="h-5 w-5" /></Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                    <Link href="#" aria-label="Instagram"><Instagram className="h-5 w-5" /></Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                    <Link href="#" aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></Link>
                </Button>
            </div>
        </div>
      </div>
    </footer>
  );
}
