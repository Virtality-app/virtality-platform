import { DeviceContextProvider } from '@/context/device-context'
import { VrVideoPage } from './_components/vr-video-page'

const Page = () => {
  return (
    <DeviceContextProvider>
      <VrVideoPage />
    </DeviceContextProvider>
  )
}

export default Page
