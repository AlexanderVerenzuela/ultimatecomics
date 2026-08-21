import React, { useState } from 'react';
import { ComicImport } from '../utils/parser';
import { Image as ImageIcon, Circle, CheckCircle2, Play, BookOpen } from 'lucide-react';

interface TimelineViewProps {
  comics: ComicImport[];
  onEditComic: (comic: ComicImport) => void;
}

export default function TimelineView({ comics, onEditComic }: TimelineViewProps) {
  const [visibleCount, setVisibleCount] = useState(30);

  const displayComics = comics.slice(0, visibleCount);

  const getStatusIcon = (status: ComicImport['estadoLectura']) => {
    switch (status) {
      case 'leido':
        return <CheckCircle2 className="text-green-500 bg-ultimate-dark" size={24} />;
      case 'leyendo':
        return <Play className="text-amber-400 fill-amber-400 bg-ultimate-dark p-0.5" size={24} />;
      case 'saltado':
        return <Circle className="text-zinc-500 bg-ultimate-dark stroke-dashed" size={24} />;
      default:
        return <Circle className="text-zinc-700 bg-ultimate-dark" size={24} fill="currentColor" />;
    }
  };

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Línea de Tiempo de Lectura</h2>
          <p className="text-sm text-zinc-400 mt-1">Sigue el hilo conductor del Universo Ultimate paso a paso.</p>
        </div>
        <div className="text-xs font-mono text-zinc-500">
          Mostrando {displayComics.length} de {comics.length} cómics
        </div>
      </div>

      {comics.length === 0 ? (
        <div className="text-center py-20 bg-ultimate-card border border-white/5 rounded-xl">
          <p className="text-zinc-500 font-semibold text-lg">No hay cómics importados para mostrar en la línea de tiempo.</p>
        </div>
      ) : (
        <div className="relative pl-8 border-l-2 border-zinc-800 space-y-8 py-4 ml-4">
          {displayComics.map((comic) => (
            <div key={comic.id} className="relative group">
              {/* Timeline Connector Dot */}
              <div className="absolute -left-[45px] top-4 z-10 transition-transform duration-300 group-hover:scale-110">
                {getStatusIcon(comic.estadoLectura)}
              </div>

              {/* Card Container */}
              <div className="flex gap-4 p-4 bg-ultimate-card border border-white/5 rounded-xl hover:border-ultimate-accent/40 hover:shadow-card-hover transition-all duration-300">
                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{comic.serie}</span>
                      <span className="text-[10px] font-mono text-zinc-400">Orden #{comic.ordenLectura}</span>
                    </div>
                    <h3 className="font-extrabold text-white text-base group-hover:text-ultimate-accent transition-colors">
                      {comic.titulo}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-1 italic">{comic.notas || 'Sin notas adicionales'}</p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <span className="px-2 py-0.5 text-[10px] font-semibold border rounded-full bg-zinc-800 text-zinc-300 border-zinc-700">
                      {comic.tipo}
                    </span>
                    <button
                      onClick={() => onEditComic(comic)}
                      className="text-xs font-semibold text-ultimate-accent hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Editar Detalles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Load more button */}
          {comics.length > visibleCount && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setVisibleCount(prev => prev + 30)}
                className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg text-sm font-semibold transition-colors"
              >
                Cargar más en la línea de tiempo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
