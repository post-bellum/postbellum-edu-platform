'use client'

import * as React from 'react'

/** Remembers per browser that this admin does not want to see the questionnaire */
const STORAGE_KEY = 'storyon-survey-hidden-for-me'
/** Keeps the admin switch and the floating widget in sync within one tab */
const CHANGE_EVENT = 'storyon-survey-hidden-for-me-change'

function readFlag(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    // Private mode or blocked storage - nothing is hidden then
    return false
  }
}

/**
 * Lets an admin hide the floating questionnaire just for themselves, so it does
 * not tempt them into answering and skewing the collected data. The preference
 * lives in the browser only - it changes nothing for other users.
 */
export function useSurveyHiddenForMe() {
  // Starts as false so server and first client render agree; the real value is
  // read right after mount
  const [isHidden, setIsHidden] = React.useState(false)

  React.useEffect(() => {
    const sync = () => setIsHidden(readFlag())
    sync()

    window.addEventListener(CHANGE_EVENT, sync)
    // Also react to the switch being flipped in another tab
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const setSurveyHiddenForMe = React.useCallback((next: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next))
    } catch {
      // Preference cannot be remembered - keep the switch usable for this page
    }
    setIsHidden(next)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  return { isHidden, setSurveyHiddenForMe }
}
