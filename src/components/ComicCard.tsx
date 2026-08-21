import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ComicImport } from '../utils/parser';
import { ChevronUp, ChevronDown, Edit, AlertCircle, GripVertical, CheckCircle2, Circle, MessageSquare } from 'lucide-react';

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
      border: 'border-red-500/10 group-hover:border-red-500/50',
      glow: 'shadow-[0_4px_20px_rgba(239,68,68,0.04)]',
      text: 'text-red-400/90',
      bgGrad: 'from-red-950/10'
    };
  }
  if (s.includes('x-men') || s.includes('xmen') || s.includes('wolverine') || s.includes('ultimate x')) {
    return {
      border: 'border-yellow-500/10 group-hover:border-yellow-500/50',
      glow: 'shadow-[0_4px_20px_rgba(234,179,8,0.04)]',
      text: 'text-yellow-400/80',
      bgGrad: 'from-yellow-950/10'
    };
  }
  if (s.includes('fantastic four') || s.includes('ultimate ff') || s.includes('xfour')) {
    return {
      border: 'border-blue-500/10 group-hover:border-blue-500/50',
      glow: 'shadow-[0_4px_20px_rgba(59,130,246,0.04)]',
      text: 'text-blue-400/90',
      bgGrad: 'from-blue-950/10'
    };
  }
  if (s.includes('ultimates') || s.includes('avengers')) {
    return {
      border: 'border-purple-500/10 group-hover:border-purple-500/50',
      glow: 'shadow-[0_4px_20px_rgba(168,85,247,0.04)]',
      text: 'text-purple-400/90',
      bgGrad: 'from-purple-950/10'
    };
  }
  if (s.includes('team-up') || s.includes('teamup') || s.includes('zombies')) {
    return {
      border: 'border-green-500/10 group-hover:border-green-500/50',
      glow: 'shadow-[0_4px_20px_rgba(34,197,94,0.04)]',
      text: 'text-green-400/95',
      bgGrad: 'from-green-950/10'
    };
  }
  return {
    border: 'border-white/5 group-hover:border-zinc-500/30',
    glow: 'shadow-none',
    text: 'text-zinc-400',
    bgGrad: 'from-zinc-950/5'
  };
};

const getImportanceStripe = (importance: ComicImport['importancia']) => {
  switch (importance) {
    case 'imprescindible':
      return 'border-l-4 border-l-red-500';
    case 'evento':
      return 'border-l-4 border-l-purple-500';
    case 'importante':
      return 'border-l-4 border-l-orange-500';
    case 'opcional':
      return 'border-l-4 border-l-green-500';
    case 'prescindible':
      return 'border-l-4 border-l-zinc-650';
    default:
      return 'border-l-4 border-l-zinc-600';
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
  const seriesTheme = getSeriesColorTheme(comic.serie);
  const stripeClass = getImportanceStripe(comic.importancia);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group relative bg-gradient-to-b ${seriesTheme.bgGrad} to-black/90 border ${
        isSelected ? 'border-ultimate-gold shadow-gold-glow' : 
        isRead ? `border-green-500/10 ${seriesTheme.glow}` : `${seriesTheme.border} ${seriesTheme.glow}`
      } ${stripeClass} rounded-xl p-4 transition-all duration-300 flex flex-col justify-between gap-3 select-none`}
    >
      {/* Top Header info - Clean & Simple */}
      <div className="flex justify-between items-center">
        <span className={`px-2 py-0.5 bg-black/80 border ${isRead ? 'border-green-500/20 text-green-400' : 'border-white/5 text-white/80'} rounded text-[10px] font-mono font-bold transition-colors`}>
          LEC #{String(comic.ordenLectura).padStart(4, '0')}
        </span>
        
        {/* Subtle tags */}
        <div className="flex items-center gap-1.5">
          {comic.esParalelo && (
            <span className="px-1.5 py-0.5 bg-blue-950/20 border border-blue-900/40 text-blue-400/90 rounded text-[8px] font-extrabold uppercase tracking-wider">
              Paralelo
            </span>
          )}
          {comic.pendienteEscaneo && (
            <span className="text-yellow-500" title="Pendiente de escaneo">
              <AlertCircle size={12} />
            </span>
          )}
        </div>
      </div>

      {/* Main Details - Clutter-free titles */}
      <div className="flex-1 space-y-1">
        <span className={`text-[10px] font-black uppercase tracking-widest block truncate ${seriesTheme.text}`}>
          {comic.serie}
        </span>
        <h4 className="text-sm font-extrabold text-white leading-tight group-hover:text-ultimate-gold transition-colors line-clamp-2" title={comic.titulo}>
          {comic.titulo}
        </h4>

        {/* Milestone / Custom Notes - single line preview to avoid clutter */}
        {comic.notas ? (
          <p className="text-[10px] text-zinc-500 italic line-clamp-1 flex items-center gap-1 pt-1" title={comic.notas}>
            <MessageSquare size={10} className="flex-shrink-0" />
            <span>{comic.notas}</span>
          </p>
        ) : null}
      </div>

      {/* Status Bar Trigger */}
      <div>
        <button
          type="button"
          onClick={() => onToggleRead(comic)}
          className={`w-full py-2 rounded-lg flex items-center justify-center gap-1.5 border text-xs font-bold transition-all ${
            isRead 
              ? 'bg-green-950/20 hover:bg-green-900/35 text-green-450 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
              : 'bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-550 hover:text-white border-white/5'
          }`}
        >
          {isRead ? (
            <>
              <CheckCircle2 size={13} className="fill-green-400/10 text-green-400" />
              <span className="text-green-400">Leído</span>
            </>
          ) : (
            <>
              <Circle size={13} className="text-zinc-500" />
              <span>Pendiente</span>
            </>
          )}
        </button>
      </div>

      {/* Hover action menu - contains file info and checkbox to keep default card clean */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 z-20">
        {/* Selection checkbox shown on hover */}
        <input 
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(comic.id || '', e.target.checked)}
          className="w-4 h-4 rounded border-white/30 bg-zinc-900 text-ultimate-accent focus:ring-ultimate-accent cursor-pointer mr-1"
        />

        <button
          onClick={() => onEdit(comic)}
          title="Editar"
          className="p-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded text-white"
        >
          <Edit size={11} />
        </button>
        <button
          onClick={() => onMoveUp(comic)}
          title="Subir"
          className="p-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded text-white"
        >
          <ChevronUp size={11} />
        </button>
        <button
          onClick={() => onMoveDown(comic)}
          title="Bajar"
          className="p-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded text-white"
        >
          <ChevronDown size={11} />
        </button>
        {isDraggable && (
          <div 
            {...attributes} 
            {...listeners}
            className="p-1 cursor-grab active:cursor-grabbing bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded text-white/50"
            title="Arrastrar"
          >
            <GripVertical size={11} />
          </div>
        )}
      </div>
    </div>
  );
}
