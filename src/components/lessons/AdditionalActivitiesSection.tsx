'use client'

import { AdditionalActivity } from '@/types/lesson.types'
import { Button } from '@/components/ui/Button'

interface AdditionalActivitiesSectionProps {
  activities: AdditionalActivity[]
}

export function AdditionalActivitiesSection({ activities }: AdditionalActivitiesSectionProps) {
  if (activities.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Section Header */}
      <h2 className="font-display text-3xl font-semibold leading-display text-grey-950 pl-7">
        Doplňkové aktivity pro žáky
      </h2>

      {/* Activities Cards */}
      <div className="flex flex-col gap-5">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            className="bg-grey-100 border border-black/5 rounded-[28px] px-7 py-10"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Content */}
              <div className="flex-1 space-y-4">
                {/* Title with icon */}
                <div className="flex items-start gap-4">
                  {activity.image_url && (
                    <div className="w-7 h-7 shrink-0 rounded overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activity.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-text-strong leading-display">
                    {activity.title}
                  </h3>
                </div>

                {/* Description */}
                {activity.description && (
                  <p className="text-text-subtle text-lg leading-headline">
                    {activity.description}
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="lg:w-[180px] shrink-0">
                <Button 
                  variant="secondary"
                  size="medium"
                  className="w-full"
                  disabled
                >
                  Bez odkazu
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

