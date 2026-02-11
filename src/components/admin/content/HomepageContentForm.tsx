'use client'

import { ContentFormSection } from './ContentFormSection'
import { ArrayEditor } from './ArrayEditor'
import { ImageUploadField } from './ImageUploadField'
import { TextInput, TextAreaInput } from './FormField'
import type { HomepageContent, HomepageFeature, HomepageTestimonial } from '@/types/page-content.types'

interface HomepageContentFormProps {
  content: HomepageContent
  onChange: (content: HomepageContent) => void
}

export function HomepageContentForm({ content, onChange }: HomepageContentFormProps) {
  const update = <K extends keyof HomepageContent>(key: K, value: HomepageContent[K]) => {
    onChange({ ...content, [key]: value })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Hero Section */}
      <ContentFormSection title="Hero sekce" defaultOpen={true}>
        <TextInput
          label="Titulek"
          value={content.hero.title}
          onChange={(title) => update('hero', { ...content.hero, title })}
        />
        <TextInput
          label="Text tlačítka"
          value={content.hero.buttonText}
          onChange={(buttonText) => update('hero', { ...content.hero, buttonText })}
        />
        <TextInput
          label="Odkaz tlačítka"
          value={content.hero.buttonHref}
          onChange={(buttonHref) => update('hero', { ...content.hero, buttonHref })}
        />
      </ContentFormSection>

      {/* Features Section */}
      <ContentFormSection title="Co platforma nabízí">
        <TextInput
          label="Titulek sekce"
          value={content.features.sectionTitle}
          onChange={(sectionTitle) => update('features', { ...content.features, sectionTitle })}
        />
        <TextAreaInput
          label="Popis sekce"
          value={content.features.sectionDescription}
          onChange={(sectionDescription) => update('features', { ...content.features, sectionDescription })}
        />
        <ArrayEditor<HomepageFeature>
          items={content.features.items}
          onChange={(items) => update('features', { ...content.features, items })}
          createEmpty={() => ({ title: '', description: '', icon: '' })}
          maxItems={12}
          addLabel="Přidat funkci"
          renderItem={(item, _index, onChange) => (
            <div className="flex flex-col gap-3">
              <TextInput label="Název" value={item.title} onChange={(title) => onChange({ ...item, title })} />
              <TextAreaInput label="Popis" value={item.description} onChange={(description) => onChange({ ...item, description })} />
              <ImageUploadField
                label="Ikonka"
                value={item.icon}
                onChange={(icon) => onChange({ ...item, icon })}
                folder="features"
                previewWidth={80}
                previewHeight={80}
              />
            </div>
          )}
        />
      </ContentFormSection>

      {/* Lessons Section */}
      <ContentFormSection title="Vybrané lekce">
        <TextInput
          label="Titulek sekce"
          value={content.lessons.sectionTitle}
          onChange={(sectionTitle) => update('lessons', { ...content.lessons, sectionTitle })}
        />
        <TextAreaInput
          label="Popis sekce"
          value={content.lessons.sectionDescription}
          onChange={(sectionDescription) => update('lessons', { ...content.lessons, sectionDescription })}
        />
      </ContentFormSection>

      {/* Testimonials Section */}
      <ContentFormSection title="Reference učitelů">
        <TextInput
          label="Titulek sekce"
          value={content.testimonials.sectionTitle}
          onChange={(sectionTitle) => update('testimonials', { ...content.testimonials, sectionTitle })}
        />
        <ArrayEditor<HomepageTestimonial>
          items={content.testimonials.items}
          onChange={(items) => update('testimonials', { ...content.testimonials, items })}
          createEmpty={() => ({ quote: '', name: '', role: '', imageUrl: '' })}
          maxItems={20}
          addLabel="Přidat referenci"
          renderItem={(item, _index, onChange) => (
            <div className="flex flex-col gap-3">
              <TextAreaInput label="Citát" value={item.quote} onChange={(quote) => onChange({ ...item, quote })} />
              <TextInput label="Jméno" value={item.name} onChange={(name) => onChange({ ...item, name })} />
              <TextInput label="Role" value={item.role} onChange={(role) => onChange({ ...item, role })} />
              <ImageUploadField
                label="Fotka"
                value={item.imageUrl || ''}
                onChange={(imageUrl) => onChange({ ...item, imageUrl })}
                folder="team"
                previewWidth={80}
                previewHeight={80}
              />
            </div>
          )}
        />
      </ContentFormSection>

      {/* Ticker */}
      <ContentFormSection title="Ticker (běžící text)">
        <TextInput
          label="Text tickeru"
          value={content.ticker.text}
          onChange={(text) => update('ticker', { text })}
        />
      </ContentFormSection>
    </div>
  )
}
