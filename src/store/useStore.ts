import { create } from 'zustand';
import type { Course, Classroom, ScheduleItem } from '../types';

interface StoreState {
    courses: Course[];
    classrooms: Classroom[];
    schedule: ScheduleItem[];
    semester: 'Güz' | 'Bahar';

    setCourses: (courses: Course[]) => void;
    setSemester: (semester: 'Güz' | 'Bahar') => void;
    addClassroom: (classroom: Classroom) => void;
    updateClassroom: (id: string, classroom: Partial<Classroom>) => void;
    removeClassroom: (id: string) => void;
    setSchedule: (schedule: ScheduleItem[]) => void;
    addScheduleItem: (item: ScheduleItem) => void;
    removeScheduleItem: (id: string) => void;
    updateScheduleItem: (id: string, item: Partial<ScheduleItem>) => void;
    resetSchedule: () => void;

    blockedSlots: { day: string; hour: number }[];
    toggleBlockedSlot: (day: string, hour: number) => void;

    reservedSlots: { classroomId: string; day: string; hour: number; reason: string }[];
    toggleReservedSlot: (classroomId: string, day: string, hour: number, reason?: string) => void;
    clearReservedSlots: (classroomId?: string) => void;

    unscheduledCourses: { courseId: string; reason: string }[];
    setUnscheduledCourses: (items: { courseId: string; reason: string }[]) => void;
    resetAll: () => void;
    clearSchedule: () => void;
}

import { persist } from 'zustand/middleware';

export const useStore = create<StoreState>()(
    persist(
        (set) => ({
            courses: [],
            classrooms: [],
            schedule: [],
            semester: 'Bahar',

            setCourses: (courses) => set({ courses }),
            setSemester: (semester) => set({ semester }),
            addClassroom: (classroom) => set((state) => ({ classrooms: [...state.classrooms, classroom] })),
            updateClassroom: (id, updatedClassroom) => set((state) => ({
                classrooms: state.classrooms.map((c) => c.id === id ? { ...c, ...updatedClassroom } : c)
            })),
            removeClassroom: (id) => set((state) => ({ classrooms: state.classrooms.filter((c) => c.id !== id) })),
            setSchedule: (schedule) => set({ schedule }),
            addScheduleItem: (item) => set((state) => ({ schedule: [...state.schedule, item] })),
            removeScheduleItem: (id) => set((state) => ({ schedule: state.schedule.filter((i) => i.id !== id) })),
            updateScheduleItem: (id, item) => set((state) => ({
                schedule: state.schedule.map((i) => i.id === id ? { ...i, ...item } : i)
            })),
            resetSchedule: () => set((state) => ({
                schedule: state.schedule.filter(i => i.locked)
            })),

            blockedSlots: [],
            toggleBlockedSlot: (day, hour) => set((state) => {
                const exists = state.blockedSlots.some(s => s.day === day && s.hour === hour);
                if (exists) {
                    return { blockedSlots: state.blockedSlots.filter(s => !(s.day === day && s.hour === hour)) };
                } else {
                    return { blockedSlots: [...state.blockedSlots, { day, hour }] };
                }
            }),

            reservedSlots: [],
            toggleReservedSlot: (classroomId, day, hour, reason = 'Rezerve') => set((state) => {
                const exists = state.reservedSlots.some(s => s.classroomId === classroomId && s.day === day && s.hour === hour);
                if (exists) {
                    return { reservedSlots: state.reservedSlots.filter(s => !(s.classroomId === classroomId && s.day === day && s.hour === hour)) };
                } else {
                    return { reservedSlots: [...state.reservedSlots, { classroomId, day, hour, reason }] };
                }
            }),
            clearReservedSlots: (classroomId?) => set((state) => ({
                reservedSlots: classroomId
                    ? state.reservedSlots.filter(s => s.classroomId !== classroomId)
                    : []
            })),

            unscheduledCourses: [],
            setUnscheduledCourses: (items) => set({ unscheduledCourses: items }),

            resetAll: () => set({
                courses: [],
                schedule: [],
                unscheduledCourses: [],
                blockedSlots: [],
                reservedSlots: []
            }),

            clearSchedule: () => set({
                schedule: [],
                unscheduledCourses: []
            }),
        }),
        {
            name: 'schedule-storage',
            // optional: partialize -> to exclude some keys if needed
            // partialize: (state) => ({ courses: state.courses, classrooms: state.classrooms, schedule: state.schedule, blockedSlots: state.blockedSlots }),
        }
    )
);
