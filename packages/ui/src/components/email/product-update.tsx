import EmailBase from './templates/email-base.js'
import EmailHeader from './templates/email-header.js'
import EmailFooter from './templates/email-footer.js'
import {
  card,
  container,
  paragraph,
  sectionHeading,
  listItem,
  caption,
} from './styles/email.js'
import { Container, Section, Text, Img, Heading } from '@react-email/components'

interface ProductUpdateProps {
  companyName?: string
}

const GIF_ROM_OFF_URL = 'https://cdn.virtality.app/email/assets/ROM_OFF_v2.gif'
const GIF_ROM_ON_URL = 'https://cdn.virtality.app/email/assets/ROM_ON_v2.gif'
const GIF_CAST_URL = 'https://cdn.virtality.app/email/assets/CAST_v2.gif'
const GIF_SITTING_URL = 'https://cdn.virtality.app/email/assets/SITTING_v2.gif'

export const ProductUpdate = ({
  companyName = 'Virtality',
}: ProductUpdateProps) => (
  <EmailBase preview='Patch v0.1.08: ROM toggle, Cast to dashboard, Sitting mode & stability fixes'>
    <Container className='container' style={container}>
      <EmailHeader />

      <Section
        style={{
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingTop: '32px',
          paddingBottom: '24px',
        }}
      >
        <Heading
          className='heading-main'
          style={{
            fontSize: '28px',
            fontWeight: '700',
            lineHeight: '1.3',
            color: '#2d3748',
            marginBottom: '8px',
            marginTop: '0',
          }}
        >
          Product Update — Patch v0.1.08
        </Heading>

        <Text style={{ ...paragraph, marginBottom: '24px', marginTop: '0' }}>
          We've shipped <strong>Patch v0.1.08</strong> plus{' '}
          <strong>Hotfix 22</strong> and <strong>Hotfix 23</strong>. Here's
          what's new and what's fixed.
        </Text>

        {/* 1. ROM setting */}
        <Heading style={sectionHeading}>
          1. Range of Motion (ROM) setting for exercises
        </Heading>
        <Text style={paragraph}>
          We've added a ROM toggle so you can match behaviour to the patient's
          actual range of motion.
        </Text>
        <Section style={card}>
          <Text style={listItem}>
            <strong>ROM OFF</strong> — The avatar runs through every repetition
            on a fixed loop, with no wait for patient input. Use this when the
            patient has zero or negligible range of motion and you want them to
            follow the avatar only.
          </Text>
          <Text style={listItem}>
            <strong>ROM ON</strong> — After the first rep, the avatar waits for
            movement input from the patient before starting the next. Use this
            for limited or full ROM so the exercise is driven by their input.
          </Text>
        </Section>
        {GIF_ROM_OFF_URL && (
          <>
            <Img
              alt='ROM OFF — avatar repeats regardless of input'
              src={GIF_ROM_OFF_URL}
              width={480}
              style={{ maxWidth: '100%', height: 'auto', marginBottom: '4px' }}
            />
            <Text style={caption}>ROM OFF: continuous repetition loop</Text>
          </>
        )}
        {GIF_ROM_ON_URL && (
          <>
            <Img
              alt='ROM ON — avatar waits for patient input between reps'
              src={GIF_ROM_ON_URL}
              width={480}
              style={{ maxWidth: '100%', height: 'auto', marginBottom: '4px' }}
            />
            <Text style={caption}>ROM ON: input-gated repetitions</Text>
          </>
        )}

        {/* 2. Cast */}
        <Heading style={sectionHeading}>
          2. Cast patient view to dashboard
        </Heading>
        <Text style={paragraph}>
          You can now stream the patient's in-headset view directly to the
          dashboard. Use it for supervision, demos, or checking what they're
          seeing in real time.
        </Text>
        <Text style={paragraph}>
          From the dashboard: hit <strong>Cast</strong> →{' '}
          <strong>Start Casting</strong>.
        </Text>
        {GIF_CAST_URL && (
          <Img
            alt='Cast patient VR view to dashboard'
            src={GIF_CAST_URL}
            width={480}
            style={{ maxWidth: '100%', height: 'auto', marginTop: '8px' }}
          />
        )}

        {/* 3. Sitting mode */}
        <Heading style={sectionHeading}>3. Sitting mode</Heading>
        <Text style={paragraph}>
          For patients who can't stand safely, we've added{' '}
          <strong>Sitting mode</strong>.
        </Text>
        <Section style={card}>
          <Text style={listItem}>
            <strong>Where:</strong> Main dashboard → Scene Settings → enable
            Sitting mode.
          </Text>
          <Text style={listItem}>
            <strong>When:</strong> Only available while the patient is in an
            active session.
          </Text>
          <Text style={listItem}>
            <strong>Behaviour:</strong> Locks the pelvis to a chair in the
            scene. If the patient moves beyond a set threshold, the mode
            disables automatically to avoid incorrect calibration.
          </Text>
        </Section>
        <Text style={paragraph}>
          Best for patients who cannot stand on their own but can participate in
          seated VR therapy.
        </Text>
        {GIF_SITTING_URL && (
          <Img
            alt='Sitting mode — Scene Settings'
            src={GIF_SITTING_URL}
            width={480}
            style={{ maxWidth: '100%', height: 'auto', marginTop: '8px' }}
          />
        )}

        {/* 4. Avatar & tracking */}
        <Heading style={sectionHeading}>4. Avatar form and tracking</Heading>
        <Text style={listItem}>• Tracking is more precise and consistent.</Text>
        <Text style={listItem}>
          • Patient height estimation is more accurate, so avatars and scaling
          in the scene should better match the user.
        </Text>

        {/* 5. Waiting room */}
        <Heading style={sectionHeading}>5. Waiting room visuals</Heading>
        <Text style={paragraph}>
          We've updated the waiting room so it's no longer a dark room — clearer
          and easier on the eyes while patients wait.
        </Text>

        {/* Fixes */}
        <Heading style={sectionHeading}>Fixes (Hotfix 22)</Heading>
        <Text style={listItem}>
          <strong>Connection stability</strong> — Addressed issues that were
          causing disconnections during sessions.
        </Text>
        <Text style={listItem}>
          <strong>General</strong> — Various minor fixes and stability
          improvements.
        </Text>

        <Heading style={sectionHeading}>Fixes (Hotfix 23)</Heading>
        <Text style={listItem}>
          <strong>Exercise flow</strong> — Fixed several exercises getting stuck
          after the first repetition so reps run through correctly with ROM ON.
        </Text>

        <Text style={{ ...paragraph, marginTop: '28px', marginBottom: '0' }}>
          If you hit anything odd or have feedback, reply to this email or reach
          out through your usual channel. We'll keep iterating.
        </Text>
        <Text style={{ ...paragraph, marginTop: '8px', marginBottom: '0' }}>
          — The {companyName} team
        </Text>
      </Section>

      <EmailFooter companyName={companyName} />
    </Container>
  </EmailBase>
)

export default ProductUpdate
