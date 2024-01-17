import { getServerSideConfig } from '@/lib/configs/server';

export function verifyPassword(hash: string) {
  const { codes } = getServerSideConfig();
  return codes.has(hash);
}