import { PageHeader, ContentSection } from '@/components/about'
import { getPageContent } from '@/lib/supabase/page-content'
import type { TermsContent } from '@/types/page-content.types'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent<TermsContent>('terms')
  return {
    title: `${content.pageTitle} | storyON`,
    description: content.metaDescription,
  }
}

export default async function TermsPage() {
  const content = await getPageContent<TermsContent>('terms')

  return (
    <div className="w-full px-5 md:px-10 xl:px-10">
      <PageHeader title={content.pageTitle} />

      <div className="max-w-[800px] mx-auto flex flex-col gap-10 lg:gap-12 pb-16 sm:pb-20 lg:pb-36">
        {content.sections.map((section, i) => (
          <ContentSection key={i} title={section.title}>
            <div
              className="flex flex-col gap-5 font-body text-sm sm:text-base md:text-lg text-text-subtle leading-[1.6] [&_a]:text-brand-primary [&_a:hover]:underline [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </ContentSection>
        ))}
      </div>
    </div>
  )
}
