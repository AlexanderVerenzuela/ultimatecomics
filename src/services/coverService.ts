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
  const query = `${serie} ${numero} comic ${anio || ''}`.trim();
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error de red al buscar portadas');
    const data = await res.json();

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
