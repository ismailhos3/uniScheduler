import React, { useState } from 'react';
import type { Course } from '../types';
import { X, Save } from 'lucide-react';

interface Props {
    course: Course;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedCourse: Course) => void;
}

export const CourseEditModal: React.FC<Props> = ({ course, isOpen, onClose, onSave }) => {
    const [roomRequirement, setRoomRequirement] = useState<Course['roomRequirement']>(course.roomRequirement || 'Classroom');

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({
            ...course,
            roomRequirement
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Ders Düzenle</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-900">{course.code} - {course.name}</h3>
                        <p className="text-sm text-gray-500">{course.instructor}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Derslik Gereksinimi</label>
                        <select
                            className="w-full border rounded-md p-2"
                            value={roomRequirement}
                            onChange={e => setRoomRequirement(e.target.value as any)}
                        >
                            <option value="Classroom">Sınıf/Derslik</option>
                            <option value="ComputerLab">Bilgisayar Laboratuvarı</option>
                            <option value="Office">Öğretim Üyesi Ofisi</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Bu dersin atanması gereken mekan tipini seçiniz.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ders Türü</label>
                        <select
                            className="w-full border rounded-md p-2"
                            value={course.type}
                            onChange={e => onSave({ ...course, type: e.target.value as 'Zorunlu' | 'Seçmeli' })}
                        >
                            <option value="Zorunlu">Zorunlu</option>
                            <option value="Seçmeli">Seçmeli</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Zorunlu dersler öncelikli yerleştirilir. Seçmeli dersler sonraya bırakılır.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ders Dili</label>
                        <select
                            className="w-full border rounded-md p-2"
                            value={course.language || 'TR'}
                            onChange={e => onSave({ ...course, language: e.target.value as 'TR' | 'EN', roomRequirement })}
                        >
                            <option value="TR">Türkçe (TR)</option>
                            <option value="EN">İngilizce (EN)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            İngilizce dersler ile Türkçe seçmeli dersler aynı saatte çakışmaz.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Kaydet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
