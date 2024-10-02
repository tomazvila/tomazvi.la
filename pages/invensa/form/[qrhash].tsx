'use client';

import React, { useEffect, useState } from 'react';
import NameForm from '@/components/invensa/NameForm';

/*
export default function Page() {
  const router = useRouter()
  console.log(`router.query: ${JSON.stringify(router.query)}`)
  return <p>Post: {router.query.qrhash}</p>
}
*/

const NamesPage: React.FC = () => {
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    const fetchNames = async () => {
      const res = await fetch('/api/invensa/names');
      const data: { names: string[] } = await res.json();
      setNames(data.names);
    };

    fetchNames();
    const interval = setInterval(fetchNames, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Enter your name to register your attendance</h1>
      <NameForm />
      <ul>
        {names.map((name, index) => (
          <li key={index}>{name}</li>
        ))}
      </ul>
    </div>
  );
};

export default NamesPage;
