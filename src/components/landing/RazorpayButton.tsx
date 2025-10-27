'use client';

import React, { useEffect, useCallback } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDocs, collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

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
      const transactionId = doc(collection(firestore, 'transactions')).id;
      const transactionRef = doc(firestore, 'users', user.uid, 'transactions', transactionId);
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
      const userDoc = await (await fetch(userDocRef.path)).json(); // Simplified fetch for demo
      const referredByCode = userDoc.fields?.referredBy?.stringValue;

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
      router.push('/login');
      return;
    }
      
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_eJmLrDXIqYRmzz', // Enter the Key ID generated from the Dashboard
      amount: '5000', // Amount is in currency subunits. Default currency is INR. Hence, 5000 paise = INR 50.
      currency: 'INR',
      name: 'Millionaire Mindset',
      description: 'Success Pathway Guide',
      image: '/logo.png', //TODO
      handler: handlePaymentSuccess,
      prefill: {
        name: user.displayName || 'Valued Customer',
        email: user.email || '',
      },
      theme: {
        color: '#6F42C1',
      },
    };
    
    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();

  }, [user, handlePaymentSuccess, router, toast]);

  // This handles the static button from your original code.
  // We'll replace this with a dynamic button.
  useEffect(() => {
    const form = document.getElementById('razorpay-form');
    if (form?.hasChildNodes()) {
        form.innerHTML = '';
    }
    const button = document.createElement('button');
    button.textContent = 'Invest ₹50 Now';
    button.className = 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transition-transform hover:scale-105 h-11 rounded-md px-8 w-full sm:w-auto';
    button.onclick = (e) => {
        e.preventDefault();
        displayRazorpay();
    };
    form?.appendChild(button);
  }, [displayRazorpay]);

  return <form id="razorpay-form"></form>;
};

export default RazorpayButton;
