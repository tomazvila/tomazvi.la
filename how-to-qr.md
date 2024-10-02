Since you'll be deploying your Next.js 14 application on Vercel, you can take advantage of Vercel's built-in Cron Jobs feature to flush the server-stored names every 30 minutes. Here's how you can implement this:

1. First, create an API route to handle name storage and flushing:

```javascript
// pages/api/names.js
import { NextResponse } from 'next/server';

let names = new Set();

export async function POST(request) {
  const { name } = await request.json();
  names.add(name);
  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json({ names: Array.from(names) });
}

export async function DELETE() {
  const oldNames = Array.from(names);
  names.clear();
  return NextResponse.json({ flushedNames: oldNames });
}
```

2. Create a `vercel.json` file in the root of your project to define the cron job:

```json
{
  "crons": [
    {
      "path": "/api/names",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

This cron job will call the `/api/names` endpoint every 30 minutes.

3. Modify your API route to handle the cron job:

```javascript
// pages/api/names.js
import { NextResponse } from 'next/server';

let names = new Set();

export async function POST(request) {
  const { name } = await request.json();
  names.add(name);
  return NextResponse.json({ success: true });
}

export async function GET(request) {
  // Check if this is a cron job request
  const isCron = request.headers.get('x-vercel-cron') === '1';
  
  if (isCron) {
    // If it's a cron job, flush the names
    const oldNames = Array.from(names);
    names.clear();
    console.log('Names flushed by cron job:', oldNames);
    return NextResponse.json({ flushedNames: oldNames });
  }
  
  // If it's a regular GET request, return the current names
  return NextResponse.json({ names: Array.from(names) });
}
```

4. Create a form component to add names:

```jsx
// components/NameForm.js
import { useState } from 'react';

export default function NameForm() {
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/names', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
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
}
```

5. Create a page to display the names:

```jsx
// pages/names.js
import { useEffect, useState } from 'react';
import NameForm from '../components/NameForm';

export default function NamesPage() {
  const [names, setNames] = useState([]);

  useEffect(() => {
    const fetchNames = async () => {
      const res = await fetch('/api/names');
      const data = await res.json();
      setNames(data.names);
    };

    fetchNames();
    const interval = setInterval(fetchNames, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Stored Names</h1>
      <NameForm />
      <ul>
        {names.map((name, index) => (
          <li key={index}>{name}</li>
        ))}
      </ul>
    </div>
  );
}
```

This implementation will:

1. Store names on the server side.
2. Flush the names every 30 minutes using Vercel's Cron Jobs.
3. Allow adding names through a form.
4. Display the current list of names, updating every minute.

When you deploy this to Vercel, the cron job will automatically be set up and will run every 30 minutes, flushing the stored names. The `x-vercel-cron` header is used to distinguish between regular GET requests and cron job invocations[1][2].

Remember to secure your cron job by adding a `CRON_SECRET` environment variable to your Vercel project and verifying it in your API route[4].

This solution works well with Vercel's serverless environment and provides a scalable way to manage server-side state with regular flushing.

Citations:
[1] https://vercel.com/blog/cron-jobs
[2] https://vercel.com/changelog/run-scheduled-jobs-with-vercel-cron-jobs-and-vercel-functions
[3] https://vercel.com/guides/how-to-setup-cron-jobs-on-vercel
[4] https://vercel.com/docs/cron-jobs/manage-cron-jobs
[5] https://blog.bitsrc.io/unleashing-the-power-of-automation-exploring-serverless-functions-and-cron-jobs-for-efficient-task-cffa07c11bd6
[6] https://vercel.com/changelog/vercel-cron-jobs-are-now-generally-available
