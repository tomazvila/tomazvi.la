'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const NameForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/invensa/names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        // Redirect to success page
        router.push('/invensa/form/success');
      } else {
        // Handle error
        console.error('Failed to submit name');
      }
    } catch (error) {
      console.error('Error submitting name:', error);
    }
    setName('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter a name"
      />
      <button type="submit">Add Name</button>
    </form>
  );
};

export default NameForm;
