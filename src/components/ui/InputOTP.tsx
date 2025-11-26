import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputOTPProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  length?: number
  onChange?: (value: string) => void
}

const InputOTP = React.forwardRef<HTMLDivElement, InputOTPProps>(
  ({ length = 6, onChange, className, ...props }, ref) => {
    const [otp, setOtp] = React.useState<string[]>(Array(length).fill(""))
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

    const handleChange = (index: number, value: string) => {
      // Only allow digits
      if (value && !/^\d$/.test(value)) return

      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Call onChange with the complete value
      onChange?.(newOtp.join(""))

      // Auto-focus next input
      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }

    const handleKeyDown = (
      index: number,
      e: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData("text/plain").slice(0, length)
      const newOtp = [...otp]

      pastedData.split("").forEach((char, index) => {
        if (/^\d$/.test(char) && index < length) {
          newOtp[index] = char
        }
      })

      setOtp(newOtp)
      onChange?.(newOtp.join(""))

      // Focus the next empty input or the last one
      const nextEmptyIndex = newOtp.findIndex((val) => !val)
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1
      inputRefs.current[focusIndex]?.focus()
    }

    return (
      <div ref={ref} className={cn("flex gap-2", className)}>
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="h-12 w-12 rounded-md border border-gray-300 bg-white text-center text-lg font-semibold text-text transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
            {...props}
          />
        ))}
      </div>
    )
  }
)
InputOTP.displayName = "InputOTP"

export { InputOTP }

