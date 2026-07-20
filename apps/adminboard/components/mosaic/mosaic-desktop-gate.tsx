import { MonitorSmartphone } from 'lucide-react'

const MosaicDesktopGate = () => {
  return (
    <div className='rounded-lg border border-dashed p-8 text-center'>
      <div className='bg-muted mx-auto mb-4 flex size-12 items-center justify-center rounded-full'>
        <MonitorSmartphone className='text-muted-foreground size-6' />
      </div>
      <h2 className='text-lg font-semibold'>Desktop or tablet required</h2>
      <p className='text-muted-foreground mx-auto mt-2 max-w-md text-sm'>
        Mosaic editing needs a larger screen for drag-and-drop placement. Open
        Adminboard on a desktop or tablet to compose the landing mosaic.
      </p>
    </div>
  )
}

export default MosaicDesktopGate
