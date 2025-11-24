"use client"

import * as React from "react"
import { Input } from "@/components/ui/Input"
import { cn } from "@/lib/utils"
import { logger } from "@/lib/logger"

export interface AutocompleteOption {
  value: string
  label: string
  subtitle?: string
}

interface AutocompleteProps {
  id?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => Promise<AutocompleteOption[]>
  disabled?: boolean
  required?: boolean
  minChars?: number
  debounceMs?: number
  emptyMessage?: string
  loadingMessage?: string
  rightIcon?: React.ReactNode
  className?: string
}

export function Autocomplete({
  id,
  placeholder,
  value,
  onChange,
  onSearch,
  disabled = false,
  required = false,
  minChars = 2,
  debounceMs = 300,
  emptyMessage = "Žádné výsledky",
  loadingMessage = "Vyhledávání...",
  rightIcon,
  className,
}: AutocompleteProps) {
  const [inputValue, setInputValue] = React.useState(value)
  const [options, setOptions] = React.useState<AutocompleteOption[]>([])
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
  const [isFocused, setIsFocused] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)

  // Debounced search
  React.useEffect(() => {
    if (inputValue.length < minChars) {
      setOptions([])
      setIsOpen(false)
      return
    }

    // Only search if input is focused
    if (!isFocused) {
      return
    }

    setIsLoading(true)
    const timer = setTimeout(async () => {
      try {
        const results = await onSearch(inputValue)
        setOptions(results)
        // Only open if still focused
        if (isFocused) {
          setIsOpen(results.length > 0)
        }
        setHighlightedIndex(-1)
      } catch (error) {
        // Log error but don't show to user - autocomplete failures are non-critical
        logger.error("Autocomplete search error", error)
        setOptions([])
        setIsOpen(false)
      } finally {
        setIsLoading(false)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [inputValue, minChars, debounceMs, onSearch, isFocused])

  // Sync external value changes
  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  // Click outside to close
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
  }

  const handleSelectOption = (option: AutocompleteOption) => {
    setInputValue(option.label)
    onChange(option.label)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || options.length === 0) {
      if (e.key === "ArrowDown" && inputValue.length >= minChars) {
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) => 
          prev < options.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          handleSelectOption(options[highlightedIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
      case "Tab":
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        })
      }
    }
  }, [highlightedIndex])

  const showDropdown = isOpen && (isLoading || options.length > 0 || inputValue.length >= minChars)

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Input
        ref={inputRef}
        id={id}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setIsFocused(true)
          if (options.length > 0 && inputValue.length >= minChars) {
            setIsOpen(true)
          }
        }}
        onBlur={() => {
          setIsFocused(false)
          // Delay closing to allow option selection
          setTimeout(() => {
            setIsOpen(false)
          }, 200)
        }}
        disabled={disabled}
        required={required}
        rightIcon={rightIcon}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={`${id}-listbox`}
        aria-autocomplete="list"
        aria-activedescendant={
          highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined
        }
      />
      
      {showDropdown && (
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading ? (
            <li className="px-4 py-3 text-sm text-gray-500 text-center">
              {loadingMessage}
            </li>
          ) : options.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500 text-center">
              {emptyMessage}
            </li>
          ) : (
            options.map((option, index) => (
              <li
                key={`${option.value}-${index}`}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === highlightedIndex}
                className={cn(
                  "px-4 py-2 cursor-pointer transition-colors",
                  index === highlightedIndex
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-gray-50 text-gray-900"
                )}
                onClick={() => handleSelectOption(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{option.label}</span>
                  {option.subtitle && (
                    <span className="text-xs text-gray-500 mt-0.5">
                      {option.subtitle}
                    </span>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

