import { buildLocalBusinessJsonLd } from '@/lib/seo/funabashi'

export default function FunabashiJsonLd() {
  const jsonLd = buildLocalBusinessJsonLd()
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
