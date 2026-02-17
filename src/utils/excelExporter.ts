import * as XLSX from 'xlsx';
import type { ScheduleItem, Course, Classroom } from '../types';

export const exportScheduleToExcel = (
    schedule: ScheduleItem[],
    courses: Course[],
    classrooms: Classroom[]
) => {
    // 1. Prepare Data
    // We'll create a flat list: Day | Time | Code | Name | Type | Instructor | Classroom
    const data = schedule.map(item => {
        const course = courses.find(c => c.id === item.courseId);
        const classroom = classrooms.find(c => c.id === item.classroomId);

        return {
            'Gün': item.day,
            'Başlangıç': `${item.startTime}:00`,
            'Bitiş': `${item.startTime + item.duration}:00`,
            'Ders Kodu': course?.code || '?',
            'Ders Adı': course?.name || '?',
            'Tür': course?.type || '?',
            'Öğretim Üyesi': course?.instructor || '?',
            'Derslik': classroom?.name || '?',
            'Sınıf (Yıl)': course?.year || '?'
        };
    });

    // 2. Create Search-friendly sorting (Day > Time > Year)
    const dayOrder = { 'Pazartesi': 1, 'Salı': 2, 'Çarşamba': 3, 'Perşembe': 4, 'Cuma': 5 };
    data.sort((a, b) => {
        const d = (dayOrder[a['Gün'] as keyof typeof dayOrder] || 9) - (dayOrder[b['Gün'] as keyof typeof dayOrder] || 9);
        if (d !== 0) return d;
        return a['Başlangıç'].localeCompare(b['Başlangıç']);
    });

    // 3. Generate Worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // 4. Generate Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ders Programı");

    // 5. Write File
    XLSX.writeFile(wb, "Ders_Programi.xlsx");
};
