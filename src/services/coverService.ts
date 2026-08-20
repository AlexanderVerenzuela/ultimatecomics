export interface CoverSearchResult {
  id: string;
  title: string;
  imageUrl: string;
  source: string;
}

export async function searchCovers(
  serie: string,
  numero: string,
  anio?: number
): Promise<CoverSearchResult[]> {
  // Clean special characters like '#' and format number cleanly (e.g., '#1' -> '1')
  const cleanNum = numero.replace('#', '').trim();
  const cleanSerie = serie.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  
  // Search query format: "Ultimate Spider-Man 1"
  const query = `${cleanSerie} ${cleanNum}`.trim();
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=6`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error de red al buscar portadas');
    const data = await res.json();

    if (!data.docs) return [];

    const results: CoverSearchResult[] = data.docs
      .map((doc: any) => {
        return {
          id: doc.key || String(Math.random()),
          title: doc.title || 'Comic sin título',
          imageUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : '',
          source: 'Open Library'
        };
      })
      .filter((r: CoverSearchResult) => r.imageUrl !== '');

    return results;
  } catch (error) {
    console.error('Error in searchCovers:', error);
    return [];
  }
}
