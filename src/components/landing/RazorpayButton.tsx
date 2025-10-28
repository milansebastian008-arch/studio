
'use client';

import React, { useEffect, useRef } from 'react';

const RazorpayButton: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formRef.current && formRef.current.children.length === 0) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.setAttribute('data-payment_button_id', 'pl_RYGUqAlaL3Qy4M');
      script.async = true;
      
      formRef.current.appendChild(script);
    }
  }, []);

  return <form ref={formRef}></form>;
};

export default RazorpayButton;
