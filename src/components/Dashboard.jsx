import React, { useState, useMemo } from 'react';
import { 
  Search, 
  GraduationCap, 
  FileText, 
  Award, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpDown,
  Filter,
  Layers,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { getClassification, getStandingBadge } from '../utils/gradeCalculator';

export function Dashboard({
  students = [],
  cohorts = [],
  selectedCohort = 'ALL',
  onSelectCohort,
  onOpenDocument
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [standingFilter, setStandingFilter] = useState('ALL');
  const [sortField, setSortField] = useState('matricNumber');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Cohort filter
      if (selectedCohort !== 'ALL' && student.sheetName !== selectedCohort) {
        return false;
      }
      // Standing filter
      if (standingFilter !== 'ALL') {
        const remarks = (student.latestRemarks || '').toLowerCase();
        if (standingFilter === 'GOOD' && !remarks.includes('good') && student.latestCGPA < 2.0) return false;
        if (standingFilter === 'PROBATION' && (!remarks.includes('probation') && student.latestCGPA >= 2.0)) return false;
        if (standingFilter === 'DEFICIENT' && !remarks.includes('defic')) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const m = (student.matricNumber || '').toLowerCase();
        const n = (student.name || '').toLowerCase();
        const p = (student.programme || '').toLowerCase();
        return m.includes(q) || n.includes(q) || p.includes(q);
      }
      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === 'latestCGPA') {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [students, selectedCohort, standingFilter, searchQuery, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Overall Statistics Calculation
  const stats = useMemo(() => {
    const total = students.length;
    if (total === 0) return { total: 0, goodStanding: 0, avgCgpa: '0.00', topCgpa: '0.00', goodRate: 0 };
    
    let goodCount = 0;
    let cgpaSum = 0;
    let top = 0;

    students.forEach(s => {
      const c = parseFloat(s.latestCGPA) || 0;
      cgpaSum += c;
      if (c > top) top = c;
      const r = (s.latestRemarks || '').toLowerCase();
      if (r.includes('good') || c >= 2.0) goodCount++;
    });

    return {
      total,
      goodStanding: goodCount,
      goodRate: total > 0 ? Math.round((goodCount / total) * 100) : 0,
      avgCgpa: total > 0 ? (cgpaSum / total).toFixed(2) : '0.00',
      topCgpa: top.toFixed(2)
    };
  }, [students]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <main className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Atmosphere Section */}
      <section className="relative w-full rounded-2xl p-6 sm:p-10 border border-[#ebebeb] bg-white overflow-hidden vercel-hero-mesh shadow-vercel-card">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 vercel-grid-bg opacity-70 pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fafafa] border border-[#ebebeb] text-[11px] font-mono text-[#4d4d4d]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3] animate-pulse" />
            <span>ACADEMIC EXAMINATION & TRANSCRIPT SYSTEM</span>
          </div>
          
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-[-0.035em] text-[#171717] leading-[1.15]">
            Generate official transcripts and semester statements.
          </h2>
          
          <p className="text-sm sm:text-base text-[#4d4d4d] leading-relaxed max-w-2xl font-normal">
            Automated grade point computation, multi-page transcript sequencing, verification QR tokens, and instant A4 print formatting for medical sciences cohorts.
          </p>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Enrolled */}
        <div className="bg-white border border-[#ebebeb] rounded-xl p-5 shadow-vercel-card hover:border-[#a1a1a1] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium font-mono text-[#888888] uppercase tracking-wider">Total Enrolled</span>
            <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] border border-[#ebebeb] flex items-center justify-center text-[#171717]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-semibold text-[#171717] font-mono tracking-tight">{stats.total}</h3>
            <p className="text-xs text-[#888888] mt-1 font-mono">
              Across {cohorts.length} sheet {cohorts.length === 1 ? 'cohort' : 'cohorts'}
            </p>
          </div>
        </div>

        {/* Card 2: Academic Standing */}
        <div className="bg-white border border-[#ebebeb] rounded-xl p-5 shadow-vercel-card hover:border-[#a1a1a1] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium font-mono text-[#888888] uppercase tracking-wider">Good Standing</span>
            <div className="w-8 h-8 rounded-lg bg-[#0070f3]/10 border border-[#0070f3]/20 flex items-center justify-center text-[#0070f3]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-semibold text-[#171717] font-mono tracking-tight">{stats.goodStanding}</h3>
            <p className="text-xs text-[#0070f3] mt-1 font-medium font-mono">
              {stats.goodRate}% of total students
            </p>
          </div>
        </div>

        {/* Card 3: Average CGPA */}
        <div className="bg-white border border-[#ebebeb] rounded-xl p-5 shadow-vercel-card hover:border-[#a1a1a1] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium font-mono text-[#888888] uppercase tracking-wider">Cohort Mean</span>
            <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] border border-[#ebebeb] flex items-center justify-center text-[#171717]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-semibold text-[#171717] font-mono tracking-tight">
              {stats.avgCgpa} <span className="text-xs font-normal text-[#888888]">/ 4.00</span>
            </h3>
            <p className="text-xs text-[#888888] mt-1">Institutional cumulative mean</p>
          </div>
        </div>

        {/* Card 4: Top CGPA */}
        <div className="bg-white border border-[#ebebeb] rounded-xl p-5 shadow-vercel-card hover:border-[#a1a1a1] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium font-mono text-[#888888] uppercase tracking-wider">Top CGPA</span>
            <div className="w-8 h-8 rounded-lg bg-[#f5a623]/10 border border-[#f5a623]/30 flex items-center justify-center text-[#ab570a]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-semibold text-[#171717] font-mono tracking-tight">
              {stats.topCgpa} <span className="text-xs font-normal text-[#888888]">/ 4.00</span>
            </h3>
            <p className="text-xs text-[#ab570a] mt-1 font-medium font-mono">Distinction Honor Class</p>
          </div>
        </div>

      </section>

      {/* Search, Filter & Action Toolbar */}
      <section className="w-full bg-white border border-[#ebebeb] rounded-xl p-4 sm:p-5 shadow-vercel-card space-y-4">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 w-full min-w-0">
          
          {/* Search Input (40px form-input spec) */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by matric number (e.g. GCMSHT/PH/001/23) or student name..."
              className="w-full pl-10 pr-16 h-10 bg-[#fafafa] hover:bg-white focus:bg-white border border-[#ebebeb] focus:border-[#0070f3] rounded-md text-sm text-[#171717] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#0070f3]/20 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#888888] hover:text-[#171717] px-2 py-0.5 rounded bg-[#f5f5f5] border border-[#ebebeb] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Standing Filter Segmented Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 min-w-0 max-w-full flex-shrink-0">
            <span className="text-xs text-[#888888] flex items-center gap-1 pl-1 pr-1 font-mono uppercase">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'GOOD', label: 'Good Standing' },
              { id: 'DEFICIENT', label: 'Deficient' },
              { id: 'PROBATION', label: 'Probation' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setStandingFilter(tab.id); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all cursor-pointer active:scale-[0.98] ${
                  standingFilter === tab.id
                    ? 'bg-[#171717] text-white shadow-sm'
                    : 'bg-[#fafafa] text-[#4d4d4d] hover:bg-[#f5f5f5] hover:text-[#171717] border border-[#ebebeb]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* Cohort Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#ebebeb] w-full min-w-0 max-w-full">
          <span className="text-xs text-[#888888] flex items-center gap-1 pr-1 font-mono uppercase whitespace-nowrap">
            <Layers className="w-3.5 h-3.5 text-[#0070f3]" /> Sheet:
          </span>
          <button
            onClick={() => { onSelectCohort('ALL'); setCurrentPage(1); }}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] ${
              selectedCohort === 'ALL'
                ? 'bg-[#171717] text-white'
                : 'bg-[#fafafa] text-[#4d4d4d] hover:bg-[#f5f5f5] hover:text-[#171717] border border-[#ebebeb]'
            }`}
          >
            All Sheets ({students.length})
          </button>
          {cohorts.map(c => (
            <button
              key={c.name}
              onClick={() => { onSelectCohort(c.name); setCurrentPage(1); }}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] ${
                selectedCohort === c.name
                  ? 'bg-[#171717] text-white'
                  : 'bg-[#fafafa] text-[#4d4d4d] hover:bg-[#f5f5f5] hover:text-[#171717] border border-[#ebebeb]'
              }`}
            >
              {c.name} ({c.studentCount})
            </button>
          ))}
        </div>

      </section>

      {/* Student Registry Table */}
      <section className="w-full max-w-full bg-white border border-[#ebebeb] rounded-xl overflow-hidden shadow-vercel-card">
        
        {/* Table Header Info Bar */}
        <div className="px-5 py-4 border-b border-[#ebebeb] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fafafa]">
          <div>
            <h3 className="text-sm font-semibold text-[#171717] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0070f3]" /> Student Examination Registry
            </h3>
            <p className="text-xs text-[#888888] mt-0.5">
              Showing {filteredStudents.length} matching candidate records &bull; Select candidate to generate statement or transcript
            </p>
          </div>
          <div className="text-xs font-mono text-[#888888]">
            Page <span className="text-[#171717] font-semibold">{currentPage}</span> of {totalPages}
          </div>
        </div>

        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full min-w-[840px] text-left border-collapse">
            <thead>
              <tr className="bg-[#fafafa] text-[11px] font-mono font-medium text-[#888888] uppercase tracking-wider border-b border-[#ebebeb]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th 
                  onClick={() => handleSort('matricNumber')}
                  className="py-3 px-4 cursor-pointer hover:text-[#171717] transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Matriculation No.</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-[#171717] transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Student Full Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Department / Program</th>
                <th className="py-3 px-4 text-center">Semesters</th>
                <th 
                  onClick={() => handleSort('latestCGPA')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-[#171717] transition-colors select-none"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Latest CGPA</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Academic Standing</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebebeb] text-xs font-sans">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-14 text-center text-[#888888]">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-10 h-10 rounded-full bg-[#fafafa] border border-[#ebebeb] flex items-center justify-center text-[#888888]">
                        <AlertTriangle className="w-5 h-5 text-[#f5a623]" />
                      </div>
                      <p className="text-sm font-semibold text-[#171717]">No student records found</p>
                      <p className="text-xs text-[#888888]">
                        Try adjusting your search query or switching cohort filters above.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student, idx) => {
                  const sIndex = (currentPage - 1) * pageSize + idx + 1;
                  const badge = getStandingBadge(student.latestRemarks, student.latestCGPA);
                  const classification = getClassification(student.latestCGPA);

                  return (
                    <tr 
                      key={student.matricNumber + idx}
                      className="hover:bg-[#fafafa] transition-colors group"
                    >
                      <td className="py-3 px-4 text-center font-mono text-[#888888] font-medium">
                        {sIndex}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-[#171717] whitespace-nowrap">
                        <span className="px-2 py-1 rounded-md bg-[#f5f5f5] text-[#171717] border border-[#ebebeb] text-xs">
                          {student.matricNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-[#171717] whitespace-nowrap">
                        {student.name}
                      </td>
                      <td className="py-3 px-4 text-[#4d4d4d]">
                        <div className="line-clamp-1 font-medium text-[#171717]">{student.programme}</div>
                        <div className="text-[11px] text-[#888888] font-mono">{student.sheetName} Cohort</div>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#f5f5f5] text-[#4d4d4d] border border-[#ebebeb]">
                          {student.semesters?.length || 0} Semesters
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-sm text-[#171717]">
                          {student.latestCGPA ? student.latestCGPA.toFixed(2) : '0.00'}
                        </span>
                        <div className="text-[10px] font-mono font-medium text-[#888888] uppercase tracking-wide">
                          {classification.label}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${badge.style}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.text}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Option 1: Semester Result (Secondary Pill) */}
                          <button
                            onClick={() => onOpenDocument(student, 'RESULT')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-[#fafafa] text-[#171717] border border-[#ebebeb] shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                            title="Generate Statement of Examination Results for a single semester"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#888888]" />
                            <span>Result</span>
                          </button>

                          {/* Option 2: Transcript (Primary Ink Pill) */}
                          <button
                            onClick={() => onOpenDocument(student, 'TRANSCRIPT')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#171717] hover:bg-[#333333] text-white shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                            title="Generate Official Multi-Page Academic Transcript"
                          >
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Transcript</span>
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-[#ebebeb] bg-[#fafafa] flex items-center justify-between text-xs">
            <div className="text-[#888888] font-mono">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredStudents.length)} of {filteredStudents.length} candidates
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-white text-[#171717] border border-[#ebebeb] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f5f5f5] transition-colors cursor-pointer font-medium"
              >
                Previous
              </button>
              <div className="px-2 font-mono font-semibold text-[#171717]">
                {currentPage} / {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-white text-[#171717] border border-[#ebebeb] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f5f5f5] transition-colors cursor-pointer font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </section>

    </main>
  );
}
