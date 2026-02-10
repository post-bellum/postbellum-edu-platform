import {
  PageHeader,
  ContentSection,
  PrinciplesCarousel,
  SchoolNetworkBanner,
  TeamMemberCard,
  PartnerCard,
  PartnerCardFull,
  Illustration,
} from '@/components/about'
import { getPageContent } from '@/lib/supabase/page-content'
import type { AboutContent } from '@/types/page-content.types'

export default async function AboutPage() {
  const content = await getPageContent<AboutContent>('about')

  return (
    <div className="w-full px-5 md:px-10 xl:px-10">
      {/* Page Header */}
      <PageHeader title={content.intro.pageTitle} />

      {/* Content Container - centered with max-width for larger screens */}
      <div className="max-w-[960px] mx-auto flex flex-col gap-12 lg:gap-18 pb-16 sm:pb-20 lg:pb-36">
        {/* StoryOn Introduction */}
        <ContentSection title={content.intro.sectionTitle} className="lg:mb-8">
          {content.intro.paragraphs.map((paragraph, i) => (
            <p key={i} className="font-body text-sm sm:text-md md:text-xl text-text-subtle leading-[1.5] max-w-[800px]">
              {paragraph}
            </p>
          ))}
        </ContentSection>

        {/* First Illustration */}
        <Illustration
          strokeSrc="/illustrations/homepage/illustration-studenti-stroke.png"
          coloredSrc="/illustrations/homepage/illustration-studenti-colored.png"
          alt="Ilustrace studentů"
          width={280}
          height={280}
          className="mb-6"
          animation="wipe-left"
        />

        {/* Pedagogical Principles */}
        <PrinciplesCarousel principles={content.principles.items} />

        {/* Second Illustration */}
        <Illustration
          strokeSrc="/illustrations/about/illustration-direction-stroke.png"
          coloredSrc="/illustrations/about/illustration-direction-colored.png"
          alt="Ilustrace ukazování směru"
          animation="wipe-right"
        />

        {/* School Network Section */}
        <ContentSection title={content.schoolNetwork.sectionTitle}>
          <p className="font-body text-sm sm:text-md text-text-subtle leading-[1.5] max-w-[800px]">
            {content.schoolNetwork.description}
          </p>
        </ContentSection>

        <SchoolNetworkBanner
          title={content.schoolNetwork.bannerTitle}
          buttonText={content.schoolNetwork.bannerButtonText}
          buttonHref={content.schoolNetwork.bannerButtonHref}
        />

        {/* Project Team */}
        <ContentSection title={content.projectTeam.sectionTitle}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {content.projectTeam.members.map((member) => (
              <TeamMemberCard
                key={member.name}
                name={member.name}
                role={member.role}
                imageUrl={member.imageUrl}
                email={member.email}
              />
            ))}
          </div>
        </ContentSection>

        {/* Additional Team Members */}
        <ContentSection title={content.additionalTeam.sectionTitle}>
          <div
            className="font-body text-sm sm:text-md md:text-lg text-text-subtle leading-[1.5] max-w-[800px] [&_strong]:font-semibold [&_strong]:text-text-strong"
            dangerouslySetInnerHTML={{ __html: content.additionalTeam.content }}
          />
        </ContentSection>

        {/* Expert Council */}
        <ContentSection title={content.expertCouncil.sectionTitle}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {content.expertCouncil.members.map((member) => (
              <TeamMemberCard
                key={member.name}
                name={member.name}
                role={member.role}
                imageUrl={member.imageUrl}
              />
            ))}
          </div>
        </ContentSection>

        {/* Advisory Board */}
        <ContentSection title={content.advisoryBoard.sectionTitle}>
          <div
            className="font-body text-sm sm:text-md text-text-subtle leading-[1.5] max-w-[800px] [&_strong]:font-semibold [&_strong]:text-text-strong"
            dangerouslySetInnerHTML={{ __html: content.advisoryBoard.content }}
          />
        </ContentSection>

        {/* Partners Section */}
        <ContentSection title={content.partners.sectionTitle}>
          {/* Main Sponsor */}
          <PartnerCardFull
            name={content.partners.mainSponsor.name}
            description={content.partners.mainSponsor.description}
            logoSrc={content.partners.mainSponsor.logoSrc}
            logoWidth={content.partners.mainSponsor.logoWidth}
            logoHeight={content.partners.mainSponsor.logoHeight}
          />

          {/* Other Partners */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:gap-8">
            {content.partners.partners.map((partner, i) => (
              <PartnerCard
                key={i}
                name={partner.name}
                description={partner.description}
                logoSrc={partner.logoSrc}
                logoWidth={partner.logoWidth}
                logoHeight={partner.logoHeight}
              />
            ))}
          </div>
        </ContentSection>

        {/* Final Illustration */}
        <Illustration
          strokeSrc="/illustrations/about/illustration-emil-stroke.png"
          coloredSrc="/illustrations/about/illustration-emil-colored.png"
          alt="Ilustrace Emila"
          animation="circle-expand"
          width={440}
          height={440}
        />
      </div>
    </div>
  )
}
