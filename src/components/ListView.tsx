import React, { useState } from 'react';
import { ComicImport } from '../utils/parser';
import { ChevronUp, ChevronDown, Edit, ArrowUpDown, Image as ImageIcon } from 'lucide-react';

interface ListViewProps {
  comics: ComicImport[];
  onUpdateComic: (comic: ComicImport) => void;
  onEditComic: (comic: ComicImport) => void;
}

export default function ListView({ comics, onUpdateComic, onEditComic }: ListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'ordenLectura' | 'ordenArchivo' | 'titulo'>('ordenLectura');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filter & Sort
  const filtered = comics.filter(c => 
    c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.nombreArchivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.serie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      aVal = (aVal as string).toLowerCase();
      bVal = (bVal as string).toLowerCase();
    }

    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = sorted.slice(startIndex, startIndex + itemsPerPage);

  const getImportanceEmoji = (imp: ComicImport['importancia']) => {
    switch (imp) {
      case 'imprescindible': return '🔴';
      case 'evento': return '💥';
      case 'importante': return 'orange'; // 🟠
      case 'opcional': return '🟢';
      case 'prescindible': return 'white'; // ⚪
    }
  };

  const getImportanceLabel = (imp: ComicImport['importancia']) => {
    switch (imp) {
      case 'imprescindible': return 'Imprescindible';
      case 'evento': return 'Evento';
      case 'importante': return 'Recomendado';
      case 'opcional': return 'Opcional';
      case 'prescindible': return 'Prescindible';
    }
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          placeholder="Buscar por título, serie o nombre de archivo..."
          className="w-full md:max-w-md px-4 py-2 bg-ultimate-card border border-white/10 rounded-lg text-sm focus:outline-none focus:border-ultimate-accent"
        />
        <div className="text-sm text-zinc-400">
          Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sorted.length)} de {sorted.length} cómics
        </div>
      </div>

      <div className="overflow-x-auto bg-ultimate-card border border-white/5 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <th className="py-4 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('ordenLectura')}>
                <div className="flex items-center gap-1">Orden Lectura <ArrowUpDown size={12} /></div>
              </th>
              <th className="py-4 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('ordenArchivo')}>
                <div className="flex items-center gap-1">Orden Archivo <ArrowUpDown size={12} /></div>
              </th>
              <th className="py-4 px-4">Portada</th>
              <th className="py-4 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('titulo')}>
                <div className="flex items-center gap-1">Cómic <ArrowUpDown size={12} /></div>
              </th>
              <th className="py-4 px-4">Importancia</th>
              <th className="py-4 px-4">Tipo</th>
              <th className="py-4 px-4">Estado</th>
              <th className="py-4 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {paginated.map(comic => (
              <tr key={comic.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="py-3 px-4 font-mono font-bold text-white/90">
                  #{String(comic.ordenLectura).padStart(4, '0')}
                </td>
                <td className="py-3 px-4 font-mono text-zinc-500">
                  #{String(comic.ordenArchivoDisplay)}
                </td>
                <td className="py-3 px-4">
                  <div className="w-9 h-14 bg-zinc-900 border border-white/10 rounded overflow-hidden flex items-center justify-center">
                    {comic.portadaUrl ? (
                      <img src={comic.portadaUrl} alt="miniatura" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={14} className="text-zinc-600" />
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{comic.serie}</span>
                    <span className="font-bold text-white group-hover:text-ultimate-accent transition-colors">{comic.titulo}</span>
                    {comic.pendienteEscaneo && (
                      <span className="ml-2 text-[10px] text-yellow-500 font-bold bg-yellow-950/20 px-1 border border-yellow-900/40 rounded uppercase">Falta Escaneo</span>
                    )}
                    {comic.esParalelo && (
                      <span className="ml-2 text-[10px] text-blue-400 font-bold bg-blue-950/20 px-1 border border-blue-900/40 rounded uppercase">Paralelo</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="flex items-center gap-1 text-xs">
                    <span>
                      {comic.importancia === 'importante' ? '🟠' : 
                       comic.importancia === 'prescindible' ? '⚪' : 
                       getImportanceEmoji(comic.importancia)}
                    </span>
                    {getImportanceLabel(comic.importancia)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-300 rounded-full font-medium">
                    {comic.tipo}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={comic.estadoLectura}
                    onChange={(e) => onUpdateComic({ ...comic, estadoLectura: e.target.value as ComicImport['estadoLectura'] })}
                    className="bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-ultimate-accent"
                  >
                    <option value="pendiente">○ Pendiente</option>
                    <option value="leyendo">📖 Leyendo</option>
                    <option value="leido">✅ Leído</option>
                    <option value="saltado">⏭️ Saltado</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => onEditComic(comic)}
                    className="p-1.5 hover:bg-white/5 rounded text-zinc-400 hover:text-white transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 rounded-lg text-xs font-semibold transition-colors"
          >
            Anterior
          </button>
          <span className="text-xs text-zinc-400 font-mono">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 rounded-lg text-xs font-semibold transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
