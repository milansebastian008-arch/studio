
'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { handleSuccessfulPayment } from '@/app/actions';

const RazorpayButton: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const scriptLoaded = useRef(false);

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const displayRazorpay = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please log in or sign up to make a payment.',
      });
      sessionStorage.setItem('redirectAfterLogin', '/#pricing');
      router.push('/login');
      return;
    }

    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      toast({
        variant: 'destructive',
        title: 'Payment Gateway Error',
        description: 'Could not load the payment script. Please check your connection or try again later.',
      });
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_5gDmT3aL4vX0vY', // Test key
      amount: '5000', // Amount in paisa (50 INR)
      currency: 'INR',
      name: 'Millionaire Mindset',
      description: 'Success Pathway Guide',
      image: '/logo.png', // A placeholder, you can add a logo to your /public folder
      handler: async function (response: any) {
        // Payment successful, now call server action
        const formData = new FormData();
        formData.append('userId', user.uid);
        formData.append('paymentId', response.razorpay_payment_id);
        formData.append('amount', '50'); // The actual amount in INR
        
        const result = await handleSuccessfulPayment(null, formData);

        if (result?.error) {
             toast({
                variant: 'destructive',
                title: 'Post-Payment Error',
                description: result.error,
             });
        } else {
            // Redirect to success page
            router.push('/success');
        }
      },
      prefill: {
        name: user.displayName || '',
        email: user.email || '',
      },
      theme: {
        color: '#8A2BE2', // Matches primary theme color
      },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  return (
    <Button onClick={displayRazorpay} size="lg" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transition-transform hover:scale-105">
      Invest Now & Get Instant Access
    </Button>
  );
};

export default RazorpayButton;
