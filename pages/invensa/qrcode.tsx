import { useEffect, useState } from 'react';
import Head from 'next/head';
import { getUrlHash } from '@/utils/hash';

export default function QRCodePage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const urlHash = getUrlHash()
  const baseUrl = 'https://www.tomazvi.la/invensa/form';
  const fullUrl = `${baseUrl}/${urlHash}`

  useEffect(() => {
    const feature = urlHash;

    fetch(`/api/invensa/get-qr-code?baseUrl=${encodeURIComponent(baseUrl)}&feature=${encodeURIComponent(feature)}`)
      .then(response => response.json())
      .then(data => {
        if (data.qrCodeDataUrl) {
          setQrCodeUrl(data.qrCodeDataUrl);
        }
      })
      .catch(error => console.error(`Error fetching QR code: ${error}`));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Invensa QR Code Generator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold mb-8">Invensa QR Code Generator</h1>
        {qrCodeUrl ? (
          <div>
            <img src={qrCodeUrl} alt="QR Code" width={300} height={300} />
            <p className="mt-4">Scan this QR code to visit:</p>
            <p className="font-semibold">{fullUrl}</p>
          </div>
        ) : (
          <p>Loading QR code...</p>
        )}
      </main>
    </div>
  );
}
