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
  
  // Search query format: "Ultimate Spider-Man 1 comic"
  const query = `${cleanSerie} ${cleanNum} comic`.trim();
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error de red al buscar portadas');
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      // Fallback query if first search fails: "Ultimate Spider-Man 1" without the word "comic"
      const fallbackQuery = `${cleanSerie} ${cleanNum}`.trim();
      const fallbackUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(fallbackQuery)}&maxResults=5`;
      const fallbackRes = await fetch(fallbackUrl);
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        if (fallbackData.items) {
          data.items = fallbackData.items;
        }
      }
    }

    if (!data.items) return [];

    const results: CoverSearchResult[] = data.items
      .map((item: any) => {
        const volumeInfo = item.volumeInfo || {};
        const imageLinks = volumeInfo.imageLinks || {};
        // Google Books URLs are often HTTP, let's upgrade to HTTPS to avoid mixed content warnings
        let imageUrl = imageLinks.medium || imageLinks.thumbnail || imageLinks.smallThumbnail || '';
        if (imageUrl && imageUrl.startsWith('http://')) {
          imageUrl = imageUrl.replace('http://', 'https://');
        }

        return {
          id: item.id,
          title: volumeInfo.title || 'Comic sin título',
          imageUrl: imageUrl,
          source: 'Google Books'
        };
      })
      .filter((r: CoverSearchResult) => r.imageUrl !== '');

    return results;
  } catch (error) {
    console.error('Error in searchCovers:', error);
    return [];
  }
}
