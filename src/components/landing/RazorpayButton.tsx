'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc, collection, query, where, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const RazorpayButton: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    const handlePaymentSuccess = async (response: any) => {
        if (!user || !firestore) {
          toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to complete a purchase.',
          });
          // Redirect to login if user context is lost
          router.push('/login');
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
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
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
                        
                        toast({
                          title: 'Referral Success!',
                          description: `Your referrer has been awarded their commission!`,
                        });
                    }
                }
            }

            // 3. Redirect to success page
            router.push('/success');

        } catch (error: any) {
            console.error('Error processing payment:', error);
            toast({
                variant: 'destructive',
                title: 'Payment Processing Failed',
                description: error.message || 'Could not save transaction details.',
            });
        }
    };

    // Make the function available globally for Razorpay to call
    (window as any).onPaymentSuccess = handlePaymentSuccess;

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    // IMPORTANT: Define the function before the script is loaded
    script.onload = () => {
        // This is where you might initialize something if needed, but for payment
        // buttons, the button itself handles the initialization.
    };
    
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      delete (window as any).onPaymentSuccess;
    };
  }, [user, firestore, router, toast]);

  const handleButtonClick = () => {
    if (!user) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to make a purchase.',
      });
      sessionStorage.setItem('redirectAfterLogin', '/#pricing');
      router.push('/login');
    } else {
        // Find the button and click it programmatically
        const razorpayButton = document.querySelector('.razorpay-payment-button') as HTMLElement;
        if (razorpayButton) {
            razorpayButton.click();
        } else {
            toast({
                variant: 'destructive',
                title: 'Payment Error',
                description: 'Could not initialize payment. Please refresh and try again.',
            });
        }
    }
  };
  
  // This form will be hidden. We will trigger the click with our own styled button.
  return (
    <div>
        <form style={{display: 'none'}}>
            <script
                src="https://checkout.razorpay.com/v1/payment-button.js"
                data-payment_button_id="pl_RYGUqAlaL3Qy4M" // Your Payment Button ID
                data-callback_url="/success" // This will be overridden by the event listener
                data-redirect="false" // Prevent auto-redirect
            >
            </script>
        </form>
         <button
            onClick={handleButtonClick}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transition-transform hover:scale-105 h-11 px-8"
        >
            Invest ₹50 Now
        </button>
    </div>
  );
};

export default RazorpayButton;
