import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, saveParsedComics } from './services/db';
import { ComicImport } from './utils/parser';

import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import GalleryView from './components/GalleryView';
import ListView from './components/ListView';
import TimelineView from './components/TimelineView';
import EventsView from './components/EventsView';
import ImportExportView from './components/ImportExportView';
import SettingsView from './components/SettingsView';
import EditComicModal from './components/EditComicModal';

import { Menu, BookOpen, Layers } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [editingComic, setEditingComic] = useState<ComicImport | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Read comics from Dexie
  const comics = useLiveQuery(
    () => db.comics.orderBy('ordenLectura').toArray(),
    []
  ) || [];

  // Recalculate reading order and save to DB
  const recalculateOrder = async (orderedList: ComicImport[]) => {
    const updated = orderedList.map((comic, idx) => ({
      ...comic,
      ordenLectura: idx + 1
    }));
    await db.transaction('rw', db.comics, async () => {
      await db.comics.clear();
      await db.comics.bulkAdd(updated);
    });
  };

  const handleUpdateComic = async (updatedComic: ComicImport) => {
    if (updatedComic.id) {
      await db.comics.put(updatedComic);
    }
  };

  const handleUpdateMultiple = async (updatedComics: ComicImport[]) => {
    await db.comics.bulkPut(updatedComics);
  };

  const handleImportComplete = async (importedList: ComicImport[]) => {
    await saveParsedComics(importedList);
    setCurrentView('dashboard');
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
        
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-4 border-b border-white/5 bg-ultimate-card/50 backdrop-blur-md md:hidden sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <BookOpen className="text-ultimate-accent" size={24} />
            <h1 className="font-extrabold text-sm tracking-widest text-white uppercase">ULTIMATE ORGANIZER</h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-zinc-400 hover:text-white rounded bg-zinc-900 border border-white/10"
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
