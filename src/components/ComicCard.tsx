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

const getSeriesColorTheme = (serie: string) => {
  const s = serie.toLowerCase();
  if (s.includes('spider-man') || s.includes('spiderman') || s.includes('six')) {
    return {
      border: 'border-red-500/20 group-hover:border-red-500/60',
      glow: 'shadow-[0_4px_20px_rgba(239,68,68,0.06)]',
      text: 'text-red-400',
      bgGrad: 'from-red-950/15'
    };
  }
  if (s.includes('x-men') || s.includes('xmen') || s.includes('wolverine') || s.includes('ultimate x')) {
    return {
      border: 'border-yellow-500/20 group-hover:border-yellow-500/60',
      glow: 'shadow-[0_4px_20px_rgba(234,179,8,0.06)]',
      text: 'text-yellow-400/90',
      bgGrad: 'from-yellow-950/15'
    };
  }
  if (s.includes('fantastic four') || s.includes('ultimate ff') || s.includes('xfour')) {
    return {
      border: 'border-blue-500/20 group-hover:border-blue-500/60',
      glow: 'shadow-[0_4px_20px_rgba(59,130,246,0.06)]',
      text: 'text-blue-400',
      bgGrad: 'from-blue-950/15'
    };
  }
  if (s.includes('ultimates') || s.includes('avengers')) {
    return {
      border: 'border-purple-500/20 group-hover:border-purple-500/60',
      glow: 'shadow-[0_4px_20px_rgba(168,85,247,0.06)]',
      text: 'text-purple-400',
      bgGrad: 'from-purple-950/15'
    };
  }
  if (s.includes('team-up') || s.includes('teamup') || s.includes('zombies')) {
    return {
      border: 'border-green-500/20 group-hover:border-green-500/60',
      glow: 'shadow-[0_4px_20px_rgba(34,197,94,0.06)]',
      text: 'text-green-400',
      bgGrad: 'from-green-950/15'
    };
  }
  return {
    border: 'border-white/5 group-hover:border-zinc-500/40',
    glow: 'shadow-none',
    text: 'text-zinc-400',
    bgGrad: 'from-zinc-950/10'
  };
};

const getImportanceStripe = (importance: ComicImport['importancia']) => {
  switch (importance) {
    case 'imprescindible':
      return { stripe: 'border-l-4 border-l-red-500', labelBg: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Imprescindible', emoji: '🔴' };
    case 'evento':
      return { stripe: 'border-l-4 border-l-purple-500', labelBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Evento', emoji: '💥' };
    case 'importante':
      return { stripe: 'border-l-4 border-l-orange-500', labelBg: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Recomendado', emoji: '🟠' };
    case 'opcional':
      return { stripe: 'border-l-4 border-l-green-500', labelBg: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Opcional', emoji: '🟢' };
    case 'prescindible':
      return { stripe: 'border-l-4 border-l-zinc-500', labelBg: 'bg-zinc-800 text-zinc-400 border-zinc-700', label: 'Prescindible', emoji: '⚪' };
    default:
      return { stripe: 'border-l-4 border-l-zinc-500', labelBg: 'bg-zinc-800 text-zinc-400 border-zinc-700', label: 'Opcional', emoji: '🟢' };
  }
};

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

  const isRead = comic.estadoLectura === 'leido';
  const series = getSeriesColorTheme(comic.serie);
  const imp = getImportanceStripe(comic.importancia);

  const getStatusBadge = (status: ComicImport['estadoLectura']) => {
    switch (status) {
      case 'pendiente':
        return { text: 'text-zinc-500 hover:text-green-400', label: 'Pendiente', dot: 'bg-zinc-650' };
      case 'leyendo':
        return { text: 'text-amber-400 hover:text-green-400', label: 'Leyendo', dot: 'bg-amber-400 animate-pulse' };
      case 'leido':
        return { text: 'text-green-400 hover:text-zinc-500', label: 'Leído', dot: 'bg-green-500' };
      case 'saltado':
        return { text: 'text-zinc-400 line-through', label: 'Saltado', dot: 'bg-zinc-500' };
    }
  };

  const status = getStatusBadge(comic.estadoLectura);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group relative bg-gradient-to-b ${series.bgGrad} to-black/85 border ${
        isSelected ? 'border-ultimate-gold shadow-gold-glow' : 
        isRead ? `border-green-500/20 ${series.glow}` : `${series.border} ${series.glow}`
      } ${imp.stripe} rounded-xl p-4 transition-all duration-300 flex flex-col justify-between gap-4 select-none`}
    >
      {/* Top Header info */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 bg-black/85 border ${isRead ? 'border-green-500/20 text-green-400' : 'border-white/10 text-white/95'} rounded text-[10px] font-mono font-bold transition-colors`}>
            LEC #{String(comic.ordenLectura).padStart(4, '0')}
          </span>
          <span className="px-1.5 py-0.5 bg-zinc-900/60 text-[9px] font-mono text-zinc-500 rounded">
            ARC #{String(comic.ordenArchivoDisplay)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Selection Checkbox */}
          <input 
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(comic.id || '', e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-black/80 text-ultimate-accent focus:ring-ultimate-accent cursor-pointer"
          />
        </div>
      </div>

      {/* Main Details */}
      <div className="flex-1 space-y-1">
        <span className={`text-[10px] font-extrabold uppercase tracking-wider block truncate ${series.text}`}>{comic.serie}</span>
        <h4 className="text-sm font-extrabold text-white leading-tight group-hover:text-ultimate-gold transition-colors line-clamp-2" title={comic.titulo}>
          {comic.titulo}
        </h4>
      </div>

      {/* Badges, Warnings and Toggle Action */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-md flex items-center gap-1 ${imp.labelBg}`}>
            <span>{imp.emoji}</span>
            {imp.label}
          </span>
          <span className="px-2 py-0.5 text-[9px] bg-zinc-900/60 text-zinc-400 rounded-md font-semibold border border-white/5">
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
