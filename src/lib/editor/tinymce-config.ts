/**
 * TinyMCE Editor Configuration
 * 
 * This file contains all static configuration for the TinyMCE editor,
 * including plugins, toolbar, menu, content styles, and color palette.
 */

// ============================================================================
// PLUGINS
// ============================================================================

export const EDITOR_PLUGINS = [
  'advlist',
  'autolink',
  'lists',
  'link',
  'image',
  'charmap',
  'anchor',
  'searchreplace',
  'visualblocks',
  'code',
  'fullscreen',
  'insertdatetime',
  'media',
  'table',
  'help',
  'wordcount',
  'quickbars',
  'pagebreak',
] as const

// ============================================================================
// TOOLBAR & MENU
// ============================================================================

export const EDITOR_TOOLBAR = 
  'undo redo | blocks fontsize | ' +
  'bold italic underline forecolor | alignleft aligncenter ' +
  'alignright alignjustify | bullist numlist outdent indent | ' +
  'image link table | pagebreak | moveblockup moveblockdown | removeformat | fullscreen'

export const EDITOR_MENU = {
  file: { title: 'Soubor', items: 'preview | print' },
  edit: { title: 'Úpravy', items: 'undo redo | cut copy paste pastetext | selectall | searchreplace' },
  view: { title: 'Zobrazit', items: 'visualblocks | fullscreen' },
  insert: { title: 'Vložit', items: 'image link | charmap insertdatetime | pagebreak' },
  format: { title: 'Formát', items: 'bold italic underline strikethrough superscript subscript | styles blocks fontsize align lineheight | forecolor backcolor | removeformat' },
  table: { title: 'Tabulka', items: 'inserttable | cell row column | tableprops deletetable' },
  help: { title: 'Nápověda', items: 'help' },
}

export const EDITOR_MENUBAR = 'file edit view insert format table help'

// ============================================================================
// QUICKBARS
// ============================================================================

export const QUICKBARS_SELECTION_TOOLBAR = 'bold italic underline | blocks | forecolor | moveblockup moveblockdown'
export const QUICKBARS_IMAGE_TOOLBAR = 'floatleft floatnone floatright | rotateimage flipimageh flipimagev | image'
export const IMAGE_TOOLBAR = 'floatleft floatnone floatright | rotateimage flipimageh flipimagev | image'

// ============================================================================
// FONT & BLOCK FORMATS
// ============================================================================

export const FONT_SIZE_FORMATS = '12px 14px 16px 18px 20px 24px 28px 32px 36px'
export const BLOCK_FORMATS = 'Odstavec=p; Nadpis 1=h1; Nadpis 2=h2; Nadpis 3=h3; Nadpis 4=h4'

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const COLOR_MAP = [
  '000000', 'Černá',
  '434343', 'Tmavě šedá',
  '666666', 'Šedá',
  '999999', 'Středně šedá',
  'b7b7b7', 'Světle šedá',
  'ffffff', 'Bílá',
  '980000', 'Tmavě červená',
  'ff0000', 'Červená',
  'ff9900', 'Oranžová',
  'ffff00', 'Žlutá',
  '00ff00', 'Zelená',
  '00ffff', 'Tyrkysová',
  '4a86e8', 'Světle modrá',
  '0000ff', 'Modrá',
  '9900ff', 'Fialová',
  'ff00ff', 'Růžová',
  '075985', 'Primární',
  '0c4a6e', 'Primární tmavá',
]

export const COLOR_COLS = 6

// ============================================================================
// IMAGE CLASS PRESETS
// ============================================================================

export const IMAGE_CLASS_LIST = [
  { title: 'Bez stylu', value: '' },
  { title: 'Zarovnat vlevo', value: 'img-align-left' },
  { title: 'Zarovnat vpravo', value: 'img-align-right' },
  { title: 'Na střed', value: 'img-align-center' },
  { title: 'Na celou šířku', value: 'img-full-width' },
  { title: 'Zaoblené rohy', value: 'img-rounded' },
  { title: 'S rámečkem', value: 'img-bordered' },
  { title: 'Stín', value: 'img-shadow' },
]

// ============================================================================
// TABLE DEFAULTS
// ============================================================================

export const TABLE_DEFAULT_STYLES = {
  'border-collapse': 'collapse',
  'width': '100%',
}

export const TABLE_DEFAULT_ATTRIBUTES = {
  border: '1',
}

// ============================================================================
// CONTENT STYLES (CSS for editor content area)
// ============================================================================

