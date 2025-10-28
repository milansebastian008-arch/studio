'use client';

import React, { useCallback } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc, collection, query, where, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';

const RazorpayButton: React.FC = () => {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentSuccess = useCallback(async (response: any) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to complete a purchase.',
      });
      return;
    }

    try {
      // 1. Create Transaction
      const transactionsCollectionRef = collection(firestore, 'users', user.uid, 'transactions');
      const transactionId = doc(transactionsCollectionRef).id;
      const transactionRef = doc(transactionsCollectionRef, transactionId);

      await setDoc(transactionRef, {
        id: transactionId,
        userId: user.uid,
        productId: 'SUCCESS_PATHWAY_GUIDE',
        transactionDate: serverTimestamp(),
        amount: 50,
        paymentGatewayTransactionId: response.razorpay_payment_id,
      });

      // 2. Handle Referral
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const referredByCode = userData.referredBy;

        if (referredByCode) {
          const usersRef = collection(firestore, 'users');
          const q = query(usersRef, where('referralCode', '==', referredByCode));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const referrerDoc = querySnapshot.docs[0];
            const referrerId = referrerDoc.id;

            const referralRef = collection(firestore, 'referrals');
            await addDoc(referralRef, {
              referrerId: referrerId,
              referredUserId: user.uid,
              transactionId: transactionId,
              referralDate: serverTimestamp(),
              commissionAmount: 10,
            });

            console.log(`Commission of ₹10 awarded to user ${referrerId}`);
            toast({
              title: 'Referral Success!',
              description: `Your referrer has been awarded their commission!`,
            });
          }
        }
      }

      router.push('/success');
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast({
        variant: 'destructive',
        title: 'Payment Processing Failed',
        description: error.message || 'Could not save transaction details.',
      });
    }
  }, [user, firestore, router, toast]);

  const displayRazorpay = useCallback(async () => {
    if (!user) {
       toast({
        title: 'Please log in',
        description: 'You need to be logged in to make a purchase.',
      });
      sessionStorage.setItem('redirectAfterLogin', '/#pricing');
      router.push('/login');
      return;
    }
      
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: '5000', 
      currency: 'INR',
      name: 'Millionaire Mindset',
      description: 'Success Pathway Guide',
      image: '/logo.png',
      handler: handlePaymentSuccess,
      prefill: {
        name: user.displayName || 'Valued Customer',
        email: user.email || '',
      },
      theme: {
        color: '#B57EDC',
      },
    };
    
    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();

  }, [user, handlePaymentSuccess, router, toast]);


  return (
      <Button
        onClick={displayRazorpay}
        className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transition-transform hover:scale-105"
        size="lg"
      >
        Invest ₹50 Now
      </Button>
  );
};

export default RazorpayButton;
