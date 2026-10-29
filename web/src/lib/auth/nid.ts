import { z } from 'zod';

/**
 * Bangladesh National ID + date-of-birth verification payload.
 *
 * NIDs are 10, 13 or 17 digits. The 17-digit form embeds a birth-year prefix;
 * Porichoy still requires the DOB separately, so we always collect it.
 */
export const nidSchema = z.object({
  nid: z
    .string()
    .trim()
    .regex(/^\d{10}$|^\d{13}$|^\d{17}$/, 'Enter a valid 10, 13 or 17 digit National ID.'),
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Select your date of birth.')
    .refine((value) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return false;
      const now = new Date();
      // Must be a real, past date and the person at least 15 years old.
      const fifteenYears = Date.UTC(now.getUTCFullYear() - 15, now.getUTCMonth(), now.getUTCDate());
      return date.getTime() < fifteenYears;
    }, 'Date of birth must be valid.'),
});

export type NidInput = z.infer<typeof nidSchema>;

/** Split YYYY-MM-DD into the numeric parts Porichoy expects. */
export function toPorichoyDate(iso: string) {
  const [year, month, date] = iso.split('-').map(Number);
  return { year, month, date };
}
