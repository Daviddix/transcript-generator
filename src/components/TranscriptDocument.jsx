import React from 'react';
import { getCourseTitle } from '../utils/coursesCatalog';
import { getClassification, generateVerificationCode, formatAcademicSession } from '../utils/gradeCalculator';

export function TranscriptDocument({
  student,
  institution = {},
  customCourses = {},
  issueDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}) {
  if (!student) {
    return <div className="p-8 text-center text-slate-500">No student selected.</div>;
  }

  const completedSemesters = student.semesters || [];
  
  // Calculate running cumulative metrics across all completed semesters if needed
  let runningTRCU = 0;
  let runningTECU = 0;
  let runningTCP = 0;
  
  completedSemesters.forEach(sem => {
    const validCourses = (sem.courses || []).filter(c => c && c.code);
    const computedRcu = validCourses.reduce((sum, c) => sum + (Number(c.units) || 0), 0);
    const computedEcu = validCourses.reduce((sum, c) => {
      const gp = Number(c.gradePoint) || 0;
      return sum + (gp > 0 ? (Number(c.units) || 0) : 0);
    }, 0);
    const computedCp = validCourses.reduce((sum, c) => sum + (Number(c.qualityPoints) || ((Number(c.units) || 0) * (Number(c.gradePoint) || 0))), 0);
    
    const semRcu = (sem.rcu && sem.rcu > 0) ? sem.rcu : computedRcu;
    const semEcu = (sem.ecu !== undefined && sem.ecu !== null && (sem.ecu > 0 || computedEcu === 0)) ? sem.ecu : computedEcu;
    const semCp = (sem.cp && sem.cp > 0) ? sem.cp : computedCp;
    
    runningTRCU += semRcu;
    runningTECU += semEcu;
    runningTCP += semCp;
  });

  const latestSemester = completedSemesters.length > 0 ? completedSemesters[completedSemesters.length - 1] : null;
  const finalTRCU = (latestSemester && latestSemester.trcu > 0) ? latestSemester.trcu : (runningTRCU > 0 ? runningTRCU : 0);
  const finalTECU = (latestSemester && latestSemester.tecu > 0) ? latestSemester.tecu : (runningTECU > 0 ? runningTECU : 0);
  const computedFinalCGPA = runningTRCU > 0 ? (runningTCP / runningTRCU) : 0;
  const finalCGPA = (latestSemester && latestSemester.cgpa > 0) ? latestSemester.cgpa : (student.latestCGPA > 0 ? student.latestCGPA : computedFinalCGPA);
  const classification = getClassification(finalCGPA);

  const verificationId = generateVerificationCode(student.matricNumber, 'TRA');
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=4&data=${encodeURIComponent(`GARKI-CMSHT|OFFICIAL-TRANSCRIPT|${student.matricNumber}|${student.name}|CGPA:${finalCGPA.toFixed(2)}|${classification.label}|${verificationId}`)}`;

  // Chunk semesters if needed (e.g. 2-4 semesters per page for clean multi-page printing)
  const semestersPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(completedSemesters.length / semestersPerPage));
  const pages = [];

  for (let p = 0; p < totalPages; p++) {
    pages.push(completedSemesters.slice(p * semestersPerPage, (p + 1) * semestersPerPage));
  }

  return (
    <div className="space-y-8 print:space-y-0">
      {pages.map((pageSemesters, pageIndex) => {
        const isFirstPage = pageIndex === 0;
        const isLastPage = pageIndex === totalPages - 1;

        return (
          <div
            key={pageIndex}
            className={`print-container bg-white text-slate-900 mx-auto max-w-[210mm] min-h-[297mm] p-8 sm:p-10 shadow-2xl relative flex flex-col justify-between font-serif-doc border border-slate-300 ${
              !isLastPage ? 'page-break-after' : ''
            }`}
          >
            {/* Outer Decorative Academic Double Border */}
            <div className="absolute inset-3 border-2 border-slate-900 pointer-events-none" />
            <div className="absolute inset-4 border border-slate-400 pointer-events-none" />

            {/* Watermark Crest */}
            <img
              src={institution.crest || '/logo.svg'}
              alt="Watermark Crest"
              className="watermark-crest"
            />

            {/* Page Header Content */}
            <div className="relative z-10 space-y-4">
              
              {/* Top Header */}
              <div className="text-center space-y-1 pb-3 border-b-2 border-slate-900">
                <div className="flex items-center justify-center gap-3 mb-1.5">
                  <img
                    src={institution.crest || '/logo.svg'}
                    alt="Institution Logo"
                    className="w-14 h-14 object-contain"
                  />
                </div>

                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-950 uppercase font-cinzel leading-tight">
                  {institution.name || 'GARKI COLLEGE OF MEDICAL SCIENCES & HEALTH TECHNOLOGY'}
                </h1>
                <p className="text-[11px] font-bold text-slate-700 tracking-wider uppercase font-sans">
                  {institution.subName || 'DIRECTORATE OF ACADEMIC AFFAIRS & REGISTRY'}
                </p>
                <p className="text-[10px] text-slate-600 italic">
                  {institution.address || 'Academic Records Division &bull; P.M.B. 1024'}
                </p>

                <div className="pt-1.5 flex items-center justify-center gap-3">
                  <span className="inline-block px-4 py-0.5 text-xs font-black uppercase tracking-widest bg-slate-900 text-white rounded-sm font-cinzel">
                    OFFICIAL ACADEMIC TRANSCRIPT
                  </span>
                  <span className="text-[10px] font-sans font-semibold text-slate-600 border border-slate-300 px-2 py-0.5 rounded bg-slate-50">
                    Page {pageIndex + 1} of {totalPages}
                  </span>
                </div>
              </div>

              {/* Student Bio-Data (Shown on Page 1 or Compact on subsequent pages) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-[11px] bg-slate-50/90 p-3 border border-slate-300 rounded font-sans">
                <div>
                  <span className="text-slate-500 font-medium">CANDIDATE NAME:</span>
                  <div className="font-bold text-slate-950 uppercase text-xs">{student.name}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">MATRICULATION NO:</span>
                  <div className="font-mono font-bold text-indigo-950 text-xs">{student.matricNumber}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">PROGRAMME / AWARD:</span>
                  <div className="font-semibold text-slate-900 uppercase">{student.programme}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">DEPARTMENT:</span>
                  <div className="font-semibold text-slate-900 uppercase">{student.department}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">COHORT / ENTRY:</span>
                  <div className="font-semibold text-slate-900">{student.sheetName} ({formatAcademicSession(student.sheetName)})</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">MODE OF STUDY:</span>
                  <div className="font-semibold text-slate-900">FULL TIME DIPLOMA</div>
                </div>
              </div>

              {/* Semester Breakdown Blocks for this Page */}
              <div className="space-y-4 font-sans">
                {pageSemesters.map((sem, sIdx) => {
                  const validCourses = (sem.courses || []).filter(c => c && c.code);
                  const semComputedRcu = validCourses.reduce((sum, c) => sum + (Number(c.units) || 0), 0);
                  const semComputedEcu = validCourses.reduce((sum, c) => {
                    const gp = Number(c.gradePoint) || 0;
                    return sum + (gp > 0 ? (Number(c.units) || 0) : 0);
                  }, 0);
                  const semComputedCp = validCourses.reduce((sum, c) => sum + (Number(c.qualityPoints) || ((Number(c.units) || 0) * (Number(c.gradePoint) || 0))), 0);
                  
                  const displayRcu = validCourses.length > 0 ? semComputedRcu : (sem.rcu || 0);
                  const displayEcu = validCourses.length > 0 ? semComputedEcu : (sem.ecu !== undefined ? sem.ecu : 0);
                  const displayCp = validCourses.length > 0 ? semComputedCp : (sem.cp || 0);
                  const displayGpa = displayRcu > 0 ? (displayCp / displayRcu) : (sem.gpa || 0);
                  const displayCgpa = (sem.cgpa && sem.cgpa > 0) ? sem.cgpa : displayGpa;

                  return (
                    <div key={sIdx} className="border border-slate-400 rounded overflow-hidden page-break-inside-avoid">
                      
                      {/* Semester Title Bar */}
                      <div className="bg-slate-800 text-white px-3 py-1 text-[11px] font-bold flex items-center justify-between uppercase">
                        <span>{sem.semesterTitle}</span>
                        <span className="text-[10px] font-mono text-indigo-200">
                          Semester GPA: {displayGpa.toFixed(2)} | Running CGPA: {displayCgpa.toFixed(2)}
                        </span>
                      </div>

                      {/* Semester Course Table */}
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                            <th className="py-1 px-2 text-center w-6 border-r border-slate-200">#</th>
                            <th className="py-1 px-2 w-20 border-r border-slate-200">Code</th>
                            <th className="py-1 px-2 border-r border-slate-200">Course Title</th>
                            <th className="py-1 px-1.5 text-center w-10 border-r border-slate-200">Units</th>
                            <th className="py-1 px-1.5 text-center w-12 border-r border-slate-200">Score</th>
                            <th className="py-1 px-1.5 text-center w-10 border-r border-slate-200">Grade</th>
                            <th className="py-1 px-1.5 text-center w-8 border-r border-slate-200">GP</th>
                            <th className="py-1 px-2 text-center w-12">QP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {validCourses.length > 0 ? (
                            validCourses.map((crs, cIdx) => (
                              <tr key={crs.code + cIdx} className={cIdx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                                <td className="py-0.5 px-2 text-center text-slate-500 font-mono border-r border-slate-200">{cIdx + 1}</td>
                                <td className="py-0.5 px-2 font-mono font-bold text-slate-900 border-r border-slate-200">{crs.code}</td>
                                <td className="py-0.5 px-2 font-medium text-slate-800 border-r border-slate-200">{getCourseTitle(crs.code, customCourses)}</td>
                                <td className="py-0.5 px-1.5 text-center font-semibold text-slate-900 border-r border-slate-200">{crs.units}</td>
                                <td className="py-0.5 px-1.5 text-center font-mono text-slate-700 border-r border-slate-200">{crs.score !== null ? crs.score : '-'}</td>
                                <td className="py-0.5 px-1.5 text-center font-bold text-slate-900 border-r border-slate-200">{crs.grade || '-'}</td>
                                <td className="py-0.5 px-1.5 text-center font-mono text-slate-700 border-r border-slate-200">{crs.gradePoint !== undefined ? crs.gradePoint.toFixed(1) : '-'}</td>
                                <td className="py-0.5 px-2 text-center font-mono font-bold text-slate-950">{crs.qualityPoints !== undefined ? crs.qualityPoints.toFixed(1) : (crs.units && crs.gradePoint !== undefined ? (crs.units * crs.gradePoint).toFixed(1) : '-')}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="8" className="py-2 text-center text-slate-400 italic">No registered courses found</td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-100/90 font-semibold border-t border-slate-300 text-slate-800 text-[10px]">
                            <td colSpan="3" className="py-1 px-2 text-right uppercase border-r border-slate-200">
                              Semester Total Units: {displayRcu} (Passed: {displayEcu})
                            </td>
                            <td className="py-1 px-1.5 text-center font-mono border-r border-slate-200">{displayRcu}</td>
                            <td colSpan="3" className="py-1 px-2 text-center border-r border-slate-200">Total Quality Points:</td>
                            <td className="py-1 px-2 text-center font-mono font-bold text-indigo-950">{displayCp.toFixed(1)}</td>
                          </tr>
                        </tfoot>
                      </table>

                    </div>
                  );
                })}
              </div>

              {/* Final Summary Card & Grading Legend (Shown on the Final Page) */}
              {isLastPage && (
                <div className="space-y-3 pt-2 page-break-inside-avoid font-sans">
                  
                  {/* Cumulative Evaluation Box */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900 text-white p-3 rounded-lg shadow-sm">
                    <div className="border-r border-slate-700 pr-2">
                      <div className="text-[10px] text-slate-400 uppercase">Total Units Registered</div>
                      <div className="text-base font-bold font-mono text-white mt-0.5">{finalTRCU}</div>
                    </div>
                    <div className="border-r border-slate-700 pr-2">
                      <div className="text-[10px] text-slate-400 uppercase">Total Units Earned</div>
                      <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">{finalTECU}</div>
                    </div>
                    <div className="border-r border-slate-700 pr-2">
                      <div className="text-[10px] text-slate-400 uppercase">Final Cumulative CGPA</div>
                      <div className="text-base font-bold font-mono text-amber-300 mt-0.5">{finalCGPA.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ 4.00</span></div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Academic Classification</div>
                      <div className="text-xs font-black text-amber-400 uppercase mt-1 tracking-wider">{classification.label}</div>
                    </div>
                  </div>

                  {/* Grading Key Scale Table */}
                  <div className="border border-slate-300 rounded p-2 bg-slate-50 text-[9.5px] text-slate-700 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 uppercase">Grading Scale (4.00 System):</span>
                    <span><strong>A</strong>: 70-100% (4.00) &bull; Distinction</span>
                    <span><strong>B</strong>: 60-69% (3.00) &bull; Upper Credit</span>
                    <span><strong>C</strong>: 50-59% (2.00) &bull; Lower Credit</span>
                    <span><strong>D</strong>: 40-49% (1.00) &bull; Pass</span>
                    <span><strong>F</strong>: 0-39% (0.00) &bull; Fail</span>
                  </div>

                </div>
              )}

            </div>

            {/* Official Footer & Certification Signatures */}
            <div className="relative z-10 pt-4 mt-4 border-t-2 border-slate-900 space-y-3 font-sans">
              
              {/* Certification Statement */}
              <p className="text-[9.5px] text-slate-600 italic text-center leading-tight">
                "I hereby certify that this is a true and verified official academic transcript of records for the above named candidate, issued under the authority of the College Academic Board."
              </p>

              {/* Signatures & Seal Grid */}
              <div className="grid grid-cols-3 gap-6 items-end text-center">
                
                {/* HOD Signature */}
                <div className="space-y-1">
                  <div className="h-9 border-b border-dashed border-slate-800 flex items-end justify-center pb-1">
                    <span className="text-[10px] text-slate-400 italic">Signature &amp; Date</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-950 uppercase">
                    {institution.hodTitle || 'HEAD OF DEPARTMENT'}
                  </p>
                  <p className="text-[9px] text-slate-500">Dept. of {student.department}</p>
                </div>

                {/* Official Seal / QR Verification */}
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="w-16 h-16 border border-slate-300 rounded p-1 bg-white shadow-sm flex items-center justify-center">
                    <img
                      src={qrDataUrl}
                      alt="Transcript QR Verification"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[8.5px] font-mono text-slate-600 font-semibold tracking-wider">
                    {verificationId}
                  </span>
                </div>

                {/* Exam Officer / Registrar */}
                <div className="space-y-1">
                  <div className="h-9 border-b border-dashed border-slate-800 flex items-end justify-center pb-1">
                    <span className="text-[10px] text-slate-400 italic">Signature &amp; Date</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-950 uppercase">
                    {institution.examOfficerTitle || 'EXAMINATION OFFICER'}
                  </p>
                  <p className="text-[9px] text-slate-500">Academic Affairs Division</p>
                </div>

              </div>

              {/* Bottom Security Notice */}
              <div className="text-center pt-2 border-t border-slate-200 text-[8.5px] text-slate-500 flex items-center justify-between">
                <span>Date of Issuance: {issueDate}</span>
                <span className="font-mono">Security Token: {verificationId}</span>
                <span>Official College Academic Transcript</span>
              </div>

            </div>

          </div>
        );
      })}
    </div>
  );
}
