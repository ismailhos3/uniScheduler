import * as XLSX from 'xlsx';
import type { Course } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const parseExcel = (file: File): Promise<Course[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                // Skip header row (assuming row 0 constitutes headers based on user description, 
                // but user description implies a complex header with merged cells for "Haftalık Ders saati".
                // Let's inspect the data structure flexibility. 
                // We will look for the row that contains "Dersin Kodu" to identify the header row.

                let headerRowIndex = -1;
                for (let i = 0; i < jsonData.length; i++) {
                    const row = jsonData[i] as any[];
                    if (row.some(cell => typeof cell === 'string' && cell.includes('Dersin Kodu'))) {
                        headerRowIndex = i;
                        break;
                    }
                }

                if (headerRowIndex === -1) {
                    reject(new Error("Uygun formatta başlık satırı (Dersin Kodu) bulunamadı."));
                    return;
                }

                const courses: Course[] = [];
                const headers = jsonData[headerRowIndex] as string[];

                // Helper to find index (Case-insensitive)
                const getIndex = (keyword: string) => headers.findIndex(h => h && h.toString().toLowerCase().includes(keyword.toLowerCase()));

                // Standard Columns
                const idxCurriculum = getIndex('Müfredat'); // Optional in new format
                const idxYear = getIndex('Sınıf'); // Matches "Dersin Sınıfı" or "Sınıf"
                const idxCode = getIndex('Dersin Kodu');
                const idxName = getIndex('Dersin adı') !== -1 ? getIndex('Dersin adı') : getIndex('Ders Adı');
                const idxType = getIndex('Seçmeli'); // Matches "Seçmeli / Zorunlu"
                const idxStudentFirst = getIndex('İlk kez');
                const idxStudentRetake = getIndex('Alttan');
                const idxInstructor = getIndex('Dersi veren'); // Matches "Dersi veren öğretim elemanı"
                const idxBranch = getIndex('Şube');

                // Sub-headers for Hours (Teorik / Uygulama)
                const subHeaders = jsonData[headerRowIndex + 1] as string[];
                let idxTheory = -1;
                let idxPractice = -1;

                if (subHeaders) {
                    subHeaders.forEach((h, i) => {
                        if (h && h.toString().toLowerCase().includes('teorik')) idxTheory = i;
                        if (h && h.toString().toLowerCase().includes('uygulama')) idxPractice = i;
                    });
                }

                // Fallback if not found in subheaders
                if (idxTheory === -1) idxTheory = getIndex('Teorik');
                if (idxPractice === -1) idxPractice = getIndex('Uygulama');

                // Language column - Robust search
                let idxLanguage = getIndex('Dil');
                if (idxLanguage === -1) idxLanguage = getIndex('Language');

                // If not found in main header row, check the row ABOVE it (merged headers?)
                if (idxLanguage === -1 && headerRowIndex > 0) {
                    const upperHeaders = jsonData[headerRowIndex - 1] as string[];
                    if (upperHeaders) {
                        idxLanguage = upperHeaders.findIndex(h => h && h.toString().toLowerCase().includes('dil'));
                        if (idxLanguage === -1) {
                            idxLanguage = upperHeaders.findIndex(h => h && h.toString().toLowerCase().includes('language'));
                        }
                    }
                }

                for (let i = headerRowIndex + (subHeaders ? 2 : 1); i < jsonData.length; i++) {
                    const row = jsonData[i] as any[];
                    if (!row || row.length === 0 || !row[idxCode]) continue;

                    const year = parseInt(row[idxYear]) || 1;
                    const firstTime = parseInt(row[idxStudentFirst]) || 0;
                    const retaking = parseInt(row[idxStudentRetake]) || 0;
                    const theory = parseInt(row[idxTheory]) || 0;
                    const practice = parseInt(row[idxPractice]) || 0;

                    if (!row[idxName]) continue;

                    let courseName = row[idxName] || '';
                    if (idxBranch !== -1 && row[idxBranch]) {
                        courseName += ` - Şube ${row[idxBranch]}`;
                    }

                    // Parse Language
                    let language: 'TR' | 'EN' = 'TR';
                    if (idxLanguage !== -1 && row[idxLanguage]) {
                        const langVal = row[idxLanguage].toString().toLowerCase();
                        if (langVal.includes('ing') || langVal.includes('en') || langVal.includes('eng')) {
                            language = 'EN';
                        }
                    }

                    courses.push({
                        id: uuidv4(),
                        curriculum: row[idxCurriculum] || '',
                        year: year,
                        code: row[idxCode] || '',
                        name: courseName,
                        type: (row[idxType] && row[idxType].toString().toLowerCase().includes('zorunlu')) ? 'Zorunlu' : 'Seçmeli',
                        studentCount: {
                            firstTime,
                            retaking
                        },
                        totalStudents: firstTime + retaking,
                        hours: {
                            theory,
                            practice
                        },
                        instructor: row[idxInstructor] || 'Atanmamış',
                        roomRequirement: (courseName.toLowerCase().includes('lab') || courseName.toLowerCase().includes('laboratuvar')) ? 'ComputerLab' : 'Classroom',
                        language
                    });
                }

                resolve(courses);

            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
};
