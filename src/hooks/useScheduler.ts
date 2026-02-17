import { useState, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { DAYS, HOURS } from '../types';
import type { Course, ScheduleItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const useScheduler = () => {
    const courses = useStore((state) => state.courses);
    const classrooms = useStore((state) => state.classrooms);
    const setSchedule = useStore((state) => state.setSchedule);
    const [generating, setGenerating] = useState(false);

    const generateSchedule = useCallback((mode: 'full' | 'fill' = 'full') => {
        setGenerating(true);

        // Simulate async operation to not freeze UI
        setTimeout(() => {
            // Validation: Check if it's mathematically possible
            const totalCourseHours = courses.reduce((acc, c) => acc + c.hours.theory + c.hours.practice, 0);
            const totalLabHours = courses
                .filter(c => c.roomRequirement === 'ComputerLab')
                .reduce((acc, c) => acc + c.hours.theory + c.hours.practice, 0);

            const totalRoomHours = classrooms.filter(c => c.type !== 'Online' && c.type !== 'Office').length * 5 * 7; // 5 days * 7 hours
            const totalLabCapacityHours = classrooms.filter(c => c.type === 'ComputerLab').length * 5 * 7;

            if (totalCourseHours > totalRoomHours) {
                alert(`UYARI: Toplam ders saati (${totalCourseHours}), toplam derslik kapasitesinden (${totalRoomHours}) fazla! Bazı dersler yerleşmeyebilir.`);
            }
            if (totalLabHours > totalLabCapacityHours) {
                alert(`UYARI: Toplam Lab ders saati (${totalLabHours}), Lab kapasitesinden (${totalLabCapacityHours}) fazla!`);
            }

            const currentSchedule = useStore.getState().schedule;
            const lockedItems = currentSchedule.filter(i => i.locked);

            // Mode handling: 
            // 'full': Start with ONLY locked items (Clear everything else)
            // 'fill': Start with CURRENT schedule (Keep everything, try to place missing)
            const newSchedule: ScheduleItem[] = mode === 'fill' ? [...currentSchedule] : [...lockedItems];



            // We need to know which SESSIONS are already placed in 'newSchedule'
            // A course might have Theory placed but Practice missing (in fill mode)
            // Or both placed.

            // Create Sessions from Courses (Split Theory and Practice)
            interface SessionToSchedule {
                id: string; // Temporary ID for sorting
                courseId: string;
                type: 'Theory' | 'Practice';
                duration: number;
                totalStudents: number;
                course: Course;
            }

            const sessions: SessionToSchedule[] = [];
            // Filter courses by semester: In Güz, skip 4th year (they're on internship)
            const currentSemester = useStore.getState().semester;
            const activeCourses = currentSemester === 'Güz'
                ? courses.filter(c => Number(c.year) !== 4)
                : courses;

            activeCourses.forEach(c => {
                // Check what is already in newSchedule for this course
                const existingItems = newSchedule.filter(i => i.courseId === c.id);
                const hasTheory = existingItems.some(i => i.sessionType === 'Theory');
                const hasPractice = existingItems.some(i => i.sessionType === 'Practice');

                // Add Theory Session if not present
                if (c.hours.theory > 0 && !hasTheory) {
                    sessions.push({
                        id: `${c.id}-theory`,
                        courseId: c.id,
                        type: 'Theory',
                        duration: c.hours.theory,
                        totalStudents: c.totalStudents,
                        course: c
                    });
                }

                // Add Practice Session if not present
                if (c.hours.practice > 0 && !hasPractice) {
                    sessions.push({
                        id: `${c.id}-practice`,
                        courseId: c.id,
                        type: 'Practice',
                        duration: c.hours.practice,
                        totalStudents: c.totalStudents,
                        course: c
                    });
                }
            });

            // --- Multi-Pass Optimization Strategy ---
            // Try to generate schedule multiple times with different sorting/shuffling
            // Keep the result with the fewest unplaced courses.

            let bestSchedule: ScheduleItem[] = [];
            let bestUnplaced: { courseId: string; reason: string }[] = [];
            let minUnplacedCount = Infinity;

            const MAX_ATTEMPTS = 20;

            // Helper to shuffle array (Fisher-Yates)
            const shuffle = <T>(array: T[]): T[] => {
                let currentIndex = array.length, randomIndex;
                const newArray = [...array];
                while (currentIndex !== 0) {
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex--;
                    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
                }
                return newArray;
            };



            for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
                // Clone base schedule (locked items)
                const currentAttemptSchedule = [...newSchedule];
                const currentAttemptUnplaced: { courseId: string; reason: string }[] = [];

                let sortedSessions = [...sessions];

                if (true) {
                    // ALWAYS use Random Shuffle within Groups for variety
                    // We split by Strict Priority Groups (Zorunlu vs Seçmeli)
                    // Shuffle each group independently.
                    // And CONCATENATE them.

                    const compulsory = sessions.filter(s => s.course.type === 'Zorunlu');
                    const elective = sessions.filter(s => s.course.type !== 'Zorunlu');

                    const shuffledCompulsory = shuffle(compulsory);
                    const shuffledElective = shuffle(elective);

                    // Recombine: Compulsory MUST come before Elective
                    sortedSessions = [...shuffledCompulsory, ...shuffledElective];
                }

                // Helper to check conflicts (Scoped to this attempt)
                const isSlotValid = (day: string, hour: number, duration: number, classroomId: string, course: Course, currentSchedule: ScheduleItem[]) => {
                    // Check if room fits (with +10 tolerance)
                    const room = classrooms.find(r => r.id === classroomId);
                    if (!room || (room.capacity + 10) < course.totalStudents) return false;

                    for (let h = 0; h < duration; h++) {
                        const currentHour = hour + h;
                        if (currentHour === 12) return false;
                        if (currentHour >= 17) return false;

                        const blockedSlots = useStore.getState().blockedSlots;
                        if (blockedSlots.some(bs => bs.day === day && bs.hour === currentHour)) return false;

                        // Check if this classroom+day+hour is reserved
                        const reservedSlots = useStore.getState().reservedSlots;
                        if (reservedSlots.some(rs => rs.classroomId === classroomId && rs.day === day && rs.hour === currentHour)) return false;

                        const itemsAtTime = currentSchedule.filter(item => item.day === day &&
                            (item.startTime <= currentHour && item.startTime + item.duration > currentHour));

                        for (const item of itemsAtTime) {
                            if (item.classroomId === classroomId) return false;
                            if (item.courseId === course.id) return false; // Self conflict

                            const existingCourse = courses.find(c => c.id === item.courseId);
                            if (!existingCourse) continue;

                            // ----------------------------------------------------------------
                            // CRITICAL RULE: Semester-based Year Conflict Rules
                            // ----------------------------------------------------------------
                            const y1 = Number(course.year);
                            const y2 = Number(existingCourse.year);
                            const t1 = course.type;
                            const t2 = existingCourse.type;
                            const currentSemester = useStore.getState().semester;

                            if (t1 === 'Zorunlu' && t2 === 'Zorunlu') {
                                if (currentSemester === 'Güz') {
                                    // GÜZ: No 4th year. 2nd and 3rd year MUST NOT overlap.
                                    if ((y1 === 2 && y2 === 3) || (y1 === 3 && y2 === 2)) {
                                        return false;
                                    }
                                } else {
                                    // BAHAR: 3rd and 4th year MUST NOT overlap.
                                    if ((y1 === 3 && y2 === 4) || (y1 === 4 && y2 === 3)) {
                                        return false;
                                    }
                                }
                            }

                            // Conflict: Same Instructor
                            if (existingCourse.instructor === course.instructor) return false;

                            // Conflict: Language (English vs Turkish Elective)
                            // Rule: EN course cannot overlap with TR Elective OF THE SAME YEAR
                            // Case 1: Placing EN, check against existing TR Elective
                            if (y1 === y2 && course.language === 'EN' && existingCourse.language === 'TR' && existingCourse.type === 'Seçmeli') return false;
                            // Case 2: Placing TR Elective, check against existing EN
                            if (y1 === y2 && course.type === 'Seçmeli' && course.language === 'TR' && existingCourse.language === 'EN') return false;


                            const bothElective = course.type === 'Seçmeli' && existingCourse.type === 'Seçmeli';

                            // Constraint: Max concurrent electives
                            // Relaxed from 3 to 15 to allow more flexibility
                            if (bothElective) {
                                const electiveCountAtSlot = itemsAtTime.filter(i => {
                                    const c = courses.find(course => course.id === i.courseId);
                                    return c && c.type === 'Seçmeli';
                                }).length;
                                if (electiveCountAtSlot >= 15) return false;
                            }

                            // Same Year Conflict (unless both are elective)
                            if (y1 === y2 && !bothElective) return false;
                        }
                    }
                    return true;
                };

                // ... (isSoftConstraintViolated stays largely the same)
                const isSoftConstraintViolated = (day: string, hour: number, duration: number, course: Course, currentSchedule: ScheduleItem[]) => {
                    // ... existing implementation
                    for (let h = 0; h < duration; h++) {
                        const currentHour = hour + h;
                        const itemsAtTime = currentSchedule.filter(item => item.day === day &&
                            (item.startTime <= currentHour && item.startTime + item.duration > currentHour));

                        for (const item of itemsAtTime) {
                            const existingCourse = courses.find(c => c.id === item.courseId);
                            if (!existingCourse) continue;
                            if ((course.year === 2 && existingCourse.year === 3) || (course.year === 3 && existingCourse.year === 2)) {
                                if (course.type === 'Zorunlu' && existingCourse.type === 'Zorunlu') return true;
                            }
                            if (Math.abs(course.year - existingCourse.year) === 1) {
                                if ((course.year === 1 && existingCourse.year === 2) || (course.year === 2 && existingCourse.year === 1)) continue;
                                if (course.type === 'Zorunlu' && existingCourse.type === 'Zorunlu') return true;
                            }
                        }
                    }
                    return false;
                };

                // Type for day/load object
                interface DayLoad { day: string; load: number; }

                // Placement Loop
                for (const session of sortedSessions) {
                    const { course, duration, type } = session;
                    let placementError = "Uygun zaman/derslik bulunamadı";
                    let placed = false;

                    // Determine valid room types for this session
                    let targetRoomTypes = ['Classroom'];
                    if (course.roomRequirement === 'ComputerLab') {
                        targetRoomTypes = ['ComputerLab'];
                    } else if (course.roomRequirement === 'LabOrClassroom') {
                        targetRoomTypes = ['Classroom', 'ComputerLab'];
                    } else if (course.roomRequirement === 'Online') {
                        targetRoomTypes = ['Online'];
                    } else if (course.roomRequirement === 'Office') {
                        targetRoomTypes = ['Office'];
                    }

                    // Filter valid rooms for this session
                    const validClassrooms = classrooms
                        .filter(r => targetRoomTypes.includes(r.type))
                        .sort((a, b) => {
                            if (course.roomRequirement === 'LabOrClassroom') {
                                if (a.type !== b.type) {
                                    return a.type === 'Classroom' ? -1 : 1;
                                }
                            }
                            return a.capacity - b.capacity;
                        });

                    if (validClassrooms.length === 0) {
                        placementError = `Otomatik atanabilir derslik bulunamadı (Tipi: ${course.roomRequirement})`;
                    }

                    // Search Strategy Definition
                    // We will define a list of search strategies to try in order.
                    // 1. Balanced: Heuristic load balancing (try least loaded days first) + Soft Constraints
                    // 2. Balanced Relaxed: Heuristic load balancing + Ignore Soft Constraints
                    // 3. Deep Search: Brute force (Monday->Friday, Morning->Evening) + Ignore Soft Constraints (Exhaustive)

                    const strategies = [];

                    // Strategy 1 & 2: Load Balanced
                    const dayLoads: DayLoad[] = DAYS.map(day => {
                        let load = 0;
                        const itemsOnDay = currentAttemptSchedule.filter(item => item.day === day);
                        for (const item of itemsOnDay) load += item.duration;
                        return { day, load };
                    });
                    dayLoads.sort((a, b) => a.load - b.load); // Least loaded first

                    strategies.push({ name: 'Balanced', days: dayLoads.map(d => d.day), checkSoft: true });
                    strategies.push({ name: 'BalancedRelaxed', days: dayLoads.map(d => d.day), checkSoft: false });

                    // Strategy 3: Deep Search (Exhaustive) - strict order to catch gaps heuristics might miss
                    strategies.push({ name: 'DeepSearch', days: DAYS, checkSoft: false });


                    searchLoop:
                    for (const strategy of strategies) {
                        for (const day of strategy.days) {
                            for (const hour of HOURS) {
                                if (hour + duration > 17) continue;
                                if (hour < 12 && hour + duration > 12) continue; // Lunch break check

                                for (const room of validClassrooms) {
                                    if (isSlotValid(day, hour, duration, room.id, course, currentAttemptSchedule)) {
                                        // Check soft constraints if strategy requires it
                                        if (strategy.checkSoft && isSoftConstraintViolated(day, hour, duration, course, currentAttemptSchedule)) {
                                            continue;
                                        }

                                        // Found a slot!
                                        currentAttemptSchedule.push({
                                            id: uuidv4(),
                                            courseId: course.id,
                                            day,
                                            startTime: hour,
                                            duration: duration,
                                            classroomId: room.id,
                                            sessionType: type
                                        });
                                        placed = true;
                                        break searchLoop;
                                    }
                                }
                            }
                        }
                    }

                    if (!placed) {
                        const failReason = `${placementError} (${type === 'Theory' ? 'Teorik' : 'Uygulama'}) - ${course.year}. Sınıf`;
                        currentAttemptUnplaced.push({ courseId: course.id, reason: failReason });
                    }
                } // End Placement Loop

                // Check if this attempt is better
                // Weighted Score: 
                // Unplaced Zorunlu = 10,000 penalty
                // Unplaced Seçmeli = 1 penalty

                const currentMandatoryFail = currentAttemptUnplaced.filter(u => {
                    const c = courses.find(course => course.id === u.courseId);
                    return c?.type === 'Zorunlu';
                }).length;

                const currentElectiveFail = currentAttemptUnplaced.filter(u => {
                    const c = courses.find(course => course.id === u.courseId);
                    return c?.type === 'Seçmeli';
                }).length;

                const currentScore = (currentMandatoryFail * 10000) + currentElectiveFail;

                if (currentScore < minUnplacedCount) { // minUnplacedCount is actually minScore now
                    minUnplacedCount = currentScore;
                    bestSchedule = currentAttemptSchedule;
                    bestUnplaced = currentAttemptUnplaced;
                }

                // Perfect score? Stop early
                if (minUnplacedCount === 0) break;

            } // End Attempt Loop

            setSchedule(bestSchedule);
            useStore.setState({ unscheduledCourses: bestUnplaced });
            setGenerating(false);

            if (bestUnplaced.length > 0) {
                // Detailed Error Summary
                const unplacedCourses = bestUnplaced.map(u => courses.find(c => c.id === u.courseId));
                const mandatoryFail = unplacedCourses.filter(c => c?.type === 'Zorunlu').length;
                const electiveFail = unplacedCourses.filter(c => c?.type === 'Seçmeli').length;

                alert(`İşlem tamamlandı.
                
                Yerleştirilemeyen Ders: ${bestUnplaced.length}
                - Zorunlu: ${mandatoryFail} ${mandatoryFail > 0 ? '(KRİTİK!)' : ''}
                - Seçmeli: ${electiveFail}
                
                Detaylar için "Hata" butonuna tıklayın.`);
            } else {
                // Optional: Success message
                // alert("Program başarıyla oluşturuldu! Hata yok.");
            }

        }, 100);
    }, [courses, classrooms, setSchedule]);

    return { generateSchedule, generating };
};
