import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { DAYS, HOURS } from '../types';

import { Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

export const InstructorSchedule: React.FC = () => {
    const classrooms = useStore((state) => state.classrooms);
    const schedule = useStore((state) => state.schedule);
    const courses = useStore((state) => state.courses);

    // Derive unique instructors from courses
    const instructors = Array.from(new Set(courses.map(c => c.instructor))).sort();

    const [selectedInstructor, setSelectedInstructor] = useState<string>('');
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Ders_Programi_${selectedInstructor}`
    });

    const getCourse = (courseId: string) => courses.find(c => c.id === courseId);
    const getClassroom = (classroomId: string) => classrooms.find(c => c.id === classroomId);

    // Show schedule where course.instructor matches selected
    const filteredSchedule = schedule.filter(item => {
        const c = getCourse(item.courseId);
        return c?.instructor === selectedInstructor;
    });

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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Öğretim Üyesi Programı</h2>
                    <p className="text-sm text-slate-500">
                        Hocalara iletmek için kişisel ders programı çıktısı.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <select
                        className="border border-slate-300 rounded-lg px-4 py-2 min-w-[200px] text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        value={selectedInstructor}
                        onChange={e => setSelectedInstructor(e.target.value)}
                    >
                        <option value="">Öğretim Üyesi Seçiniz...</option>
                        {instructors.map(inst => (
                            <option key={inst} value={inst}>{inst}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => handlePrint()}
                        disabled={!selectedInstructor}
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <Printer className="w-4 h-4" />
                        Yazdır
                    </button>
                </div>
            </div>

            {selectedInstructor ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 overflow-x-auto">
                    <div ref={printRef} className="min-w-[800px] p-8 bg-white print:p-0">
                        <div className="text-center mb-8 border-b-2 border-slate-100 pb-6">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">HAFTALIK DERS PROGRAMI</h1>
                            <h2 className="text-3xl font-bold text-indigo-700 mt-2">
                                {selectedInstructor}
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mt-2 uppercase tracking-wide">
                                GÜZ YARIYILI • 2024-2025
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

                                            if (!item) {
                                                return <td key={day} className="border border-slate-300 p-2"></td>;
                                            }

                                            if (isStart) {
                                                const course = getCourse(item.courseId);
                                                const room = getClassroom(item.classroomId);
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
                                                            <div className="text-xs font-bold text-indigo-600 mt-1 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                                                {room?.name}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
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
                            Oluşturulma: {new Date().toLocaleDateString()} • Sonic Sojourner
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                    <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                        <Printer className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-medium">Lütfen programını görüntülemek için bir öğretim üyesi seçiniz.</p>
                </div>
            )}
        </div>
    );
};
