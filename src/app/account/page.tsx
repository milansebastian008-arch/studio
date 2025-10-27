'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountPage() {
  const { user, isUserLoading } from useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1 container py-10">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="grid gap-8 pt-6 md:grid-cols-2">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-10">
          <h1 className="text-3xl font-bold">Welcome, {user.displayName || 'User'}!</h1>
          <p className="text-muted-foreground">This is your account dashboard.</p>
          
          <div className="grid gap-8 pt-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>AI Wealth Assistant</CardTitle>
                    <CardDescription>Your personal guide to financial freedom.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Coming soon! Get personalized advice and strategies.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Referral Program</CardTitle>
                    <CardDescription>Earn by sharing with your friends.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Your referral dashboard is coming soon!</p>
                </CardContent>
            </Card>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
