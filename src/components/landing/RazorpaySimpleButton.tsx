
'use client';

import React, { useEffect, useRef } from 'react';

const RazorpaySimpleButton: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.async = true;
    script.dataset.payment_button_id = 'pl_RYGUqAlaL3Qy4M';

    if (formRef.current) {
        formRef.current.appendChild(script);
    }

    return () => {
      // Cleanup script when component unmounts
      if (formRef.current) {
        const existingScript = formRef.current.querySelector('script');
        if (existingScript) {
          formRef.current.removeChild(existingScript);
        }
      }
    };
  }, []);

  return <form ref={formRef}></form>;
};

export default RazorpaySimpleButton;
