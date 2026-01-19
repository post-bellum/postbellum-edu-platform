interface AlertMessageProps {
  /** Success message to display */
  success?: string | null
  /** Error message to display */
  error?: string | null
}

export function AlertMessage({ success, error }: AlertMessageProps) {
  if (success) {
    return (
      <div 
        className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg"
        data-testid="alert-message-success"
      >
        {success}
      </div>
    )
  }

  if (error) {
    return (
      <div 
        className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg"
        data-testid="alert-message-error"
      >
        {error}
      </div>
    )
  }

  return null
}

