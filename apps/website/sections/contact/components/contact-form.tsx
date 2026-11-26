'use client'
import { MessageSquare, Send } from 'lucide-react'
import { startTransition, useActionState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@virtality/ui/components/button'
import { Input } from '@virtality/ui/components/input'
import { Textarea } from '@virtality/ui/components/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ContactFormSchema } from '@/lib/definitions'
import { submitContactMsg } from '@/lib/actions'
import { ContactForm as ContactFormValues } from '@/types/models'

const initialFormState: ContactFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: '',
}

const inputClassName =
  'focus-visible:border-vital-blue-700/40 focus-visible:ring-vital-blue-700/40'

type ContactFormProps = {
  onSubmitted: () => void
}

const ContactForm = ({ onSubmitted }: ContactFormProps) => {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(ContactFormSchema),
    mode: 'onChange',
    defaultValues: initialFormState,
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formState, formAction] = useActionState(
    submitContactMsg,
    initialFormState,
  )

  const onSubmit = (values: ContactFormValues) => {
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString())
      }
    })

    startTransition(() => formAction(formData))
    form.reset()
    onSubmitted()
  }

  return (
    <Card className='border-vital-blue-700/20 h-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-2xl text-gray-900'>
          <MessageSquare className='text-vital-blue-700 size-6' />
          Send us a Message
        </CardTitle>
      </CardHeader>
      <CardContent className='flex h-full flex-col space-y-6'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input {...field} className={inputClassName} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input {...field} className={inputClassName} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input {...field} className={inputClassName} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone Number{' '}
                      <span className='text-xs text-gray-500'>(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className={inputClassName} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex-1 space-y-2'>
              <FormField
                control={form.control}
                name='message'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Tell us more about your needs or share anything you would like about our product...'
                        rows={6}
                        {...field}
                        className='focus:border-vital-blue-700/40! focus:ring-vital-blue-700/40! h-full'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button className='bg-vital-blue-700 w-full py-3 text-white hover:bg-[#077a89]'>
              <Send className='mr-2' />
              Send Message
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default ContactForm
