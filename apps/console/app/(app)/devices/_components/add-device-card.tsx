import { Plus } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import { Card, CardContent } from '@virtality/ui/components/card'

const AddDeviceCard = ({
  handleDialogOpen,
}: {
  handleDialogOpen: () => void
}) => {
  return (
    <Card
      id='add-new-device'
      data-tour='device-add'
      onClick={handleDialogOpen}
      className='aspect-4/5 w-full max-w-xs cursor-pointer border-2 border-dashed border-zinc-400 transition-colors hover:border-zinc-200 dark:border-zinc-200 dark:hover:border-zinc-400 dark:hover:bg-zinc-900'
    >
      <CardContent className='m-auto flex h-full flex-col items-center justify-center p-6'>
        <Button className='mb-4 rounded-full p-3! dark:bg-zinc-200'>
          <Plus className='h-6 w-6 text-zinc-200 dark:text-zinc-900' />
        </Button>
        <p className='text-lg font-medium dark:text-zinc-200'>Add device</p>
      </CardContent>
    </Card>
  )
}

export default AddDeviceCard
