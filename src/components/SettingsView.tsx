import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { uploadToFirebase, downloadFromFirebase, FirebaseCredentials, DEFAULT_FIREBASE_CREDS } from '../services/firebase';
import { ComicImport } from '../utils/parser';
import { Database, Save, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

interface SettingsViewProps {
  comics: ComicImport[];
  onSyncComplete: (comics: ComicImport[]) => void;
}

export default function SettingsView({ comics, onSyncComplete }: SettingsViewProps) {
  const [apiKey, setApiKey] = useState(DEFAULT_FIREBASE_CREDS.apiKey);
  const [authDomain, setAuthDomain] = useState(DEFAULT_FIREBASE_CREDS.authDomain);
  const [projectId, setProjectId] = useState(DEFAULT_FIREBASE_CREDS.projectId);
  const [appId, setAppId] = useState(DEFAULT_FIREBASE_CREDS.appId);
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Load config from Dexie
    const loadConfig = async () => {
      const apiKeyVal = await db.config.get('firebase_apiKey');
      const authDomainVal = await db.config.get('firebase_authDomain');
      const projectIdVal = await db.config.get('firebase_projectId');
      const appIdVal = await db.config.get('firebase_appId');
      
      if (apiKeyVal) setApiKey(apiKeyVal.value);
      if (authDomainVal) setAuthDomain(authDomainVal.value);
      if (projectIdVal) setProjectId(projectIdVal.value);
      if (appIdVal) setAppId(appIdVal.value);
    };
    loadConfig();
  }, []);

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await db.config.put({ key: 'firebase_apiKey', value: apiKey.trim() });
      await db.config.put({ key: 'firebase_authDomain', value: authDomain.trim() });
      await db.config.put({ key: 'firebase_projectId', value: projectId.trim() });
      await db.config.put({ key: 'firebase_appId', value: appId.trim() });
      
      setSuccessMsg('Credenciales de Firebase guardadas localmente.');
    } catch (err) {
      setErrorMsg('Error al guardar las credenciales locales.');
    } finally {
      setLoading(false);
    }
  };

  const getCredentials = (): FirebaseCredentials => {
    return {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      appId: appId.trim(),
    };
  };

  const handleUpload = async () => {
    if (!apiKey || !projectId) {
      setErrorMsg('Debes ingresar las credenciales de Firebase primero.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const creds = getCredentials();
      await uploadToFirebase(creds, comics);
      setSuccessMsg(`¡Sincronización de subida exitosa! ${comics.length} cómics guardados en Firestore.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al conectar y subir datos a Firebase. Comprueba la configuración de Firestore.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!apiKey || !projectId) {
      setErrorMsg('Debes ingresar las credenciales de Firebase primero.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const creds = getCredentials();
      const list = await downloadFromFirebase(creds);
      if (list && list.length > 0) {
        onSyncComplete(list);
        setSuccessMsg(`¡Sincronización de bajada exitosa! ${list.length} cómics cargados desde Firestore.`);
      } else {
        setErrorMsg('No se encontraron registros en tu colección de Firestore.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al descargar datos de Firebase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Configuración</h2>
        <p className="text-sm text-zinc-400 mt-1">Conecta tu organizador con Firebase Firestore para sincronización multi-dispositivo gratuita.</p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/30 border border-red-900/50 text-red-400 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-950/30 border border-green-900/50 text-green-400 text-sm rounded-lg flex items-center gap-2">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* Firebase Connection */}
      <div className="bg-ultimate-card border border-white/5 p-6 rounded-xl space-y-6">
        <h3 className="text-base font-bold text-white/90 flex items-center gap-2">
          <Database size={18} className="text-ultimate-accent" /> Conexión con Firebase
        </h3>

        <form onSubmit={handleSaveCredentials} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md text-xs focus:outline-none focus:border-ultimate-accent font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Project ID</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="mi-proyecto-comics"
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md text-xs focus:outline-none focus:border-ultimate-accent font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Auth Domain</label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="mi-proyecto-comics.firebaseapp.com"
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md text-xs focus:outline-none focus:border-ultimate-accent font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">App ID</label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:12345678:web:abcdef..."
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md text-xs focus:outline-none focus:border-ultimate-accent font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Save size={14} /> Guardar Credenciales
          </button>
        </form>

        <div className="border-t border-white/5 pt-6 space-y-4">
          <h4 className="text-sm font-bold text-white/80">Sincronización con Firestore</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Una vez guardadas las credenciales de Firebase, puedes subir tu progreso local a la nube o descargarlo en un nuevo dispositivo.
            Asegúrate de haber activado la base de datos **Cloud Firestore** en tu panel de Firebase.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleUpload}
              disabled={loading || comics.length === 0}
              className="py-2.5 bg-ultimate-accent hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Subir a Firebase
            </button>

            <button
              onClick={handleDownload}
              disabled={loading}
              className="py-2.5 bg-zinc-800 hover:bg-zinc-750 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Bajar de Firebase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
