import type {
  HomepageContent,
  AboutContent,
  TermsContent,
  PageSlug,
} from '@/types/page-content.types'

// =============================================
// HOMEPAGE DEFAULTS
// =============================================

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  hero: {
    title: 'Zapněte příběhy do své výuky.',
    buttonText: 'Přejít na lekce',
    buttonHref: '/lessons',
  },
  features: {
    sectionTitle: 'Platforma nabízí',
    sectionDescription:
      'Všechny materiály jsou připravené tak, abyste je mohli rovnou využít ve výuce – bez zbytečné administrativy nebo technických překážek.',
    items: [
      {
        title: 'Autentická videa pamětníků',
        description:
          'Přineste do třídy skutečné příběhy lidí, kteří zažili historické události na vlastní kůži.',
        icon: '/illustrations/homepage/videa.png',
      },
      {
        title: 'Lekce pro ZŠ i SŠ s různou délkou',
        description:
          'Lekce jsou připravené pro základní i střední školy ve variantách na 30, 45 i 90 minut.',
        icon: '/illustrations/homepage/lekce_pro_zs.png',
      },
      {
        title: 'Metodické a pracovní listy k úpravě',
        description:
          'Připravené materiály pro výuku, které si snadno upravíte a stáhnete jako PDF.',
        icon: '/illustrations/homepage/pracovni_listy.png',
      },
      {
        title: 'Rozvoj gramotností',
        description:
          'Žáci si procvičí kritické myšlení, práci s informacemi a porozumění dějinám v souvislostech.',
        icon: '/illustrations/homepage/rozvoj_gramotnosti.png',
      },
      {
        title: 'Doprovodné aktivity pro žáky',
        description:
          'Využijte připravené Kahoot kvízy a další interaktivní prvky k upevnění klíčových pojmů a souvislostí.',
        icon: '/illustrations/homepage/doprovodne_aktivity.png',
      },
      {
        title: 'Hodnotové a mezigenerační vzdělávání',
        description:
          'Podporujte platformou kritické myšlení a diskuze mezi generacemi pomocí autentických příběhů.',
        icon: '/illustrations/homepage/mezigeneracni_vzdelavani.png',
      },
    ],
  },
  lessons: {
    sectionTitle: 'Vybrané lekce pro vás',
    sectionDescription:
      'Pravidelně přidáváme nové materiály, které reagují na aktuální výuková témata. Vše připraveno tak, aby šlo ihned použít ve třídě – bez složité přípravy.',
  },
  testimonials: {
    sectionTitle: 'Co o platformě říkají učitelé',
    items: [
      {
        quote:
          '„Používám videa pamětníků jako úvod do tématu a následně rozvíjím diskuzi se studenty. Materiály mi šetří čas a hodiny jsou mnohem živější."',
        name: 'Dominika Kopčiková',
        role: 'učitelka dějepisu',
        imageUrl: '/team/dominika-kopcikova.jpg',
      },
      {
        quote:
          '„Platforma je jednoduchá na použití a skvěle zapadá do RVP. Oceňuji přehlednost a že nemusíme nic instalovat."',
        name: 'Eva Mikulášková',
        role: 'učitelka dějepisu',
        imageUrl: '/team/eva-mikulaskova.jpg',
      },
      {
        quote:
          '„Je to super, že můžeme používat platformu i u dětí, kteří nemají přístup k internetu."',
        name: 'Tomáš Spáčil',
        role: 'učitel dějepisu',
        imageUrl: '/team/tomas-spacil.jpg',
      },
    ],
  },
  ticker: {
    text: 'StoryOn přináší paměť národa.',
  },
}

