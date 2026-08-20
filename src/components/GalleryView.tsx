import React, { useState } from 'react';
import { ComicImport } from '../utils/parser';
import ComicCard from './ComicCard';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Search, SlidersHorizontal, Trash2, CheckSquare, Square, RefreshCw, MoveUp, MoveDown } from 'lucide-react';

interface GalleryViewProps {
  comics: ComicImport[];
  onUpdateComic: (comic: ComicImport) => void;
  onUpdateMultiple: (updated: ComicImport[]) => void;
  onEditComic: (comic: ComicImport) => void;
  recalculateOrder: (list: ComicImport[]) => void;
}

export default function GalleryView({
  comics,
  onUpdateComic,
  onUpdateMultiple,
  onEditComic,
  recalculateOrder
}: GalleryViewProps) {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSerie, setSelectedSerie] = useState('All');
  const [selectedImportancia, setSelectedImportancia] = useState('All');
  const [selectedTipo, setSelectedTipo] = useState('All');
  const [selectedEstado, setSelectedEstado] = useState('All');
  const [showParalelos, setShowParalelos] = useState('All'); // 'All' | 'Yes' | 'No'
  const [showPendienteEscaneo, setShowPendienteEscaneo] = useState('All'); // 'All' | 'Yes' | 'No'
  const [showFilters, setShowFilters] = useState(false);

  // Pagination / Load more (since 854 is huge)
  const [visibleCount, setVisibleCount] = useState(48);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sensors for Drag and Drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoid triggering drag on simple click
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Extract unique series/types for filters
  const series = Array.from(new Set(comics.map(c => c.serie))).sort();
  const tipos = Array.from(new Set(comics.map(c => c.tipo))).sort();

  // Filter logic
  const filteredComics = comics.filter(comic => {
    const matchesSearch = comic.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comic.nombreArchivo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSerie = selectedSerie === 'All' || comic.serie === selectedSerie;
    const matchesImportancia = selectedImportancia === 'All' || comic.importancia === selectedImportancia;
    const matchesTipo = selectedTipo === 'All' || comic.tipo === selectedTipo;
    const matchesEstado = selectedEstado === 'All' || comic.estadoLectura === selectedEstado;
    
    const matchesParalelo = showParalelos === 'All' || 
      (showParalelos === 'Yes' && comic.esParalelo) || 
      (showParalelos === 'No' && !comic.esParalelo);
      
    const matchesEscaneo = showPendienteEscaneo === 'All' || 
      (showPendienteEscaneo === 'Yes' && comic.pendienteEscaneo) || 
      (showPendienteEscaneo === 'No' && !comic.pendienteEscaneo);

    return matchesSearch && matchesSerie && matchesImportancia && matchesTipo && matchesEstado && matchesParalelo && matchesEscaneo;
  });

  const displayComics = filteredComics.slice(0, visibleCount);

  // Drag and Drop ordering handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Find the elements in the full list
    const activeIndex = comics.findIndex(c => c.id === active.id);
    const overIndex = comics.findIndex(c => c.id === over.id);

    if (activeIndex !== -1 && overIndex !== -1) {
      const reordered = arrayMove(comics, activeIndex, overIndex);
      recalculateOrder(reordered);
    }
  };

  const handleMoveUp = (comic: ComicImport) => {
    const index = comics.findIndex(c => c.id === comic.id);
    if (index > 0) {
      const reordered = arrayMove(comics, index, index - 1);
      recalculateOrder(reordered);
    }
  };

  const handleMoveDown = (comic: ComicImport) => {
    const index = comics.findIndex(c => c.id === comic.id);
    if (index !== -1 && index < comics.length - 1) {
      const reordered = arrayMove(comics, index, index + 1);
      recalculateOrder(reordered);
    }
  };

  // Multi-select mechanics
  const handleSelectOne = (id: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleSelectAll = () => {
    const visibleIds = displayComics.map(c => c.id || '');
    const allVisibleSelected = visibleIds.every(id => selectedIds.includes(id));

    if (allVisibleSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Bulk actions
  const handleBulkStatusChange = (status: ComicImport['estadoLectura']) => {
    const updated = comics.map(c => {
      if (c.id && selectedIds.includes(c.id)) {
        return { ...c, estadoLectura: status };
      }
      return c;
    });
    onUpdateMultiple(updated);
    setSelectedIds([]);
  };

  const handleBulkImportanceChange = (imp: ComicImport['importancia']) => {
    const updated = comics.map(c => {
      if (c.id && selectedIds.includes(c.id)) {
        return { ...c, importancia: imp };
      }
      return c;
    });
    onUpdateMultiple(updated);
    setSelectedIds([]);
  };

  const handleBulkMove = (targetPosition: number) => {
    if (selectedIds.length === 0) return;
    const pos = Math.max(1, Math.min(comics.length, targetPosition));

    // Sort selected comics by their current order
    const selectedComics = comics.filter(c => c.id && selectedIds.includes(c.id));
    const remainingComics = comics.filter(c => !c.id || !selectedIds.includes(c.id));

    // Insert selected at the target index (0-indexed)
    const targetIdx = pos - 1;
    const reordered = [
      ...remainingComics.slice(0, targetIdx),
      ...selectedComics,
      ...remainingComics.slice(targetIdx)
    ];

    recalculateOrder(reordered);
    setSelectedIds([]);
  };

  const isDndActive = searchTerm === '' && 
                     selectedSerie === 'All' && 
                     selectedImportancia === 'All' && 
                     selectedTipo === 'All' && 
                     selectedEstado === 'All' && 
                     showParalelos === 'All' && 
                     showPendienteEscaneo === 'All';

  const handleToggleRead = (comic: ComicImport) => {
    const updated = {
      ...comic,
      estadoLectura: (comic.estadoLectura === 'leido' ? 'pendiente' : 'leido') as ComicImport['estadoLectura']
    };
    onUpdateComic(updated);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Top filter bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 text-zinc-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título o archivo..."
            className="w-full pl-10 pr-4 py-2 bg-ultimate-card border border-white/10 rounded-lg text-sm focus:outline-none focus:border-ultimate-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
              showFilters ? 'bg-ultimate-accent border-ultimate-accent text-white' : 'bg-ultimate-card border-white/10 text-zinc-300 hover:border-white/20'
            }`}
          >
            <SlidersHorizontal size={16} /> Filtros Avanzados
          </button>

          <button
            onClick={() => recalculateOrder([...comics].sort((a, b) => a.ordenArchivo - b.ordenArchivo))}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors"
            title="Restablecer al orden original del archivo"
          >
            <RefreshCw size={14} /> Restaurar Orden
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="p-5 bg-ultimate-card border border-white/5 rounded-xl grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
          <div>
            <label className="block text-zinc-400 font-bold uppercase mb-1.5">Serie</label>
            <select
              value={selectedSerie}
              onChange={(e) => setSelectedSerie(e.target.value)}
              className="w-full p-2 bg-zinc-900 border border-white/10 rounded-md focus:outline-none focus:border-ultimate-accent"
            >
              <option value="All">Todas</option>
              {series.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 font-bold uppercase mb-1.5">Importancia</label>
            <select
              value={selectedImportancia}
              onChange={(e) => setSelectedImportancia(e.target.value)}
              className="w-full p-2 bg-zinc-900 border border-white/10 rounded-md focus:outline-none focus:border-ultimate-accent"
            >
              <option value="All">Todas</option>
              <option value="imprescindible">🔴 Imprescindible</option>
              <option value="importante">🟠 Importante</option>
              <option value="opcional">🟢 Opcional</option>
              <option value="prescindible">⚪ Prescindible</option>
              <option value="evento">💥 Evento</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 font-bold uppercase mb-1.5">Tipo</label>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="w-full p-2 bg-zinc-900 border border-white/10 rounded-md focus:outline-none focus:border-ultimate-accent"
            >
              <option value="All">Todos</option>
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 font-bold uppercase mb-1.5">Estado</label>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="w-full p-2 bg-zinc-900 border border-white/10 rounded-md focus:outline-none focus:border-ultimate-accent"
            >
              <option value="All">Todos</option>
              <option value="pendiente">○ Pendiente</option>
              <option value="leyendo">📖 Leyendo</option>
              <option value="leido">✅ Leído</option>
              <option value="saltado">⏭️ Saltado</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 font-bold uppercase mb-1.5">Paralelos</label>
            <select
              value={showParalelos}
              onChange={(e) => setShowParalelos(e.target.value)}
              className="w-full p-2 bg-zinc-900 border border-white/10 rounded-md focus:outline-none focus:border-ultimate-accent"
            >
              <option value="All">Todos</option>
              <option value="Yes">Solo Paralelos</option>
              <option value="No">Excluir Paralelos</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 font-bold uppercase mb-1.5">Escaneo</label>
            <select
              value={showPendienteEscaneo}
              onChange={(e) => setShowPendienteEscaneo(e.target.value)}
              className="w-full p-2 bg-zinc-900 border border-white/10 rounded-md focus:outline-none focus:border-ultimate-accent"
            >
              <option value="All">Todos</option>
              <option value="Yes">Pendientes de Escaneo</option>
              <option value="No">Escaneados</option>
            </select>
          </div>
        </div>
      )}

      {/* Bulk actions and multi-select bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-zinc-950/40 border border-white/5 rounded-xl">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            {displayComics.length > 0 && displayComics.every(c => selectedIds.includes(c.id || '')) ? (
              <>
                <CheckSquare size={16} className="text-ultimate-accent" /> Deseleccionar todo
              </>
            ) : (
              <>
                <Square size={16} /> Seleccionar todo ({displayComics.length})
              </>
            )}
          </button>
          {selectedIds.length > 0 && (
            <span className="text-xs text-ultimate-accent font-bold px-2 py-0.5 bg-ultimate-accent/10 border border-ultimate-accent/20 rounded font-mono">
              {selectedIds.length} seleccionados
            </span>
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <span className="text-zinc-500 font-bold uppercase text-[10px]">Acciones en lote:</span>
            
            {/* Status change */}
            <select
              onChange={(e) => handleBulkStatusChange(e.target.value as ComicImport['estadoLectura'])}
              defaultValue=""
              className="bg-zinc-900 border border-white/10 rounded-md p-1.5 text-white/80 focus:outline-none"
            >
              <option value="" disabled>Cambiar estado...</option>
              <option value="pendiente">○ Pendiente</option>
              <option value="leyendo">📖 Leyendo</option>
              <option value="leido">✅ Leído</option>
              <option value="saltado">⏭️ Saltado</option>
            </select>

            {/* Importance change */}
            <select
              onChange={(e) => handleBulkImportanceChange(e.target.value as ComicImport['importancia'])}
              defaultValue=""
              className="bg-zinc-900 border border-white/10 rounded-md p-1.5 text-white/80 focus:outline-none"
            >
              <option value="" disabled>Cambiar importancia...</option>
              <option value="imprescindible">🔴 Imprescindible</option>
              <option value="importante">🟠 Importante</option>
              <option value="opcional">🟢 Opcional</option>
              <option value="prescindible">⚪ Prescindible</option>
              <option value="evento">💥 Evento</option>
            </select>

            {/* Move to order position */}
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Mover al orden..."
                id="bulkMoveOrderInput"
                className="w-24 bg-zinc-900 border border-white/10 rounded-md p-1.5 text-white/80 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = parseInt((e.target as HTMLInputElement).value, 10);
                    if (!isNaN(val)) handleBulkMove(val);
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById('bulkMoveOrderInput') as HTMLInputElement;
                  const val = parseInt(input?.value, 10);
                  if (!isNaN(val)) handleBulkMove(val);
                }}
                className="px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md border border-white/10 text-white font-medium"
              >
                Mover
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid view */}
      {filteredComics.length === 0 ? (
        <div className="text-center py-20 bg-ultimate-card border border-white/5 rounded-xl">
          <p className="text-zinc-500 font-semibold text-lg">No se encontraron cómics con los filtros aplicados.</p>
        </div>
      ) : (
        <>
          {!isDndActive && (
            <div className="px-4 py-2.5 bg-yellow-950/20 border border-yellow-900/40 text-yellow-400 rounded-lg text-xs font-semibold">
              ⚠️ El Drag & Drop para ordenar está deshabilitado mientras se usan filtros de búsqueda o filtros avanzados. Restablece los filtros para reordenar arrastrando.
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToWindowEdges]}
          >
            <SortableContext items={displayComics.map(c => c.id || '')} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {displayComics.map(comic => (
                  <ComicCard
                    key={comic.id}
                    comic={comic}
                    onEdit={onEditComic}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onSelect={handleSelectOne}
                    onToggleRead={handleToggleRead}
                    onAutoFetchCover={onUpdateComic}
                    isSelected={selectedIds.includes(comic.id || '')}
                    isDraggable={isDndActive}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Load more button */}
          {filteredComics.length > visibleCount && (
            <div className="flex justify-center pt-8">
              <button
                onClick={() => setVisibleCount(prev => prev + 48)}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg text-sm font-semibold transition-colors"
              >
                Cargar más cómics ({filteredComics.length - visibleCount} restantes)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
