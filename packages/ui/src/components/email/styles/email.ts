export const main = {
  backgroundColor: '#f6f9fc',
} as const

export const text = {
  textAlign: 'left' as const,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
} as const

export const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '0',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  maxWidth: '600px',
} as const

export const header = {
  backgroundColor: '#06626e',
  padding: '40px 40px 30px',
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px',
} as const

export const headerText = {
  ...text,
  margin: '0',
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '1.3',
} as const

export const content = {
  padding: '40px',
} as const

export const paragraph = {
  ...text,
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
  marginBottom: '16px',
} as const

export const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
} as const

export const button = {
  backgroundColor: '#08899a',
  color: '#ffffff',
  padding: '14px 32px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-block',
} as const

export const destructive = {
  ...button,
  backgroundColor: '#ff6467',
} as const

export const divider = {
  borderColor: '#E5E7EB',
  margin: '32px 0 24px',
} as const

export const smallText = {
  ...text,
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#6B7280',
  marginTop: '16px',
  textAlign: 'center' as const,
} as const

export const linkText = {
  ...text,
  textAlign: 'center' as const,
  fontSize: '13px',
  wordBreak: 'break-all' as const,
  backgroundColor: '#F3F4F6',
  padding: '12px',
  borderRadius: '4px',
  marginTop: '12px',
} as const

export const link = {
  color: '#4F46E5',
  textDecoration: 'none',
} as const

export const footer = {
  backgroundColor: '#F9FAFB',
  padding: '24px 40px',
  borderTop: '1px solid #E5E7EB',
  borderBottomLeftRadius: '8px',
  borderBottomRightRadius: '8px',
} as const

export const footerText = {
  ...text,
  textAlign: 'center' as const,
  fontSize: '13px',
  color: '#9CA3AF',
  margin: '4px 0',
  lineHeight: '1.5',
} as const

export const warningText = {
  ...text,
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
  padding: '16px',
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #dc2626',
  borderRadius: '4px',
  textAlign: 'center' as const,
} as const

export const card = {
  backgroundColor: '#f7f7f7',
  padding: '24px',
  borderRadius: '6px',
  marginBottom: '32px',
} as const

export const sectionHeading = {
  fontSize: '20px',
  fontWeight: '700',
  marginTop: '28px',
  marginBottom: '12px',
  color: '#2d3748',
} as const

export const listItem = {
  ...paragraph,
  marginBottom: '8px',
  marginTop: '0',
  paddingLeft: '4px',
} as const

export const caption = {
  fontSize: '14px',
  color: '#718096',
  marginTop: '8px',
  marginBottom: '16px',
  fontStyle: 'italic',
} as const
