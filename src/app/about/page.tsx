import {
  PageHeader,
  ContentSection,
  PrincipleCard,
  SchoolNetworkBanner,
  TeamMemberCard,
  PartnerCard,
  PartnerCardFull,
  Illustration,
} from '@/components/about'

// Team members data
const projectTeam = [
  {
    name: 'Dominika Kopčiková',
    role: 'Vzdělávání Paměti národa, projektová manažerka',
    imageUrl: '/team/dominika-kopcikova.jpg',
    email: 'dominika.kopcikova@postbellum.cz',
  },
  {
    name: 'Tomáš Spáčil',
    role: 'Product owner a vedoucí metodického vývoje',
    imageUrl: '/team/tomas-spacil.jpg',
    email: 'tomas.spacil@postbellum.cz',
  },
  {
    name: 'Eva Mikulášková',
    role: 'Vedoucí projektu Síť škol Paměti národa',
    imageUrl: '/team/eva-mikulaskova.jpg',
    email: 'eva.mikulaskova@postbellum.cz',
  },
]

const expertCouncil = [
  {
    name: 'Aleš Sedlmeier',
    role: 'Učitel, metodik, expert na didaktiku dějepisu',
    imageUrl: '/team/ales-sedlmeier.jpg',
    // email: 'ales.sedlmeier@postbellum.cz',
  },
  {
    name: 'Marie Smutná',
    role: 'Lektorka, metodička, expertka na vzdělávání o holocaustu a tématech menšin',
    imageUrl: '/team/marie-smutna.jpg',
    // email: 'marie.smutna@postbellum.cz',
  },
  {
    name: 'Andrej Novik',
    role: 'Učitel, metodik, expert na AI a nové technologie ve vzdělávání',
    imageUrl: '/team/andrej-novik.jpg',
    // email: 'andrej.novik@postbellum.cz',
  },
  {
    name: 'Zuzana Krocakova',
    role: 'Lektorka, metodička a expertka na zážitkové vzdělávání a reflexi učení',
    imageUrl: '/team/zuzana-krocakova.jpg',
    // email: 'zuzana.krocakova@postbellum.cz',
  },
]

const principles = [
  {
    title: 'Příběh',
    description:
      'Věříme v sílu příběhu. Autentické příběhy pamětníků dokáží dějiny oživit a učinit je přístupnými a srozumitelnými. Osobní vyprávění pomáhá žákům vcítit se do situací lidí v minulosti a lépe pochopit historické události. Příběh je přirozený způsob, jak si pamatujeme a předáváme zkušenosti.',
  },
  {
    title: 'Aktivizační učení žáků.',
    description:
      'Žáci nepřijímají informace pasivně, ale aktivně s nimi pracují prostřednictvím různých úkolů a činností. Nabízíme metody, které zapojují kritické myšlení, diskusi a vlastní objevování. Učení se tak stává pro žáky smysluplnější a trvalejší.',
  },
  {
    title: 'Podpora učitelů',
    description:
      'Poskytujeme učitelům připravené materiály, metodické návody a inspiraci pro výuku. Chceme jim usnadnit práci s náročnými tématy moderních dějin a nabídnout osvědčené postupy. Učitelé tak mohou věnovat více času samotné výuce než přípravě podkladů.',
  },
]

