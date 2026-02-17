import React from 'react';
import { Calendar, Upload, Settings, BookOpen, Users } from 'lucide-react';
import clsx from 'clsx';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: 'upload' | 'classrooms' | 'schedule' | 'classrooms-view' | 'instructors-view';
    setActiveTab: (tab: 'upload' | 'classrooms' | 'schedule' | 'classrooms-view' | 'instructors-view') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-indigo-600 text-white shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Calendar className="w-8 h-8" />
                        UniScheduler
                    </h1>
                    <nav className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
                                activeTab === 'upload' ? "bg-indigo-700 font-semibold" : "hover:bg-indigo-500"
                            )}
                        >
                            <Upload className="w-4 h-4" />
                            Veri Yükle
                        </button>
                        <button
                            onClick={() => setActiveTab('classrooms')}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
                                activeTab === 'classrooms' ? "bg-indigo-700 font-semibold" : "hover:bg-indigo-500"
                            )}
                        >
                            <Settings className="w-4 h-4" />
                            Derslikler
                        </button>
                        <button
                            onClick={() => setActiveTab('schedule')}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
                                activeTab === 'schedule' ? "bg-indigo-700 font-semibold" : "hover:bg-indigo-500"
                            )}
                        >
                            <Calendar className="w-4 h-4" />
                            Program
                        </button>
                        <button
                            onClick={() => setActiveTab('classrooms-view')}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
                                activeTab === 'classrooms-view' ? "bg-indigo-700 font-semibold" : "hover:bg-indigo-500"
                            )}
                        >
                            <BookOpen className="w-4 h-4" />
                            Derslikler
                        </button>
                        <button
                            onClick={() => setActiveTab('instructors-view')}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
                                activeTab === 'instructors-view' ? "bg-indigo-700 font-semibold" : "hover:bg-indigo-500"
                            )}
                        >
                            <Users className="w-4 h-4" />
                            Hocalar
                        </button>
                    </nav>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8 flex-grow">
                {children}
            </main>
            <footer className="bg-gray-800 text-gray-400 py-6 text-center">
                <p>&copy; {new Date().getFullYear()} UniScheduler - Haftalık Ders Programı Oluşturucu</p>
            </footer>
        </div>
    );
};
