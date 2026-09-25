import React, { useState } from 'react';
import { X, Save, RotateCcw, Building, BookOpen, Plus, Trash2, Search } from 'lucide-react';
import { COURSE_CATALOG } from '../utils/coursesCatalog';

export function SettingsModal({
  isOpen,
  onClose,
  institution,
  onSaveInstitution,
  customCourses,
  onSaveCourses,
  onResetAll
}) {
  const [activeTab, setActiveTab] = useState('INSTITUTION');
  const [instForm, setInstForm] = useState({ ...institution });
  const [coursesForm, setCoursesForm] = useState({ ...COURSE_CATALOG, ...customCourses });
  const [courseSearch, setCourseSearch] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');

  if (!isOpen) return null;

  const handleInstChange = (field, value) => {
    setInstForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCourseChange = (code, title) => {
    setCoursesForm(prev => ({ ...prev, [code]: title }));
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!newCode.trim() || !newTitle.trim()) return;
    const cleanCode = newCode.trim().toUpperCase();
    setCoursesForm(prev => ({ ...prev, [cleanCode]: newTitle.trim() }));
    setNewCode('');
    setNewTitle('');
  };

  const handleDeleteCourse = (code) => {
    setCoursesForm(prev => {
      const next = { ...prev };
      delete next[code];
      return next;
    });
  };

  const handleSaveAll = () => {
    onSaveInstitution(instForm);
    onSaveCourses(coursesForm);
    onClose();
  };

  const filteredCourses = Object.entries(coursesForm).filter(([code, title]) => {
    const q = courseSearch.toLowerCase();
    return code.toLowerCase().includes(q) || title.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      
      <div className="w-full max-w-2xl bg-white border border-[#ebebeb] rounded-xl shadow-vercel-modal overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ebebeb] bg-[#fafafa]">
          <div>
            <h3 className="text-sm font-semibold text-[#171717] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#0070f3]" /> Institution &amp; Academic Settings
            </h3>
            <p className="text-xs text-[#888888] mt-0.5">
              Configure official header branding, signature titles, and course catalogs
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#888888] hover:text-[#171717] hover:bg-[#ebebeb] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-6 border-b border-[#ebebeb] bg-white gap-4">
          <button
            onClick={() => setActiveTab('INSTITUTION')}
            className={`flex items-center gap-1.5 py-3 text-xs font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'INSTITUTION'
                ? 'border-[#171717] text-[#171717]'
                : 'border-transparent text-[#888888] hover:text-[#171717]'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Institution &amp; Signatures</span>
          </button>

          <button
            onClick={() => setActiveTab('COURSES')}
            className={`flex items-center gap-1.5 py-3 text-xs font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'COURSES'
                ? 'border-[#171717] text-[#171717]'
                : 'border-transparent text-[#888888] hover:text-[#171717]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Course Catalog ({Object.keys(coursesForm).length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {activeTab === 'INSTITUTION' && (
            <div className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-[#4d4d4d] uppercase tracking-wider">Institution Official Name</label>
                <input
                  type="text"
                  value={instForm.name}
                  onChange={(e) => handleInstChange('name', e.target.value)}
                  className="w-full h-10 px-3.5 bg-[#fafafa] focus:bg-white border border-[#ebebeb] focus:border-[#0070f3] rounded-md text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#0070f3]/20 transition-all font-sans"
                  placeholder="e.g. GARKI COLLEGE OF MEDICAL SCIENCES & HEALTH TECHNOLOGY"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-[#4d4d4d] uppercase tracking-wider">Division / Directorate Subtitle</label>
                <input
                  type="text"
                  value={instForm.subName}
                  onChange={(e) => handleInstChange('subName', e.target.value)}
                  className="w-full h-10 px-3.5 bg-[#fafafa] focus:bg-white border border-[#ebebeb] focus:border-[#0070f3] rounded-md text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#0070f3]/20 transition-all font-sans"
                  placeholder="e.g. DIRECTORATE OF ACADEMIC AFFAIRS & REGISTRY"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-[#4d4d4d] uppercase tracking-wider">Official Campus Address</label>
                <input
                  type="text"
                  value={instForm.address}
                  onChange={(e) => handleInstChange('address', e.target.value)}
                  className="w-full h-10 px-3.5 bg-[#fafafa] focus:bg-white border border-[#ebebeb] focus:border-[#0070f3] rounded-md text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#0070f3]/20 transition-all font-sans"
                  placeholder="e.g. Academic Records Division, P.M.B. 1024"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-[#4d4d4d] uppercase tracking-wider">HOD Title</label>
                  <input
                    type="text"
                    value={instForm.hodTitle}
                    onChange={(e) => handleInstChange('hodTitle', e.target.value)}
                    className="w-full h-10 px-3.5 bg-[#fafafa] focus:bg-white border border-[#ebebeb] focus:border-[#0070f3] rounded-md text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#0070f3]/20 transition-all font-sans"
                    placeholder="e.g. HEAD OF DEPARTMENT"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-[#4d4d4d] uppercase tracking-wider">Exam Officer Title</label>
                  <input
                    type="text"
                    value={instForm.examOfficerTitle}
                    onChange={(e) => handleInstChange('examOfficerTitle', e.target.value)}
                    className="w-full h-10 px-3.5 bg-[#fafafa] focus:bg-white border border-[#ebebeb] focus:border-[#0070f3] rounded-md text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#0070f3]/20 transition-all font-sans"
                    placeholder="e.g. EXAMINATION OFFICER"
                  />
                </div>
              </div>

            </div>
          )}

          {activeTab === 'COURSES' && (
            <div className="space-y-3.5">
              
              {/* Add New Course Row */}
              <form onSubmit={handleAddCourse} className="p-3 bg-[#fafafa] border border-[#ebebeb] rounded-lg flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Code (e.g. CHE301)"
                  className="w-full sm:w-28 h-9 px-3 bg-white border border-[#ebebeb] focus:border-[#0070f3] rounded-md text-xs text-[#171717] uppercase font-mono focus:outline-none"
                />
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Course title..."
                  className="flex-1 w-full h-9 px-3 bg-white border border-[#ebebeb] focus:border-[#0070f3] rounded-md text-xs text-[#171717] focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-3.5 h-9 rounded-full bg-[#171717] hover:bg-[#333333] text-white text-xs font-medium flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              {/* Search Courses */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Search course code or title..."
                  className="w-full pl-9 pr-4 h-9 bg-[#fafafa] focus:bg-white border border-[#ebebeb] focus:border-[#0070f3] rounded-md text-xs text-[#171717] focus:outline-none"
                />
              </div>

              {/* Courses Grid List */}
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {filteredCourses.map(([code, title]) => (
                  <div key={code} className="flex items-center gap-2 p-1.5 bg-[#fafafa] hover:bg-white border border-[#ebebeb] rounded-md transition-colors">
                    <span className="w-20 font-mono font-semibold text-xs text-[#171717] uppercase px-2 py-1 bg-white border border-[#ebebeb] rounded text-center">
                      {code}
                    </span>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => handleCourseChange(code, e.target.value)}
                      className="flex-1 px-2.5 py-1 bg-white border border-[#ebebeb] focus:border-[#0070f3] rounded text-xs text-[#171717] focus:outline-none"
                    />
                    <button
                      onClick={() => handleDeleteCourse(code)}
                      className="p-1.5 text-[#888888] hover:text-[#ee0000] hover:bg-[#f7d4d6]/50 rounded transition-colors cursor-pointer"
                      title="Remove course mapping"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#ebebeb] bg-[#fafafa]">
          <button
            onClick={onResetAll}
            className="flex items-center gap-1.5 text-xs text-[#888888] hover:text-[#ee0000] transition-colors cursor-pointer font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#f5f5f5] text-[#4d4d4d] text-xs font-medium border border-[#ebebeb] cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#171717] hover:bg-[#333333] text-white text-xs font-medium shadow-sm cursor-pointer transition-all active:scale-[0.98]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
