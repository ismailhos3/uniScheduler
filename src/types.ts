export interface Course {
    id: string;
    curriculum: string; // Müfredat
    year: number; // Ders sınıfı (1, 2, 3, 4)
    code: string; // Dersin Kodu
    name: string; // Dersin adı
    type: 'Zorunlu' | 'Seçmeli';
    studentCount: {
        firstTime: number; // İlk kez alacak öğrenci sayısı
        retaking: number; // Alttan alacak öğrenci sayısı
    };
    totalStudents: number; // firstTime + retaking
    hours: {
        theory: number;
        practice: number;
    };
    instructor: string; // Dersi veren öğretim üyesi
    roomRequirement: 'Classroom' | 'ComputerLab' | 'LabOrClassroom' | 'Office' | 'Online';
    language: 'TR' | 'EN'; // Dersin dili
}

export interface Classroom {
    id: string;
    name: string;
    capacity: number;
    type: 'Classroom' | 'ComputerLab' | 'Office' | 'Online';
}

export interface ScheduleItem {
    id: string;
    courseId: string;
    day: string; // "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"
    startTime: number; // 9, 10, ... 16
    duration: number; // 1, 2, 3...
    sessionType?: 'Theory' | 'Practice'; // [NEW]
    classroomId: string;
    locked?: boolean;
}

export const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
export const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16]; // 12 is lunch break
