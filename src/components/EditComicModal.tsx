import React, { useState, useEffect } from 'react';
import { ComicImport } from '../utils/parser';
import { searchCovers, CoverSearchResult } from '../services/coverService';
import { X, Search, Image as ImageIcon, Link, Upload, Check } from 'lucide-react';

interface EditComicModalProps {
  comic: ComicImport;
  onClose: () => void;
  onSave: (updatedComic: ComicImport) => void;
}

export default function EditComicModal({ comic, onClose, onSave }: EditComicModalProps) {
  const [edited, setEdited] = useState<ComicImport>({ ...comic });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CoverSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    setEdited({ ...comic });
    setSearchQuery(`${comic.serie} ${comic.numero}`);
  }, [comic]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setEdited(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const handleSearchCovers = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await searchCovers(edited.serie, edited.numero, edited.anio);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCover = (url: string) => {
    setEdited(prev => ({ ...prev, portadaUrl: url }));
  };

  const handleApplyCustomUrl = () => {
    if (customUrl.trim()) {
      setEdited(prev => ({ ...prev, portadaUrl: customUrl.trim() }));
      setCustomUrl('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEdited(prev => ({ ...prev, portadaUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(edited);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-ultimate-card border border-white/10 rounded-xl shadow-2xl p-6 text-white">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-ultimate-accent mb-6">Editar Cómic</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cover management */}
          <div className="space-y-6">
            <div className="flex flex-col items-center p-4 bg-black/30 rounded-lg border border-white/5">
              <div className="relative w-48 h-72 bg-zinc-900 border border-white/10 rounded-md overflow-hidden shadow-lg flex items-center justify-center mb-4">
                {edited.portadaUrl ? (
                  <img 
                    src={edited.portadaUrl} 
                    alt={edited.titulo}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/300x450/1e293b/ffffff?text=Portada';
                    }}
                  />
                ) : (
                  <div className="text-center p-4 text-white/40">
                    <ImageIcon className="mx-auto mb-2" size={48} />
                    <span className="text-sm">Sin portada</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-zinc-500 font-mono">Orden de lectura: #{edited.ordenLectura}</span>
            </div>

            {/* Cover URL / Upload */}
            <div className="p-4 bg-black/20 rounded-lg border border-white/5 space-y-4">
              <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <Link size={16} /> Configurar Portada
              </h3>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Pegar URL de portada..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-sm focus:outline-none focus:border-ultimate-accent"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-md text-sm font-medium transition-colors"
                >
                  Aplicar
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-white/40">O subir imagen local:</span>
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-md text-xs font-medium cursor-pointer transition-colors">
                  <Upload size={14} /> Subir Archivo
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>

            {/* Search Covers online */}
            <div className="p-4 bg-black/20 rounded-lg border border-white/5 space-y-3">
              <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <Search size={16} /> Buscar Portada Online
              </h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar en internet..."
                  className="flex-1 px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-sm focus:outline-none focus:border-ultimate-accent"
                />
                <button
                  type="button"
                  onClick={handleSearchCovers}
                  className="px-4 py-1.5 bg-ultimate-accent hover:bg-red-700 rounded-md text-sm font-semibold transition-colors flex items-center gap-1"
                  disabled={searching}
                >
                  {searching ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="grid grid-cols-4 gap-2 pt-2 max-h-40 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => handleSelectCover(result.imageUrl)}
                      className="relative border border-white/10 rounded overflow-hidden aspect-[2/3] hover:border-ultimate-accent transition-colors group"
                    >
                      <img 
                        src={result.imageUrl} 
                        alt="search result" 
                        className="w-full h-full object-cover" 
                      />
                      {edited.portadaUrl === result.imageUrl && (
                        <div className="absolute inset-0 bg-ultimate-accent/50 flex items-center justify-center">
                          <Check size={20} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Metadata Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Título Limpio</label>
              <input 
                type="text" 
                name="titulo"
                value={edited.titulo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md focus:outline-none focus:border-ultimate-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Serie</label>
                <input 
                  type="text" 
                  name="serie"
                  value={edited.serie}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md focus:outline-none focus:border-ultimate-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Número</label>
                <input 
                  type="text" 
                  name="numero"
                  value={edited.numero}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md focus:outline-none focus:border-ultimate-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Orden de Lectura</label>
                <input 
                  type="number" 
                  name="ordenLectura"
                  value={edited.ordenLectura}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md focus:outline-none focus:border-ultimate-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Orden del Archivo</label>
                <input 
                  type="number" 
                  name="ordenArchivo"
                  value={edited.ordenArchivo}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md focus:outline-none focus:border-ultimate-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Importancia</label>
                <select
                  name="importancia"
                  value={edited.importancia}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-md focus:outline-none focus:border-ultimate-accent"
                >
                  <option value="imprescindible">🔴 Imprescindible</option>
                  <option value="importante">🟠 Importante</option>
                  <option value="opcional">🟢 Opcional</option>
                  <option value="prescindible">⚪ Prescindible</option>
                  <option value="evento">💥 Evento</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Estado de Lectura</label>
                <select
                  name="estadoLectura"
                  value={edited.estadoLectura}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-md focus:outline-none focus:border-ultimate-accent"
                >
                  <option value="pendiente">○ Pendiente</option>
                  <option value="leyendo">📖 Leyendo</option>
                  <option value="leido">✅ Leído</option>
                  <option value="saltado">⏭️ Saltado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Tipo</label>
                <input 
                  type="text" 
                  name="tipo"
                  value={edited.tipo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md focus:outline-none focus:border-ultimate-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Año</label>
                <input 
                  type="number" 
                  name="anio"
                  value={edited.anio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md focus:outline-none focus:border-ultimate-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  name="esParalelo"
                  checked={edited.esParalelo}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-zinc-700 bg-black text-ultimate-accent focus:ring-ultimate-accent"
                />
                <span className="text-sm">Es Cómic Paralelo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  name="pendienteEscaneo"
                  checked={edited.pendienteEscaneo}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-zinc-700 bg-black text-ultimate-accent focus:ring-ultimate-accent"
                />
                <span className="text-sm text-yellow-500">Pendiente de Escaneo</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Notas</label>
              <textarea 
                name="notas"
                value={edited.notas}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md focus:outline-none focus:border-ultimate-accent text-sm resize-none"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md font-medium text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-ultimate-accent hover:bg-red-700 rounded-md font-bold text-sm transition-colors shadow-premium"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
