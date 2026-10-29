import { clsx, type ClassValue } from 'clsx';

/** Join class names. No Tailwind merge needed — yak owns every class. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Upload cap in MB. Hosted serverless platforms limit request bodies (Vercel:
 * 4.5 MB), so deployments set NEXT_PUBLIC_MAX_UPLOAD_MB; local dev allows 25.
 */
export const MAX_UPLOAD_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB) || 25;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
