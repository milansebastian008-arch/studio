
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import {
  doc,
  collection,
  runTransaction,
  serverTimestamp,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    const paymentId = searchParams.get('razorpay_payment_id');

    if (isUserLoading || !firestore) {
      // Still waiting for auth state or firestore to be ready
      return;
    }

    if (!user) {
      // User is not logged in. We can't attribute the purchase.
      // Save the intent and redirect to login.
      toast({
        title: 'Please log in to complete your purchase',
        description: 'We need to link this purchase to your account.',
      });
      sessionStorage.setItem('redirectAfterLogin', window.location.href);
      router.push('/login');
      return;
    }

    if (!paymentId) {
      // No payment ID found, maybe user navigated here directly.
      toast({
        variant: 'destructive',
        title: 'Invalid Access',
        description: 'No payment information found.',
      });
      router.push('/');
      return;
    }

    const processPayment = async () => {
      const userRef = doc(firestore, 'users', user.uid);
      const transactionRef = doc(collection(userRef, 'transactions'), paymentId);

      try {
        await runTransaction(firestore, async (transaction) => {
          const transactionDoc = await transaction.get(transactionRef);
          if (transactionDoc.exists()) {
            // This transaction has already been processed.
            console.log('Transaction already processed:', paymentId);
            return;
          }

          const userDoc = await transaction.get(userRef);
          if (!userDoc.exists()) {
            throw new Error('User does not exist.');
          }

          // 1. Create transaction record
          transaction.set(transactionRef, {
            id: paymentId,
            userId: user.uid,
            productId: 'Success_Pathway_Guide',
            transactionDate: serverTimestamp(),
            amount: 50, // Hardcoded amount
            paymentGatewayTransactionId: paymentId,
          });

          // 2. Check for referral and create referral record
          const userData = userDoc.data();
          if (userData.referredBy) {
            const usersCollection = collection(firestore, 'users');
            const referrerQuery = query(
              usersCollection,
              where('referralCode', '==', userData.referredBy),
              limit(1)
            );
            const referrerSnapshot = await getDocs(referrerQuery);

            if (!referrerSnapshot.empty) {
              const referrerDoc = referrerSnapshot.docs[0];
              const referrerId = referrerDoc.id;

              const newReferralRef = doc(collection(firestore, 'referrals'));
              transaction.set(newReferralRef, {
                id: newReferralRef.id,
                referrerId: referrerId,
                referredUserId: user.uid,
                transactionId: paymentId,
                referralDate: serverTimestamp(),
                commissionAmount: 10, // 10 INR commission
              });
            } else {
              console.warn(
                `Referrer with code ${userData.referredBy} not found.`
              );
            }
          }
        });

        toast({
          title: 'Payment Successful!',
          description: 'Your guide is ready to download.',
        });
      } catch (e: any) {
        console.error('Payment processing failed:', e);
        toast({
          variant: 'destructive',
          title: 'Payment Processing Failed',
          description:
            e.message ||
            'There was an error processing your payment. Please contact support.',
        });
      }
    };

    processPayment();
  }, [searchParams, firestore, user, isUserLoading, router, toast]);

  if (isUserLoading) {
    return (
      <Card className="w-full max-w-md text-center shadow-2xl">
        <CardHeader className="items-center">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-8 w-3/4 mt-4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mt-2" />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md text-center shadow-2xl">
      <CardHeader className="items-center">
        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/50">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="mt-4 text-3xl font-bold">
          Congratulations, Future Achiever! 🚀
        </CardTitle>
        <CardDescription className="pt-2 text-base">
          Your guide to wealth and motivation is ready for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          You've taken the first step on an incredible journey. Click the button
          below to download your guide and start building your empire.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          asChild
          size="lg"
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <a href="/Success_Pathway_Guide.pdf" download>
            Download Your Guide
          </a>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/account">Go to My Dashboard</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function SuccessPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
            <SuccessContent />
        </div>
    )
}
