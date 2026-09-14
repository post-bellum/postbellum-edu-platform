import Home from '@/app/page'
import { ResetPasswordDialog } from '@/components/auth'

/**
 * Landing page for the password recovery link.
 *
 * Renders the homepage as background with the new-password form in a modal,
 * matching the login / registration experience.
 */
export default function ResetPasswordPage() {
  return (
    <>
      <Home />
      <ResetPasswordDialog />
    </>
  )
}