// =============================================
// ABOUT PAGE DEFAULTS
// =============================================

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  intro: {
    pageTitle: 'O projektu',
    sectionTitle: 'StoryOn',
    paragraphs: [
      'StoryON je vzdělávací platforma vytvořená neziskovou organizací Post Bellum. Prostřednictvím videí s autentickými výpověďmi pamětníků a pamětnic a materiálů přímo do výuky nabízí vyučujícím základních a středních škol nástroj, jak se ve svých třídách věnovat dějinám 20. století, hodnotovému a mezigeneračnímu vzdělávání. Celý web a všechny materiály jsou dostupné zdarma.',
      'Platforma navazuje na cestu organizace Post Bellum, která už 25 let dokumentuje příběhy lidí, kteří zažili 20. století a ukládá je do jednoho z největších archivů orální historie Paměť národa.',
    ],
  },
  principles: {
    sectionTitle: 'Pedagogické principy a východiska',
    items: [
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
    ],
  },
  schoolNetwork: {
    sectionTitle: 'Síť škol Paměti národa',
    description:
      'Důležitou roli při vzniku StoryON hráli učitelé základních a středních škol, které se snažíme dlouhodobě podporovat pořádáním vzdělávacích seminářů v projektu Síť škol Paměti národa. Jedná se o dlouhodobou aktivitu Paměti národa, která učitelům nabízí prostor pro networking a sdílení zkušeností.',
    bannerTitle:
      'Na seminář v síti škol Paměti národa se můžete registrovat zde',
    bannerButtonText: 'Registrovat',
    bannerButtonHref: 'https://www.pametnaroda.cz/cs/sit-skol',
  },
  projectTeam: {
    sectionTitle: 'Projektový tým',
    members: [
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
    ],
  },
  additionalTeam: {
    sectionTitle: 'Za Post Bellum se na projektu dále podílí',
    content:
      '<p><strong>Mikuláš Kroupa,</strong> zakladatel a ředitel, <strong>Jan Blažek,</strong> dokumentarista a dramaturg, <strong>Viktor Portel,</strong> vedoucí filmové produkce, <strong>Tomáš Trnobranský,</strong> vedoucí grafiky, <strong>Michal Šmíd,</strong> historik, <strong>Jan Polouček,</strong> provozní ředitel, <strong>František Štambera,</strong> vedoucí dokumentaristiky.</p>',
  },
  expertCouncil: {
    sectionTitle: 'Expertně-metodická rada',
    members: [
      {
        name: 'Aleš Sedlmeier',
        role: 'Učitel, metodik, expert na didaktiku dějepisu',
        imageUrl: '/team/ales-sedlmeier.jpg',
      },
      {
        name: 'Marie Smutná',
        role: 'Lektorka, metodička, expertka na vzdělávání o holocaustu a tématech menšin',
        imageUrl: '/team/marie-smutna.jpg',
      },
      {
        name: 'Andrej Novik',
        role: 'Učitel, metodik, expert na AI a nové technologie ve vzdělávání',
        imageUrl: '/team/andrej-novik.jpg',
      },
      {
        name: 'Zuzana Kročáková',
        role: 'Lektorka, metodička a expertka na zážitkové vzdělávání a reflexi učení',
        imageUrl: '/team/zuzana-krocakova.jpg',
      },
    ],
  },
  advisoryBoard: {
    sectionTitle: 'Poradní sbor',
    content:
      '<p><strong>Mikuláš Kroupa,</strong> zakladatel a ředitel Post Bellum, <strong>Ondřej Zapletal,</strong> ředitel Nadace Benetheo, <strong>Hana Kuzníková,</strong> designérka učitelských programů, Začni učit, <strong>Helena Sadílková,</strong> Romistka, <strong>Daniel Kroupa,</strong> filosof a signatář Charty 77, <strong>Jan Hábl,</strong> komeniolog a odborník na rozvoj charakteru, <strong>Václav Korbel,</strong> Výzkumník a evaluátor, PAQ Research, <strong>Josefina Formanová,</strong> filosofka, <strong>Ladislav Heryán,</strong> pedagog a kněz, <strong>Silvie Pýchová,</strong> ředitelka Partnerství 2030+, <strong>Bára Stárek,</strong> výkonná ředitelka Díky, že můžem</p>',
  },
  partners: {
    sectionTitle: 'Kdo nám pomáhá projekt realizovat',
    mainSponsor: {
      name: 'Generální partner',
      description: 'StoryON vzniká za finanční podpory Nadace Benetheo',
      logoSrc: '/logos/benetheo.svg',
      logoWidth: 190,
      logoHeight: 88,
    },
    partners: [
      {
        name: 'Technologický partner',
        description: 'Applifting stojí za vývojem platformy',
        logoSrc: '/logos/applifting.svg',
        logoWidth: 135,
        logoHeight: 41,
      },
      {
        name: 'Technologický partner',
        description: 'Sudolabs stojí za UX/UI designem a discovery fází',
        logoSrc: '/logos/sudolabs.svg',
        logoWidth: 152,
        logoHeight: 48,
      },
    ],
  },
}

