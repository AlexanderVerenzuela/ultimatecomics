import React, { useState } from 'react';
import { ComicImport } from '../utils/parser';
import { searchCovers } from '../services/coverService';
import { BookOpen, CheckCircle, Clock, AlertTriangle, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';

interface DashboardViewProps {
  comics: ComicImport[];
  onNavigateToView: (view: string) => void;
  onUpdateMultiple: (updated: ComicImport[]) => void;
}

export default function DashboardView({ comics, onNavigateToView, onUpdateMultiple }: DashboardViewProps) {
  const total = comics.length;
  const read = comics.filter(c => c.estadoLectura === 'leido').length;
  const reading = comics.filter(c => c.estadoLectura === 'leyendo').length;
  const pending = comics.filter(c => c.estadoLectura === 'pendiente').length;
  const skipped = comics.filter(c => c.estadoLectura === 'saltado').length;
  const scanPending = comics.filter(c => c.pendienteEscaneo).length;

  const noCoverComics = comics.filter(c => !c.portadaUrl);
  const percentComplete = total > 0 ? Math.round((read / total) * 100) : 0;

  // Auto cover fetcher states
  const [fetching, setFetching] = useState(false);
  const [fetchProgress, setFetchProgress] = useState({ current: 0, total: 0, found: 0 });
  const [stopRequested, setStopRequested] = useState(false);

  const startAutoFetch = async () => {
    if (noCoverComics.length === 0) return;
    setFetching(true);
    setStopRequested(false);
    setFetchProgress({ current: 0, total: noCoverComics.length, found: 0 });

    const updatedComics: ComicImport[] = [];
    
    for (let i = 0; i < noCoverComics.length; i++) {
      if (stopRequested) {
        break;
      }

      const comic = noCoverComics[i];
      setFetchProgress(prev => ({ ...prev, current: i + 1 }));

      try {
        const results = await searchCovers(comic.serie, comic.numero, comic.anio);
        if (results && results.length > 0) {
          const matched = { ...comic, portadaUrl: results[0].imageUrl };
          updatedComics.push(matched);
          setFetchProgress(prev => ({ ...prev, found: prev.found + 1 }));
          
          // Save in batches of 10 to update database and UI progress incrementally
          if (updatedComics.length >= 10 || i === noCoverComics.length - 1) {
            onUpdateMultiple([...updatedComics]);
            updatedComics.length = 0; // Clear array
          }
        }
      } catch (err) {
        console.error(`Error buscando portada para ${comic.titulo}:`, err);
      }

      // Small delay to avoid triggering API rate limit blocks
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Save any remaining updates
    if (updatedComics.length > 0) {
      onUpdateMultiple(updatedComics);
    }
    
    setFetching(false);
  };

  // Breakdown by series
  const seriesStats: { [key: string]: { total: number; read: number } } = {};
  comics.forEach(c => {
    if (!seriesStats[c.serie]) {
      seriesStats[c.serie] = { total: 0, read: 0 };
    }
    seriesStats[c.serie].total += 1;
    if (c.estadoLectura === 'leido') {
      seriesStats[c.serie].read += 1;
    }
  });

  const sortedSeries = Object.entries(seriesStats)
    .map(([name, stat]) => ({
      name,
      total: stat.total,
      read: stat.read,
      percent: Math.round((stat.read / stat.total) * 100)
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8); // Top 8 series by volume

  // Breakdown by importance
  const importanceLabels = {
    imprescindible: { emoji: '🔴', label: 'Imprescindible' },
    importante: { emoji: '🟠', label: 'Importante/Recomendado' },
    opcional: { emoji: '🟢', label: 'Opcional' },
    prescindible: { emoji: '⚪', label: 'Prescindible' },
    evento: { emoji: '💥', label: 'Evento' }
  };

  const importanceStats = {
    imprescindible: { total: 0, read: 0 },
    importante: { total: 0, read: 0 },
    opcional: { total: 0, read: 0 },
    prescindible: { total: 0, read: 0 },
    evento: { total: 0, read: 0 }
  };

  comics.forEach(c => {
    const imp = c.importancia as keyof typeof importanceStats;
    if (importanceStats[imp]) {
      importanceStats[imp].total += 1;
      if (c.estadoLectura === 'leido') {
        importanceStats[imp].read += 1;
      }
    }
  });

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Universo Ultimate Marvel</h1>
          <p className="text-zinc-400 mt-1">Tu centro de lectura personal de la Tierra-1610.</p>
        </div>
        
        <div className="flex gap-2">
          {noCoverComics.length > 0 && total > 0 && !fetching && (
            <button
              onClick={startAutoFetch}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-755 hover:to-indigo-755 text-white rounded-lg font-bold text-sm transition-all shadow-lg flex items-center gap-2"
            >
              <Sparkles size={16} /> Auto-buscar {noCoverComics.length} Portadas
            </button>
          )}

          {fetching && (
            <button
              onClick={() => setStopRequested(true)}
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold text-sm transition-all border border-white/10"
            >
              Detener Auto-búsqueda
            </button>
          )}

          {total === 0 && (
            <button 
              onClick={() => onNavigateToView('import')}
              className="px-5 py-2.5 bg-ultimate-accent hover:bg-red-700 rounded-lg font-bold text-sm transition-colors shadow-premium"
            >
              Importar Cómics
            </button>
          )}
        </div>
      </div>

      {/* Auto fetch covers progress bar */}
      {fetching && (
        <div className="p-5 bg-gradient-to-r from-indigo-950/20 to-purple-950/20 border border-indigo-900/40 rounded-xl space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-2 font-semibold text-indigo-400">
              <Loader2 className="animate-spin" size={16} />
              Buscando portadas en internet...
            </span>
            <span className="font-mono text-zinc-400">
              {fetchProgress.current} / {fetchProgress.total} cómics procesados ({fetchProgress.found} portadas añadidas)
            </span>
          </div>
          <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${(fetchProgress.current / fetchProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-ultimate-card border border-white/5 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono">{total}</div>
            <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Cómics Totales</div>
          </div>
        </div>

        <div className="bg-ultimate-card border border-white/5 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono">{read}</div>
            <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Leídos</div>
          </div>
        </div>

        <div className="bg-ultimate-card border border-white/5 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono">{reading}</div>
            <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Leyendo</div>
          </div>
        </div>

        <div className="bg-ultimate-card border border-white/5 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-lg text-red-400">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-yellow-500">{scanPending}</div>
            <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Sin Escanear</div>
          </div>
        </div>
      </div>

      {/* Progress Wheel and Importance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circle Progress */}
        <div className="bg-ultimate-card border border-white/5 p-6 rounded-xl flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-semibold mb-4 text-white/90">Progreso de Lectura</h3>
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* SVG Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                className="stroke-zinc-800"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                className="stroke-ultimate-accent transition-all duration-500"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * percentComplete) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold font-mono">{percentComplete}%</span>
              <span className="text-xs text-zinc-400 mt-1 uppercase font-semibold">Completado</span>
            </div>
          </div>
          <div className="flex gap-4 mt-6 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-ultimate-accent rounded-full"></span>
              <span>{read} Leídos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-zinc-750 border border-zinc-500 rounded-full"></span>
              <span>{pending} Pendientes</span>
            </div>
            {skipped > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-zinc-500 rounded-full"></span>
                <span>{skipped} Saltados</span>
              </div>
            )}
          </div>
        </div>

        {/* Importance breakdown */}
        <div className="bg-ultimate-card border border-white/5 p-6 rounded-xl lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-white/90">Progreso por Importancia</h3>
          <div className="space-y-3">
            {Object.entries(importanceStats).map(([key, stat]) => {
              const labelInfo = importanceLabels[key as keyof typeof importanceLabels];
              const pct = stat.total > 0 ? Math.round((stat.read / stat.total) * 100) : 0;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>{labelInfo.emoji}</span>
                      <span className="font-medium text-white/80">{labelInfo.label}</span>
                    </span>
                    <span className="text-zinc-400 text-xs font-mono">{stat.read} / {stat.total} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-ultimate-accent rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Series Progress */}
      <div className="bg-ultimate-card border border-white/5 p-6 rounded-xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white/90">Progreso por Series Clave</h3>
          <span className="text-xs text-zinc-400 font-medium">Top 8 por volumen de tomos</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {sortedSeries.map(s => (
            <div key={s.name} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-white/70 truncate max-w-[70%]">{s.name}</span>
                <span className="text-zinc-500 text-xs font-mono">{s.read} / {s.total} tomos ({s.percent}%)</span>
              </div>
              <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-ultimate-accent rounded-full transition-all duration-500" 
                  style={{ width: `${s.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
