import { z } from 'zod'
import { sanitizeInput, sanitizeHTML } from '@/lib/sanitize'

const sanitizeString = (val: string) => sanitizeInput(val.trim())

// ---- Homepage ----

const homepageHeroSchema = z.object({
  title: z.string().min(1).max(500).transform(sanitizeString),
  buttonText: z.string().min(1).max(100).transform(sanitizeString),
  buttonHref: z.string().min(1).max(500),
})

const homepageFeatureSchema = z.object({
  title: z.string().min(1).max(200).transform(sanitizeString),
  description: z.string().min(1).max(1000).transform(sanitizeString),
  icon: z.string().min(1).max(500),
})

const homepageFeaturesSchema = z.object({
  sectionTitle: z.string().min(1).max(200).transform(sanitizeString),
  sectionDescription: z.string().min(1).max(2000).transform(sanitizeString),
  items: z.array(homepageFeatureSchema).min(1).max(12),
})

const homepageLessonsSchema = z.object({
  sectionTitle: z.string().min(1).max(200).transform(sanitizeString),
  sectionDescription: z.string().min(1).max(2000).transform(sanitizeString),
})

const homepageTestimonialSchema = z.object({
  quote: z.string().min(1).max(1000).transform(sanitizeString),
  name: z.string().min(1).max(200).transform(sanitizeString),
  role: z.string().min(1).max(200).transform(sanitizeString),
  imageUrl: z.string().max(500).optional().default(''),
})

const homepageTestimonialsSchema = z.object({
  sectionTitle: z.string().min(1).max(200).transform(sanitizeString),
  items: z.array(homepageTestimonialSchema).min(1).max(20),
})

const homepageTickerSchema = z.object({
  text: z.string().min(1).max(500).transform(sanitizeString),
})

export const homepageContentSchema = z.object({
  hero: homepageHeroSchema,
  features: homepageFeaturesSchema,
  lessons: homepageLessonsSchema,
  testimonials: homepageTestimonialsSchema,
  ticker: homepageTickerSchema,
})

// ---- About ----

const aboutTeamMemberSchema = z.object({
  name: z.string().min(1).max(200).transform(sanitizeString),
  role: z.string().max(500).optional().default('').transform(sanitizeString),
  imageUrl: z.string().max(500).optional().default(''),
  email: z.string().max(200).optional().default(''),
})

const aboutPartnerSchema = z.object({
  name: z.string().min(1).max(200).transform(sanitizeString),
  description: z.string().min(1).max(1000).transform(sanitizeString),
  logoSrc: z.string().min(1).max(500),
  logoWidth: z.number().int().positive().optional(),
  logoHeight: z.number().int().positive().optional(),
})

export const aboutContentSchema = z.object({
  intro: z.object({
    pageTitle: z.string().min(1).max(200).transform(sanitizeString),
    sectionTitle: z.string().min(1).max(200).transform(sanitizeString),
    paragraphs: z.array(z.string().min(1).max(5000).transform(sanitizeString)).min(1).max(10),
  }),
  principles: z.object({
    sectionTitle: z.string().min(1).max(200).transform(sanitizeString),
    items: z.array(z.object({
      title: z.string().min(1).max(200).transform(sanitizeString),
      description: z.string().min(1).max(2000).transform(sanitizeString),
    })).min(1).max(10),
  }),
  schoolNetwork: z.object({
    sectionTitle: z.string().min(1).max(200).transform(sanitizeString),
    description: z.string().min(1).max(5000).transform(sanitizeString),
    bannerTitle: z.string().min(1).max(500).transform(sanitizeString),
    bannerButtonText: z.string().min(1).max(100).transform(sanitizeString),
    bannerButtonHref: z.string().min(1).max(500),
  }),
  projectTeam: z.object({
    sectionTitle: z.string().min(1).max(200).transform(sanitizeString),
    members: z.array(aboutTeamMemberSchema).min(1).max(20),
  }),
  additionalTeam: z.object({
    sectionTitle: z.string().min(1).max(200).transform(sanitizeString),
    content: z.string().min(1).max(10000).transform(sanitizeHTML),
  }),
  expertCouncil: z.object({
    sectionTitle: z.string().min(1).max(200).transform(sanitizeString),
    members: z.array(aboutTeamMemberSchema).min(1).max(20),
  }),
  advisoryBoard: z.object({
    sectionTitle: z.string().min(1).max(200).transform(sanitizeString),
    content: z.string().min(1).max(10000).transform(sanitizeHTML),
  }),
  partners: z.object({
    sectionTitle: z.string().min(1).max(200).transform(sanitizeString),
    mainSponsor: aboutPartnerSchema,
    partners: z.array(aboutPartnerSchema).min(0).max(10),
  }),
})

// ---- Terms ----

const termsSectionSchema = z.object({
  title: z.string().min(1).max(200).transform(sanitizeString),
  content: z.string().min(1).max(150000).transform(sanitizeHTML),
})

export const termsContentSchema = z.object({
  pageTitle: z.string().min(1).max(200).transform(sanitizeString),
  metaDescription: z.string().min(1).max(500).transform(sanitizeString),
  sections: z.array(termsSectionSchema).min(1).max(20),
})

// Schema map by page slug
export const pageContentSchemas = {
  homepage: homepageContentSchema,
  about: aboutContentSchema,
  terms: termsContentSchema,
} as const
