import { Container, Heading, Section, Text } from 'react-email'
import EmailFooter from './templates/email-footer.js'
import EmailHeader from './templates/email-header.js'
import EmailBase from './templates/email-base.js'
import { container, content, text } from './styles/email.js'

export interface WaitlistInternalNotificationProps {
  email: string
  companyName?: string
}

export const WAITLIST_INTERNAL_NOTIFICATION_SUBJECT = 'New waitlist signup'

export const WaitlistInternalNotificationEmail = ({
  email,
  companyName = 'Virtality',
}: WaitlistInternalNotificationProps) => (
  <EmailBase preview='A new person joined the waitlist.'>
    <Container style={container}>
      <EmailHeader />

      <Section style={content}>
        <Heading
          style={{
            fontSize: '24px',
            fontWeight: '700',
            lineHeight: '1.3',
            color: '#2d3748',
            marginBottom: '16px',
            marginTop: '0',
          }}
        >
          New waitlist signup
        </Heading>

        <Text style={text}>
          A new healthcare professional joined the public waitlist.
        </Text>

        <Text style={text}>
          <strong>Email:</strong> {email}
        </Text>
      </Section>

      <EmailFooter companyName={companyName} />
    </Container>
  </EmailBase>
)

export default WaitlistInternalNotificationEmail
