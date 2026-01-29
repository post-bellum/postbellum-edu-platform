import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { Label } from '@/components/ui/Label'

interface UserTypeSectionProps {
  /** Current user type */
  userType: 'teacher' | 'not-teacher'
}

export function UserTypeSection({ userType }: UserTypeSectionProps) {
  // Override disabled checked styling to keep green background
  const radioClassName = 'data-[state=checked]:disabled:bg-brand-primary data-[state=checked]:disabled:border-brand-primary'

  return (
    <RadioGroup value={userType} disabled data-testid="user-type-radio-group">
      <div className="flex gap-3 w-full">
        <div className="flex-1 flex items-center gap-2 rounded-2xl bg-grey-100 px-5 py-3">
          <RadioGroupItem 
            value="teacher" 
            id="teacher-display" 
            disabled 
            className={radioClassName}
            data-testid="user-type-teacher" 
          />
          <Label htmlFor="teacher-display" className="font-normal text-base text-text-subtle leading-[1.5]">
            Jsem učitel
          </Label>
        </div>
        <div className="flex-1 flex items-center gap-2 rounded-2xl bg-grey-100 px-5 py-3">
          <RadioGroupItem 
            value="not-teacher" 
            id="not-teacher-display" 
            disabled 
            className={radioClassName}
            data-testid="user-type-not-teacher" 
          />
          <Label htmlFor="not-teacher-display" className="font-normal text-base text-text-subtle leading-[1.5]">
            Nejsem učitel
          </Label>
        </div>
      </div>
    </RadioGroup>
  )
}

