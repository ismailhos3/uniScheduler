
import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import { parseExcel } from '../utils/excelParser';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { CourseEditModal } from './CourseEditModal';
import type { Course } from '../types';

export const ExcelUploader: React.FC = () => {
    const [dragActive, setDragActive] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const setCourses = useStore((state) => state.setCourses);
    const courses = useStore((state) => state.courses);
    const resetAll = useStore((state) => state.resetAll);

    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    const handleReset = () => {
        if (window.confirm('Tüm yüklenen dersler ve oluşturulan program silinecek. Emin misiniz?')) {
            resetAll();
            setStatus('idle');
            setMessage('');
        }
    };

    const handleCourseUpdate = (updatedCourse: Course) => {
        const updatedCourses = courses.map(c => c.id === updatedCourse.id ? updatedCourse : c);
        setCourses(updatedCourses);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const processFile = async (file: File) => {
        setStatus('loading');
        try {
            const parsedCourses = await parseExcel(file);
            setCourses(parsedCourses);
            setStatus('success');
            setMessage(`${parsedCourses.length} ders başarıyla yüklendi.`);
        } catch (error) {
            setStatus('error');
            setMessage('Dosya işlenirken hata oluştu. Lütfen formatı kontrol edin.');
            console.error(error);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Veri Yükleme</h2>
                <p className="text-slate-500">Ders programı oluşturmak için Excel dosyanızı yükleyin.</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ease-in-out cursor-pointer group",
                    dragActive ? "border-indigo-500 bg-indigo-50/50 scale-[1.01]" : "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30",
                    status === 'error' && "border-red-300 bg-red-50/50",
                    status === 'success' && "border-green-300 bg-green-50/50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".xlsx, .xls"
                    onChange={handleChange}
                />

                <label htmlFor="file-upload" className="absolute inset-0 cursor-pointer" />

                <div className="flex flex-col items-center gap-6 pointer-events-none">
                    <div className={cn(
                        "w-20 h-20 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
                        status === 'loading' ? "bg-indigo-100" :
                            status === 'success' ? "bg-green-100" :
                                status === 'error' ? "bg-red-100" :
                                    "bg-white shadow-md group-hover:shadow-lg group-hover:scale-110"
                    )}>
                        {status === 'loading' ? (
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                        ) : status === 'success' ? (
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        ) : status === 'error' ? (
                            <AlertCircle className="w-10 h-10 text-red-600" />
                        ) : (
                            <Upload className="w-10 h-10 text-indigo-600" />
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-slate-700">
                            {status === 'loading' ? 'Dosya İşleniyor...' :
                                status === 'success' ? 'Başarılı!' :
                                    'Excel Dosyasını Sürükleyin'}
                        </h3>
                        <p className="text-slate-400 max-w-sm mx-auto">
                            {message || "veya dosya seçmek için tıklayın (.xlsx, .xls)"}
                        </p>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {courses.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                    <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Yüklenen Dersler</h3>
                                    <p className="text-sm text-slate-500">{courses.length} ders listeleniyor</p>
                                </div>
                            </div>
                            <button
                                onClick={handleReset}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Tümünü Temizle
                            </button>
                        </div>

                        <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="p-4 font-semibold text-slate-600">Ders Kodu</th>
                                            <th className="p-4 font-semibold text-slate-600">Ders Adı</th>
                                            <th className="p-4 font-semibold text-slate-600">Tür</th>
                                            <th className="p-4 font-semibold text-slate-600">Dil</th>
                                            <th className="p-4 font-semibold text-slate-600">Sınıf</th>
                                            <th className="p-4 font-semibold text-slate-600">Öğretim Üyesi</th>
                                            <th className="p-4 font-semibold text-slate-600">T/U</th>
                                            <th className="p-4 font-semibold text-slate-600">Gereksinim</th>
                                            <th className="p-4 font-semibold text-slate-600 text-right">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {courses.map((course) => (
                                            <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="p-4 font-medium text-slate-900">{course.code}</td>
                                                <td className="p-4 text-slate-600">{course.name}</td>
                                                <td className="p-4">
                                                    <select
                                                        value={course.type}
                                                        onChange={(e) => handleCourseUpdate({ ...course, type: e.target.value as 'Zorunlu' | 'Seçmeli' })}
                                                        className={cn(
                                                            "text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500",
                                                            course.type === 'Zorunlu'
                                                                ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                                                                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                        )}
                                                    >
                                                        <option value="Zorunlu">Zorunlu</option>
                                                        <option value="Seçmeli">Seçmeli</option>
                                                    </select>
                                                </td>
                                                <td className="p-4">
                                                    <select
                                                        value={course.language || 'TR'}
                                                        onChange={(e) => handleCourseUpdate({ ...course, language: e.target.value as 'TR' | 'EN' })}
                                                        className={cn(
                                                            "text-xs font-semibold px-2 py-1 rounded border-0 cursor-pointer ring-1 ring-inset focus:ring-2 focus:ring-indigo-600 appearance-none pr-6 bg-no-repeat bg-right",
                                                            course.language === 'EN' ? "bg-blue-50 text-blue-700 ring-blue-600/20" : "bg-slate-50 text-slate-600 ring-slate-200"
                                                        )}
                                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundSize: '1.25em 1.25em' }}
                                                    >
                                                        <option value="TR">TR</option>
                                                        <option value="EN">EN</option>
                                                    </select>
                                                </td>
                                                <td className="p-4 text-slate-600">{course.year}</td>
                                                <td className="p-4 text-slate-600">{course.instructor}</td>
                                                <td className="p-4 text-slate-600 bg-slate-50 font-mono text-xs">{course.hours.theory} / {course.hours.practice}</td>
                                                <td className="p-4">
                                                    <select
                                                        value={course.roomRequirement || 'Classroom'}
                                                        onChange={(e) => handleCourseUpdate({ ...course, roomRequirement: e.target.value as any })}
                                                        className="text-xs font-medium px-2 py-1 rounded bg-slate-100 border-none text-slate-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer w-full"
                                                    >
                                                        <option value="Classroom">Derslik</option>
                                                        <option value="ComputerLab">Lab</option>
                                                        <option value="LabOrClassroom">Lab/Derslik</option>
                                                        <option value="Office">Ofis</option>
                                                    </select>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                                            course.totalStudents > 80 ? "bg-red-50 text-red-600" :
                                                                course.totalStudents > 40 ? "bg-amber-50 text-amber-600" :
                                                                    "bg-emerald-50 text-emerald-600"
                                                        )}>
                                                            {course.totalStudents} ÖĞR.
                                                        </span>
                                                        <button
                                                            onClick={() => setEditingCourse(course)}
                                                            className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-md transition-colors"
                                                            title="Düzenle"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {editingCourse && (
                <CourseEditModal
                    course={editingCourse}
                    isOpen={!!editingCourse}
                    onClose={() => setEditingCourse(null)}
                    onSave={handleCourseUpdate}
                />
            )}
        </div>
    );
};
