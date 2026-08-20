export interface ComicImport {
  id?: string;
  ordenLectura: number;
  ordenArchivo: number;
  ordenArchivoDisplay: string; // e.g. "0001" or "0578a"
  nombreArchivo: string;
  titulo: string;
  numero: string;
  serie: string;
  anio: number;
  fechaPublicacion?: string;
  importancia: 'imprescindible' | 'importante' | 'opcional' | 'prescindible' | 'evento';
  tipo: string;
  portadaUrl?: string;
  estadoLectura: 'pendiente' | 'leyendo' | 'leido' | 'saltado';
  notas: string;
  universo: string;
  esParalelo: boolean;
  pendienteEscaneo: boolean;
  grupoEvento?: string;
}

// Clean and normalize series names for better API lookup and display
const SERIES_CLEAN_MAP: { [key: string]: { name: string; year: number; tipo: string } } = {
  'ultimate spiderman': { name: 'Ultimate Spider-Man', year: 2000, tipo: 'Serie principal' },
  'ultimate spiderman ii': { name: 'Ultimate Spider-Man (Vol. 2)', year: 2009, tipo: 'Serie principal' },
  'ultimate spiderman iii': { name: 'Ultimate Comics Spider-Man', year: 2011, tipo: 'Serie principal' },
  'ultimate spiderman iv': { name: 'Miles Morales: Ultimate Spider-Man', year: 2014, tipo: 'Serie principal' },
  'ultimate xmen': { name: 'Ultimate X-Men', year: 2001, tipo: 'Serie principal' },
  'ultimate xmen ii': { name: 'Ultimate Comics X-Men', year: 2011, tipo: 'Serie principal' },
  'ultimate fantastic four': { name: 'Ultimate Fantastic Four', year: 2004, tipo: 'Serie principal' },
  'ultimate marvel teamup': { name: 'Ultimate Marvel Team-Up', year: 2001, tipo: 'Complementario' },
  'the ultimates': { name: 'The Ultimates', year: 2002, tipo: 'Serie principal' },
  'the ultimates ii': { name: 'The Ultimates 2', year: 2005, tipo: 'Serie principal' },
  'the ultimates iii': { name: 'The Ultimates 3', year: 2008, tipo: 'Serie principal' },
  'the ultimates iv': { name: 'Ultimate Comics: The Ultimates', year: 2011, tipo: 'Serie principal' },
  'ultimate secret': { name: 'Ultimate Secret', year: 2005, tipo: 'Miniserie' },
  'ultimate vision': { name: 'Ultimate Vision', year: 2006, tipo: 'Miniserie' },
  'ultimate extinction': { name: 'Ultimate Extinction', year: 2006, tipo: 'Miniserie' },
  'ultimate nightmare': { name: 'Ultimate Nightmare', year: 2004, tipo: 'Miniserie' },
  'ultimate war': { name: 'Ultimate War', year: 2003, tipo: 'Miniserie' },
  'ultimate six': { name: 'Ultimate Six', year: 2003, tipo: 'Miniserie' },
  'ultimate power': { name: 'Ultimate Power', year: 2007, tipo: 'Miniserie' },
  'ultimate human': { name: 'Ultimate Human', year: 2008, tipo: 'Miniserie' },
  'ultimate origins': { name: 'Ultimate Origins', year: 2008, tipo: 'Miniserie' },
  'ultimatum': { name: 'Ultimatum', year: 2009, tipo: 'Evento' },
  'ultimatum requiem': { name: 'Ultimatum: Requiem', year: 2009, tipo: 'Especial' },
  'ultimate armor wars': { name: 'Ultimate Comics: Armor Wars', year: 2009, tipo: 'Miniserie' },
  'ultimate x': { name: 'Ultimate Comics: X', year: 2010, tipo: 'Miniserie' },
  'ultimate avengers': { name: 'Ultimate Avengers', year: 2009, tipo: 'Serie principal' },
  'ultimate avengers ii': { name: 'Ultimate Avengers 2', year: 2010, tipo: 'Serie principal' },
  'ultimate avengers iii': { name: 'Ultimate Avengers 3', year: 2010, tipo: 'Serie principal' },
  'ultimate avengers vs new ultimates': { name: 'Ultimate Avengers vs. New Ultimates', year: 2011, tipo: 'Evento' },
  'new ultimates': { name: 'New Ultimates', year: 2010, tipo: 'Serie principal' },
  'ultimate enemy': { name: 'Ultimate Enemy', year: 2010, tipo: 'Miniserie' },
  'ultimate mystery': { name: 'Ultimate Mystery', year: 2010, tipo: 'Miniserie' },
  'ultimate doom': { name: 'Ultimate Doom', year: 2010, tipo: 'Miniserie' },
  'ultimate fallout': { name: 'Ultimate Comics: Fallout', year: 2011, tipo: 'Miniserie' },
  'ultimate hawkeye': { name: 'Ultimate Comics: Hawkeye', year: 2011, tipo: 'Miniserie' },
  'ultimate ironman': { name: 'Ultimate Iron Man', year: 2005, tipo: 'Miniserie' },
  'ultimate ironman ii': { name: 'Ultimate Iron Man II', year: 2008, tipo: 'Miniserie' },
  'ultimate ironman iii': { name: 'Ultimate Comics: Iron Man', year: 2012, tipo: 'Miniserie' },
  'ultimate wolverine': { name: 'Ultimate Comics: Wolverine', year: 2013, tipo: 'Miniserie' },
  'spidermen': { name: 'Spider-Men', year: 2012, tipo: 'Miniserie' },
  'hunger': { name: 'Hunger', year: 2013, tipo: 'Miniserie' },
  'cataclysm': { name: 'Cataclysm', year: 2013, tipo: 'Evento' },
  'survive': { name: 'Survive!', year: 2014, tipo: 'Especial' },
  'all new ultimates': { name: 'All-New Ultimates', year: 2014, tipo: 'Serie principal' },
  'ultimate ff': { name: 'Ultimate FF', year: 2014, tipo: 'Serie principal' },
  'sw - el fin': { name: 'Secret Wars: Ultimate End', year: 2015, tipo: 'Evento' },
  // Paralelos frecuentes
  'marvel zombies': { name: 'Marvel Zombies', year: 2005, tipo: 'Paralelo' },
  'marvel zombies ii': { name: 'Marvel Zombies 2', year: 2007, tipo: 'Paralelo' },
  'marvel zombies return': { name: 'Marvel Zombies Return', year: 2009, tipo: 'Paralelo' },
  'army of darkness': { name: 'Marvel Zombies vs. Army of Darkness', year: 2007, tipo: 'Paralelo' },
  'squadron supreme': { name: 'Squadron Supreme', year: 2006, tipo: 'Paralelo' },
  'squadron supreme ii': { name: 'Squadron Supreme (Vol. 2)', year: 2008, tipo: 'Paralelo' },
  'squadron supreme iii': { name: 'Squadron Supreme (Vol. 3)', year: 2008, tipo: 'Paralelo' },
  'age of ultron': { name: 'Age of Ultron', year: 2013, tipo: 'Paralelo' },
  'edge of spiderverse': { name: 'Edge of Spider-Verse', year: 2014, tipo: 'Paralelo' },
  'the amazing spiderman iii': { name: 'The Amazing Spider-Man', year: 2014, tipo: 'Paralelo' },
};

