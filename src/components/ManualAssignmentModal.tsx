import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { DAYS, HOURS } from '../types';
import type { ScheduleItem } from '../types';
import { X, Save, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const ManualAssignmentModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const courses = useStore((state) => state.courses);
    const classrooms = useStore((state) => state.classrooms);
    const addScheduleItem = useStore((state) => state.addScheduleItem);
    const schedule = useStore((state) => state.schedule);
    const reservedSlots = useStore((state) => state.reservedSlots);

    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedDay, setSelectedDay] = useState(DAYS[0]);
    const [selectedHour, setSelectedHour] = useState(HOURS[0]);
    const [selectedClassroom, setSelectedClassroom] = useState('');
    const [duration, setDuration] = useState(1);
    const [sessionType, setSessionType] = useState<'Theory' | 'Practice'>('Theory');

    const [confirmConflict, setConfirmConflict] = useState(false);
    const [conflictMessage, setConflictMessage] = useState('');

    // Reset state when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setConfirmConflict(false);
            setConflictMessage('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!selectedCourseId || !selectedClassroom) {
            alert("Lütfen ders ve derslik seçiniz.");
            return;
        }

        // Check classroom conflict
        const classroomConflict = schedule.find(item =>
            item.classroomId === selectedClassroom &&
            item.day === selectedDay &&
            ((item.startTime <= selectedHour && item.startTime + item.duration > selectedHour) ||
                (selectedHour <= item.startTime && selectedHour + duration > item.startTime))
        );

        // Check instructor conflict (same instructor, same time, ANY classroom)
        const selectedCourse = courses.find(c => c.id === selectedCourseId);
        const instructorConflict = selectedCourse ? schedule.find(item => {
            const itemCourse = courses.find(c => c.id === item.courseId);
            if (!itemCourse || itemCourse.instructor !== selectedCourse.instructor) return false;
            if (item.day !== selectedDay) return false;
            // Time overlap check
            return (item.startTime < selectedHour + duration && item.startTime + item.duration > selectedHour);
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
        const conflictMessage = reservedConflict
            ? `🛡️ Bu dersliğin bu saati başka bir bölüm/program için REZERVE edilmiş.`
            : instructorConflict
                ? `⚠️ Öğretim Üyesi Çakışması! ${selectedCourse?.instructor} bu saatte başka bir derse (${courses.find(c => c.id === instructorConflict.courseId)?.name}) zaten atanmış.`
                : classroomConflict
                    ? 'Seçilen saatte ve derslikte başka bir ders var.'
                    : '';

        if (hasConflict && !confirmConflict) {
            setConflictMessage(conflictMessage);
            setConfirmConflict(true);
            return;
        }

        const newItem: ScheduleItem = {
            id: uuidv4(),
            courseId: selectedCourseId,
            day: selectedDay,
            startTime: parseInt(selectedHour.toString()),
            duration: parseInt(duration.toString()),
            classroomId: selectedClassroom,
            sessionType: sessionType,
            locked: true // Manual assignments are locked by default
        };

        addScheduleItem(newItem);
        onClose();
        setConfirmConflict(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Lock className="w-5 h-5 text-indigo-600" />
                        Manuel Ders Atama
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {confirmConflict && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 animate-in fade-in slide-in-from-top-2 duration-200">
                        <p className="font-bold flex items-center gap-2">
                            <span className="text-lg">⚠️</span> Çakışma Tespit Edildi!
                        </p>
                        <p>{conflictMessage} Yine de eklemek istiyor musunuz?</p>
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
                                Evet, Ekle
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ders Seçin</label>
                        <select
                            className="w-full border rounded-md p-2"
                            value={selectedCourseId}
                            onChange={e => setSelectedCourseId(e.target.value)}
                        >
                            <option value="">Seçiniz...</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.code} - {c.name} ({c.year}. Sınıf)</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gün</label>
                            <select
                                className="w-full border rounded-md p-2"
                                value={selectedDay}
                                onChange={e => setSelectedDay(e.target.value)}
                            >
                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Saati</label>
                            <select
                                className="w-full border rounded-md p-2"
                                value={selectedHour}
                                onChange={e => setSelectedHour(parseInt(e.target.value))}
                            >
                                {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Derslik</label>
                            <select
                                className="w-full border rounded-md p-2"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Süre (Saat)</label>
                            <input
                                type="number"
                                className="w-full border rounded-md p-2"
                                min="1"
                                max="5"
                                value={duration}
                                onChange={e => setDuration(parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ders Tipi</label>
                        <div className="flex gap-4 p-2 border rounded-md bg-gray-50">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="sessionType"
                                    checked={sessionType === 'Theory'}
                                    onChange={() => setSessionType('Theory')}
                                    className="text-indigo-600 focus:ring-indigo-500"
                                />
                                Teorik
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="sessionType"
                                    checked={sessionType === 'Practice'}
                                    onChange={() => setSessionType('Practice')}
                                    className="text-indigo-600 focus:ring-indigo-500"
                                />
                                Uygulama
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end mt-6">
                        <button
                            onClick={handleSave}
                            disabled={confirmConflict}
                            className={cn(
                                "w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 font-medium shadow-sm shadow-indigo-200",
                                confirmConflict && "opacity-50 cursor-not-allowed bg-slate-400 hover:bg-slate-400 shadow-none"
                            )}
                        >
                            <Save className="w-5 h-5" />
                            {confirmConflict ? 'Yukarıdaki Uyarıyı Cevaplayın' : 'Kaydet ve Kilitle'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
