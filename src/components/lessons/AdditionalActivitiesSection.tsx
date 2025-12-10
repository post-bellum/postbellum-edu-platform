'use client'

import { AdditionalActivity } from '@/types/lesson.types'
import { Button } from '@/components/ui/Button'
import { Eye } from 'lucide-react'

interface AdditionalActivitiesSectionProps {
  activities: AdditionalActivity[]
}

export function AdditionalActivitiesSection({ activities }: AdditionalActivitiesSectionProps) {
  if (activities.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Doplňkové aktivity pro žáky</h2>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex gap-6">
              {activity.image_url && (
                <div className="shrink-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activity.image_url}
                      alt={activity.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{activity.title}</h3>
                {activity.description && (
                  <p className="text-gray-600 text-sm mb-4">{activity.description}</p>
                )}
                <Button variant="outline" size="sm">
                  <Eye />
                  Zobrazit
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

