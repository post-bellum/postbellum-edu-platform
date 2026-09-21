'use client'

import * as React from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'

// ============================================================================
// Help content (Czech) - kept as data so the sections stay easy to edit
// ============================================================================

interface HelpItem {
  term: string
  description: string
}

interface HelpSection {
  title: string
  intro?: string
  items: HelpItem[]
}

const HELP_SECTIONS: HelpSection[] = [
  {
    title: 'Struktura textu (Typ bloku)',
    intro: 'Nabídka slouží k nastavení logické hierarchie dokumentu:',
    items: [
      { term: 'Odstavec', description: 'Základ pro běžný text.' },
      {
        term: 'Název',
        description: 'Hlavní označení celého materiálu (nejvýraznější prvek).',
      },
      {
        term: 'Nadpis 1 až 4',
        description:
          'Slouží k postupnému členění dokumentu. Nadpis 1 je vizuálně největší a určuje hlavní kapitoly či sekce. Čísla 2, 3 a 4 představují postupně menší podnadpisy určené pro hlubší a detailnější zanoření v textu.',
      },
      {
        term: 'Citace',
        description:
          'Odsazený blok textu určený pro zvýraznění přímé řeči, definice nebo důležité myšlenky.',
      },
    ],
  },
  {
    title: 'Obrázky, grafy a mapy',
    items: [
      {
        term: 'Vložení obrázku',
        description:
          'Soubory můžete nahrát přímo z počítače, nebo využít materiál z původní podoby lekce.',
      },
      {
        term: 'Popisky',
        description:
          'Ke každému vloženému obrázku lze ve spodní části rovnou dopsat vysvětlující popisek.',
      },
      {
        term: 'Více obrázků vedle sebe',
        description:
          'Nelze je vkládat pouhým klikáním na ikonu obrázku za sebou. Nejprve vytvořte dvousloupcový blok (ikona dvou obdélníků) a teprve poté vložte do každého sloupce samostatný obrázek. Pokud chcete vložit více než tři obrázky vedle sebe, využijte funkci Tabulka a jednotlivé obrázky vložte do jednotlivých polí Tabulky.',
      },
      {
        term: 'Grafy a mapy',
        description:
          'Editor pro ně nemá speciální nástroj. Vkládají se úplně stejně jako běžné obrázky (ve formátu obrazového souboru).',
      },
      {
        term: 'QR kód',
        description:
          'Do materiálu můžete vložit QR kód, přes který si uživatelé snadno naskenují a otevřou odkaz například na online ukázku nebo rozšiřující studijní zdroje. QR kód nahrajete stejně jako obrázek.',
      },
    ],
  },
  {
    title: 'Odkazy',
    items: [
      {
        term: 'Tvorba odkazu',
        description:
          'Klikněte na tlačítko pro vložení odkazu, do otevřeného okna zadejte URL adresu a potvrďte. Následně vás systém vyzve k zadání textu, který se má čtenářům v materiálu zobrazit.',
      },
      {
        term: 'Důležité pravidlo pro zobrazený text',
        description:
          'Jako zobrazený text vložte znovu celou URL adresu, nikoliv zástupná slova (např. “klikněte zde”). V tištěné formě nebo ve vyexportovaném PDF dokumentu nelze na odkazy klikat, takže uživatelé musí vidět přímo plnou adresu.',
      },
    ],
  },
  {
    title: 'Dva sloupce (Rozdělení stránky)',
    items: [
      {
        term: 'Vložení sloupců',
        description:
          'Klikněte do místa, kde chcete obsah rozdělit, a stiskněte tlačítko pro dva sloupce. Stránka se v daném místě okamžitě rozdělí na dvě samostatné části.',
      },
      {
        term: 'Úprava rozložení',
        description:
          'Po rozdělení se zobrazí dodatečné podmenu. Pomocí něj můžete snadno změnit šířku a uspořádání sloupců, případně prostor rozdělit až na tři části.',
      },
    ],
  },
  {
    title: 'Tabulka',
    items: [
      {
        term: 'Vložení tabulky',
        description:
          'Klikněte do místa, kam chcete tabulku umístit, a v horním menu zvolte tlačítko Tabulka.',
      },
      {
        term: 'Nastavení rozměrů',
        description:
          'Nabídka se po kliknutí rozbalí do interaktivní mřížky. Pouhým tažením myši přes tuto mřížku si jednoduše zvolte požadovanou počáteční velikost (počet řádků a sloupců).',
      },
      {
        term: 'Dodatečné úpravy',
        description:
          'Jakmile kliknete kurzorem do jakékoliv buňky ve vytvořené tabulce, zpřístupní se vám další možnosti. Můžete tak snadno měnit barvu pozadí konkrétní buňky, upravovat tloušťku okrajů nebo podle potřeby přidávat a odebírat další řádky či sloupce.',
      },
    ],
  },
]

// ============================================================================
// Dialog
// ============================================================================

interface EditorHelpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Scrollable help modal with basic tips on how to work with the editor.
 */
export function EditorHelpDialog({ open, onOpenChange }: EditorHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] max-h-[85vh] grid-rows-[auto_minmax(0,1fr)] rounded-[24px] sm:rounded-[40px]">
        <DialogHeader className="pr-8">
          <DialogTitle>Jak pracovat s editorem</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto pr-8 -mr-2 space-y-6 text-sm leading-relaxed text-text-strong">
          {HELP_SECTIONS.map((section) => (
            <section key={section.title}>
              <h3 className="mb-2 text-base font-semibold">{section.title}</h3>
              {section.intro && (
                <p className="mb-2 text-text-subtle">{section.intro}</p>
              )}
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item.term}>
                    <span className="font-medium">{item.term}:</span>{' '}
                    <span className="text-text-subtle">{item.description}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
