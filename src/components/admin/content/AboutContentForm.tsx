'use client'

import { ContentFormSection } from './ContentFormSection'
import { ArrayEditor } from './ArrayEditor'
import { ImageUploadField } from './ImageUploadField'
import { TextInput, TextAreaInput } from './FormField'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import type {
  AboutContent,
  AboutPrinciple,
  AboutTeamMember,
  AboutPartner,
} from '@/types/page-content.types'

interface AboutContentFormProps {
  content: AboutContent
  onChange: (content: AboutContent) => void
}

export function AboutContentForm({ content, onChange }: AboutContentFormProps) {
  const update = <K extends keyof AboutContent>(key: K, value: AboutContent[K]) => {
    onChange({ ...content, [key]: value })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Introduction */}
      <ContentFormSection title="Úvod" defaultOpen={true}>
        <TextInput
          label="Titulek stránky"
          value={content.intro.pageTitle}
          onChange={(pageTitle) => update('intro', { ...content.intro, pageTitle })}
        />
        <TextInput
          label="Titulek sekce"
          value={content.intro.sectionTitle}
          onChange={(sectionTitle) => update('intro', { ...content.intro, sectionTitle })}
        />
        {content.intro.paragraphs.map((paragraph, i) => (
          <TextAreaInput
            key={i}
            label={`Odstavec ${i + 1}`}
            value={paragraph}
            onChange={(value) => {
              const paragraphs = [...content.intro.paragraphs]
              paragraphs[i] = value
              update('intro', { ...content.intro, paragraphs })
            }}
            rows={4}
          />
        ))}
      </ContentFormSection>

      {/* Principles */}
      <ContentFormSection title="Pedagogické principy">
        <TextInput
          label="Titulek sekce"
          value={content.principles.sectionTitle}
          onChange={(sectionTitle) => update('principles', { ...content.principles, sectionTitle })}
        />
        <ArrayEditor<AboutPrinciple>
          items={content.principles.items}
          onChange={(items) => update('principles', { ...content.principles, items })}
          createEmpty={() => ({ title: '', description: '' })}
          maxItems={10}
          addLabel="Přidat princip"
          renderItem={(item, _index, onChange) => (
            <div className="flex flex-col gap-3">
              <TextInput label="Název" value={item.title} onChange={(title) => onChange({ ...item, title })} />
              <TextAreaInput label="Popis" value={item.description} onChange={(description) => onChange({ ...item, description })} rows={4} />
            </div>
          )}
        />
      </ContentFormSection>

      {/* School Network */}
      <ContentFormSection title="Síť škol Paměti národa">
        <TextInput
          label="Titulek sekce"
          value={content.schoolNetwork.sectionTitle}
          onChange={(sectionTitle) => update('schoolNetwork', { ...content.schoolNetwork, sectionTitle })}
        />
        <TextAreaInput
          label="Popis"
          value={content.schoolNetwork.description}
          onChange={(description) => update('schoolNetwork', { ...content.schoolNetwork, description })}
          rows={4}
        />
        <TextInput
          label="Titulek banneru"
          value={content.schoolNetwork.bannerTitle}
          onChange={(bannerTitle) => update('schoolNetwork', { ...content.schoolNetwork, bannerTitle })}
        />
        <TextInput
          label="Text tlačítka"
          value={content.schoolNetwork.bannerButtonText}
          onChange={(bannerButtonText) => update('schoolNetwork', { ...content.schoolNetwork, bannerButtonText })}
        />
        <TextInput
          label="Odkaz tlačítka"
          value={content.schoolNetwork.bannerButtonHref}
          onChange={(bannerButtonHref) => update('schoolNetwork', { ...content.schoolNetwork, bannerButtonHref })}
        />
      </ContentFormSection>

      {/* Project Team */}
      <ContentFormSection title="Projektový tým">
        <TextInput
          label="Titulek sekce"
          value={content.projectTeam.sectionTitle}
          onChange={(sectionTitle) => update('projectTeam', { ...content.projectTeam, sectionTitle })}
        />
        <ArrayEditor<AboutTeamMember>
          items={content.projectTeam.members}
          onChange={(members) => update('projectTeam', { ...content.projectTeam, members })}
          createEmpty={() => ({ name: '', role: '', imageUrl: '', email: '' })}
          maxItems={20}
          addLabel="Přidat člena"
          renderItem={(item, _index, onChange) => (
            <div className="flex flex-col gap-3">
              <TextInput label="Jméno" value={item.name} onChange={(name) => onChange({ ...item, name })} />
              <TextInput label="Role" value={item.role} onChange={(role) => onChange({ ...item, role })} />
              <TextInput label="Email" value={item.email || ''} onChange={(email) => onChange({ ...item, email })} />
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

      {/* Additional Team */}
      <ContentFormSection title="Další členové týmu">
        <TextInput
          label="Titulek sekce"
          value={content.additionalTeam.sectionTitle}
          onChange={(sectionTitle) => update('additionalTeam', { ...content.additionalTeam, sectionTitle })}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-grey-700">Obsah (rich text)</label>
          <RichTextEditor
            content={content.additionalTeam.content}
            onChange={(html) => update('additionalTeam', { ...content.additionalTeam, content: html })}
            className="min-h-[200px] [&_.tox-tinymce]:!h-[200px]"
          />
        </div>
      </ContentFormSection>

      {/* Expert Council */}
      <ContentFormSection title="Expertně-metodická rada">
        <TextInput
          label="Titulek sekce"
          value={content.expertCouncil.sectionTitle}
          onChange={(sectionTitle) => update('expertCouncil', { ...content.expertCouncil, sectionTitle })}
        />
        <ArrayEditor<AboutTeamMember>
          items={content.expertCouncil.members}
          onChange={(members) => update('expertCouncil', { ...content.expertCouncil, members })}
          createEmpty={() => ({ name: '', role: '', imageUrl: '' })}
          maxItems={20}
          addLabel="Přidat člena"
          renderItem={(item, _index, onChange) => (
            <div className="flex flex-col gap-3">
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

      {/* Advisory Board */}
      <ContentFormSection title="Poradní sbor">
        <TextInput
          label="Titulek sekce"
          value={content.advisoryBoard.sectionTitle}
          onChange={(sectionTitle) => update('advisoryBoard', { ...content.advisoryBoard, sectionTitle })}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-grey-700">Obsah (rich text)</label>
          <RichTextEditor
            content={content.advisoryBoard.content}
            onChange={(html) => update('advisoryBoard', { ...content.advisoryBoard, content: html })}
            className="min-h-[200px] [&_.tox-tinymce]:!h-[200px]"
          />
        </div>
      </ContentFormSection>

      {/* Partners */}
      <ContentFormSection title="Partneři">
        <TextInput
          label="Titulek sekce"
          value={content.partners.sectionTitle}
          onChange={(sectionTitle) => update('partners', { ...content.partners, sectionTitle })}
        />

        <div className="border border-grey-200 rounded-xl p-4 bg-grey-50">
          <h4 className="font-medium text-sm text-grey-700 mb-3">Hlavní partner</h4>
          <div className="flex flex-col gap-3">
            <TextInput label="Název" value={content.partners.mainSponsor.name} onChange={(name) => update('partners', { ...content.partners, mainSponsor: { ...content.partners.mainSponsor, name } })} />
            <TextInput label="Popis" value={content.partners.mainSponsor.description} onChange={(description) => update('partners', { ...content.partners, mainSponsor: { ...content.partners.mainSponsor, description } })} />
            <ImageUploadField
              label="Logo"
              value={content.partners.mainSponsor.logoSrc}
              onChange={(logoSrc) => update('partners', { ...content.partners, mainSponsor: { ...content.partners.mainSponsor, logoSrc } })}
              folder="partners"
              previewWidth={150}
              previewHeight={60}
            />
          </div>
        </div>

        <ArrayEditor<AboutPartner>
          items={content.partners.partners}
          onChange={(partners) => update('partners', { ...content.partners, partners })}
          createEmpty={() => ({ name: '', description: '', logoSrc: '' })}
          maxItems={10}
          minItems={0}
          addLabel="Přidat partnera"
          renderItem={(item, _index, onChange) => (
            <div className="flex flex-col gap-3">
              <TextInput label="Název" value={item.name} onChange={(name) => onChange({ ...item, name })} />
              <TextInput label="Popis" value={item.description} onChange={(description) => onChange({ ...item, description })} />
              <ImageUploadField
                label="Logo"
                value={item.logoSrc}
                onChange={(logoSrc) => onChange({ ...item, logoSrc })}
                folder="partners"
                previewWidth={150}
                previewHeight={60}
              />
            </div>
          )}
        />
      </ContentFormSection>
    </div>
  )
}
