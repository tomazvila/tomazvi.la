// pages/success.tsx
'use client';

import React from 'react';
import Link from 'next/link';

const SuccessPage: React.FC = () => {
  return (
    <div>
      <h1>Success!</h1>
      <p>The name has been successfully added.</p>
      <Link href="/invensa/qrcode">Back to QR code</Link>
    </div>
  );
};

export default SuccessPage;
