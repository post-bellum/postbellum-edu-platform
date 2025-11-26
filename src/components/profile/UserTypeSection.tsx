import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup"
import { Label } from "@/components/ui/Label"

interface UserTypeSectionProps {
  /** Current user type */
  userType: "teacher" | "not-teacher"
}

export function UserTypeSection({ userType }: UserTypeSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold">Typ účtu</h2>
      <RadioGroup value={userType} disabled>
        <div className="flex items-center space-x-3 rounded-lg border border-gray-300 p-4 bg-gray-50">
          <RadioGroupItem value="teacher" id="teacher-display" disabled />
          <Label htmlFor="teacher-display" className="flex-1 font-normal opacity-60">
            Jsem učitel
          </Label>
        </div>
        <div className="flex items-center space-x-3 rounded-lg border border-gray-300 p-4 bg-gray-50">
          <RadioGroupItem value="not-teacher" id="not-teacher-display" disabled />
          <Label htmlFor="not-teacher-display" className="flex-1 font-normal opacity-60">
            Nejsem učitel
          </Label>
        </div>
      </RadioGroup>
      <p className="text-sm text-gray-500">
        Typ účtu nelze změnit. Pokud potřebujete změnit typ účtu, kontaktujte podporu.
      </p>
    </div>
  )
}

