import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ComicImport } from '../utils/parser';
import { ChevronUp, ChevronDown, Edit, AlertCircle, GripVertical } from 'lucide-react';

interface ComicCardProps {
  comic: ComicImport;
  onEdit: (comic: ComicImport) => void;
  onMoveUp: (comic: ComicImport) => void;
  onMoveDown: (comic: ComicImport) => void;
  onSelect: (id: string, selected: boolean) => void;
  onToggleRead: (comic: ComicImport) => void;
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
  isSelected,
  isDraggable = true
}: ComicCardProps) {
  
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
      className={`group relative bg-ultimate-card border ${isSelected ? 'border-ultimate-gold shadow-gold-glow' : 'border-white/5 hover:border-ultimate-accent/50 hover:shadow-card-hover'} rounded-xl p-4 transition-all duration-300 flex flex-col justify-between space-y-4`}
    >
      {/* Top Header info */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1">
          <span className="px-2 py-0.5 w-fit bg-black/85 border border-white/10 rounded text-[10px] font-mono font-bold text-white">
            LEC #{String(comic.ordenLectura).padStart(4, '0')}
          </span>
          <span className="px-2 py-0.5 w-fit bg-zinc-900/85 border border-white/5 rounded text-[10px] font-mono text-zinc-400">
            ARC #{String(comic.ordenArchivoDisplay)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Selection Checkbox */}
          <input 
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(comic.id || '', e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-black/85 text-ultimate-accent focus:ring-ultimate-accent cursor-pointer"
          />
        </div>
      </div>

      {/* Main Details */}
      <div className="space-y-1">
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block truncate">{comic.serie}</span>
        <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug" title={comic.titulo}>
          {comic.titulo}
        </h4>
      </div>

      {/* Badges and Tags */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-wrap gap-1">
          <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded-full flex items-center gap-1 ${badge.bg}`}>
            <span>{badge.emoji}</span> {badge.label}
          </span>
          <span className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-300 rounded-full font-medium">
            {comic.tipo}
          </span>
        </div>

        {/* Status Actions */}
        <div className="flex justify-between items-center text-xs pt-1 border-t border-white/5">
          <button
            type="button"
            onClick={() => onToggleRead(comic)}
            className={`flex items-center gap-1.5 font-medium transition-colors ${status.text}`}
            title="Alternar estado de lectura"
          >
            <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
            {status.label}
          </button>
          
          <div className="flex items-center gap-1">
            {comic.pendienteEscaneo && (
              <span className="text-yellow-500 mr-1" title="Pendiente de escaneo">
                <AlertCircle size={12} />
              </span>
            )}
            {comic.esParalelo && (
              <span className="text-blue-400 text-[9px] font-bold uppercase tracking-wider bg-blue-950/20 px-1 border border-blue-900/40 rounded">
                Paralelo
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hover overlay with action buttons only */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-20">
        <button
          onClick={() => onEdit(comic)}
          title="Editar Info"
          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-white transition-colors"
        >
          <Edit size={12} />
        </button>
        <button
          onClick={() => onMoveUp(comic)}
          title="Subir posición"
          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-white transition-colors"
        >
          <ChevronUp size={12} />
        </button>
        <button
          onClick={() => onMoveDown(comic)}
          title="Bajar posición"
          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-white transition-colors"
        >
          <ChevronDown size={12} />
        </button>
        {isDraggable && (
          <div 
            {...attributes} 
            {...listeners}
            className="p-1.5 cursor-grab active:cursor-grabbing bg-zinc-800 hover:bg-zinc-700 rounded text-white/50 hover:text-white transition-colors"
            title="Arrastrar para ordenar"
          >
            <GripVertical size={12} />
          </div>
        )}
      </div>
    </div>
  );
}
