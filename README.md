# Post Bellum Educational Platform

Vzdělávací platforma pro učitele k objevování, přizpůsobování a používání historických učebních materiálů.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database & Auth**: Supabase
- **Video Hosting**: Vimeo
- **Deployment**: Vercel

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/              # Next.js app router
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── lessons/     # Lesson-specific components
│   ├── editor/      # TinyMCE editor components
│   └── layout/      # Layout components
├── lib/             # Utility functions
│   ├── supabase/    # Supabase client
│   └── utils/       # Helper functions
├── hooks/           # Custom React hooks
└── types/           # TypeScript type definitions
```

## Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project:
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy your Project URL and anon/public key

## Features

- 📚 Browse historical lesson materials
- 🎥 Watch educational videos
- 📝 Edit and customize materials with rich text editor
- ⭐ Save favorite lessons
- 🔐 Secure authentication
- 🌐 Czech/Slovak language support

## License

This project is proprietary and confidential.