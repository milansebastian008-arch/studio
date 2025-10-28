
'use client';

import React from 'react';

const RazorpayButton: React.FC = () => {
  return (
    <form>
      <script 
        src="https://checkout.razorpay.com/v1/payment-button.js" 
        data-payment_button_id="pl_RYGUqAlaL3Qy4M" 
        async 
      >
      </script>
    </form>
  );
};

export default RazorpayButton;
