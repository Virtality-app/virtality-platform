'use client'
import { Mail } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import { Card, CardContent } from '@virtality/ui/components/card'

type ContactSubmittedProps = {
  onReset: () => void
}

const ContactSubmitted = ({ onReset }: ContactSubmittedProps) => {
  return (
    <Card>
      <CardContent className='pt-6'>
        <div className='space-y-4 text-center'>
          <div className='mx-auto flex size-16 items-center justify-center rounded-full bg-green-100'>
            <Mail className='size-8 text-green-600' />
          </div>
          <h3 className='text-xl font-semibold text-gray-900'>
            Message Submitted!
          </h3>
          <p className='text-gray-600'>
            {
              "We received your message. We'll do our best to get back to you as fast as possible."
            }
          </p>
          <Button
            onClick={() => {
              onReset()
              window.location.reload()
            }}
            variant='outline'
          >
            Send Another Message
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ContactSubmitted
