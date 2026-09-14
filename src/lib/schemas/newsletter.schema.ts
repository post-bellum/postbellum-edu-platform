import { z } from 'zod'

/**
 * Newsletter subscription input.
 *
 * Shared by the public signup form and the server action so the browser and
 * the server agree on what a valid address is - and so the value that reaches
 * both Supabase and SmartEmailing is always trimmed and lowercased.
 */
export const newsletterEmailSchema = z
  .string()
  .trim()
  .min(1, 'Zadejte prosím e-mailovou adresu')
  .max(254, 'E-mailová adresa je příliš dlouhá')
  .email('Zadejte prosím platnou e-mailovou adresu')
  .transform((value) => value.toLowerCase())

export type NewsletterEmail = z.infer<typeof newsletterEmailSchema>

/**
 * Validates an address for the UI. Returns the normalized address, or the
 * Czech error message to show next to the field.
 */
export function parseNewsletterEmail(
  value: string
): { success: true; email: string } | { success: false; error: string } {
  const result = newsletterEmailSchema.safeParse(value)
  if (result.success) {
    return { success: true, email: result.data }
  }
  return {
    success: false,
    error: result.error.issues[0]?.message ?? 'Zadejte prosím platnou e-mailovou adresu',
  }
}
