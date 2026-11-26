import { Mail } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'

const ContactInfoCard = () => {
  return (
    <Card className='border-vital-blue-700/20'>
      <CardHeader>
        <CardTitle className='text-xl text-gray-900'>
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-start gap-3'>
          <Mail className='text-vital-blue-700 mt-1 size-5' />
          <div>
            <p className='font-medium text-gray-900'>Email</p>
            <p className='text-gray-600'>info@virtality.app</p>
            <p className='text-gray-600'>support@virtality.app</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ContactInfoCard
