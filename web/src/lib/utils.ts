import { clsx, type ClassValue } from 'clsx';

/** Join class names. No Tailwind merge needed — yak owns every class. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
