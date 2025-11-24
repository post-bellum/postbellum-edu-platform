export interface UserProfile {
  id: string
  email: string
  user_type: "teacher" | "not-teacher"
  school_name: string | null
  category: "student" | "parent" | "educational_professional" | "ngo_worker" | "public_sector_worker" | "other" | null
  email_consent: boolean
  registration_completed: boolean
  created_at: string
  updated_at: string
}

export interface CompleteRegistrationData {
  userType: "teacher" | "not-teacher"
  schoolName?: string  // For teachers
  category?: "student" | "parent" | "educational_professional" | "ngo_worker" | "public_sector_worker" | "other"  // For non-teachers
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

