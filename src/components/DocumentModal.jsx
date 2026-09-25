import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  GraduationCap, 
  Calendar, 
  Download, 
  ChevronDown,
  Layers,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { SemesterResultDocument } from './SemesterResultDocument';
import { TranscriptDocument } from './TranscriptDocument';

export function DocumentModal({
  isOpen,
  onClose,
  student,
  initialDocType = 'RESULT',
  institution,
  customCourses
}) {
  const [docType, setDocType] = useState(initialDocType);
  const [selectedSemIdx, setSelectedSemIdx] = useState(0);
  const [issueDate, setIssueDate] = useState(() => {
    return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  });
  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    setDocType(initialDocType);
    if (student?.semesters?.length) {
      // Default to latest completed semester
      setSelectedSemIdx(student.semesters.length - 1);
    }
  }, [initialDocType, student]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !student) return null;

  const semesters = student.semesters || [];
  const currentSemester = semesters[selectedSemIdx] || semesters[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(student, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${student.matricNumber.replace(/\//g, '_')}_academic_record.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/75 backdrop-blur-md">
      
      {/* Modal Container */}
      <div className="flex flex-col w-full h-full max-h-screen bg-[#0c0c0c] border-x border-[#262626] shadow-2xl">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-[#171717] border-b border-[#262626] z-20">
          
          {/* Left: Document Mode Switcher */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center p-1 bg-[#262626] rounded-full border border-[#333333]">
              <button
                onClick={() => setDocType('RESULT')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  docType === 'RESULT'
                    ? 'bg-white text-[#171717] shadow-sm font-semibold'
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Semester Statement</span>
              </button>

              <button
                onClick={() => setDocType('TRANSCRIPT')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  docType === 'TRANSCRIPT'
                    ? 'bg-white text-[#171717] shadow-sm font-semibold'
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Academic Transcript</span>
              </button>
            </div>

            {/* Semester Selector (For Single Statement Mode) */}
            {docType === 'RESULT' && semesters.length > 0 && (
              <div className="relative flex items-center bg-[#262626] border border-[#333333] rounded-full px-3 py-1.5 text-xs text-white">
                <Layers className="w-3.5 h-3.5 text-[#888888] mr-1.5 flex-shrink-0" />
                <span className="text-[#888888] mr-1.5 font-mono">Semester:</span>
                <select
                  value={selectedSemIdx}
                  onChange={(e) => setSelectedSemIdx(Number(e.target.value))}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-4 appearance-none"
                >
                  {semesters.map((sem, idx) => (
                    <option key={idx} value={idx} className="bg-[#171717] text-white">
                      {sem.semesterTitle} (GPA: {sem.gpa ? sem.gpa.toFixed(2) : '0.00'})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-[#888888] absolute right-2.5 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Center: Student Info Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#262626] border border-[#333333] rounded-full text-xs">
            <span className="font-medium text-white">{student.name}</span>
            <span className="text-[#666666]">&bull;</span>
            <span className="font-mono text-[#50e3c2]">{student.matricNumber}</span>
          </div>

          {/* Right: Actions (Print, Export, Zoom, Close) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-[#262626] border border-[#333333] rounded-full p-1 text-[#888888]">
              <button
                onClick={() => setZoomScale(s => Math.max(0.6, s - 0.1))}
                className="p-1 hover:text-white rounded-full transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-medium px-1.5 text-white">{Math.round(zoomScale * 100)}%</span>
              <button
                onClick={() => setZoomScale(s => Math.min(1.4, s + 0.1))}
                className="p-1 hover:text-white rounded-full transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export JSON Button */}
            <button
              onClick={handleExportJSON}
              className="p-2 rounded-full bg-[#262626] hover:bg-[#333333] text-[#888888] hover:text-white border border-[#333333] transition-all cursor-pointer"
              title="Export Student JSON Dataset"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Primary Print / Save PDF Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-full bg-white hover:bg-[#f0f0f0] text-[#171717] shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              title="Print Document or Save as PDF (A4)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document (A4)</span>
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#262626] hover:bg-[#333333] text-[#888888] hover:text-white border border-[#333333] transition-all cursor-pointer"
              title="Close viewer"
            >
              <X className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* Scrollable Document Canvas Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-10 vercel-grid-dark flex justify-center">
          <div 
            style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center' }}
            className="transition-transform duration-150"
          >
            {docType === 'RESULT' ? (
              <SemesterResultDocument
                student={student}
                semester={currentSemester}
                institution={institution}
                customCourses={customCourses}
                issueDate={issueDate}
              />
            ) : (
              <TranscriptDocument
                student={student}
                institution={institution}
                customCourses={customCourses}
                issueDate={issueDate}
              />
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
