import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, saveParsedComics } from './services/db';
import { ComicImport } from './utils/parser';
import { uploadToFirebase, downloadFromFirebase, saveComicToFirebase, DEFAULT_FIREBASE_CREDS } from './services/firebase';

import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import GalleryView from './components/GalleryView';
import ListView from './components/ListView';
import TimelineView from './components/TimelineView';
import EventsView from './components/EventsView';
import ImportExportView from './components/ImportExportView';
import SettingsView from './components/SettingsView';
import EditComicModal from './components/EditComicModal';
import defaultComicsList from './data/comics_list.json';

import { Menu, BookOpen } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [editingComic, setEditingComic] = useState<ComicImport | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Read comics from Dexie
  const comics = useLiveQuery(
    () => db.comics.orderBy('ordenLectura').toArray(),
    []
  ) || [];

  // Auto-initialize DB with Excel data if empty or not fully migrated to the Excel layout
  useEffect(() => {
    const initDefaultData = async () => {
      const hasForcedExcel = await db.config.get('excel_force_reload_v2');
      if (!hasForcedExcel || hasForcedExcel.value !== 'true') {
        // Force reset database to import the exact Excel classifications and milestones notes
        await db.comics.clear();
        await saveParsedComics(defaultComicsList as any);
        await db.config.put({ key: 'excel_force_reload_v2', value: 'true' });
        
        // Push the new list immediately to Firebase Firestore
        try {
          const creds = await getFirebaseCredentials();
          await uploadToFirebase(creds, defaultComicsList as any);
        } catch (e) {
          console.error('Error uploading fresh Excel DB to Firebase on auto-migration:', e);
        }
      }
    };
    initDefaultData();
  }, []);

  // Automatic sync on startup
  useEffect(() => {
    const autoSync = async () => {
      setSyncStatus('syncing');
      try {
        // Load custom creds if available, else use default
        const apiKeyVal = await db.config.get('firebase_apiKey');
        const projectIdVal = await db.config.get('firebase_projectId');
        const authDomainVal = await db.config.get('firebase_authDomain');
        const appIdVal = await db.config.get('firebase_appId');

        const creds = {
          apiKey: apiKeyVal?.value || DEFAULT_FIREBASE_CREDS.apiKey,
          projectId: projectIdVal?.value || DEFAULT_FIREBASE_CREDS.projectId,
          authDomain: authDomainVal?.value || DEFAULT_FIREBASE_CREDS.authDomain,
          appId: appIdVal?.value || DEFAULT_FIREBASE_CREDS.appId,
        };

        const firebaseComics = await downloadFromFirebase(creds);
        
        if (firebaseComics && firebaseComics.length > 0) {
          // Firebase has data: merge/populate local DB
          // We can check if local DB is different. For simplicity, since it's a personal app,
          // overwrite local DB with the Firestore database state (which is the source of truth).
          const localCount = await db.comics.count();
          if (localCount !== firebaseComics.length || JSON.stringify(comics) !== JSON.stringify(firebaseComics)) {
            await saveParsedComics(firebaseComics);
          }
          setSyncStatus('success');
        } else {
          // Firebase is empty: upload local DB if we already have comics
          const localCount = await db.comics.count();
          if (localCount > 0) {
            const localComics = await db.comics.orderBy('ordenLectura').toArray();
            await uploadToFirebase(creds, localComics);
          }
          setSyncStatus('success');
        }
      } catch (err) {
        console.error('Error in background auto-sync:', err);
        setSyncStatus('error');
      }
    };

    // Run auto-sync once local database is checked and comics hook is ready
    if (comics.length >= 0) {
      autoSync();
    }
  }, [comics.length === 0]); // Trigger when count transitions from 0/init

  // Fetch credentials helper
  const getFirebaseCredentials = async () => {
    const apiKeyVal = await db.config.get('firebase_apiKey');
    const projectIdVal = await db.config.get('firebase_projectId');
    const authDomainVal = await db.config.get('firebase_authDomain');
    const appIdVal = await db.config.get('firebase_appId');

    return {
      apiKey: apiKeyVal?.value || DEFAULT_FIREBASE_CREDS.apiKey,
      projectId: projectIdVal?.value || DEFAULT_FIREBASE_CREDS.projectId,
      authDomain: authDomainVal?.value || DEFAULT_FIREBASE_CREDS.authDomain,
      appId: appIdVal?.value || DEFAULT_FIREBASE_CREDS.appId,
    };
  };

  // Recalculate reading order, save locally and background sync
  const recalculateOrder = async (orderedList: ComicImport[]) => {
    const updated = orderedList.map((comic, idx) => ({
      ...comic,
      ordenLectura: idx + 1
    }));
    await db.transaction('rw', db.comics, async () => {
      await db.comics.clear();
      await db.comics.bulkAdd(updated);
    });

    // Background push
    try {
      const creds = await getFirebaseCredentials();
      await uploadToFirebase(creds, updated);
    } catch (e) {
      console.error('Error background syncing recalculateOrder:', e);
    }
  };

  // Update single comic and background sync
  const handleUpdateComic = async (updatedComic: ComicImport) => {
    if (updatedComic.id) {
      await db.comics.put(updatedComic);
      // Background push
      try {
        const creds = await getFirebaseCredentials();
        await saveComicToFirebase(creds, updatedComic);
      } catch (e) {
        console.error('Error background syncing handleUpdateComic:', e);
      }
    }
  };

  // Update multiple comics and background sync
  const handleUpdateMultiple = async (updatedComics: ComicImport[]) => {
    await db.comics.bulkPut(updatedComics);
    // Background push
    try {
      const creds = await getFirebaseCredentials();
      await uploadToFirebase(creds, updatedComics);
    } catch (e) {
      console.error('Error background syncing handleUpdateMultiple:', e);
    }
  };

  const handleImportComplete = async (importedList: ComicImport[]) => {
    await saveParsedComics(importedList);
    setCurrentView('dashboard');
    // Background push
    try {
      const creds = await getFirebaseCredentials();
      await uploadToFirebase(creds, importedList);
    } catch (e) {
      console.error('Error background syncing handleImportComplete:', e);
    }
  };

  const handleSyncComplete = async (syncedList: ComicImport[]) => {
    await saveParsedComics(syncedList);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView comics={comics} onNavigateToView={setCurrentView} onUpdateMultiple={handleUpdateMultiple} />;
      case 'gallery':
        return (
          <GalleryView
            comics={comics}
            onUpdateComic={handleUpdateComic}
            onUpdateMultiple={handleUpdateMultiple}
            onEditComic={setEditingComic}
            recalculateOrder={recalculateOrder}
          />
        );
      case 'list':
        return (
          <ListView
            comics={comics}
            onUpdateComic={handleUpdateComic}
            onEditComic={setEditingComic}
          />
        );
      case 'timeline':
        return <TimelineView comics={comics} onEditComic={setEditingComic} />;
      case 'events':
        return <EventsView comics={comics} onUpdateMultiple={handleUpdateMultiple} />;
      case 'import':
        return <ImportExportView onImportComplete={handleImportComplete} comics={comics} />;
      case 'settings':
        return <SettingsView comics={comics} onSyncComplete={handleSyncComplete} />;
      default:
        return <DashboardView comics={comics} onNavigateToView={setCurrentView} onUpdateMultiple={handleUpdateMultiple} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-ultimate-dark text-white font-comic overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        open={sidebarOpen} 
        setOpen={setSidebarOpen} 
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'pl-0'}`}>
        
        {/* Header / Sync status indicator */}
        <header className="flex items-center justify-between p-4 border-b border-white/5 bg-ultimate-card/50 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <BookOpen className="text-ultimate-accent md:hidden" size={24} />
            <h1 className="font-extrabold text-sm tracking-widest text-white uppercase md:hidden">ULTIMATE ORGANIZER</h1>
            
            {/* Background Sync Pill Indicator */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${
                syncStatus === 'syncing' ? 'bg-amber-400 animate-pulse' :
                syncStatus === 'success' ? 'bg-green-500' :
                syncStatus === 'error' ? 'bg-red-500' : 'bg-zinc-600'
              }`} />
              <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                {syncStatus === 'syncing' ? 'Sincronizando con la nube...' :
                 syncStatus === 'success' ? 'Sincronizado con Firebase' :
                 syncStatus === 'error' ? 'Error de sincronización' : 'Offline'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-zinc-400 hover:text-white rounded bg-zinc-900 border border-white/10 md:hidden"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Inner Page View */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto pb-24">
          {renderView()}
        </main>
      </div>

      {/* Edit Comic Modal */}
      {editingComic && (
        <EditComicModal
          comic={editingComic}
          onClose={() => setEditingComic(null)}
          onSave={async (updatedComic) => {
            await handleUpdateComic(updatedComic);
            setEditingComic(null);
          }}
        />
      )}
    </div>
  );
}