// =============================================
// TERMS PAGE DEFAULTS
// =============================================

export const DEFAULT_TERMS_CONTENT: TermsContent = {
  pageTitle: 'Smluvní podmínky',
  metaDescription:
    'Všeobecné podmínky užívání a zásady ochrany osobních údajů portálu storyON organizace POST BELLUM, z. ú.',
  sections: [
    {
      title: 'Úvod',
      content: `<p>Vítejte na internetovém portálu storyON <a href="https://www.storyon.cz" target="_blank" rel="noopener noreferrer">www.storyon.cz</a>, který podporuje vzdělávání tím, že nabízí učitelům připravené lekce do výuky základních a středních škol s hlavním důrazem na výuku moderních dějin a hodnotového a mezigeneračního vzdělávání. Lekce pracují s autentickými výpověďmi pamětníků z archivu Paměti národa (dále jen „Portál").</p>
<p>Portál provozuje organizace POST BELLUM, z.ú., IČO: 26548526, se sídlem Španělská 1073/10, Vinohrady, 120 00 Praha 2 (dále jen „Provozovatel"). Přečtěte si, prosím, tato pravidla sestávající z podmínek užívání a zásad ochrany osobních údajů při užívání Portálu. Máte-li jakýkoli dotaz související s užíváním Portálu, můžete nás kontaktovat na e-mailové adrese <a href="mailto:storyon@postbellum.cz">storyon@postbellum.cz</a>.</p>
<p>V případě, že se rozhodnete zaregistrovat na Portálu a stát se uživatelem (dále jen „Uživatel"), týká se Vás pak výlučně článek č. 2 těchto podmínek. Ve zbývajícím rozsahu platí pravidla jak pro registrované Uživatele, tak ostatní návštěvníky Portálu (dále souhrnně jen „Návštěvník").</p>`,
    },
    {
      title: '1. Pravidla pro užívání portálu',
      content: `<p><strong>1.1.</strong> Užívání Portálu je v plné míře možné pouze po úspěšné registraci. U neregistrovaných Návštěvníků je možnost jeho využití omezená. V obou případech platí, že Portál lze užívat pouze v souladu s těmito podmínkami a obecně závaznými právními předpisy České republiky.</p>
<p><strong>1.2.</strong> Návštěvník není oprávněn užívat Portál jinak než pro vlastní či edukativní potřebu. Za účelem vzdělávání je možné jeho užití formou šíření a kopírování či další technické zpracování materiálů, které Portál obsahuje. Za jiným účelem toto možné není bez prokazatelného souhlasu Provozovatele. Návštěvník užíváním Portálu bere na vědomí, že jeho obsah je chráněn autorskými právy a dalšími právními předpisy.</p>
<p><strong>1.3.</strong> Provozovatel si vyhrazuje právo omezit nebo zrušit přístup jakémukoli Návštěvníkovi, který porušuje pravidla.</p>
<p><strong>1.4.</strong> Na Portálu se mohou objevit nepřesnosti či chybějící informace. Jakmile se o podobném nedostatku Provozovatel dozví, situaci napraví. Pokud si takové chyby všimnete, kontaktujte Provozovatele prosím na e-mailové adrese <a href="mailto:storyon@postbellum.cz">storyon@postbellum.cz</a>.</p>`,
    },
    {
      title: '2. Registrace a účet uživatele',
      content: `<p><strong>2.1.</strong> Každý, kdo chce plně využívat možnosti Portálu, se musí zaregistrovat vyplněním elektronického formuláře na Portálu.</p>
<p><strong>2.2.</strong> Při registraci je Návštěvník povinen zadat pravdivé a bezchybné údaje výlučně o své osobě. Jestliže se údaje uvedené v Účtu změní, je Uživatel povinen tyto údaje bez zbytečného odkladu aktualizovat. Touto bezplatnou registrací bude Uživateli vytvořen účet.</p>
<p><strong>2.3.</strong> Do účtu vstupuje Uživatel pod uživatelským jménem a přístup je zabezpečen heslem. Uživatel má právo své heslo kdykoliv změnit. Ztracené heslo může Uživatel obnovit prostřednictvím formuláře na Portálu.</p>
<p><strong>2.4.</strong> Registraci a následný vstup do Portálu lze provést rovněž skrze e-mailové účty společností Google (Gmail) nebo Microsoft.</p>
<p><strong>2.5.</strong> Provozovatel si vyhrazuje právo účet Uživatele kdykoliv jednostranně zrušit bez udání důvodu či upozornění. Zejména mohou být smazány účty Uživatelů, kteří se delší dobu nepřihlásili nebo pokud bude mít Provozovatel podezření na jednání v rozporu s pravidly.</p>
<p><strong>2.6.</strong> Uživatel může kdykoliv požádat o zrušení svého Účtu v nastavení svého profilu a Provozovatel mu musí vyhovět.</p>
<p><strong>2.7.</strong> Uživatel může na svém účtu upravovat materiály poskytnuté Portálem. K těmto upraveným materiálům nemá přístup nikdo kromě daného Uživatele a Provozovatel nemá právo s nimi jakkoli dále nakládat, ani do nich zasahovat.</p>
<p><strong>2.8.</strong> Zrušením účtu se plně smažou všechna data a osobní údaje, která Provozovatel o Uživateli zpracovává, a to včetně upravených materiálů dle čl. 2.7.</p>`,
    },
    {
      title: '3. Etický kodex',
      content: `<p><strong>3.1.</strong> Provozovatel zakládá svou činnost na důležitých hodnotách jako je vzájemný respekt, úcta ke svědectvím pamětníků a individuální odpovědnost primárně za práci s citlivými materiály a autentickými historickými prameny. V souvislosti s tím při používání Portálu Návštěvník souhlasí, že:</p>
<ul>
<li><strong>a)</strong> materiály získané na Portálu bude využívat výhradně k vlastnímu vzdělávání, případně též k jiné vzdělávací, osvětové či jiné nevýdělečné činnosti, přičemž budu vždy respektovat autorská práva vztahující se k daným materiálům;</li>
<li><strong>b)</strong> bude ctít a respektovat důstojnost pamětníka, i když se ve své výpovědi může mýlit. Pro pamětníky není snadné vracet se ve vzpomínkách k dávným a nezřídka traumatizujícím zážitkům, a to se týká jak pamětníků, kteří se stali oběťmi totalitních represí, i těch, kteří se na těchto represích podíleli. Každý pamětník, který se rozhodl zanechat pro budoucí generace své (byť kontroverzní) svědectví si zaslouží jistou míru úcty a respektu;</li>
<li><strong>c)</strong> bude pracovat s materiály vždy s úctou a nebude jakkoli snižovat jejich hodnotu ani vážnost či historickou hodnotu.</li>
</ul>`,
    },
    {
      title: '4. Zásady ochrany osobních údajů',
      content: `<p><strong>4.1.</strong> Respektování vašeho soukromí je pro nás klíčové. Proto Vás na následujících řádcích informujeme, jak zacházíme s Vašimi osobními údaji na Portálu a jakým způsobem je chráníme.</p>
<p><strong>4.2.</strong> Správcem osobních údajů ve smyslu nařízení Evropského parlamentu a Rady (EU) č. 2016/679 o ochraně fyzických osob v souvislosti se zpracováním osobních údajů (obecné nařízení o ochraně osobních údajů) je Provozovatel. Korespondenční adresa správce je: POST BELLUM, z.ú., Španělská 1073/10, Vinohrady, 120 00 Praha 2.</p>
<p><strong>4.3.</strong> Vaše osobní údaje používáme pouze v souladu s těmito zásadami. Máte-li jakékoli dotazy či připomínky ohledně osobních údajů, kontaktujte nás prostřednictvím e-mailové adresy <a href="mailto:storyon@postbellum.cz">storyon@postbellum.cz</a>.</p>
<p><strong>4.4.</strong> Osobními údaji se rozumí jakékoli informace nebo údaje, díky nimž Vás lze identifikovat buď přímo, nebo nepřímo. To znamená, že osobní údaje zahrnují údaje jako e-mail/soukromé adresy/mobilní telefon, uživatelská jména, profilové fotky, osobní preference či finanční údaje. Mohou rovněž zahrnovat jedinečné číselné identifikační údaje jako IP adresu Vašeho počítače nebo MAC adresu Vašeho mobilního zařízení a také soubory cookies.</p>
<p><strong>4.5.</strong> Na základě Vaší registrace na Portálu budeme zpracovávat Vaše osobní údaje napříč naším Portálem za účelem poskytnutí služby, ke které jsme se zavázali a která je podstatou Portálu. Z tohoto titulu potřebujeme zpracovávat Vaše osobní údaje v rozsahu, v jakém je uvedete v rámci registrace na našem Portálu. Jedná se tedy především o tyto osobní údaje, pokud jste je poskytli:</p>
<ul>
<li>jméno a příjmení</li>
<li>e-mailová adresa</li>
<li>škola nebo instituce, na které uživatel působí</li>
</ul>
<p>Uvedené osobní údaje zpracováváme výhradně pro účel poskytnutí služby, na základě Vámi zvolených kritérií a po dobu, dokud budete registrováni jako uživatelé Portálu. V případě zrušení Vašeho účtu Vaše osobní údaje smažeme a přestaneme je na našem Portálu nadále zpracovávat.</p>
<p><strong>4.6.</strong> Pakliže Uživatel použije k registraci na Portálu svůj e-mailový účet od společností Google či Microsoft, bere rovněž na vědomí, že kromě osobních údajů, které zpracovává Provozovatel v souladu s těmito podmínkami, zpracovávají jeho osobní údaje rovněž tyto společnosti dle svých platných zásad.</p>
<p><strong>4.7.</strong> Primárně zpracováváme osobní údaje sami vlastními prostředky, nicméně v některých případech mohou osobní údaje zpracovávat i další zpracovatelé, kteří nám poskytují software, služby a aplikace, jakými jsou například poskytovatelé cloudových služeb, e-mailu nebo dalších softwarových nástrojů a IT infrastruktury. Bez Vašeho souhlasu nepředáváme Vaše osobní údaje žádnému z obchodních partnerů, jejichž nabídky zasíláme, ani žádným jiným třetím stranám.</p>
<p><strong>4.8.</strong> V případě, kdy navštívíte Portál bez ohledu na to, zda jste registrovaný uživatel či nikoliv, chtěli bychom Vás upozornit, že používáme cookies. Pomocí cookies získáváme některé informace o Vás, Vašem zařízení a způsobu, jakým užíváte Portál a na jejich základě pak můžeme upravovat Portál, aby byly uživatelsky přívětivější a zlepšovat naše služby.</p>
<p><strong>4.9.</strong> Vzhledem ke zpracování svých osobních údajů vůči nám máte tato práva:</p>
<ul>
<li><strong>a) Právo na přístup k osobním údajům:</strong> máte právo získat informace o tom, jestli jsou Vaše osobní údaje zpracovávány, a pokud tomu tak je, máte právo k nim získat přístup. V případě nedůvodných, nepřiměřených nebo opakovaných žádostí jsme oprávněni za kopii poskytnutých osobních údajů účtovat přiměřený poplatek anebo žádost odmítnout.</li>
<li><strong>b) Právo na opravu nepřesných a doplnění neúplných osobních údajů:</strong> v případě, že máte pocit, že o Vás zpracováváme nepřesné či neúplné osobní údaje, máte právo požadovat jejich opravu a doplnění. Opravu či doplnění údajů provedeme bez zbytečného odkladu. Toto své právo můžete kdykoliv vykonat zejména prostřednictvím úprav či oprav svých osobních údajů v rámci nastavení vlastního profilu na Portálu.</li>
<li><strong>c) Právo na výmaz:</strong> v případě, že požádáte o výmaz, vymažeme Vaše osobní údaje pokud již nejsou potřebné pro účely, pro které byly shromážděny nebo jinak zpracovány, zpracování je protiprávní, vznesete námitky proti zpracování a neexistují žádné převažující oprávněné důvody pro zpracování, nebo výmaz nám ukládá zákonná povinnost. Toto své právo můžete kdykoliv vykonat zejména prostřednictvím žádosti na zrušení celého profilu prostřednictvím svého uživatelského účtu.</li>
<li><strong>d) Právo na omezení zpracování osobních údajů:</strong> v případě, že požádáte o omezení zpracování, osobní údaje znepřístupníme, dočasně odstraníme či uchováme anebo provedeme jiné úkony zpracování, které budou potřebné pro řádný výkon uplatněného práva.</li>
<li><strong>e) Právo na přenositelnost údajů:</strong> v případě, že chcete, abychom osobní údaje předali třetímu subjektu, můžete využít svého práva na přenositelnost údajů. V případě, že by výkonem tohoto práva byla nepříznivě dotčena práva a svobody jiných osob, nebudeme moci Vaší žádosti plně vyhovět.</li>
<li><strong>f) Právo vznést námitku:</strong> právo vznést námitku proti zpracování osobních údajů, které jsou zpracovávány pro účely splnění úkolu prováděného ve veřejném zájmu nebo při výkonu veřejné moci nebo pro účely ochrany oprávněných zájmů Provozovatele. V případě, že neprokážeme, že existuje závažný oprávněný důvod pro zpracování, který převažuje nad Vaším zájmem nebo právy a svobodami, zpracování na základě námitky ukončíme bez zbytečného odkladu.</li>
<li><strong>g) Právo podat stížnost u dozorového orgánu:</strong> vždy máte právo v případě, že nejste spokojeni se způsobem, jakým zpracováváme osobní údaje nebo se způsobem, jakým o tomto informujeme, obrátit se na dozorový úřad, kterým je v České republice Úřad pro ochranu osobních údajů, a to na adrese: Úřad pro ochranu osobních údajů Pplk. Sochora 27, 170 00 Praha 7, Česká republika <a href="https://www.uoou.cz/" target="_blank" rel="noopener noreferrer">https://www.uoou.cz/</a>.</li>
</ul>
<p>Svá práva vůči Provozovateli jakožto správci osobních údajů můžete uplatnit kdykoliv prostřednictvím e-mailové adresy <a href="mailto:storyon@postbellum.cz">storyon@postbellum.cz</a>, nebo na shora uvedené adrese sídla Provozovatele.</p>`,
    },
    {
      title: '5. Změny portálu, podmínek užívání',
      content: `<p><strong>5.1.</strong> Provozovatel si vyhrazuje změnu informací uváděných na Portálu i v těchto pravidlech, zejména z důvodu dodržování jakýchkoli nových platných právních či správních předpisů nebo za účelem zlepšování Portálu.</p>
<p><strong>5.2.</strong> Jakékoli změny Portálu či podmínek užívání zveřejníme na Portálu, další užívání Portálu bude považováno za Vaše přijetí těchto nových Podmínek užívání bez výhrad, pokud nevyžadují Váš výslovný souhlas.</p>`,
    },
    {
      title: '6. Závěrečná ustanovení',
      content: `<p><strong>6.1.</strong> Tato pravidla se řídí platnými právními předpisy České republiky, zejména zákonem č. 89/2012 Sb., občanským zákoníkem, ve znění pozdějších předpisů.</p>
<p><strong>6.2.</strong> Máte-li jakýkoli dotaz či připomínku, kontaktujte nás prosím na e-mailové adrese <a href="mailto:storyon@postbellum.cz">storyon@postbellum.cz</a>.</p>
<p class="text-sm pt-4" style="opacity: 0.8">Publikováno POST BELLUM, z.ú. dne 05. 02. 2026.</p>`,
    },
  ],
}

// =============================================
// DEFAULTS MAP
// =============================================

export const PAGE_DEFAULTS: Record<PageSlug, HomepageContent | AboutContent | TermsContent> = {
  homepage: DEFAULT_HOMEPAGE_CONTENT,
  about: DEFAULT_ABOUT_CONTENT,
  terms: DEFAULT_TERMS_CONTENT,
}
