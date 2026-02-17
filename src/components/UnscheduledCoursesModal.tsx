import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const UnscheduledCoursesModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const unscheduledCourses = useStore((state) => state.unscheduledCourses);
    const courses = useStore((state) => state.courses);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                        Yerleştirilemeyen Dersler ({unscheduledCourses.length})
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1">
                    {unscheduledCourses.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            Tüm dersler başarıyla yerleştirildi!
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {unscheduledCourses.map((item, index) => {
                                const course = courses.find(c => c.id === item.courseId);
                                if (!course) return null;

                                return (
                                    <li key={index} className="bg-red-50 border border-red-100 p-4 rounded-lg flex flex-col gap-1">
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-gray-800">{course.name}</span>
                                            <span className="text-xs bg-white text-gray-600 px-2 py-1 rounded border border-gray-200">
                                                {course.code}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            <span className="font-semibold">Öğretim Üyesi:</span> {course.instructor}
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            <span className="font-semibold">Öğrenci Sayısı:</span> {course.totalStudents}
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            <span className="font-semibold">Gereksinim:</span>{' '}
                                            {course.roomRequirement === 'Classroom' ? 'Derslik' :
                                                course.roomRequirement === 'ComputerLab' ? 'Bilgisayar Lab' :
                                                    course.roomRequirement === 'Office' ? 'Ofis' : 'Online'}
                                        </div>
                                        <div className="mt-2 text-sm text-red-700 font-medium bg-white/50 p-2 rounded">
                                            <span className="font-bold">Neden:</span> {item.reason}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-medium transition"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
};
