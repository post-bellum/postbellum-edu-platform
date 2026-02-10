'use client'

interface FormFieldProps {
  label: string
  children: React.ReactNode
}

export function FormField({ label, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-grey-700">{label}</label>
      {children}
    </div>
  )
}

interface TextInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TextInput({ label, value, onChange, placeholder }: TextInputProps) {
  return (
    <FormField label={label}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2 border border-grey-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
      />
    </FormField>
  )
}

interface TextAreaInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export function TextAreaInput({ label, value, onChange, placeholder, rows = 3 }: TextAreaInputProps) {
  return (
    <FormField label={label}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="px-3 py-2 border border-grey-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-y"
      />
    </FormField>
  )
}
