import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { DAYS, HOURS } from '../types';
import type { ScheduleItem } from '../types';
import { cn } from '../lib/utils';
import { Download, RefreshCw, AlertTriangle, Lock, Plus, AlertCircle, RotateCcw, Play, Clock, Calendar as CalendarIcon, X, Printer, FileSpreadsheet, ChevronDown, Snowflake, Sun } from 'lucide-react';
import { EditScheduleModal } from './EditScheduleModal';
import { ManualAssignmentModal } from './ManualAssignmentModal';
import { UnscheduledCoursesModal } from './UnscheduledCoursesModal';
import { motion } from 'framer-motion';

interface ScheduleGridProps {
    onGenerate: (mode: 'full' | 'fill') => void;
    generating: boolean;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({ onGenerate, generating }) => {
    const schedule = useStore((state) => state.schedule);
    const courses = useStore((state) => state.courses);
    const classrooms = useStore((state) => state.classrooms);
    const unscheduledCourses = useStore((state) => state.unscheduledCourses);
    const blockedSlots = useStore((state) => state.blockedSlots);
    const toggleBlockedSlot = useStore((state) => state.toggleBlockedSlot);
    const semester = useStore((state) => state.semester);

    const availableYears = semester === 'Güz' ? [1, 2, 3] : [1, 2, 3, 4];

    const [selectedYear, setSelectedYear] = useState<number>(1);

    // Auto-reset year if current selection is no longer available (e.g. 4th year in Güz)
    React.useEffect(() => {
        if (!availableYears.includes(selectedYear)) {
            setSelectedYear(1);
        }
    }, [semester]);
    const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isUnscheduledModalOpen, setIsUnscheduledModalOpen] = useState(false);
    const [confirmClear, setConfirmClear] = useState(false);
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const printAreaRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        setExportMenuOpen(false);
        // Small delay to let menu close before print dialog
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const getCourse = (courseId: string) => courses.find(c => c.id === courseId);
    const getClassroom = (classroomId: string) => classrooms.find(c => c.id === classroomId);

    // Filter schedule by year
    const filteredSchedule = schedule.filter(item => {
        const course = getCourse(item.courseId);
        return course && course.year === selectedYear;
    });

    const isOccupiedByEarlierBlock = (day: string, hour: number) => {
        return filteredSchedule.some(item =>
            item.day === day &&
            item.startTime < hour &&
            item.startTime + item.duration > hour
        );
    };

