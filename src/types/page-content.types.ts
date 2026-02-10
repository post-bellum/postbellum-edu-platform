// =============================================
// HOMEPAGE CONTENT
// =============================================

export interface HomepageHero {
  title: string
  buttonText: string
  buttonHref: string
}

export interface HomepageFeature {
  title: string
  description: string
  icon: string
}

export interface HomepageFeatures {
  sectionTitle: string
  sectionDescription: string
  items: HomepageFeature[]
}

export interface HomepageLessons {
  sectionTitle: string
  sectionDescription: string
}

export interface HomepageTestimonial {
  quote: string
  name: string
  role: string
}

export interface HomepageTestimonials {
  sectionTitle: string
  items: HomepageTestimonial[]
}

export interface HomepageTicker {
  text: string
}

export interface HomepageContent {
  hero: HomepageHero
  features: HomepageFeatures
  lessons: HomepageLessons
  testimonials: HomepageTestimonials
  ticker: HomepageTicker
}

// =============================================
// ABOUT PAGE CONTENT
// =============================================

export interface AboutIntro {
  pageTitle: string
  sectionTitle: string
  paragraphs: string[]
}

export interface AboutPrinciple {
  title: string
  description: string
}

export interface AboutPrinciples {
  sectionTitle: string
  items: AboutPrinciple[]
}

export interface AboutSchoolNetwork {
  sectionTitle: string
  description: string
  bannerTitle: string
  bannerButtonText: string
  bannerButtonHref: string
}

export interface AboutTeamMember {
  name: string
  role: string
  imageUrl?: string
  email?: string
}

export interface AboutProjectTeam {
  sectionTitle: string
  members: AboutTeamMember[]
}

export interface AboutAdditionalTeam {
  sectionTitle: string
  /** Rich HTML content with bold names */
  content: string
}

export interface AboutExpertCouncil {
  sectionTitle: string
  members: AboutTeamMember[]
}

export interface AboutAdvisoryBoard {
  sectionTitle: string
  /** Rich HTML content with bold names */
  content: string
}

export interface AboutPartner {
  name: string
  description: string
  logoSrc: string
  logoWidth?: number
  logoHeight?: number
}

export interface AboutPartners {
  sectionTitle: string
  mainSponsor: AboutPartner
  partners: AboutPartner[]
}

export interface AboutContent {
  intro: AboutIntro
  principles: AboutPrinciples
  schoolNetwork: AboutSchoolNetwork
  projectTeam: AboutProjectTeam
  additionalTeam: AboutAdditionalTeam
  expertCouncil: AboutExpertCouncil
  advisoryBoard: AboutAdvisoryBoard
  partners: AboutPartners
}

// =============================================
// TERMS PAGE CONTENT
// =============================================

export interface TermsSection {
  title: string
  /** Rich HTML content */
  content: string
}

export interface TermsContent {
  pageTitle: string
  metaDescription: string
  sections: TermsSection[]
}

// =============================================
// UNION TYPES
// =============================================

export type PageSlug = 'homepage' | 'about' | 'terms'

export type PageContent = HomepageContent | AboutContent | TermsContent

export interface PageContentRow {
  id: string
  page_slug: PageSlug
  content: PageContent
  updated_at: string
  updated_by: string | null
}
