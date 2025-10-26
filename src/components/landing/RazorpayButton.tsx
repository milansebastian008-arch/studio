'use client';

import React, { useEffect } from 'react';

const RazorpayButton: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.setAttribute('data-payment_button_id', 'pl_RYGUqAlaL3Qy4M');
    script.async = true;

    const form = document.getElementById('razorpay-form');
    form?.appendChild(script);

    return () => {
      // Find the script and remove it from the form
      const existingScript = form?.querySelector('script');
      if (existingScript) {
        form?.removeChild(existingScript);
      }
      // Razorpay might leave an iframe, let's remove it if the button is unmounted.
      const razorpayFrame = document.querySelector('.razorpay-checkout-frame');
      if (razorpayFrame) {
        razorpayFrame.remove();
      }
    };
  }, []);

  return <form id="razorpay-form"></form>;
};

export default RazorpayButton;
