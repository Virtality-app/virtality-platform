import EmailBase from './templates/email-base.js'
import EmailHeader from './templates/email-header.js'
import EmailFooter from './templates/email-footer.js'
import {
  container,
  content,
  paragraph,
  buttonContainer,
  destructive,
  divider,
  smallText,
  linkText,
  link,
  warningText,
} from './styles/email.js'
import { Button, Container, Hr, Link, Section, Text } from 'react-email'

const ChangeEmailConfirmation = ({
  url,
  name = 'there',
  companyName = 'Virtality',
  newEmail,
}: {
  url: string
  name?: string
  companyName?: string
  newEmail: string
}) => {
  return (
    <EmailBase preview='Change your email address to a new one.'>
      <Container style={container}>
        {/* Header */}
        <EmailHeader />

        {/* Body Content */}
        <Section style={content}>
          <Text style={paragraph}>Hi, {name}</Text>

          <Text style={paragraph}>
            We received a request to change your email address to {newEmail}.
          </Text>

          <Text style={paragraph}>
            If you requested this, please confirm your change by clicking the
            button below:
          </Text>

          <Section style={buttonContainer}>
            <Button style={destructive} href={url}>
              Change email address
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={smallText}>
            If the button doesn't work, copy and paste this link into your
            browser:
          </Text>

          <Text style={linkText}>
            <Link href={url} style={link}>
              {url}
            </Link>
          </Text>

          <Text style={smallText}>
            This verification link will expire in 24 hours.
          </Text>

          <Text style={warningText}>
            If you didn't request to change your email address, please ignore
            this email or contact support if you have concerns. Your email
            address will remain unchanged.
          </Text>
        </Section>

        {/* Footer */}
        <EmailFooter companyName={companyName} />
      </Container>
    </EmailBase>
  )
}

export default ChangeEmailConfirmation
