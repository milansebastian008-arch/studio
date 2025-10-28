
'use client';

import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc, collection, query, where, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

// This function loads the Razorpay script and adds it to the page
const useRazorpayScript = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
};

const RazorpayButton: React.FC = () => {
  useRazorpayScript(); // Load the script when the component mounts
  const { user } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handlePayment = useCallback(async () => {
    if (!user || !firestore) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to make a purchase.',
      });
      sessionStorage.setItem('redirectAfterLogin', '/#pricing');
      router.push('/login');
      return;
    }
    
    // This is your Razorpay Test Key ID.
    const razorpayKeyId = 'rzp_test_p7mN4A1nS0Yl9S';

    const options = {
      key: razorpayKeyId,
      amount: 50 * 100, // Amount in paise (50 INR)
      currency: 'INR',
      name: 'Millionaire Mindset',
      description: 'Success Pathway Guide',
      image: 'https://picsum.photos/seed/logo/128/128', // Placeholder logo
      handler: async function (response: any) {
        // This function is called on successful payment
        try {
            // 1. Create Transaction in Firestore
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
            
            // 2. Handle Referral Logic
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
                            commissionAmount: 10, // 20% of 50 INR
                        });
                        
                        toast({
                          title: 'Referral Success!',
                          description: `Your referrer has earned a commission!`,
                        });
                    }
                }
            }

            // 3. Redirect to success page
            router.push('/success');

        } catch (error: any) {
            console.error('Error processing payment post-confirmation:', error);
            toast({
                variant: 'destructive',
                title: 'Payment Processing Failed',
                description: error.message || 'Could not save transaction details. Please contact support.',
            });
        }
      },
      prefill: {
        name: user.displayName || '',
        email: user.email || '',
      },
      theme: {
        color: '#8A2BE2', // A purple color to match the theme
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();

  }, [user, firestore, router, toast]);

  return (
    <button
      onClick={handlePayment}
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transition-transform hover:scale-105 h-11 px-8"
    >
      Invest ₹50 Now
    </button>
  );
};

export default RazorpayButton;
