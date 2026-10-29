import { useClientT } from '@/i18n/use-client-t'
import { Star, X } from 'lucide-react'
import { Input } from '@virtality/ui/components/input'
import { Button } from '@virtality/ui/components/button'
import { cn } from '@/lib/utils'

interface ExerciseGridSearchProps {
  searchTerm: string
  onSearchTermChange: (value: string) => void
  favoritesOnly: boolean
  onToggleFavoritesOnly: () => void
}

const ExerciseGridSearch = ({
  searchTerm,
  onSearchTermChange,
  favoritesOnly,
  onToggleFavoritesOnly,
}: ExerciseGridSearchProps) => {
  const { t } = useClientT('shared')
  return (
    <div className='mb-3 flex max-w-lg flex-wrap items-start gap-2'>
      <div className='relative min-w-48 flex-1'>
        <Input
          id='searchTerm'
          name='searchTerm'
          type='text'
          placeholder={t('exerciseLibrary.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className='bg-zinc-100 pr-8 dark:bg-zinc-950!'
        />
        {searchTerm !== '' && (
          <Button
            type='button'
            size='icon'
            variant='ghost'
            className='absolute top-1.5 right-2 size-6'
            onClick={() => onSearchTermChange('')}
          >
            <X />
          </Button>
        )}
      </div>
      <Button
        type='button'
        variant='outline'
        aria-pressed={favoritesOnly}
        aria-label={t('exerciseLibrary.showFavoritesOnly')}
        onClick={onToggleFavoritesOnly}
        className={cn(
          'mt-0 shrink-0',
          favoritesOnly && 'ring-cyan-highlight ring-2',
        )}
      >
        <Star className={cn(favoritesOnly && 'fill-yellow-400')} />
        <span>{t('exerciseLibrary.favorites')}</span>
      </Button>
    </div>
  )
}

export default ExerciseGridSearch
