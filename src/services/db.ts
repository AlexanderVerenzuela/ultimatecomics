import Dexie, { Table } from 'dexie';
import { ComicImport } from '../utils/parser';

export interface AppConfig {
  key: string;
  value: any;
}

export class UltimateComicDatabase extends Dexie {
  comics!: Table<ComicImport, string>;
  config!: Table<AppConfig, string>;

  constructor() {
    super('UltimateComicDB_v3');
    this.version(1).stores({
      comics: 'id, ordenLectura, ordenArchivo, serie, importancia, tipo, estadoLectura, esParalelo, pendienteEscaneo, grupoEvento',
      config: 'key'
    });
  }
}

export const db = new UltimateComicDatabase();

// Pre-populate database helper with custom ID generation
export async function saveParsedComics(comics: ComicImport[]): Promise<void> {
  const comicsWithIds = comics.map((c, index) => ({
    ...c,
    id: c.id || `comic-${c.ordenArchivo}-${index}-${Date.now()}`,
    ordenLectura: c.ordenLectura || index + 1
  }));

  await db.transaction('rw', db.comics, async () => {
    await db.comics.clear();
    await db.comics.bulkAdd(comicsWithIds);
  });
}