export function parseComicLine(line: string, index: number): ComicImport | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Pattern: "0001 - Ultimate Spiderman 001.cbr" or "0213 PARALELO - Army of Darkness 001.cbr"
  // Group 1: Archive order (e.g. 0578a or 0001)
  // Group 2: PARALELO flag (optional)
  // Group 3: File core name (stripped of .cbr)
  const regex = /^(\d+[a-zA-Z]?)\s*(PARALELO)?\s*-\s*(.+?)(?:\.cbr)?$/i;
  const match = trimmed.match(regex);

  if (!match) {
    // Fallback if formatting is weird
    return {
      ordenLectura: index + 1,
      ordenArchivo: index + 1,
      ordenArchivoDisplay: String(index + 1).padStart(4, '0'),
      nombreArchivo: trimmed,
      titulo: trimmed.replace(/\.cbr$/i, ''),
      numero: 'Unknown',
      serie: 'Otros',
      anio: 2000,
      importancia: 'opcional',
      tipo: 'Otros',
      estadoLectura: 'pendiente',
      notas: 'Formato de nombre de archivo no reconocido.',
      universo: 'Tierra-1610',
      esParalelo: false,
      pendienteEscaneo: false,
    };
  }

  const fileOrderStr = match[1];
  const isParallelFile = !!match[2];
  let rawContent = match[3].trim();

  // Extract metadata in parentheses
  let scanPending = false;
  const notesArray: string[] = [];

  if (/PENDIENTE DE ESCANEO/i.test(rawContent)) {
    scanPending = true;
    rawContent = rawContent.replace(/\(PENDIENTE DE ESCANEO\)/gi, '').trim();
  }

  // Parse custom additions like (X), (Inglés), (por Nismo)
  const parenRegex = /\(([^)]+)\)/g;
  let parenMatch;
  while ((parenMatch = parenRegex.exec(rawContent)) !== null) {
    notesArray.push(parenMatch[1]);
  }
  rawContent = rawContent.replace(/\([^)]+\)/g, '').trim();

  // Clean double spaces
  rawContent = rawContent.replace(/\s+/g, ' ').trim();

  // Extract issue number or variant (e.g. 001, 100A, medio, Super Special)
  // Look for trailing numbers or words like "medio", "Super Special"
  let issueNum = '#1';
  let seriesRaw = rawContent;

  const issueRegex = /(?:\s+)(0\d*|\d+[a-zA-Z]?|medio|Super Special|Requiem \d+|Saga|Annual \d+[a-zA-Z]?)(?:\s+o\s+.*)?$/i;
  const issueMatch = rawContent.match(issueRegex);

  if (issueMatch) {
    issueNum = `#${issueMatch[1].replace(/^0+/, '') || issueMatch[1]}`;
    seriesRaw = rawContent.substring(0, issueMatch.index).trim();
  }

  // Normalize series lookup key
  const seriesKey = seriesRaw.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim();
  let cleanSeries = seriesRaw;
  let defaultYear = 2000;
  let defaultTipo = 'Serie principal';

  // Try to match in clean map
  let foundMatch = false;
  for (const key of Object.keys(SERIES_CLEAN_MAP)) {
    if (seriesKey.startsWith(key) || key.startsWith(seriesKey)) {
      cleanSeries = SERIES_CLEAN_MAP[key].name;
      defaultYear = SERIES_CLEAN_MAP[key].year;
      defaultTipo = SERIES_CLEAN_MAP[key].tipo;
      foundMatch = true;
      break;
    }
  }

  if (!foundMatch) {
    if (/annual/i.test(rawContent)) {
      defaultTipo = 'Anual';
    } else if (/special/i.test(rawContent) || /medio/i.test(rawContent)) {
      defaultTipo = 'Especial';
    } else if (/miniserie/i.test(rawContent)) {
      defaultTipo = 'Miniserie';
    }
  }

  // Default Importance logic
  let importancia: ComicImport['importancia'] = 'opcional';
  if (defaultTipo === 'Serie principal') {
    importancia = 'imprescindible';
  } else if (defaultTipo === 'Evento') {
    importancia = 'evento';
  } else if (defaultTipo === 'Miniserie') {
    importancia = 'importante';
  }

  const cleanTitle = `${cleanSeries} ${issueNum}`;
  const generatedId = `comic-${fileOrderStr}-${index}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: generatedId,
    ordenLectura: index + 1,
    ordenArchivo: parseInt(fileOrderStr, 10) || index + 1,
    ordenArchivoDisplay: fileOrderStr,
    nombreArchivo: trimmed,
    titulo: cleanTitle,
    numero: issueNum,
    serie: cleanSeries,
    anio: defaultYear,
    importancia,
    tipo: defaultTipo,
    estadoLectura: 'pendiente',
    notas: notesArray.join(', '),
    universo: 'Tierra-1610',
    esParalelo: isParallelFile || defaultTipo === 'Paralelo',
    pendienteEscaneo: scanPending,
  };
}

export function parseComicList(text: string): ComicImport[] {
  const lines = text.split('\n');
  const comics: ComicImport[] = [];
  let index = 0;
  for (const line of lines) {
    const parsed = parseComicLine(line, index);
    if (parsed) {
      comics.push(parsed);
      index++;
    }
  }
  return comics;
}
