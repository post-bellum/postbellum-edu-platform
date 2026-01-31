'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input, InputProps } from './Input'

export type PasswordInputProps = Omit<InputProps, 'type' | 'rightIcon' | 'onRightIconClick'>

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev)
    }

    return (
      <Input
        {...props}
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          showPassword ? (
            <EyeOff className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Eye className="h-5 w-5" aria-hidden="true" />
          )
        }
        onRightIconClick={togglePasswordVisibility}
        aria-describedby={props['aria-describedby']}
      />
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
