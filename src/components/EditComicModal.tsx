import React, { useState, useEffect } from 'react';
import { ComicImport } from '../utils/parser';
import { X } from 'lucide-react';

interface EditComicModalProps {
  comic: ComicImport;
  onClose: () => void;
  onSave: (updatedComic: ComicImport) => void;
}

export default function EditComicModal({ comic, onClose, onSave }: EditComicModalProps) {
  const [edited, setEdited] = useState<ComicImport>({ ...comic });

  useEffect(() => {
    setEdited({ ...comic });
  }, [comic]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setEdited(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(edited);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-ultimate-card border border-white/10 rounded-xl shadow-2xl p-6 text-white">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-ultimate-accent mb-6">Editar Cómic</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Título</label>
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

          <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
