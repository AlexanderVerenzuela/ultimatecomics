import React, { useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ComicImport } from '../utils/parser';
import { searchCovers } from '../services/coverService';
import { ChevronUp, ChevronDown, Edit, AlertCircle, GripVertical } from 'lucide-react';

interface ComicCardProps {
  comic: ComicImport;
  onEdit: (comic: ComicImport) => void;
  onMoveUp: (comic: ComicImport) => void;
  onMoveDown: (comic: ComicImport) => void;
  onSelect: (id: string, selected: boolean) => void;
  onToggleRead: (comic: ComicImport) => void;
  onAutoFetchCover?: (updatedComic: ComicImport) => void;
  isSelected: boolean;
  isDraggable?: boolean;
}

export default function ComicCard({
  comic,
  onEdit,
  onMoveUp,
  onMoveDown,
  onSelect,
  onToggleRead,
  onAutoFetchCover,
  isSelected,
  isDraggable = true
}: ComicCardProps) {

  // Lazy load covers in the background for visible items
  useEffect(() => {
    if (comic.portadaUrl || !onAutoFetchCover) return;

    // Stagger API calls with a random delay (500ms - 4500ms) to avoid rate limits
    const delay = Math.floor(Math.random() * 4000) + 500;
    const timer = setTimeout(async () => {
      try {
        const results = await searchCovers(comic.serie, comic.numero, comic.anio);
        if (results && results.length > 0) {
          onAutoFetchCover({
            ...comic,
            portadaUrl: results[0].imageUrl
          });
        }
      } catch (err) {
        console.error(`Error loading lazy cover for ${comic.titulo}:`, err);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [comic.id, comic.portadaUrl, onAutoFetchCover]);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: comic.id || '' });

  const style: React.CSSProperties = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: transition || undefined,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const getImportanceBadge = (importance: ComicImport['importancia']) => {
    switch (importance) {
      case 'imprescindible':
        return { bg: 'bg-red-950/40 text-red-400 border-red-900/60', label: 'Imprescindible', emoji: '🔴' };
      case 'evento':
        return { bg: 'bg-purple-950/40 text-purple-400 border-purple-900/60', label: 'Evento', emoji: '💥' };
      case 'importante':
        return { bg: 'bg-amber-950/40 text-amber-400 border-amber-900/60', label: 'Recomendado', emoji: '🟠' };
      case 'opcional':
        return { bg: 'bg-green-950/40 text-green-400 border-green-900/60', label: 'Opcional', emoji: '🟢' };
      case 'prescindible':
        return { bg: 'bg-zinc-800/40 text-zinc-400 border-zinc-700/60', label: 'Prescindible', emoji: '⚪' };
      default:
        return { bg: 'bg-zinc-800/40 text-zinc-400 border-zinc-700/60', label: 'Opcional', emoji: '🟢' };
    }
  };

  const getStatusBadge = (status: ComicImport['estadoLectura']) => {
    switch (status) {
      case 'pendiente':
        return { text: 'text-zinc-500 hover:text-green-400', label: 'Pendiente', dot: 'bg-zinc-600' };
      case 'leyendo':
        return { text: 'text-amber-400 hover:text-green-400', label: 'Leyendo', dot: 'bg-amber-400 animate-pulse' };
      case 'leido':
        return { text: 'text-green-400 hover:text-zinc-500', label: 'Leído', dot: 'bg-green-500' };
      case 'saltado':
        return { text: 'text-zinc-400 line-through', label: 'Saltado', dot: 'bg-zinc-500' };
    }
  };

  const badge = getImportanceBadge(comic.importancia);
  const status = getStatusBadge(comic.estadoLectura);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group relative bg-ultimate-card border ${isSelected ? 'border-ultimate-gold shadow-gold-glow' : 'border-white/5 hover:border-ultimate-accent/50 hover:shadow-card-hover'} rounded-xl overflow-hidden transition-all duration-300 flex flex-col`}
    >
      {/* Cover Image Area */}
      <div className="relative aspect-[2/3] w-full bg-zinc-950/60 overflow-hidden flex items-center justify-center border-b border-white/5">
        {comic.portadaUrl ? (
          <img 
            src={comic.portadaUrl} 
            alt={comic.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/300x450/111827/ffffff?text=Portada+Pendiente';
            }}
          />
        ) : (
          <div className="text-center p-4 text-white/30 flex flex-col items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-wider text-zinc-500">{comic.serie}</span>
            <span className="text-2xl font-extrabold text-zinc-600">{comic.numero}</span>
          </div>
        )}

        {/* Floating Index Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <span className="px-2 py-0.5 bg-black/85 backdrop-blur border border-white/10 rounded text-[10px] font-mono font-bold text-white">
            LEC #{String(comic.ordenLectura).padStart(4, '0')}
          </span>
          <span className="px-2 py-0.5 bg-zinc-900/85 backdrop-blur border border-white/5 rounded text-[10px] font-mono text-zinc-400">
            ARC #{String(comic.ordenArchivoDisplay)}
          </span>
        </div>

        {/* Selection Checkbox */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <input 
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(comic.id || '', e.target.checked)}
            className="w-5 h-5 rounded border-white/20 bg-black/85 text-ultimate-accent focus:ring-ultimate-accent cursor-pointer"
          />
        </div>

        {/* Hover Controls Overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-3 p-4 z-25">
          <button
            onClick={() => onEdit(comic)}
            className="px-4 py-2 bg-ultimate-accent hover:bg-red-700 text-white rounded-md text-xs font-bold transition-all shadow-lg flex items-center gap-1"
          >
            <Edit size={12} /> Editar Info
          </button>

          <button
            onClick={() => onToggleRead(comic)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-bold transition-all shadow-lg flex items-center gap-1"
          >
            {comic.estadoLectura === 'leido' ? 'Marcar Pendiente' : 'Marcar Leído'}
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => onMoveUp(comic)}
              title="Subir posición"
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-white transition-colors"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={() => onMoveDown(comic)}
              title="Bajar posición"
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-white transition-colors"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {/* DND handle handle */}
          {isDraggable && (
            <div 
              {...attributes} 
              {...listeners}
              className="p-2 cursor-grab active:cursor-grabbing text-white/40 hover:text-white transition-colors"
              title="Arrastrar para ordenar"
            >
              <GripVertical size={20} />
            </div>
          )}
        </div>
      </div>

      {/* Details Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block truncate">{comic.serie}</span>
          <h4 className="text-sm font-bold text-white line-clamp-2 mt-0.5 leading-snug" title={comic.titulo}>
            {comic.titulo}
          </h4>
        </div>

        <div className="space-y-1.5">
          {/* Importance & Type */}
          <div className="flex flex-wrap gap-1">
            <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded-full flex items-center gap-1 ${badge.bg}`}>
              <span>{badge.emoji}</span> {badge.label}
            </span>
            <span className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-300 rounded-full font-medium">
              {comic.tipo}
            </span>
          </div>

          {/* Status and warnings */}
          <div className="flex justify-between items-center pt-1 text-xs">
            <button
              type="button"
              onClick={() => onToggleRead(comic)}
              className={`flex items-center gap-1.5 font-medium transition-colors ${status.text}`}
              title="Alternar estado de lectura"
            >
              <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
              {status.label}
            </button>
            {comic.pendienteEscaneo && (
              <span className="text-yellow-500 flex items-center gap-0.5 text-[10px] font-bold" title="Pendiente de escaneo">
                <AlertCircle size={10} /> Escaneo
              </span>
            )}
            {comic.esParalelo && (
              <span className="text-blue-400 text-[10px] font-bold uppercase tracking-wider bg-blue-950/20 px-1 border border-blue-900/40 rounded">
                Paralelo
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
