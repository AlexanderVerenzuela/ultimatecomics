import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { 
  LayoutDashboard, 
  Grid, 
  List, 
  GitCommit, 
  FolderOpen, 
  FileJson, 
  Settings, 
  ChevronLeft, 
  BookOpen,
  Library
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ currentView, onViewChange, open, setOpen }: SidebarProps) {
  
  // Fetch live stats for mini progress bar
  const stats = useLiveQuery(async () => {
    const total = await db.comics.count();
    const read = await db.comics.where('estadoLectura').equals('leido').count();
    return { total, read };
  }) || { total: 0, read: 0 };

  const pct = stats.total > 0 ? Math.round((stats.read / stats.total) * 100) : 0;

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'gallery', name: 'Galería', icon: <Grid size={18} /> },
    { id: 'list', name: 'Lista', icon: <List size={18} /> },
    { id: 'timeline', name: 'Línea de Tiempo', icon: <GitCommit size={18} /> },
    { id: 'events', name: 'Sagas y Eventos', icon: <FolderOpen size={18} /> },
    { id: 'import', name: 'Importar / Exportar', icon: <FileJson size={18} /> },
    { id: 'settings', name: 'Configuración', icon: <Settings size={18} /> },
  ];

  return (
    <>
      {/* Sidebar background overlay for mobile */}
      {open && (
        <div 
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-ultimate-card border-r border-white/5 flex flex-col justify-between transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 overflow-hidden'
      }`}>
        <div className="flex-1 py-6 px-4 space-y-8 overflow-y-auto">
          {/* Logo / Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Library className="text-ultimate-accent" size={24} />
              <div>
                <h2 className="font-black text-sm tracking-wider uppercase leading-none">Ultimate</h2>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono">Tierra-1610</span>
              </div>
            </div>
            
            <button 
              onClick={() => setOpen(false)}
              className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 md:hidden"
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    // Close sidebar on mobile
                    if (window.innerWidth < 768) setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    active 
                      ? 'bg-ultimate-accent text-white shadow-premium' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Mini Progress Area */}
        {stats.total > 0 && (
          <div className="p-4 border-t border-white/5 bg-black/20 text-xs">
            <div className="flex justify-between items-center mb-1 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
              <span>Tu Progreso</span>
              <span className="font-mono">{pct}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-ultimate-accent rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>{stats.read} Leídos</span>
              <span>{stats.total} Cómics</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
