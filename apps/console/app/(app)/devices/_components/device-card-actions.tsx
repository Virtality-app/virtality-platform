import { Button } from '@virtality/ui/components/button'
import { Input } from '@virtality/ui/components/input'

/** Footer of a device card: pair, show the Pairing Code, retry, or remove. */
const DeviceCardActions = ({
  error,
  isCodeFieldOpen,
  isPaired,
  isBusy,
  isStarting,
  isCancelling,
  verificationCode,
  onPair,
  onCancel,
  onRemove,
}: {
  error: string
  isCodeFieldOpen: boolean
  isPaired: boolean
  /** Pairing is starting or under way. */
  isBusy: boolean
  isStarting: boolean
  isCancelling: boolean
  verificationCode: string
  onPair: () => void
  onCancel: () => void
  onRemove: () => void
}) => {
  if (error && !isCodeFieldOpen) {
    return (
      <div className='flex w-full gap-2'>
        <Button onClick={onCancel} disabled={isCancelling} className='flex-1'>
          Cancel
        </Button>
        <Button onClick={onPair} disabled={isStarting} className='flex-1'>
          Retry
        </Button>
      </div>
    )
  }

  if (isCodeFieldOpen) {
    return (
      <div className='flex gap-2'>
        <Input
          type='text'
          name='verificationCode'
          id='verificationCode'
          data-tour='device-code'
          value={verificationCode}
          className='w-full text-center'
          disabled
        />
        <Button onClick={onCancel} disabled={isCancelling}>
          Cancel
        </Button>
      </div>
    )
  }

  if (isPaired) {
    return (
      <Button variant='destructive' onClick={onRemove} className='w-full'>
        Remove
      </Button>
    )
  }

  return (
    <div className='flex w-full gap-2'>
      <Button
        variant='destructive'
        disabled={isBusy}
        onClick={onRemove}
        className='flex-1'
      >
        Remove
      </Button>
      <Button
        variant='default'
        onClick={onPair}
        disabled={isBusy}
        data-tour='device-pair'
        className='flex-1'
      >
        Pair
      </Button>
    </div>
  )
}

export default DeviceCardActions
