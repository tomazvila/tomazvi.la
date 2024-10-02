import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

let names: Set<string> = new Set();

async function appendToSheet(name: string) {
  // Load credentials from environment variables
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '');

  // Create a new JWT client using the credentials
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const range = 'Sheet1'; // Update this to match your sheet name
  const today: string = new Date().toISOString().split('T')[0];

  const result = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[name, today]], // Adjust these fields based on your form data
    },
  });

  return result.data;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name } = req.body;

    names.add(name);

    try {
      const result = await appendToSheet(name);
      res.status(200).json({ success: true, result });
    } catch (error) {
      console.error('Error appending to sheet:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  } else if (req.method === 'GET') {
    const isCron = req.headers['x-vercel-cron'] === '1';
    
    if (isCron) {
      const oldNames = Array.from(names);
      names.clear();
      console.log('Names flushed by cron job:', oldNames);
      res.status(200).json({ flushedNames: oldNames });
    } else {
      res.status(200).json({ names: Array.from(names) });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