    return (
        <div className="space-y-6 h-full flex flex-col relative">
            {confirmClear && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 border border-slate-100">
                        <div className="flex items-center gap-3 mb-4 text-red-600 bg-red-50 p-3 rounded-lg">
                            <AlertTriangle className="w-6 h-6" />
                            <h3 className="font-bold text-lg">Programı Temizle</h3>
                        </div>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Tüm yerleşimler silinecek. Ders ve derslik verileri korunacaktır.
                            <br /><span className="font-semibold text-slate-800">Bu işlem geri alınamaz.</span>
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmClear(false)}
                                className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={() => {
                                    useStore.getState().clearSchedule();
                                    setConfirmClear(false);
                                }}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm shadow-sm shadow-red-200 transition"
                            >
                                Evet, Temizle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-6" data-print-hide>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <CalendarIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Haftalık Program</h2>
                        <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                            <span className="font-medium text-indigo-600">{selectedYear}. Sınıf</span>
                            <span>•</span>
                            <span>{filteredSchedule.length} Ders Yerleşti</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
                    <div className="flex p-1 bg-slate-100 rounded-lg mr-4">
                        {availableYears.map(year => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(year)}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                    selectedYear === year
                                        ? "bg-white text-indigo-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                                )}
                            >
                                {year}. Sınıf
                            </button>
                        ))}
                    </div>

                    {/* Semester badge */}
                    <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border",
                        semester === 'Güz'
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    )}>
                        {semester === 'Güz' ? <Snowflake className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                        {semester} Dönemi
                        {semester === 'Güz' && <span className="text-[10px] font-normal ml-1 opacity-70">(4. sınıf stajda)</span>}
                    </div>

                    <div className="h-8 w-px bg-slate-200 hidden xl:block mx-2"></div>

                    {unscheduledCourses.length > 0 && (
                        <button
                            onClick={() => setIsUnscheduledModalOpen(true)}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center gap-2 text-sm font-semibold transition ring-1 ring-inset ring-red-600/10"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {unscheduledCourses.length} Hata
                        </button>
                    )}

                    <button
                        onClick={() => setIsManualModalOpen(true)}
                        className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg flex items-center gap-2 text-sm font-medium transition"
                    >
                        <Plus className="w-4 h-4" />
                        Manuel Ekle
                    </button>

                    <div className="flex rounded-lg shadow-sm">
                        <button
                            onClick={() => onGenerate('fill')}
                            disabled={generating || courses.length === 0 || classrooms.length === 0}
                            className={cn(
                                "px-4 py-2 rounded-l-lg flex items-center gap-2 font-medium transition text-sm border-r border-emerald-700/20",
                                (courses.length === 0 || classrooms.length === 0) ? "bg-slate-100 text-slate-400 cursor-not-allowed" :
                                    generating ? "bg-emerald-500 text-white cursor-wait" : "bg-emerald-600 text-white hover:bg-emerald-700"
                            )}
                        >
                            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                            Tamamla
                        </button>
                        <button
                            onClick={() => onGenerate('full')}
                            disabled={generating || courses.length === 0 || classrooms.length === 0}
                            className={cn(
                                "px-4 py-2 rounded-r-lg flex items-center gap-2 font-medium transition text-sm",
                                (courses.length === 0 || classrooms.length === 0) ? "bg-slate-100 text-slate-400 cursor-not-allowed" :
                                    generating ? "bg-emerald-500 text-white cursor-wait" : "bg-emerald-800 text-white hover:bg-emerald-900"
                            )}
                            title="Sıfırdan Oluştur"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="relative no-print">
                        <button
                            onClick={() => setExportMenuOpen(!exportMenuOpen)}
                            className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition flex items-center gap-1.5 text-sm font-medium"
                            title="Dışa Aktar"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Dışa Aktar</span>
                            <ChevronDown className={cn("w-3 h-3 transition-transform", exportMenuOpen && "rotate-180")} />
                        </button>

                        {exportMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setExportMenuOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-40 py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Dışa Aktarma Seçenekleri</div>
                                    <button
                                        onClick={() => {
                                            setExportMenuOpen(false);
                                            import('../utils/excelExporter').then(mod => {
                                                mod.exportScheduleToExcel(schedule, courses, classrooms);
                                            });
                                        }}
                                        className="w-full px-3 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 transition text-sm group"
                                    >
                                        <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition">
                                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-800">Excel Olarak İndir</div>
                                            <div className="text-[11px] text-slate-400">.xlsx formatında tablo</div>
                                        </div>
                                    </button>
                                    <div className="mx-3 border-t border-slate-100" />
                                    <button
                                        onClick={handlePrint}
                                        className="w-full px-3 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 transition text-sm group"
                                    >
                                        <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition">
                                            <Printer className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-800">Yazdır / PDF</div>
                                            <div className="text-[11px] text-slate-400">Tarayıcı yazdırma ile PDF kaydet</div>
                                        </div>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setConfirmClear(true)}
                        className="p-2 border border-slate-200 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 transition"
                        title="Programı Temizle"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {(courses.length === 0 || classrooms.length === 0) && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-amber-800 shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <p className="font-medium">Veri eksik. Lütfen önce dersleri ve derslikleri sisteme yükleyin.</p>
                </div>
            )}

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col" data-print-area ref={printAreaRef}>
                <div className="print-header" style={{ display: 'none' }}>Haftalık Ders Programı</div>
                <div className="print-subheader" style={{ display: 'none' }}>{selectedYear}. Sınıf • {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <div className="min-w-[1000px] h-full">
                        <table className="w-full border-collapse h-full">
                            <thead className="sticky top-0 z-20 shadow-sm">
                                <tr>
                                    <th className="p-4 border-b border-indigo-100 bg-indigo-50/80 backdrop-blur w-24 text-indigo-900 font-bold text-sm text-center">
                                        <Clock className="w-4 h-4 mx-auto mb-1 opacity-50" />
                                        Saat
                                    </th>
                                    {DAYS.map(day => (
                                        <th key={day} className="p-4 border-b border-r border-indigo-100 last:border-r-0 bg-indigo-50/80 backdrop-blur text-indigo-900 font-bold min-w-[180px] text-left">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-slate-50/30">
                                {HOURS.map(hour => (
                                    <tr key={hour} className="group/row">
                                        <td className="p-2 border-b border-indigo-50 bg-white font-medium text-slate-500 text-center text-xs whitespace-nowrap sticky left-0 z-10 group-hover/row:bg-slate-50 transition-colors">
                                            <div className="py-1 px-2 rounded bg-slate-100 group-hover/row:bg-white transition-colors">
                                                {`${hour.toString().padStart(2, '0')}:00`}
                                                <div className="text-[10px] text-slate-400 font-normal">
                                                    {`${(hour + 1).toString().padStart(2, '0')}:00`}
                                                </div>
                                            </div>
                                        </td>

                                        {hour === 12 ? (
                                            <td colSpan={5} className="bg-stripes-slate p-2 text-center align-middle border-b border-slate-200/50">
                                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-slate-200 shadow-sm text-slate-500 text-xs font-bold tracking-widest uppercase backdrop-blur-sm">
                                                    <span>☕</span> Öğle Arası <span>🍽️</span>
                                                </div>
                                            </td>
                                        ) : (
                                            DAYS.map(day => {
                                                if (isOccupiedByEarlierBlock(day, hour)) return null;

                                                const items = filteredSchedule.filter(item => item.day === day && item.startTime === hour);
                                                const isBlocked = blockedSlots.some(s => s.day === day && s.hour === hour);

                                                if (items.length > 0) {
                                                    const maxDuration = Math.max(...items.map(i => i.duration));

                                                    return (
                                                        <td
                                                            key={day}
                                                            rowSpan={maxDuration}
                                                            className="p-1.5 border-b border-r border-slate-200/50 last:border-r-0 align-top h-[140px] relative"
                                                        >
                                                            <div className="flex flex-col gap-2 h-full">
                                                                {items.map(item => {
                                                                    const course = getCourse(item.courseId);
                                                                    const room = getClassroom(item.classroomId);
                                                                    return (
                                                                        <motion.div
                                                                            layoutId={item.id}
                                                                            key={item.id}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setEditingItem(item);
                                                                            }}
                                                                            className={cn(
                                                                                "w-full p-3 rounded-xl border shadow-sm flex flex-col justify-between group relative min-h-[110px] cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-gradient-to-br",
                                                                                course?.type === 'Seçmeli'
                                                                                    ? "from-amber-50 to-amber-100/50 border-amber-200/60 hover:border-amber-300"
                                                                                    : (
                                                                                        course?.year === 1 ? "from-blue-50 to-blue-100/50 border-blue-200/60 hover:border-blue-300" :
                                                                                            course?.year === 2 ? "from-emerald-50 to-emerald-100/50 border-emerald-200/60 hover:border-emerald-300" :
                                                                                                course?.year === 3 ? "from-orange-50 to-orange-100/50 border-orange-200/60 hover:border-orange-300" :
                                                                                                    "from-purple-50 to-purple-100/50 border-purple-200/60 hover:border-purple-300"
                                                                                    )
                                                                            )}
                                                                        >
                                                                            {item.locked && (
                                                                                <div className="absolute top-2 right-10 flex gap-1 z-20">
                                                                                    <div className="text-slate-400 bg-white/80 rounded-full p-1 shadow-sm backdrop-blur-sm" title="Kilitli">
                                                                                        <Lock className="w-3 h-3" />
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (window.confirm(`${course?.name} dersini programdan kaldırmak istiyor musunuz?`)) {
                                                                                        useStore.getState().removeScheduleItem(item.id);
                                                                                    }
                                                                                }}
                                                                                className="absolute top-2 right-2 p-1.5 bg-white text-red-600 rounded-lg hover:bg-red-50 shadow-sm border border-red-100 z-[60] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                                                title="Dersi Kaldır"
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                            </button>

                                                                            <div>
                                                                                <div className="flex items-start justify-between gap-1 pr-6">
                                                                                    <h4 className="font-bold text-slate-800 leading-tight text-sm line-clamp-2">
                                                                                        {course?.name}
                                                                                    </h4>
                                                                                </div>
                                                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                                                    <span className="text-[10px] font-mono bg-white/60 px-1.5 py-0.5 rounded text-slate-500 border border-black/5">
                                                                                        {course?.code}
                                                                                    </span>
                                                                                    {course?.type === 'Zorunlu' && <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-medium">Zorunlu</span>}
                                                                                    {course?.type === 'Seçmeli' && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Seçmeli</span>}
                                                                                    {item.sessionType === 'Theory' && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium">Teorik</span>}
                                                                                    {item.sessionType === 'Practice' && <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-medium">Uygulama</span>}
                                                                                </div>
                                                                            </div>

                                                                            <div className="mt-3 pt-2 border-t border-black/5 flex justify-between items-end gap-2">
                                                                                <div className="text-xs text-slate-600 font-medium truncate flex-1" title={course?.instructor}>
                                                                                    {course?.instructor}
                                                                                </div>
                                                                                {room && (
                                                                                    <div className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded text-[10px] font-bold text-slate-700 shadow-sm border border-black/5" title={room.name}>
                                                                                        {room.name}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </motion.div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </td>
                                                    );
                                                }

                                                return (
                                                    <td
                                                        key={day}
                                                        className={cn(
                                                            "border-b border-r border-slate-100 last:border-r-0 p-1 transition-all relative group cursor-cell",
                                                            isBlocked
                                                                ? "bg-red-50/30"
                                                                : "hover:bg-slate-50"
                                                        )}
                                                        onClick={() => toggleBlockedSlot(day, hour)}
                                                    >
                                                        {isBlocked ? (
                                                            <div className="absolute inset-2 flex items-center justify-center rounded-lg border-2 border-dashed border-red-200 bg-red-50/50">
                                                                <span className="text-red-300 text-xs font-bold uppercase tracking-wider">BOŞ</span>
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-full rounded-lg border-2 border-dashed border-transparent group-hover:border-slate-200 group-hover:scale-[0.98] transition-all flex items-center justify-center">
                                                                <Plus className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100" />
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ManualAssignmentModal
                isOpen={isManualModalOpen}
                onClose={() => setIsManualModalOpen(false)}
            />
            <UnscheduledCoursesModal
                isOpen={isUnscheduledModalOpen}
                onClose={() => setIsUnscheduledModalOpen(false)}
            />
            <EditScheduleModal
                item={editingItem}
                isOpen={!!editingItem}
                onClose={() => setEditingItem(null)}
            />
        </div>
    );
};
