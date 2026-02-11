'use client'

import { ContentFormSection } from './ContentFormSection'
import { ArrayEditor } from './ArrayEditor'
import { TextInput, TextAreaInput } from './FormField'
import { PlateEditor } from '@/components/editor/PlateEditor'
import type { TermsContent, TermsSection } from '@/types/page-content.types'

interface TermsContentFormProps {
  content: TermsContent
  onChange: (content: TermsContent) => void
}

export function TermsContentForm({ content, onChange }: TermsContentFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <ContentFormSection title="Nastavení stránky" defaultOpen={true}>
        <TextInput
          label="Titulek stránky"
          value={content.pageTitle}
          onChange={(pageTitle) => onChange({ ...content, pageTitle })}
        />
        <TextAreaInput
          label="Meta popis (SEO)"
          value={content.metaDescription}
          onChange={(metaDescription) => onChange({ ...content, metaDescription })}
          rows={2}
        />
      </ContentFormSection>

      <ContentFormSection title="Sekce" defaultOpen={true}>
        <ArrayEditor<TermsSection>
          items={content.sections}
          onChange={(sections) => onChange({ ...content, sections })}
          createEmpty={() => ({ title: '', content: '' })}
          maxItems={20}
          addLabel="Přidat sekci"
          renderItem={(item, _index, onItemChange) => (
            <div className="flex flex-col gap-3">
              <TextInput
                label="Titulek sekce"
                value={item.title}
                onChange={(title) => onItemChange({ ...item, title })}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-grey-700">Obsah (rich text)</label>
                <PlateEditor
                  content={item.content}
                  onChange={(html: string) => onItemChange({ ...item, content: html })}
                  className="min-h-[300px] [&_.tox-tinymce]:!h-[400px]"
                />
              </div>
            </div>
          )}
        />
      </ContentFormSection>
    </div>
  )
}
