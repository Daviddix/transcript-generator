import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { DocumentModal } from './components/DocumentModal';
import { SettingsModal } from './components/SettingsModal';
import { parseExcelFile } from './utils/excelParser';
import { COURSE_CATALOG } from './utils/coursesCatalog';
import { AlertCircle, CheckCircle2, Loader2, Info } from 'lucide-react';

const DEFAULT_INSTITUTION = {
  name: 'GARKI COLLEGE OF MEDICAL SCIENCES & HEALTH TECHNOLOGY',
  subName: 'DIRECTORATE OF ACADEMIC AFFAIRS & REGISTRY',
  address: 'Kano / Abuja Academic Campus, Nigeria',
  crest: '/logo.svg',
  hodTitle: 'HEAD OF DEPARTMENT',
  examOfficerTitle: 'EXAMINATION OFFICER',
  registrarTitle: 'REGISTRAR / ACADEMIC SECRETARY'
};

export default function App() {
  const [students, setStudents] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Institution & Custom Courses in localStorage
  const [institution, setInstitution] = useState(() => {
    try {
      const saved = localStorage.getItem('gcmsht_institution');
      return saved ? JSON.parse(saved) : DEFAULT_INSTITUTION;
    } catch {
      return DEFAULT_INSTITUTION;
    }
  });

  const [customCourses, setCustomCourses] = useState(() => {
    try {
      const saved = localStorage.getItem('gcmsht_courses');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modal states
  const [activeStudent, setActiveStudent] = useState(null);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [initialDocType, setInitialDocType] = useState('RESULT');
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Load default dataset on startup
  useEffect(() => {
    loadDefaultData();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadDefaultData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/default_data.json');
      if (!res.ok) throw new Error('Failed to load default dataset');
      const data = await res.json();
      
      setStudents(data.students || []);
      setCohorts(data.cohorts || []);
      if (data.institution && !localStorage.getItem('gcmsht_institution')) {
        setInstitution(data.institution);
      }
      showNotification(`Loaded ${data.students?.length || 0} candidate records.`, 'success');
    } catch (err) {
      console.error('Error loading default data:', err);
      showNotification('Could not load pre-parsed dataset. Upload an Excel ledger directly.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle User Uploading new Excel Sheet
  const handleUploadExcel = async (file) => {
    setIsLoading(true);
    showNotification(`Parsing "${file.name}" in browser...`, 'info');
    try {
      const parsedData = await parseExcelFile(file);
      if (parsedData.students && parsedData.students.length > 0) {
        setStudents(parsedData.students);
        setCohorts(parsedData.cohorts);
        setSelectedCohort('ALL');
        showNotification(`Successfully imported ${parsedData.students.length} candidates from ${parsedData.cohorts.length} cohorts!`, 'success');
      } else {
        showNotification('No student records found in the uploaded file.', 'error');
      }
    } catch (err) {
      console.error('Failed to parse uploaded Excel file:', err);
      showNotification('Failed to parse Excel file. Please ensure it has standard result ledger headers.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveInstitution = (newInst) => {
    setInstitution(newInst);
    localStorage.setItem('gcmsht_institution', JSON.stringify(newInst));
    showNotification('Institution branding & details saved.', 'success');
  };

  const handleSaveCourses = (newCourses) => {
    setCustomCourses(newCourses);
    localStorage.setItem('gcmsht_courses', JSON.stringify(newCourses));
    showNotification('Course catalog updated successfully.', 'success');
  };

  const handleResetAll = () => {
    setInstitution(DEFAULT_INSTITUTION);
    setCustomCourses({});
    localStorage.removeItem('gcmsht_institution');
    localStorage.removeItem('gcmsht_courses');
    showNotification('Settings reset to system defaults.', 'info');
  };

  const handleOpenDocument = (student, type) => {
    setActiveStudent(student);
    setInitialDocType(type);
    setDocModalOpen(true);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#fafafa] text-[#171717] flex flex-col font-sans selection:bg-[#171717] selection:text-white">
      
      {/* Top Navigation */}
      <Header
        institution={institution}
        onUploadExcel={handleUploadExcel}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onResetToDefault={loadDefaultData}
        isLoading={isLoading}
        cohorts={cohorts}
        selectedCohort={selectedCohort}
        onSelectCohort={setSelectedCohort}
        totalStudents={students.length}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="no-print fixed bottom-6 right-6 z-50 transition-all transform animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#171717] text-white border border-[#333333] shadow-vercel-elevated text-xs font-medium">
            {notification.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-[#50e3c2] flex-shrink-0" />
            )}
            {notification.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-[#ff0080] flex-shrink-0" />
            )}
            {notification.type === 'info' && (
              <Loader2 className="w-4 h-4 text-[#0070f3] animate-spin flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && students.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3">
          <Loader2 className="w-8 h-8 text-[#0070f3] animate-spin" />
          <p className="text-xs font-mono text-[#888888]">Loading Academic Examination Ledger...</p>
        </div>
      ) : (
        /* Main Dashboard View */
        <Dashboard
          students={students}
          cohorts={cohorts}
          selectedCohort={selectedCohort}
          onSelectCohort={setSelectedCohort}
          onOpenDocument={handleOpenDocument}
        />
      )}

      {/* Document Interactive Preview & Print Modal */}
      <DocumentModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        student={activeStudent}
        initialDocType={initialDocType}
        institution={institution}
        customCourses={customCourses}
      />

      {/* Admin Settings & Catalog Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        institution={institution}
        onSaveInstitution={handleSaveInstitution}
        customCourses={customCourses}
        onSaveCourses={handleSaveCourses}
        onResetAll={handleResetAll}
      />

    </div>
  );
}
