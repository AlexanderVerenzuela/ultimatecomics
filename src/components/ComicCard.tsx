import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ComicImport } from '../utils/parser';
import { ChevronUp, ChevronDown, Edit, AlertCircle, GripVertical, CheckCircle2, Circle } from 'lucide-react';

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

  const getImportanceDetails = (importance: ComicImport['importancia']) => {
    switch (importance) {
      case 'imprescindible':
        return { bg: 'bg-red-950/30 text-red-400 border-red-900/50', label: 'Imprescindible', dot: 'bg-red-500' };
      case 'evento':
        return { bg: 'bg-purple-950/30 text-purple-400 border-purple-900/50', label: 'Evento', dot: 'bg-purple-500' };
      case 'importante':
        return { bg: 'bg-amber-950/30 text-amber-400 border-amber-900/50', label: 'Recomendado', dot: 'bg-amber-500' };
      case 'opcional':
        return { bg: 'bg-green-950/30 text-green-400 border-green-900/50', label: 'Opcional', dot: 'bg-green-500' };
      case 'prescindible':
        return { bg: 'bg-zinc-800/30 text-zinc-400 border-zinc-700/50', label: 'Prescindible', dot: 'bg-zinc-500' };
      default:
        return { bg: 'bg-zinc-800/30 text-zinc-400 border-zinc-700/50', label: 'Opcional', dot: 'bg-zinc-500' };
    }
  };

  const imp = getImportanceDetails(comic.importancia);
  const isRead = comic.estadoLectura === 'leido';

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group relative bg-gradient-to-b from-ultimate-card to-black/60 border ${
        isSelected ? 'border-ultimate-gold shadow-gold-glow' : 
        isRead ? 'border-green-500/30 hover:border-green-500/60' : 'border-white/5 hover:border-ultimate-accent/50'
      } rounded-xl p-4 transition-all duration-300 flex flex-col justify-between gap-4 select-none`}
    >
      {/* Top Header info */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 bg-black/80 border ${isRead ? 'border-green-500/30 text-green-400' : 'border-white/10 text-white/90'} rounded text-[10px] font-mono font-bold transition-colors`}>
            LEC #{String(comic.ordenLectura).padStart(4, '0')}
          </span>
          <span className="px-1.5 py-0.5 bg-zinc-900/40 text-[9px] font-mono text-zinc-500 rounded">
            ARC #{String(comic.ordenArchivoDisplay)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Selection Checkbox */}
          <input 
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(comic.id || '', e.target.checked)}
            className="w-4 h-4 rounded border-white/10 bg-black/80 text-ultimate-accent focus:ring-ultimate-accent cursor-pointer"
          />
        </div>
      </div>

      {/* Main Details */}
      <div className="flex-1 space-y-1">
        <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block truncate">{comic.serie}</span>
        <h4 className="text-sm font-extrabold text-white leading-tight group-hover:text-ultimate-gold transition-colors line-clamp-2" title={comic.titulo}>
          {comic.titulo}
        </h4>
      </div>

      {/* Badges, Warnings and Toggle Action */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-md flex items-center gap-1 ${imp.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${imp.dot}`} />
            {imp.label}
          </span>
          <span className="px-2 py-0.5 text-[9px] bg-zinc-900/80 text-zinc-400 rounded-md font-semibold border border-white/5">
            {comic.tipo}
          </span>
          {comic.pendienteEscaneo && (
            <span className="text-yellow-500" title="Pendiente de escaneo">
              <AlertCircle size={12} />
            </span>
          )}
          {comic.esParalelo && (
            <span className="px-1.5 py-0.5 bg-blue-950/20 border border-blue-900/40 text-blue-400 rounded text-[8px] font-extrabold uppercase tracking-wider">
              Paralelo
            </span>
          )}
        </div>

        {/* Large, Easy-to-click mark-as-read bar */}
        <button
          type="button"
          onClick={() => onToggleRead(comic)}
          className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 border text-xs font-bold transition-all ${
            isRead 
              ? 'bg-green-950/30 hover:bg-green-900/40 text-green-400 border-green-500/40 shadow-[0_0_12px_rgba(34,197,94,0.15)]' 
              : 'bg-zinc-900/50 hover:bg-zinc-800/80 text-zinc-400 hover:text-white border-white/5 hover:border-white/10'
          }`}
        >
          {isRead ? (
            <>
              <CheckCircle2 size={15} className="fill-green-400/10" />
              <span>Leído</span>
            </>
          ) : (
            <>
              <Circle size={15} />
              <span>Pendiente</span>
            </>
          )}
        </button>
      </div>

      {/* Hover action menu */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-20">
        <button
          onClick={() => onEdit(comic)}
          title="Editar Info"
          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded text-white transition-colors"
        >
          <Edit size={12} />
        </button>
        <button
          onClick={() => onMoveUp(comic)}
          title="Subir posición"
          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded text-white transition-colors"
        >
          <ChevronUp size={12} />
        </button>
        <button
          onClick={() => onMoveDown(comic)}
          title="Bajar posición"
          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded text-white transition-colors"
        >
          <ChevronDown size={12} />
        </button>
        {isDraggable && (
          <div 
            {...attributes} 
            {...listeners}
            className="p-1.5 cursor-grab active:cursor-grabbing bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded text-white/50 hover:text-white transition-colors"
            title="Arrastrar para ordenar"
          >
            <GripVertical size={12} />
          </div>
        )}
      </div>
    </div>
  );
}
