
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Sparkles, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const navLinks = [
  { href: '/#features', label: 'Features' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const AuthButtons = () => {
    if (isUserLoading) {
      return null; // Or a loading spinner
    }

    if (user) {
      return (
        <>
          <Button asChild variant="ghost">
            <Link href="/account">Dashboard</Link>
          </Button>
          <Button onClick={handleLogout} variant="outline">
            Log Out
          </Button>
        </>
      );
    }

    return (
      <>
        <Button asChild variant="ghost">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </>
    );
  };
  
  const MobileAuthButtons = () => {
    if (isUserLoading) {
      return null; // Or a loading spinner
    }

    if (user) {
      return (
        <div className='flex flex-col gap-4'>
           <Button asChild className="w-full">
            <Link href="/account" onClick={() => setIsOpen(false)}>Dashboard</Link>
          </Button>
          <Button onClick={() => {handleLogout(); setIsOpen(false);}} variant="outline" className='w-full'>
            Log Out
          </Button>
        </div>
      );
    }

    return (
      <div className='flex flex-col gap-4'>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
        </Button>
        <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Sparkles className="h-6 w-6 text-primary" />
          <span>Millionaire Mindset</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
            <Link
              href="/discover"
              className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Bot className='h-4 w-4'/> AI Mentor
            </Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <AuthButtons />
        </div>

        <div className="flex items-center gap-2 md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <div className="flex flex-col gap-6 p-6">
                        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                            <Sparkles className="h-6 w-6 text-primary" />
                            <span>Millionaire Mindset</span>
                        </Link>
                        <nav className="flex flex-col gap-4 text-lg">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="text-muted-foreground transition-colors hover:text-foreground"
                                onClick={() => setIsOpen(false)}
                            >
                            {link.label}
                            </Link>
                        ))}
                         <Link
                            href="/discover"
                            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                             onClick={() => setIsOpen(false)}
                          >
                            <Bot className='h-5 w-5'/> AI Mentor
                          </Link>
                        </nav>
                         <MobileAuthButtons />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
