import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { EyeIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'

interface ViewButtonProps {
  href: string
  className?: string
  title?: string
}

export function ViewButton({ href, className, title = 'Zobrazit lekci' }: ViewButtonProps) {
  return (
    <Button
      asChild
      variant="quaternary"
      size="medium"
      className={cn('border-[1.25px]', className)}
    >
      <Link href={href} title={title}>
        <EyeIcon className="w-5 h-5 text-grey-500" />
        <span>Zobrazit</span>
      </Link>
    </Button>
  )
}
