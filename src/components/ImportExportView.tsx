import React, { useState } from 'react';
import { parseComicList, ComicImport } from '../utils/parser';
import { FileText, Download, Upload, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

interface ImportExportViewProps {
  onImportComplete: (comics: ComicImport[]) => void;
  comics: ComicImport[];
}

export default function ImportExportView({ onImportComplete, comics }: ImportExportViewProps) {
  const [inputText, setInputText] = useState('');
  const [previewList, setPreviewList] = useState<ComicImport[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoadTemplate = async () => {
    try {
      const response = await fetch('/orden_comics_ultimate.txt');
      if (!response.ok) {
        throw new Error('No se pudo encontrar el archivo pre-cargado.');
      }
      const text = await response.text();
      setInputText(text);
      setSuccessMsg('¡Colección cargada del archivo local! Revisa la lista abajo.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cargar el archivo de plantilla.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleGeneratePreview = () => {
    if (!inputText.trim()) {
      setErrorMsg('Por favor, pega el listado de cómics primero.');
      return;
    }

    const parsed = parseComicList(inputText);
    if (parsed.length === 0) {
      setErrorMsg('No se pudo interpretar ninguna línea. Comprueba el formato.');
      return;
    }

    setPreviewList(parsed);
    setShowPreview(true);
    setErrorMsg('');
  };

  const handleConfirmImport = () => {
    if (previewList.length === 0) return;
    onImportComplete(previewList);
    setSuccessMsg(`¡Importación exitosa de ${previewList.length} cómics!`);
    setInputText('');
    setPreviewList([]);
    setShowPreview(false);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    if (comics.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(comics, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ultimate_marvel_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCSV = () => {
    if (comics.length === 0) return;
    const headers = ['Orden Lectura', 'Orden Archivo', 'Título', 'Serie', 'Número', 'Importancia', 'Tipo', 'Estado', 'Paralelo', 'Falta Escaneo', 'Notas'];
    const rows = comics.map(c => [
      c.ordenLectura,
      c.ordenArchivoDisplay,
      `"${c.titulo.replace(/"/g, '""')}"`,
      `"${c.serie.replace(/"/g, '""')}"`,
      `"${c.numero.replace(/"/g, '""')}"`,
      c.importancia,
      c.tipo,
      c.estadoLectura,
      c.esParalelo ? 'SI' : 'NO',
      c.pendienteEscaneo ? 'SI' : 'NO',
      `"${(c.notas || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `ultimate_marvel_lista_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Backup file
  const handleImportJSONFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = JSON.parse(event.target?.result as string);
        if (Array.isArray(result) && result.length > 0 && 'ordenLectura' in result[0]) {
          onImportComplete(result);
          setSuccessMsg(`¡Respaldo importado con éxito! Se cargaron ${result.length} cómics.`);
          setTimeout(() => setSuccessMsg(''), 4000);
        } else {
          setErrorMsg('El formato del respaldo JSON no es válido.');
        }
      } catch (err) {
        setErrorMsg('Error al interpretar el archivo JSON de respaldo.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Importar y Exportar</h2>
        <p className="text-sm text-zinc-400 mt-1">Importa listas de texto, descarga copias de seguridad de tus datos y administra tu colección.</p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/30 border border-red-900/50 text-red-400 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-950/30 border border-green-900/50 text-green-400 text-sm rounded-lg flex items-center gap-2">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import from text panel */}
        <div className="bg-ultimate-card border border-white/5 p-6 rounded-xl space-y-4">
          <h3 className="text-base font-bold text-white/90 flex items-center gap-2">
            <FileText size={18} className="text-ultimate-accent" /> Importar Listado de Archivos
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Pega una lista de nombres de archivo (.cbr) con numeración de colección. El sistema auto-detectará si es paralelo, el número, año y serie.
          </p>

          <button
            onClick={handleLoadTemplate}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg text-xs font-semibold transition-colors text-center"
          >
            📂 Autocompletar con "orden comics ultimate.txt" del Workspace
          </button>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={10}
            placeholder="Pegar lista aquí, ejemplo:&#13;0001 - Ultimate Spiderman 001.cbr&#13;0002 PARALELO - Marvel Zombies 001.cbr (PENDIENTE DE ESCANEO)"
            className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-xs font-mono focus:outline-none focus:border-ultimate-accent resize-y"
          />

          <button
            onClick={handleGeneratePreview}
            className="w-full py-2.5 bg-ultimate-accent hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors text-center shadow-premium"
          >
            Interpretar y Ver Vista Previa
          </button>
        </div>

        {/* Backups panel */}
        <div className="bg-ultimate-card border border-white/5 p-6 rounded-xl space-y-6">
          <h3 className="text-base font-bold text-white/90 flex items-center gap-2">
            <Download size={18} className="text-ultimate-accent" /> Respaldar y Exportar
          </h3>

          <div className="space-y-3">
            <p className="text-xs text-zinc-400">
              Guarda tus datos locales, tus configuraciones de lectura y la asignación de portadas para no perder nada.
            </p>

            <button
              onClick={handleExportJSON}
              disabled={comics.length === 0}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-750 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              📥 Guardar Respaldo JSON Completo
            </button>

            <button
              onClick={handleExportCSV}
              disabled={comics.length === 0}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-750 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              📊 Descargar Listado en formato CSV
            </button>
          </div>

          <div className="border-t border-white/5 pt-6 space-y-3">
            <h3 className="text-sm font-bold text-white/90 flex items-center gap-2">
              <Upload size={16} className="text-ultimate-accent" /> Restaurar Copia de Seguridad
            </h3>
            <p className="text-xs text-zinc-400">
              Sube un archivo de respaldo JSON anteriormente descargado. Esto reemplazará tu base de datos actual.
            </p>

            <label className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-white/10 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
              📤 Cargar Archivo JSON de Respaldo
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSONFile}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Review preview panel */}
      {showPreview && previewList.length > 0 && (
        <div className="bg-ultimate-card border border-white/5 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h3 className="text-base font-bold text-white/90">Revisión de cómics a importar</h3>
              <p className="text-xs text-zinc-400">Verifica cómo se interpretarán los cómics antes de agregarlos.</p>
            </div>
            <button
              onClick={handleConfirmImport}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors shadow-lg flex items-center gap-1"
            >
              Confirmar Importación <ChevronRight size={14} />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 pr-2 text-xs">
            {previewList.map((comic, idx) => (
              <div key={idx} className="p-2.5 bg-black/40 border border-white/5 rounded-lg flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 font-mono font-bold">ARC #{comic.ordenArchivoDisplay}</span>
                  <h4 className="font-bold text-white truncate">{comic.titulo}</h4>
                  <div className="flex gap-2 mt-1 text-[10px] text-zinc-400">
                    <span>Serie: {comic.serie}</span>
                    <span>•</span>
                    <span>Número: {comic.numero}</span>
                    <span>•</span>
                    <span>Tipo: {comic.tipo}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {comic.esParalelo && <span className="px-1.5 py-0.5 bg-blue-950/30 text-blue-400 border border-blue-900/50 rounded font-bold uppercase text-[8px]">Paralelo</span>}
                  {comic.pendienteEscaneo && <span className="px-1.5 py-0.5 bg-yellow-950/30 text-yellow-500 border border-yellow-900/50 rounded font-bold uppercase text-[8px]">Sin Escanear</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
