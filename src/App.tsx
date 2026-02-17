import { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { ExcelUploader } from './components/ExcelUploader';
import { ClassroomManager } from './components/ClassroomManager';
import { ScheduleGrid } from './components/ScheduleGrid';
import { ClassroomSchedule } from './components/ClassroomSchedule';
import { InstructorSchedule } from './components/InstructorSchedule';
import { useScheduler } from './hooks/useScheduler';
import { Toaster } from 'sonner';

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'classrooms' | 'schedule' | 'classrooms-view' | 'instructors-view'>('upload');
  const { generateSchedule, generating } = useScheduler();

  const handleGenerate = (mode: 'full' | 'fill') => {
    generateSchedule(mode);
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'upload' && <ExcelUploader />}
        {activeTab === 'classrooms' && <ClassroomManager />}
        {activeTab === 'schedule' && (
          <ScheduleGrid
            onGenerate={handleGenerate}
            generating={generating}
          />
        )}
        {activeTab === 'classrooms-view' && <ClassroomSchedule />}
        {activeTab === 'instructors-view' && <InstructorSchedule />}
      </AppLayout>
    </>
  );
}

export default App;