export default function AboutPage() {
  return (
    <div className="w-full px-5 md:px-10 xl:px-10">
      {/* Page Header */}
      <PageHeader title="O projektu" />

      {/* Content Container - centered with max-width for larger screens */}
      <div className="max-w-[960px] mx-auto flex flex-col gap-16 sm:gap-20 md:gap-24 lg:gap-18 pb-16 sm:pb-20 lg:pb-36">
        {/* StoryOn Introduction */}
        <ContentSection title="StoryOn" className="mb-8">
          <p className="font-body text-sm sm:text-md md:text-xl text-text-subtle leading-[1.5] max-w-[800px]">
            StoryON je vzdělávací platforma vytvořená neziskovou organizací Post Bellum.
            Prostřednictvím videí s autentickými výpověďmi pamětníků a pamětnic a materiálů
            přímo do výuky nabízí vyučujícím základních a středních škol nástroj, jak se ve
            svých třídách věnovat dějinám 20. století, hodnotovému a mezigeneračnímu
            vzdělávání. Celý web a všechny materiály jsou dostupné zdarma.</p>
          <p className="font-body text-sm sm:text-md md:text-xl text-text-subtle leading-[1.5] max-w-[800px]">
            Platforma navazuje na cestu organizace Post Bellum, která už 25 let dokumentuje příběhy lidí, kteří
            zažili 20. století a ukládá je do jednoho z největších archivů orální historie
            Paměť národa.
          </p>
        </ContentSection>

        {/* First Illustration */}
        <Illustration
          strokeSrc="/illustrations/homepage/illustration-studenti-stroke.png"
          coloredSrc="/illustrations/homepage/illustration-studenti-colored.png"
          alt="Ilustrace studentů"
          width={280}
          height={280}
          className="mb-6"
        />

        {/* Pedagogical Principles */}
        <ContentSection title="Pedagogické principy a východiska">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {principles.map((principle) => (
              <PrincipleCard
                key={principle.title}
                title={principle.title}
                description={principle.description}
              />
            ))}
          </div>
        </ContentSection>

        {/* Second Illustration */}
        <Illustration
          strokeSrc="/illustrations/about/illustration-direction-stroke.png"
          coloredSrc="/illustrations/about/illustration-direction-colored.png"
          alt="Ilustrace ukazování směru"
        />

        {/* School Network Section */}
        <ContentSection title="Síť škol Paměti národa">
          <p className="font-body text-sm sm:text-md text-text-subtle leading-[1.5] max-w-[800px]">
            Důležitou roli při vzniku StoryON hráli učitelé základních a středních škol,
            které se snažíme dlouhodobě podporovat pořádáním vzdělávacích seminářů v projektu
            Síť škol Paměti národa. Jedná se o dlouhodobou aktivitu Paměti národa, která
            učitelům nabízí prostor pro networking a sdílení zkušeností.
          </p>
        </ContentSection>

        <SchoolNetworkBanner
            illustrationSrc="/illustrations/about/banner-illustration.png"
        />

        {/* Project Team */}
        <ContentSection title="Projektový tým">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {projectTeam.map((member) => (
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
        <ContentSection title="Za Post Bellum se na projektu dále podílí">
          <p className="font-body text-sm sm:text-md md:text-lg text-text-subtle leading-[1.5] max-w-[800px]">
            <span className="font-semibold text-text-strong">Mikuláš Kroupa,</span> zakladatel a ředitel,{' '}
            <span className="font-semibold text-text-strong">Jan Blažek,</span> dokumentarista a dramaturg,{' '}
            <span className="font-semibold text-text-strong">Viktor Portel,</span> vedoucí filmové produkce,{' '}
            <span className="font-semibold text-text-strong">Tomáš Trnobranský,</span> vedoucí grafiky,{' '}
            <span className="font-semibold text-text-strong">Michal Šmíd,</span> historik,{' '}
            <span className="font-semibold text-text-strong">Jan Polouček,</span> provozní ředitel,{' '}
            <span className="font-semibold text-text-strong">František Štambera,</span> vedoucí dokumentaristiky.
          </p>
        </ContentSection>

        {/* Expert Council */}
        <ContentSection title="Expertně-metodická rada">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {expertCouncil.map((member) => (
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
        <ContentSection title="Poradní sbor">
          <p className="font-body text-sm sm:text-md text-text-subtle leading-[1.5] max-w-[800px]">
            <span className="font-semibold text-text-strong">Mikuláš Kroupa,</span> zakladatel a ředitel Post Bellum,{' '}
            <span className="font-semibold text-text-strong">Ondřej Zapletal,</span> ředitel Nadace Benetheo,{' '}
            <span className="font-semibold text-text-strong">Hana Kuzníková,</span> designérka učitelských programů, Začni učit,{' '}
            <span className="font-semibold text-text-strong">Helena Sadílková,</span> Romistka,{' '}
            <span className="font-semibold text-text-strong">Daniel Kroupa,</span> filosof a signatář Charty 77,{' '}
            <span className="font-semibold text-text-strong">Jan Hábl,</span> komeniolog a odborník na rozvoj charakteru,{' '}
            <span className="font-semibold text-text-strong">Václav Korbel,</span> Výzkumník a evaluátor, PAQ Research,{' '}
            <span className="font-semibold text-text-strong">Josefina Formanová,</span> filosofka,{' '}
            <span className="font-semibold text-text-strong">Ladislav Heryán,</span> pedagog a kněz,{' '}
            <span className="font-semibold text-text-strong">Silvie Pýchová,</span> ředitelka Partnerství 2030+,{' '}
            <span className="font-semibold text-text-strong">Bára Stárek,</span> výkonná ředitelka Díky, že můžem
          </p>
        </ContentSection>

        {/* Partners Section */}
        <ContentSection title="Kdo nám pomáhá projekt realizovat">
          {/* Main Sponsor */}
          <PartnerCardFull
            name="Generální partner"
            description="StoryON vzniká za finanční podpory Nadace Benetheo 💚"
            logoSrc="/logos/benetheo.svg"
            logoWidth={190}
            logoHeight={88}
          />

          {/* Other Partners */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:gap-8">
            <PartnerCard
              name="Technologický partner"
              description="Applifting stojí za vývojem platformy"
              logoSrc="/logos/applifting.svg"
              logoWidth={135}
              logoHeight={41}
            />
            <PartnerCard
              name="Technologický partner"
              description="Sudolabs stojí za UX/UI designem a discovery fází"
              logoSrc="/logos/sudolabs.svg"
              logoWidth={152}
              logoHeight={48}
            />
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
