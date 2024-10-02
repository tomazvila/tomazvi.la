import { createHash } from 'crypto';

export function getUrlHash(): string {
  const today: string = new Date().toISOString().split('T')[0];
  const hash: string = createHash('sha256').update(today).digest('hex');
  return hash.substring(0, 8);
}
