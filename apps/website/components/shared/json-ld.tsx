import { serializeJsonLd } from '@/lib/json-ld'

type JsonLdProps = {
  data: Record<string, unknown>
}

/** Structured data for search engines, rendered from a server component. */
const JsonLd = ({ data }: JsonLdProps) => {
  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}

export default JsonLd
