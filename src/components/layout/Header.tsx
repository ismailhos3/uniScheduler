import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export const Header: React.FC = () => {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40" data-print-hide>
            <div className="flex items-center gap-4 w-96">
                <div className="relative w-full">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Ders veya hoca ara..."
                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border-none rounded-full focus:ring-2 focus:ring-indigo-500/20 text-slate-700 placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="w-px h-6 bg-slate-200 mx-2"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-700">Dr. Yönetici</p>
                        <p className="text-xs text-slate-500">Sistem Admin</p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200">
                        <User className="w-5 h-5 text-indigo-600" />
                    </div>
                </div>
            </div>
        </header>
    );
};
