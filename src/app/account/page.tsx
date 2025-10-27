'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useDoc, useCollection } from '@/firebase/firestore/use-doc';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

function ReferralCard({ referralCode }: { referralCode: string }) {
  const { toast } = useToast();
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const referralLink = `${origin}/signup?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Referral Program</CardTitle>
        <CardDescription>Earn by sharing with your friends. You get ₹10 for every friend who signs up!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Share your unique referral link:</p>
        <div className="flex items-center space-x-2">
          <Input value={referralLink} readOnly />
          <Button variant="outline" size="icon" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AIAssistantCard({ hasPaid }: { hasPaid: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Wealth Assistant</CardTitle>
        <CardDescription>Your personal guide to financial freedom.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          {hasPaid
            ? 'Get personalized advice and strategies to kickstart your journey.'
            : 'Purchase the guide to unlock your personal AI assistant.'}
        </p>
        <Button asChild disabled={!hasPaid}>
          <Link href={hasPaid ? '/discover' : '#'} aria-disabled={!hasPaid} tabIndex={hasPaid ? undefined : -1}>
            { !hasPaid && <Lock className="mr-2 h-4 w-4" /> }
            Launch Assistant
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}


export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  
  const transactionsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'transactions');
  }, [user, firestore]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);
  const { data: transactions, isLoading: isTransactionsLoading } = useCollection(transactionsCollectionRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const isLoading = isUserLoading || isUserDataLoading || isTransactionsLoading;
  
  const hasPaid = transactions ? transactions.length > 0 : false;

  if (isLoading || !user) {
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
            <AIAssistantCard hasPaid={hasPaid} />
            {userData?.referralCode && <ReferralCard referralCode={userData.referralCode} />}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
