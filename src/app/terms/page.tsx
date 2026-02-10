import { PageHeader, ContentSection } from '@/components/about'

export const metadata = {
  title: 'Smluvní podmínky | storyON',
  description:
    'Všeobecné podmínky užívání a zásady ochrany osobních údajů portálu storyON organizace POST BELLUM, z. ú.',
}

export default function TermsPage() {
  return (
    <div className="w-full px-5 md:px-10 xl:px-10">
      <PageHeader title="Smluvní podmínky" />

      <div className="max-w-[800px] mx-auto flex flex-col gap-10 lg:gap-12 pb-16 sm:pb-20 lg:pb-36">
        <ContentSection title="Úvod">
          <p className="font-body text-sm sm:text-base md:text-lg text-text-subtle leading-[1.6]">
            Vítejte na internetovém portálu storyON{' '}
            <a
              href="https://www.storyon.cz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary hover:underline"
            >
              www.storyon.cz
            </a>
            , který podporuje vzdělávání tím, že nabízí učitelům připravené lekce do výuky
            základních a středních škol s hlavním důrazem na výuku moderních dějin a hodnotového
            a mezigeneračního vzdělávání. Lekce pracují s autentickými výpověďmi pamětníků z
            archivu Paměti národa (dále jen „Portál“).
          </p>
          <p className="font-body text-sm sm:text-base md:text-lg text-text-subtle leading-[1.6]">
            Portál provozuje organizace POST BELLUM, z.ú., IČO: 26548526, se sídlem Španělská
            1073/10, Vinohrady, 120 00 Praha 2 (dále jen „Provozovatel“). Přečtěte si, prosím,
            tato pravidla sestávající z podmínek užívání a zásad ochrany osobních údajů při
            užívání Portálu. Máte-li jakýkoli dotaz související s užíváním Portálu, můžete nás
            kontaktovat na e-mailové adrese{' '}
            <a
              href="mailto:storyon@postbellum.cz"
              className="text-brand-primary hover:underline"
            >
              storyon@postbellum.cz
            </a>
            .
          </p>
          <p className="font-body text-sm sm:text-base md:text-lg text-text-subtle leading-[1.6]">
            V případě, že se rozhodnete zaregistrovat na Portálu a stát se uživatelem (dále jen
            „Uživatel“), týká se Vás pak výlučně článek č. 2 těchto podmínek. Ve zbývajícím
            rozsahu platí pravidla jak pro registrované Uživatele, tak ostatní návštěvníky
            Portálu (dále souhrnně jen „Návštěvník“).
          </p>
        </ContentSection>

        <ContentSection title="1. Pravidla pro užívání portálu">
          <div className="flex flex-col gap-5 font-body text-sm sm:text-base md:text-lg text-text-subtle leading-[1.6]">
            <p>
              <strong>1.1.</strong> Užívání Portálu je v plné míře možné pouze po úspěšné
              registraci. U neregistrovaných Návštěvníků je možnost jeho využití omezená. V
              obou případech platí, že Portál lze užívat pouze v souladu s těmito podmínkami a
              obecně závaznými právními předpisy České republiky.
            </p>
            <p>
              <strong>1.2.</strong> Návštěvník není oprávněn užívat Portál jinak než pro vlastní
              či edukativní potřebu. Za účelem vzdělávání je možné jeho užití formou šíření a
              kopírování či další technické zpracování materiálů, které Portál obsahuje. Za
              jiným účelem toto možné není bez prokazatelného souhlasu Provozovatele. Návštěvník
              užíváním Portálu bere na vědomí, že jeho obsah je chráněn autorskými právy a
              dalšími právními předpisy.
            </p>
            <p>
              <strong>1.3.</strong> Provozovatel si vyhrazuje právo omezit nebo zrušit přístup
              jakémukoli Návštěvníkovi, který porušuje pravidla.
            </p>
            <p>
              <strong>1.4.</strong> Na Portálu se mohou objevit nepřesnosti či chybějící informace.
              Jakmile se o podobném nedostatku Provozovatel dozví, situaci napraví. Pokud si
              takové chyby všimnete, kontaktujte Provozovatele prosím na e-mailové adrese{' '}
              <a
                href="mailto:storyon@postbellum.cz"
                className="text-brand-primary hover:underline"
              >
                storyon@postbellum.cz
              </a>
              .
            </p>
          </div>
        </ContentSection>

        <ContentSection title="2. Registrace a účet uživatele">
          <div className="flex flex-col gap-5 font-body text-sm sm:text-base md:text-lg text-text-subtle leading-[1.6]">
            <p>
              <strong>2.1.</strong> Každý, kdo chce plně využívat možnosti Portálu, se musí
              zaregistrovat vyplněním elektronického formuláře na Portálu.
            </p>
            <p>
              <strong>2.2.</strong> Při registraci je Návštěvník povinen zadat pravdivé a
              bezchybné údaje výlučně o své osobě. Jestliže se údaje uvedené v Účtu změní, je
              Uživatel povinen tyto údaje bez zbytečného odkladu aktualizovat. Touto
              bezplatnou registrací bude Uživateli vytvořen účet.
            </p>
            <p>
              <strong>2.3.</strong> Do účtu vstupuje Uživatel pod uživatelským jménem a přístup je
              zabezpečen heslem. Uživatel má právo své heslo kdykoliv změnit. Ztracené heslo může
              Uživatel obnovit prostřednictvím formuláře na Portálu.
            </p>
            <p>
              <strong>2.4.</strong> Registraci a následný vstup do Portálu lze provést rovněž
              skrze e-mailové účty společností Google (Gmail) nebo Microsoft.
            </p>
            <p>
              <strong>2.5.</strong> Provozovatel si vyhrazuje právo účet Uživatele kdykoliv
              jednostranně zrušit bez udání důvodu či upozornění. Zejména mohou být smazány účty
              Uživatelů, kteří se delší dobu nepřihlásili nebo pokud bude mít Provozovatel
              podezření na jednání v rozporu s pravidly.
            </p>
            <p>
              <strong>2.6.</strong> Uživatel může kdykoliv požádat o zrušení svého Účtu v
              nastavení svého profilu a Provozovatel mu musí vyhovět.
            </p>
            <p>
              <strong>2.7.</strong> Uživatel může na svém účtu upravovat materiály poskytnuté
              Portálem. K těmto upraveným materiálům nemá přístup nikdo kromě daného Uživatele a
              Provozovatel nemá právo s nimi jakkoli dále nakládat, ani do nich zasahovat.
            </p>
            <p>
              <strong>2.8.</strong> Zrušením účtu se plně smažou všechna data a osobní údaje,
              která Provozovatel o Uživateli zpracovává, a to včetně upravených materiálů dle
              čl. 2.7.
            </p>
          </div>
        </ContentSection>

        <ContentSection title="3. Etický kodex">
          <div className="flex flex-col gap-5 font-body text-sm sm:text-base md:text-lg text-text-subtle leading-[1.6]">
            <p>
              <strong>3.1.</strong> Provozovatel zakládá svou činnost na důležitých hodnotách jako
              je vzájemný respekt, úcta ke svědectvím pamětníků a individuální odpovědnost
              primárně za práci s citlivými materiály a autentickými historickými prameny. V
              souvislosti s tím při používání Portálu Návštěvník souhlasí, že:
            </p>
            <ul className="list-none flex flex-col gap-3 pl-0">
              <li className="flex gap-2">
                <span className="font-semibold shrink-0">a)</span>
                <span>
                  materiály získané na Portálu bude využívat výhradně k vlastnímu vzdělávání,
                  případně též k jiné vzdělávací, osvětové či jiné nevýdělečné činnosti, přičemž
                  budu vždy respektovat autorská práva vztahující se k daným materiálům;
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold shrink-0">b)</span>
                <span>
                  bude ctít a respektovat důstojnost pamětníka, i když se ve své výpovědi může
                  mýlit. Pro pamětníky není snadné vracet se ve vzpomínkách k dávným a nezřídka
                  traumatizujícím zážitkům, a to se týká jak pamětníků, kteří se stali oběťmi
                  totalitních represí, i těch, kteří se na těchto represích podíleli. Každý
                  pamětník, který se rozhodl zanechat pro budoucí generace své (byť
                  kontroverzní) svědectví si zaslouží jistou míru úcty a respektu;
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold shrink-0">c)</span>
                <span>
                  bude pracovat s materiály vždy s úctou a nebude jakkoli snižovat jejich
                  hodnotu ani vážnost či historickou hodnotu.
                </span>
              </li>
            </ul>
          </div>
        </ContentSection>

        <ContentSection title="4. Zásady ochrany osobních údajů">
          <div className="flex flex-col gap-5 font-body text-sm sm:text-base md:text-lg text-text-subtle leading-[1.6]">
            <p>
              <strong>4.1.</strong> Respektování vašeho soukromí je pro nás klíčové. Proto Vás na
              následujících řádcích informujeme, jak zacházíme s Vašimi osobními údaji na Portálu
              a jakým způsobem je chráníme.
            </p>
            <p>
              <strong>4.2.</strong> Správcem osobních údajů ve smyslu nařízení Evropského
              parlamentu a Rady (EU) č. 2016/679 o ochraně fyzických osob v souvislosti se
              zpracováním osobních údajů (obecné nařízení o ochraně osobních údajů) je
              Provozovatel. Korespondenční adresa správce je: POST BELLUM, z.ú., Španělská
              1073/10, Vinohrady, 120 00 Praha 2.
            </p>
            <p>
              <strong>4.3.</strong> Vaše osobní údaje používáme pouze v souladu s těmito zásadami.
              Máte-li jakékoli dotazy či připomínky ohledně osobních údajů, kontaktujte nás
              prostřednictvím e-mailové adresy{' '}
              <a
                href="mailto:storyon@postbellum.cz"
                className="text-brand-primary hover:underline"
              >
                storyon@postbellum.cz
              </a>
              .
            </p>
            <p>
              <strong>4.4.</strong> Osobními údaji se rozumí jakékoli informace nebo údaje, díky
              nimž Vás lze identifikovat buď přímo, nebo nepřímo. To znamená, že osobní údaje
              zahrnují údaje jako e-mail/soukromé adresy/mobilní telefon, uživatelská jména,
              profilové fotky, osobní preference či finanční údaje. Mohou rovněž zahrnovat
              jedinečné číselné identifikační údaje jako IP adresu Vašeho počítače nebo MAC
              adresu Vašeho mobilního zařízení a také soubory cookies.
            </p>
            <p>
              <strong>4.5.</strong> Na základě Vaší registrace na Portálu budeme zpracovávat Vaše
              osobní údaje napříč naším Portálem za účelem poskytnutí služby, ke které jsme se
              zavázali a která je podstatou Portálu. Z tohoto titulu potřebujeme zpracovávat
              Vaše osobní údaje v rozsahu, v jakém je uvedete v rámci registrace na našem
              Portálu. Jedná se tedy především o tyto osobní údaje, pokud jste je poskytli:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>jméno a příjmení</li>
              <li>e-mailová adresa</li>
              <li>škola nebo instituce, na které uživatel působí</li>
            </ul>
            <p>
              Uvedené osobní údaje zpracováváme výhradně pro účel poskytnutí služby, na základě
              Vámi zvolených kritérií a po dobu, dokud budete registrováni jako uživatelé
              Portálu. V případě zrušení Vašeho účtu Vaše osobní údaje smažeme a přestaneme je
              na našem Portálu nadále zpracovávat.
            </p>
            <p>
              <strong>4.6.</strong> Pakliže Uživatel použije k registraci na Portálu svůj
              e-mailový účet od společností Google či Microsoft, bere rovněž na vědomí, že kromě
              osobních údajů, které zpracovává Provozovatel v souladu s těmito podmínkami,
              zpracovávají jeho osobní údaje rovněž tyto společnosti dle svých platných zásad.
            </p>
            <p>
              <strong>4.7.</strong> Primárně zpracováváme osobní údaje sami vlastními prostředky,
              nicméně v některých případech mohou osobní údaje zpracovávat i další zpracovatelé,
              kteří nám poskytují software, služby a aplikace, jakými jsou například poskytovatelé
              cloudových služeb, e-mailu nebo dalších softwarových nástrojů a IT infrastruktury.
              Bez Vašeho souhlasu nepředáváme Vaše osobní údaje žádnému z obchodních partnerů,
              jejichž nabídky zasíláme, ani žádným jiným třetím stranám.
            </p>
            <p>
              <strong>4.8.</strong> V případě, kdy navštívíte Portál bez ohledu na to, zda jste
              registrovaný uživatel či nikoliv, chtěli bychom Vás upozornit, že používáme
              cookies. Pomocí cookies získáváme některé informace o Vás, Vašem zařízení a
              způsobu, jakým užíváte Portál a na jejich základě pak můžeme upravovat Portál,
              aby byly uživatelsky přívětivější a zlepšovat naše služby.
            </p>
            <p>
              <strong>4.9.</strong> Vzhledem ke zpracování svých osobních údajů vůči nám máte
              tato práva:
            </p>
            <ul className="list-none flex flex-col gap-4 pl-0">
              <li className="flex gap-2">
                <span className="font-semibold shrink-0">a)</span>
                <span>
                  <strong>Právo na přístup k osobním údajům:</strong> máte právo získat
                  informace o tom, jestli jsou Vaše osobní údaje zpracovávány, a pokud tomu tak
                  je, máte právo k nim získat přístup. V případě nedůvodných, nepřiměřených nebo
                  opakovaných žádostí jsme oprávněni za kopii poskytnutých osobních údajů účtovat
                  přiměřený poplatek anebo žádost odmítnout.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold shrink-0">b)</span>
                <span>
                  <strong>Právo na opravu nepřesných a doplnění neúplných osobních údajů:</strong>{' '}
                  v případě, že máte pocit, že o Vás zpracováváme nepřesné či neúplné osobní
                  údaje, máte právo požadovat jejich opravu a doplnění. Opravu či doplnění údajů
                  provedeme bez zbytečného odkladu. Toto své právo můžete kdykoliv vykonat zejména
                  prostřednictvím úprav či oprav svých osobních údajů v rámci nastavení vlastního
                  profilu na Portálu.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold shrink-0">c)</span>
                <span>
                  <strong>Právo na výmaz:</strong> v případě, že požádáte o výmaz, vymažeme Vaše
                  osobní údaje pokud již nejsou potřebné pro účely, pro které byly shromážděny
                  nebo jinak zpracovány, zpracování je protiprávní, vznesete námitky proti
                  zpracování a neexistují žádné převažující oprávněné důvody pro zpracování, nebo
                  výmaz nám ukládá zákonná povinnost. Toto své právo můžete kdykoliv vykonat zejména
                  prostřednictvím žádosti na zrušení celého profilu prostřednictvím svého
                  uživatelského účtu.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold shrink-0">d)</span>
                <span>
                  <strong>Právo na omezení zpracování osobních údajů:</strong> v případě, že
                  požádáte o omezení zpracování, osobní údaje znepřístupníme, dočasně odstraníme
                  či uchováme anebo provedeme jiné úkony zpracování, které budou potřebné pro
                  řádný výkon uplatněného práva.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold shrink-0">e)</span>
                <span>
                  <strong>Právo na přenositelnost údajů:</strong> v případě, že chcete, abychom
                  osobní údaje předali třetímu subjektu, můžete využít svého práva na
                  přenositelnost údajů. V případě, že by výkonem tohoto práva byla nepříznivě
                  dotčena práva a svobody jiných osob, nebudeme moci Vaší žádosti plně vyhovět.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold shrink-0">f)</span>
                <span>
                  <strong>Právo vznést námitku:</strong> právo vznést námitku proti zpracování
                  osobních údajů, které jsou zpracovávány pro účely splnění úkolu prováděného ve
                  veřejném zájmu nebo při výkonu veřejné moci nebo pro účely ochrany oprávněných
                  zájmů Provozovatele. V případě, že neprokážeme, že existuje závažný
                  oprávněný důvod pro zpracování, který převažuje nad Vaším zájmem nebo právy a
                  svobodami, zpracování na základě námitky ukončíme bez zbytečného odkladu.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold shrink-0">g)</span>
                <span>
                  <strong>Právo podat stížnost u dozorového orgánu:</strong> vždy máte právo v
                  případě, že nejste spokojeni se způsobem, jakým zpracováváme osobní údaje nebo
                  se způsobem, jakým o tomto informujeme, obrátit se na dozorový úřad, kterým je v
                  České republice Úřad pro ochranu osobních údajů, a to na adrese: Úřad pro
                  ochranu osobních údajů Pplk. Sochora 27, 170 00 Praha 7, Česká republika{' '}
                  <a
                    href="https://www.uoou.cz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:underline"
                  >
                    https://www.uoou.cz/
                  </a>
                  .
                </span>
              </li>
            </ul>
            <p>
              Svá práva vůči Provozovateli jakožto správci osobních údajů můžete uplatnit
              kdykoliv prostřednictvím e-mailové adresy{' '}
              <a
                href="mailto:storyon@postbellum.cz"
                className="text-brand-primary hover:underline"
              >
                storyon@postbellum.cz
              </a>
              , nebo na shora uvedené adrese sídla Provozovatele.
            </p>
          </div>
        </ContentSection>

        <ContentSection title="5. Změny portálu, podmínek užívání">
          <div className="flex flex-col gap-5 font-body text-sm sm:text-base md:text-lg text-text-subtle leading-[1.6]">
            <p>
              <strong>5.1.</strong> Provozovatel si vyhrazuje změnu informací uváděných na
              Portálu i v těchto pravidlech, zejména z důvodu dodržování jakýchkoli nových
              platných právních či správních předpisů nebo za účelem zlepšování Portálu.
            </p>
            <p>
              <strong>5.2.</strong> Jakékoli změny Portálu či podmínek užívání zveřejníme na
              Portálu, další užívání Portálu bude považováno za Vaše přijetí těchto nových
              Podmínek užívání bez výhrad, pokud nevyžadují Váš výslovný souhlas.
            </p>
          </div>
        </ContentSection>

        <ContentSection title="6. Závěrečná ustanovení">
          <div className="flex flex-col gap-5 font-body text-sm sm:text-base md:text-lg text-text-subtle leading-[1.6]">
            <p>
              <strong>6.1.</strong> Tato pravidla se řídí platnými právními předpisy České
              republiky, zejména zákonem č. 89/2012 Sb., občanským zákoníkem, ve znění pozdějších
              předpisů.
            </p>
            <p>
              <strong>6.2.</strong> Máte-li jakýkoli dotaz či připomínku, kontaktujte nás prosím
              na e-mailové adrese{' '}
              <a
                href="mailto:storyon@postbellum.cz"
                className="text-brand-primary hover:underline"
              >
                storyon@postbellum.cz
              </a>
              .
            </p>
            <p className="text-text-subtle/80 text-sm pt-4">
              Publikováno POST BELLUM, z.ú. dne 05. 02. 2026.
            </p>
          </div>
        </ContentSection>
      </div>
    </div>
  )
}