export const CONTENT_STYLE = `
  @import url("https://use.typekit.net/anz3jmg.css");
  
  body {
    font-family: 'tablet-gothic-wide', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 16px;
    line-height: 1.75;
    color: #18181B;
    padding: 32px 40px;
    max-width: 100%;
    margin: 0;
    background-color: #fff;
  }
  
  /* Typography */
  p { margin: 1em 0; }
  h1 { font-family: 'tablet-gothic-narrow', system-ui, sans-serif; font-size: 28px; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.75em; line-height: 1.2; }
  h2 { font-family: 'tablet-gothic-narrow', system-ui, sans-serif; font-size: 24px; font-weight: 600; margin-top: 1.25em; margin-bottom: 0.5em; line-height: 1.3; }
  h3 { font-family: 'tablet-gothic-narrow', system-ui, sans-serif; font-size: 20px; font-weight: 600; margin-top: 1em; margin-bottom: 0.5em; line-height: 1.4; }
  h4 { font-family: 'tablet-gothic-narrow', system-ui, sans-serif; font-size: 18px; font-weight: 600; margin-top: 1em; margin-bottom: 0.5em; }
  h5, h6 { font-family: 'tablet-gothic-narrow', system-ui, sans-serif; font-size: 16px; font-weight: 600; margin-top: 1em; margin-bottom: 0.5em; }
  
  /* Lists */
  ul, ol { padding-left: 1.5em; margin: 1em 0; }
  ul { list-style-type: disc; }
  ol { list-style-type: decimal; }
  li { margin: 0.5em 0; }
  
  /* Images - Base */
  img { 
    max-width: 100%; 
    height: auto; 
    border-radius: 6px; 
    transition: all 0.2s ease;
    display: inline-block;
    vertical-align: top;
    margin: 0.5em 0.5em 0.5em 0;
  }
  img:hover { outline: 2px solid #075985; outline-offset: 2px; cursor: pointer; }
  
  /* Images - Block display when only child */
  p > img:only-child { display: block; margin: 1em auto; }
  
  /* Images - Alignment classes */
  img.img-align-left { float: left; margin: 0.5em 1.5em 1em 0; max-width: 50%; }
  img.img-align-right { float: right; margin: 0.5em 0 1em 1.5em; max-width: 50%; }
  img.img-align-center { display: block; margin-left: auto; margin-right: auto; float: none; }
  img.img-full-width { width: 100%; max-width: 100%; float: none; display: block; }
  
  /* Images - Style classes */
  img.img-rounded { border-radius: 16px; }
  img.img-bordered { border: 3px solid #e5e7eb; border-radius: 8px; }
  img.img-shadow { box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
  
  /* Images - Combined classes */
  img.img-rounded.img-shadow { border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15); }
  img.img-bordered.img-shadow { box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15); }
  
  /* Figure/caption styling */
  figure.image { display: table; margin: 1.5em auto; max-width: 100%; }
  figure.image img { display: block; margin: 0 auto; }
  figure.image figcaption { display: table-caption; caption-side: bottom; text-align: center; font-size: 14px; color: #6b7280; padding: 8px 0; font-style: italic; }
  
  /* Layout utilities */
  .clearfix::after { content: ""; display: table; clear: both; }
  h1, h2, h3, h4, h5, h6 { clear: both; }
  
  /* Links */
  a { color: #075985; text-decoration: underline; }
  
  /* Tables */
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { border: 1px solid #d1d5db; padding: 0.75em; }
  th { background-color: #f3f4f6; font-weight: 600; }
  
  /* Blockquote & Code */
  blockquote { border-left: 4px solid #d1d5db; margin: 1em 0; padding-left: 1em; color: #6b7280; }
  code { background-color: #f3f4f6; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
  pre { background-color: #f3f4f6; padding: 1em; border-radius: 6px; overflow-x: auto; }
  
  /* Page break indicator */
  .mce-pagebreak {
    display: block;
    width: 100%;
    height: 4px;
    margin: 24px 0;
    border: none;
    background: repeating-linear-gradient(
      90deg,
      #94a3b8 0px,
      #94a3b8 8px,
      transparent 8px,
      transparent 16px
    );
    position: relative;
    cursor: default;
    page-break-after: always;
  }
  
  .mce-pagebreak::before {
    content: 'Konec stránky – klikni na Tisk pro náhled';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: #f1f5f9;
    padding: 4px 16px;
    font-size: 12px;
    font-weight: 500;
    color: #64748b;
    border-radius: 4px;
    border: 1px solid #cbd5e1;
    white-space: nowrap;
  }
`

