export interface UserProfile {
  id: string
  email: string
  display_name: string | null
  user_type: "teacher" | "not-teacher"
  school_name: string | null
  category: "student" | "parent" | "educational_professional" | "ngo_worker" | "public_sector_worker" | "other" | null
  terms_accepted: boolean
  email_consent: boolean
  registration_completed: boolean
  created_at: string
  updated_at: string
}

export interface CompleteRegistrationData {
  displayName?: string  // Optional display name (from OAuth or manual input)
  userType: "teacher" | "not-teacher"
  schoolName?: string  // For teachers
  category?: "student" | "parent" | "educational_professional" | "ngo_worker" | "public_sector_worker" | "other"  // For non-teachers
  termsAccepted: boolean  // Required: user must accept terms of service
  emailConsent: boolean
}

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

export interface AuthError {
  message: string
  status?: number
}

