import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { DAYS, HOURS } from '../types';
import type { ScheduleItem } from '../types';
import { X, Save, Edit, Trash2 } from 'lucide-react';

interface Props {
    item: ScheduleItem | null;
    isOpen: boolean;
    onClose: () => void;
}

export const EditScheduleModal: React.FC<Props> = ({ item, isOpen, onClose }) => {
    const courses = useStore((state) => state.courses);
    const classrooms = useStore((state) => state.classrooms);
    const updateScheduleItem = useStore((state) => state.updateScheduleItem);
    const removeScheduleItem = useStore((state) => state.removeScheduleItem);
    const schedule = useStore((state) => state.schedule);
    const reservedSlots = useStore((state) => state.reservedSlots);

    const [selectedDay, setSelectedDay] = useState(DAYS[0]);
    const [selectedHour, setSelectedHour] = useState(HOURS[0]);
    const [selectedClassroom, setSelectedClassroom] = useState('');
    const [duration, setDuration] = useState(1);
    const [sessionType, setSessionType] = useState<'Theory' | 'Practice'>('Theory');

    const [confirmDelete, setConfirmDelete] = useState(false);
    const [confirmConflict, setConfirmConflict] = useState(false);

    useEffect(() => {
        if (item) {
            setSelectedDay(item.day);
            setSelectedHour(item.startTime);
            setSelectedClassroom(item.classroomId);
            setDuration(item.duration);
            setSessionType(item.sessionType || 'Theory');
            setConfirmDelete(false);
            setConfirmConflict(false);
        }
    }, [item]);

    if (!isOpen || !item) return null;

    const course = courses.find(c => c.id === item.courseId);

    const handleSave = () => {
        if (!selectedClassroom) {
            alert("Lütfen derslik seçiniz.");
            return;
        }

        // Check if slot is occupied (excluding current editing item) — Classroom conflict
        const classroomConflict = schedule.find(sItem =>
            sItem.id !== item.id && // Exclude self
            sItem.classroomId === selectedClassroom &&
            sItem.day === selectedDay &&
            ((sItem.startTime <= selectedHour && sItem.startTime + sItem.duration > selectedHour) ||
                (selectedHour <= sItem.startTime && selectedHour + duration > sItem.startTime))
        );

        // Check instructor conflict (same instructor, same time, ANY classroom)
        const instructorConflict = course ? schedule.find(sItem => {
            if (sItem.id === item.id) return false; // Exclude self
            const sItemCourse = courses.find(c => c.id === sItem.courseId);
            if (!sItemCourse || sItemCourse.instructor !== course.instructor) return false;
            if (sItem.day !== selectedDay) return false;
            return (sItem.startTime < selectedHour + duration && sItem.startTime + sItem.duration > selectedHour);
        }) : null;

        const conflict = classroomConflict || instructorConflict;

        // Check if any hour in duration overlaps with a reserved slot
        const reservedConflict = (() => {
            for (let h = 0; h < duration; h++) {
                if (reservedSlots.some(rs => rs.classroomId === selectedClassroom && rs.day === selectedDay && rs.hour === selectedHour + h)) {
                    return true;
                }
            }
            return false;
        })();

        const hasConflict = conflict || reservedConflict;

        if (hasConflict && !confirmConflict) {
            setConfirmConflict(true);
            return;
        }

        updateScheduleItem(item.id, {
            day: selectedDay,
            startTime: selectedHour,
            duration: duration,
            classroomId: selectedClassroom,
            sessionType: sessionType,
            locked: true // Edited items become locked/manual
        });
        onClose();
    };

    const handleDelete = () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        removeScheduleItem(item.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <Edit className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Dersi Düzenle</h2>
                        <p className="text-sm text-gray-500">Ders bilgilerini güncelleyin veya silin</p>
                    </div>
                </div>

                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">{course?.code}</span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-600">{course?.year}. Sınıf</span>
                    </div>
                    <p className="font-medium text-slate-700 text-sm mb-1">{course?.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                        <span>👨‍🏫</span> {course?.instructor}
                    </p>
                </div>

                {confirmConflict && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 animate-in fade-in slide-in-from-top-2 duration-200">
                        <p className="font-bold flex items-center gap-2">
                            <span className="text-lg">⚠️</span> Çakışma Var!
                        </p>
                        <p>Seçilen saatte ve derslikte başka bir ders var. Yine de güncellemek istiyor musunuz?</p>
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => setConfirmConflict(false)}
                                className="px-3 py-1 bg-white border border-amber-200 rounded text-amber-700 hover:bg-amber-100 text-xs font-medium"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 text-xs font-medium"
                            >
                                Evet, Güncelle
                            </button>
                        </div>
                    </div>
                )}

                {confirmDelete && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 animate-in fade-in slide-in-from-top-2 duration-200">
                        <p className="font-bold">Emin misiniz?</p>
                        <p>Bu ders programdan kaldırılacak.</p>
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="px-3 py-1 bg-white border border-red-200 rounded text-red-700 hover:bg-red-100 text-xs font-medium"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium"
                            >
                                Evet, Sil
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Gün</label>
                            <select
                                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                value={selectedDay}
                                onChange={e => setSelectedDay(e.target.value)}
                            >
                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Saat</label>
                            <select
                                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                value={selectedHour}
                                onChange={e => setSelectedHour(parseInt(e.target.value))}
                            >
                                {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Derslik</label>
                            <select
                                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                value={selectedClassroom}
                                onChange={e => setSelectedClassroom(e.target.value)}
                            >
                                <option value="">Seçiniz...</option>
                                {classrooms.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} ({r.capacity})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Süre</label>
                            <input
                                type="number"
                                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                min="1"
                                max="5"
                                value={duration}
                                onChange={e => setDuration(parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Ders Tipi</label>
                        <div className="flex p-1 bg-slate-100 rounded-lg">
                            <button
                                onClick={() => setSessionType('Theory')}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${sessionType === 'Theory' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Teorik
                            </button>
                            <button
                                onClick={() => setSessionType('Practice')}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${sessionType === 'Practice' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Uygulama
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
                        <button
                            onClick={() => confirmDelete ? setConfirmDelete(false) : handleDelete()}
                            className={`flex-1 py-2.5 rounded-lg transition font-medium text-sm flex items-center justify-center gap-2 ${confirmDelete ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                        >
                            <Trash2 className="w-4 h-4" />
                            {confirmDelete ? 'İptal' : 'Programdan Sil'}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={confirmDelete}
                            className="flex-[2] bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-200"
                        >
                            <Save className="w-4 h-4" />
                            Güncelle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
