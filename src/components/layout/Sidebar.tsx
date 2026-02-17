import React from 'react';
import { Upload, Calendar, Settings, BookOpen, Users, Sun, Snowflake } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useStore } from '../../store/useStore';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    isOpen?: boolean;
}

const menuItems = [
    { id: 'upload', label: 'Veri Yükleme', icon: Upload },
    { id: 'classrooms', label: 'Derslikler', icon: Settings },
    { id: 'schedule', label: 'Program Oluştur', icon: Calendar },
    { id: 'classrooms-view', label: 'Derslik Programı', icon: BookOpen },
    { id: 'instructors-view', label: 'Hoca Programı', icon: Users },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const semester = useStore((state) => state.semester);
    const setSemester = useStore((state) => state.setSemester);

    return (
        <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-50" data-print-hide>
            <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">UniScheduler</h1>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                            activeTab === item.id
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20 translate-x-1"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-white" : "text-slate-500 group-hover:text-white")} />
                        {item.label}
                        {activeTab === item.id && (
                            <motion.div
                                layoutId="active-pill"
                                className="absolute right-0 w-1 h-8 rounded-l bg-indigo-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            />
                        )}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider font-bold">Aktif Dönem</p>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setSemester('Güz')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all",
                                semester === 'Güz'
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/50"
                            )}
                        >
                            <Snowflake className="w-3.5 h-3.5" />
                            Güz
                        </button>
                        <button
                            onClick={() => setSemester('Bahar')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all",
                                semester === 'Bahar'
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/50"
                            )}
                        >
                            <Sun className="w-3.5 h-3.5" />
                            Bahar
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-2 text-center">2025-2026</p>
                </div>
            </div>
        </aside>
    );
};
