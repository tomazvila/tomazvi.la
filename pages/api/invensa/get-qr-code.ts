import { NextApiRequest, NextApiResponse } from 'next';
import QRCode from 'qrcode';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { baseUrl, feature } = req.query;

  if (!baseUrl || !feature || Array.isArray(baseUrl) || Array.isArray(feature)) {
    console.log(`400 returned here?`)
    return res.status(400).json({ error: 'Invalid baseUrl or feature parameter' });
  }

  const fullUrl = `${baseUrl}/${feature}`;

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(fullUrl);
    return res.status(200).json({ qrCodeDataUrl });
  } catch (error) {
    console.error('Error generating QR code:', error);
    console.log(`500 returned here?`)
    return res.status(500).json({ error: 'Failed to generate QR code' });
  }
}
