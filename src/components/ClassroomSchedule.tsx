import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { DAYS, HOURS } from '../types';
import { cn } from '../lib/utils';
import { Printer, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

export const ClassroomSchedule: React.FC = () => {
    const classrooms = useStore((state) => state.classrooms);
    const schedule = useStore((state) => state.schedule);
    const courses = useStore((state) => state.courses);
    const reservedSlots = useStore((state) => state.reservedSlots);
    const toggleReservedSlot = useStore((state) => state.toggleReservedSlot);
    const clearReservedSlots = useStore((state) => state.clearReservedSlots);

    const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
    const [reserveMode, setReserveMode] = useState(false);
    const [confirmClearReservations, setConfirmClearReservations] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Derslik_Programi_${classrooms.find(c => c.id === selectedClassroomId)?.name || ''}`
    });

    const getCourse = (courseId: string) => courses.find(c => c.id === courseId);

    const filteredSchedule = schedule.filter(item => item.classroomId === selectedClassroomId);

    const getItemAtSlot = (day: string, hour: number) => {
        return filteredSchedule.find(item =>
            item.day === day &&
            item.startTime <= hour &&
            item.startTime + item.duration > hour
        );
    };

    const isStartOfBlock = (day: string, hour: number) => {
        const item = filteredSchedule.find(item => item.day === day && item.startTime === hour);
        return !!item;
    };

    const isReserved = (day: string, hour: number) => {
        return reservedSlots.some(s => s.classroomId === selectedClassroomId && s.day === day && s.hour === hour);
    };

    const reservationCount = reservedSlots.filter(s => s.classroomId === selectedClassroomId).length;

    const handleSlotClick = (day: string, hour: number) => {
        if (!reserveMode) return;
        // Don't allow reserving a slot that already has a course
        const item = getItemAtSlot(day, hour);
        if (item) return;
        toggleReservedSlot(selectedClassroomId, day, hour, 'Rezerve');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Derslik Programı</h2>
                    <p className="text-sm text-slate-500">
                        Sınıflara asmak için derslik bazlı program çıktısı.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <select
                        className="border border-slate-300 rounded-lg px-4 py-2 min-w-[200px] text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        value={selectedClassroomId}
                        onChange={e => { setSelectedClassroomId(e.target.value); setReserveMode(false); }}
                    >
                        <option value="">Derslik Seçiniz...</option>
                        {classrooms.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                        ))}
                    </select>

                    {selectedClassroomId && (
                        <>
                            <button
                                onClick={() => setReserveMode(!reserveMode)}
                                className={cn(
                                    "px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all shadow-sm border",
                                    reserveMode
                                        ? "bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-amber-200"
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700"
                                )}
                            >
                                {reserveMode ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                {reserveMode ? 'Rezervasyon Modu: AÇIK' : 'Rezervasyon Yap'}
                            </button>

                            {reservationCount > 0 && (
                                <button
                                    onClick={() => setConfirmClearReservations(true)}
                                    className="px-3 py-2 bg-white text-red-600 border border-red-200 rounded-lg flex items-center justify-center gap-1.5 text-sm font-medium hover:bg-red-50 transition shadow-sm"
                                    title="Bu dersliğin tüm rezervasyonlarını sil"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="text-xs">({reservationCount})</span>
                                </button>
                            )}

                            <button
                                onClick={() => handlePrint()}
                                className="px-4 py-2 bg-slate-800 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors shadow-sm"
                            >
                                <Printer className="w-4 h-4" />
                                Yazdır
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Reserve mode info banner */}
            {reserveMode && selectedClassroomId && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800">Rezervasyon Modu Aktif</p>
                        <p className="text-xs text-amber-600 mt-0.5">
                            Boş hücrelere tıklayarak rezerve edebilir veya mevcut rezervasyonları kaldırabilirsiniz.
                            Rezerve edilen slotlara otomatik program oluşturulurken ders atanmayacaktır.
                        </p>
                    </div>
                </div>
            )}

            {/* Confirm clear reservations modal */}
            {confirmClearReservations && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">Rezervasyonları Temizle</h3>
                        <p className="text-sm text-slate-500 mt-2">
                            <strong>{classrooms.find(c => c.id === selectedClassroomId)?.name}</strong> dersliğinin tüm rezervasyonlarını ({reservationCount} adet) silmek istediğinizden emin misiniz?
                        </p>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setConfirmClearReservations(false)}
                                className="flex-1 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium text-sm transition"
                            >
                                İptal
                            </button>
                            <button
                                onClick={() => {
                                    clearReservedSlots(selectedClassroomId);
                                    setConfirmClearReservations(false);
                                }}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm shadow-sm shadow-red-200 transition"
                            >
                                Evet, Temizle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedClassroomId ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 overflow-x-auto">
                    <div ref={printRef} className="min-w-[800px] p-8 bg-white print:p-0">
                        <div className="text-center mb-8 border-b-2 border-slate-100 pb-6">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">HAFTALIK DERS PROGRAMI</h1>
                            <h2 className="text-3xl font-bold text-indigo-700 mt-2">
                                {classrooms.find(c => c.id === selectedClassroomId)?.name}
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mt-2 uppercase tracking-wide">
                                {classrooms.find(c => c.id === selectedClassroomId)?.type === 'ComputerLab' ? 'BİLGİSAYAR LABORATUVARI' :
                                    classrooms.find(c => c.id === selectedClassroomId)?.type === 'Office' ? 'ÖĞRETİM ÜYESİ OFİSİ' : 'DERSLİK'}
                            </p>
                        </div>

                        <table className="w-full border-collapse border border-slate-300">
                            <thead>
                                <tr>
                                    <th className="border border-slate-300 p-3 bg-slate-50 text-center w-24 text-slate-700 font-bold text-sm">Saat</th>
                                    {DAYS.map(day => (
                                        <th key={day} className="border border-slate-300 p-3 bg-slate-50 text-center text-slate-700 font-bold">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {HOURS.map(hour => (
                                    <tr key={hour}>
                                        <td className="border border-slate-300 p-2 text-center font-semibold text-xs text-slate-500 whitespace-nowrap bg-slate-50/30">
                                            {`${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`}
                                        </td>
                                        {DAYS.map(day => {
                                            const item = getItemAtSlot(day, hour);
                                            const isStart = isStartOfBlock(day, hour);
                                            const reserved = isReserved(day, hour);

                                            // Empty slot — show reserved or normal empty
                                            if (!item) {
                                                return (
                                                    <td
                                                        key={day}
                                                        className={cn(
                                                            "border border-slate-300 p-2 transition-all",
                                                            reserved
                                                                ? "bg-amber-50"
                                                                : "",
                                                            reserveMode && !reserved && "cursor-pointer hover:bg-amber-50/50",
                                                            reserveMode && reserved && "cursor-pointer hover:bg-amber-100"
                                                        )}
                                                        onClick={() => handleSlotClick(day, hour)}
                                                    >
                                                        {reserved && (
                                                            <div className="flex items-center justify-center h-full">
                                                                <div className="px-3 py-1.5 rounded-lg border-2 border-dashed border-amber-300 bg-amber-100/60">
                                                                    <span className="text-amber-600 text-[10px] font-bold uppercase tracking-wider">
                                                                        REZERVE
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            }

                                            if (isStart) {
                                                const course = getCourse(item.courseId);
                                                return (
                                                    <td
                                                        key={day}
                                                        rowSpan={item.duration}
                                                        className="border border-slate-300 p-1 text-center align-middle bg-white hover:bg-slate-50 transition-colors"
                                                    >
                                                        <div className="flex flex-col gap-1.5 p-2 items-center justify-center h-full w-full">
                                                            <div className="font-bold text-slate-900 text-sm leading-tight text-center">
                                                                {course?.name}
                                                                {item.sessionType === 'Theory' && <span className="font-normal text-slate-500 ml-1 text-xs">(T)</span>}
                                                                {item.sessionType === 'Practice' && <span className="font-normal text-slate-500 ml-1 text-xs">(U)</span>}
                                                            </div>
                                                            <div className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono text-slate-600 border border-slate-200">
                                                                {course?.code}
                                                            </div>
                                                            <div className="text-xs font-medium text-slate-700 mt-1">{course?.instructor}</div>
                                                            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                                                {course?.year}. Sınıf
                                                            </div>
                                                        </div>
                                                    </td>
                                                );
                                            }

                                            return null;
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-8 text-[10px] text-slate-400 text-right font-mono">
                            Oluşturulma: {new Date().toLocaleDateString()} • UniScheduler
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                    <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                        <Printer className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-medium">Lütfen programını görüntülemek için bir derslik seçiniz.</p>
                </div>
            )}
        </div>
    );
};
