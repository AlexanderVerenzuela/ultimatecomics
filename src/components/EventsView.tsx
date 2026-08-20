import React, { useState } from 'react';
import { ComicImport } from '../utils/parser';
import { Plus, Trash2, Folder, Image as ImageIcon } from 'lucide-react';

interface EventsViewProps {
  comics: ComicImport[];
  onUpdateMultiple: (updated: ComicImport[]) => void;
}

interface EventBlock {
  id: string;
  name: string;
  description: string;
}

export default function EventsView({ comics, onUpdateMultiple }: EventsViewProps) {
  const [eventBlocks, setEventBlocks] = useState<EventBlock[]>([
    { id: 'inicio', name: 'INICIO DEL UNIVERSO ULTIMATE', description: 'El origen de Spider-Man, X-Men y The Ultimates' },
    { id: 'ultimate_war', name: 'ULTIMATE WAR', description: 'El conflicto entre Ultimates y X-Men' },
    { id: 'ultimatum', name: 'ULTIMATUM', description: 'El evento devastador de Magneto' },
    { id: 'cataclysm', name: 'CATACLYSM', description: 'La llegada de Galactus de la Tierra-616' }
  ]);

  const [newEventName, setNewEventName] = useState('');
  const [selectedComicId, setSelectedComicId] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('inicio');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim()) return;
    const newEvent: EventBlock = {
      id: `event-${Date.now()}`,
      name: newEventName.trim().toUpperCase(),
      description: 'Bloque de lectura personalizado.'
    };
    setEventBlocks(prev => [...prev, newEvent]);
    setNewEventName('');
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este bloque de eventos? Los cómics dentro volverán a estar sin grupo.')) {
      setEventBlocks(prev => prev.filter(e => e.id !== id));
      // Remove group reference from comics
      const updated = comics.map(c => {
        if (c.grupoEvento === id) {
          return { ...c, grupoEvento: undefined };
        }
        return c;
      });
      onUpdateMultiple(updated);
    }
  };

  const handleAssignComic = () => {
    if (!selectedComicId) return;
    const updated = comics.map(c => {
      if (c.id === selectedComicId) {
        return { ...c, grupoEvento: selectedEventId };
      }
      return c;
    });
    onUpdateMultiple(updated);
    setSelectedComicId('');
  };

  const handleRemoveFromEvent = (comicId: string) => {
    const updated = comics.map(c => {
      if (c.id === comicId) {
        return { ...c, grupoEvento: undefined };
      }
      return c;
    });
    onUpdateMultiple(updated);
  };

  // Get comics that don't belong to any event for the selector
  const unassignedComics = comics
    .filter(c => !c.grupoEvento)
    .sort((a, b) => a.ordenLectura - b.ordenLectura);

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h2 className="text-2xl font-bold">Eventos y Bloques de Lectura</h2>
        <p className="text-sm text-zinc-400 mt-1">Agrupa tus cómics en grandes sagas y eventos del Universo Ultimate.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creator panel */}
        <div className="bg-ultimate-card border border-white/5 p-5 rounded-xl space-y-6 h-fit">
          <form onSubmit={handleAddEvent} className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">Crear Nuevo Bloque</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="Nombre del evento (ej: SPIDER-VERSE)..."
                className="flex-1 px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs focus:outline-none focus:border-ultimate-accent"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-ultimate-accent hover:bg-red-700 rounded-md text-xs font-bold transition-colors flex items-center gap-0.5"
              >
                <Plus size={14} /> Crear
              </button>
            </div>
          </form>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">Asignar Cómic a Bloque</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">Seleccionar Cómic</label>
                <select
                  value={selectedComicId}
                  onChange={(e) => setSelectedComicId(e.target.value)}
                  className="w-full p-2 bg-zinc-900 border border-white/10 rounded-md text-xs focus:outline-none focus:border-ultimate-accent"
                >
                  <option value="">-- Elige un cómic --</option>
                  {unassignedComics.slice(0, 150).map(c => (
                    <option key={c.id} value={c.id}>
                      #{String(c.ordenLectura).padStart(4, '0')} - {c.titulo}
                    </option>
                  ))}
                </select>
                {unassignedComics.length > 150 && (
                  <span className="text-[10px] text-zinc-500 mt-1 block">Mostrando los primeros 150 cómics pendientes de asignar.</span>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">Seleccionar Bloque</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full p-2 bg-zinc-900 border border-white/10 rounded-md text-xs focus:outline-none"
                >
                  {eventBlocks.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>

              <button
                type="button"
                onClick={handleAssignComic}
                disabled={!selectedComicId}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-md text-xs font-bold transition-all text-center"
              >
                Añadir al Bloque
              </button>
            </div>
          </div>
        </div>

        {/* Blocks display */}
        <div className="lg:col-span-2 space-y-6">
          {eventBlocks.map(block => {
            const blockComics = comics
              .filter(c => c.grupoEvento === block.id)
              .sort((a, b) => a.ordenLectura - b.ordenLectura);

            return (
              <div key={block.id} className="bg-ultimate-card border border-white/5 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Folder className="text-ultimate-accent" size={20} />
                    <div>
                      <h3 className="font-extrabold text-white text-base">{block.name}</h3>
                      <p className="text-xs text-zinc-400">{block.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(block.id)}
                    className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                    title="Eliminar bloque"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {blockComics.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No hay cómics en este evento. Usa el panel de asignación para agregar cómics.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto pr-1">
                    {blockComics.map(comic => (
                      <div key={comic.id} className="relative group p-2 bg-black/40 border border-white/5 rounded-lg flex gap-2 items-center">
                        <div className="w-8 h-12 bg-zinc-900 rounded overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/10">
                          {comic.portadaUrl ? (
                            <img src={comic.portadaUrl} alt="capa" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={12} className="text-zinc-700" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white truncate">{comic.titulo}</h4>
                          <span className="text-[9px] text-zinc-500 font-mono block">Order #{comic.ordenLectura}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFromEvent(comic.id || '')}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 bg-black/60 rounded text-zinc-400 hover:text-red-400 transition-all text-[9px]"
                          title="Quitar del bloque"
                        >
                          Quitar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
