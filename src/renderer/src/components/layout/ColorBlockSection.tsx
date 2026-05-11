import { cn } from '@/lib/utils'

type BlockColor = 'lime' | 'lilac' | 'cream' | 'mint' | 'pink' | 'coral' | 'navy'

interface ColorBlockSectionProps {
  color: BlockColor
  children: React.ReactNode
  id?: string
  className?: string
}

const blockClasses: Record<BlockColor, string> = {
  lime: 'color-block-lime',
  lilac: 'color-block-lilac',
  cream: 'color-block-cream',
  mint: 'color-block-mint',
  pink: 'color-block-pink',
  coral: 'color-block-coral',
  navy: 'color-block-navy'
}

export function ColorBlockSection({ color, children, id, className }: ColorBlockSectionProps): JSX.Element {
  return (
    <section id={id} className={cn(blockClasses[color], className)}>
      {children}
    </section>
  )
}
