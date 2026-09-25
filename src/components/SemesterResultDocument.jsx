import React from 'react';
import { getCourseTitle } from '../utils/coursesCatalog';
import { getStandingBadge, generateVerificationCode, formatAcademicSession } from '../utils/gradeCalculator';

export function SemesterResultDocument({
  student,
  semester,
  institution = {},
  customCourses = {},
  issueDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}) {
  if (!student || !semester) {
    return (
      <div className="p-8 text-center text-slate-500">
        No semester data selected.
      </div>
    );
  }

  const validCourses = (semester.courses || []).filter(c => c && c.code);
  const semComputedRcu = validCourses.reduce((sum, c) => sum + (Number(c.units) || 0), 0);
  const semComputedEcu = validCourses.reduce((sum, c) => {
    const gp = Number(c.gradePoint) || 0;
    return sum + (gp > 0 ? (Number(c.units) || 0) : 0);
  }, 0);
  const semComputedCp = validCourses.reduce((sum, c) => sum + (Number(c.qualityPoints) || ((Number(c.units) || 0) * (Number(c.gradePoint) || 0))), 0);

  const displayRcu = validCourses.length > 0 ? semComputedRcu : (semester.rcu || 0);
  const displayEcu = validCourses.length > 0 ? semComputedEcu : (semester.ecu !== undefined ? semester.ecu : 0);
  const displayCp = validCourses.length > 0 ? semComputedCp : (semester.cp || 0);
  const displayGpa = displayRcu > 0 ? (displayCp / displayRcu) : (semester.gpa || 0);

  // Cumulative fallback calculation
  const allSemesters = student.semesters || [semester];
  const currentSemIndex = allSemesters.findIndex(s => s.semesterTitle === semester.semesterTitle || s.semesterId === semester.semesterId);
  const activeSemesters = currentSemIndex >= 0 ? allSemesters.slice(0, currentSemIndex + 1) : [semester];

  let cumulativeRcu = 0;
  let cumulativeEcu = 0;
  let cumulativeCp = 0;
  activeSemesters.forEach(s => {
    const sCourses = (s.courses || []).filter(c => c && c.code);
    const sRcu = sCourses.reduce((acc, c) => acc + (Number(c.units) || 0), 0);
    const sEcu = sCourses.reduce((acc, c) => acc + ((Number(c.gradePoint) || 0) > 0 ? (Number(c.units) || 0) : 0), 0);
    const sCp = sCourses.reduce((acc, c) => acc + (Number(c.qualityPoints) || ((Number(c.units) || 0) * (Number(c.gradePoint) || 0))), 0);
    cumulativeRcu += (s.rcu && s.rcu > 0) ? s.rcu : sRcu;
    cumulativeEcu += (s.ecu !== undefined && s.ecu !== null && (s.ecu > 0 || sEcu === 0)) ? s.ecu : sEcu;
    cumulativeCp += (s.cp && s.cp > 0) ? s.cp : sCp;
  });

  const displayTrcu = (semester.trcu && semester.trcu > 0) ? semester.trcu : cumulativeRcu;
  const displayTecu = (semester.tecu !== undefined && semester.tecu !== null && (semester.tecu > 0 || cumulativeEcu === 0)) ? semester.tecu : cumulativeEcu;
  const displayTcp = (semester.tcp && semester.tcp > 0) ? semester.tcp : cumulativeCp;
  const displayCgpa = (semester.cgpa && semester.cgpa > 0) ? semester.cgpa : (displayTrcu > 0 ? (displayTcp / displayTrcu) : displayGpa);

  const verificationId = generateVerificationCode(student.matricNumber, 'RES');
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&margin=4&data=${encodeURIComponent(`GARKI-CMSHT|VERIFIED|${student.matricNumber}|${student.name}|${semester.semesterTitle}|GPA:${displayGpa.toFixed(2)}|CGPA:${displayCgpa.toFixed(2)}|${verificationId}`)}`;

  const standing = getStandingBadge(semester.remarks, displayCgpa);

  return (
    <div className="print-container bg-white text-slate-900 mx-auto max-w-[210mm] min-h-[297mm] p-8 sm:p-10 shadow-2xl relative flex flex-col justify-between font-serif-doc border border-slate-300">
      
      {/* Outer Decorative Academic Double Border */}
      <div className="absolute inset-3 border-2 border-slate-900 pointer-events-none" />
      <div className="absolute inset-4 border border-slate-400 pointer-events-none" />

      {/* Watermark Crest */}
      <img
        src={institution.crest || '/logo.svg'}
        alt="Watermark Crest"
        className="watermark-crest"
      />

      {/* Main Content Area */}
      <div className="relative z-10 space-y-6">
        
        {/* Document Header */}
        <div className="text-center space-y-1.5 pb-4 border-b-2 border-slate-900">
          <div className="flex items-center justify-center gap-4 mb-2">
            <img
              src={institution.crest || '/logo.svg'}
              alt="Institution Logo"
              className="w-16 h-16 object-contain"
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase font-cinzel leading-tight">
            {institution.name || 'GARKI COLLEGE OF MEDICAL SCIENCES & HEALTH TECHNOLOGY'}
          </h1>
          <p className="text-xs font-semibold text-slate-700 tracking-wider uppercase">
            {institution.subName || 'OFFICE OF THE REGISTRAR &bull; ACADEMIC AFFAIRS DIVISION'}
          </p>
          <p className="text-[11px] text-slate-600 italic">
            {institution.address || 'Academic Records & Examination Board &bull; P.M.B. 1024'}
          </p>

          <div className="pt-2">
            <span className="inline-block px-5 py-1 text-xs font-extrabold uppercase tracking-widest bg-slate-900 text-white rounded-sm font-cinzel shadow-sm">
              STATEMENT OF EXAMINATION RESULTS
            </span>
          </div>
        </div>

        {/* Student & Session Profile Card */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs bg-slate-50/80 p-4 border border-slate-300 rounded font-sans">
          <div>
            <span className="text-slate-500 font-medium">STUDENT NAME:</span>
            <div className="font-bold text-slate-950 uppercase text-[13px]">{student.name}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">MATRICULATION NUMBER:</span>
            <div className="font-mono font-bold text-indigo-900 text-[13px] tracking-wide">{student.matricNumber}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">PROGRAMME / COURSE:</span>
            <div className="font-semibold text-slate-900 uppercase">{student.programme}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">DEPARTMENT:</span>
            <div className="font-semibold text-slate-900 uppercase">{student.department}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">ACADEMIC SESSION:</span>
            <div className="font-semibold text-slate-900">{formatAcademicSession(student.sheetName)}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">SEMESTER / LEVEL:</span>
            <div className="font-bold text-indigo-950 uppercase">{semester.semesterTitle}</div>
          </div>
        </div>

        {/* Course Results Table */}
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between font-sans">
            <span>Course Scores &amp; Grade Breakdown</span>
            <span className="text-[11px] font-normal text-slate-500">Grading Scale: 4.00 Max</span>
          </h3>

          <div className="border border-slate-900 overflow-hidden">
            <table className="w-full text-left border-collapse text-[11px] font-sans">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-1.5 px-2.5 text-center w-8 border-r border-slate-700">#</th>
                  <th className="py-1.5 px-2.5 w-24 border-r border-slate-700">Course Code</th>
                  <th className="py-1.5 px-2.5 border-r border-slate-700">Course Title</th>
                  <th className="py-1.5 px-2 text-center w-14 border-r border-slate-700">Units</th>
                  <th className="py-1.5 px-2 text-center w-14 border-r border-slate-700">Score (%)</th>
                  <th className="py-1.5 px-2 text-center w-12 border-r border-slate-700">Grade</th>
                  <th className="py-1.5 px-2 text-center w-12 border-r border-slate-700">GP</th>
                  <th className="py-1.5 px-2.5 text-center w-16">EGP / QP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {validCourses.length > 0 ? (
                  validCourses.map((course, idx) => (
                    <tr key={course.code + idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                      <td className="py-1.5 px-2.5 text-center font-mono text-slate-600 border-r border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-2.5 font-mono font-bold text-slate-900 border-r border-slate-200">
                        {course.code}
                      </td>
                      <td className="py-1.5 px-2.5 font-medium text-slate-800 border-r border-slate-200">
                        {getCourseTitle(course.code, customCourses)}
                      </td>
                      <td className="py-1.5 px-2 text-center font-semibold text-slate-900 border-r border-slate-200">
                        {course.units}
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono text-slate-700 border-r border-slate-200">
                        {course.score !== null && course.score !== undefined && course.score !== '' ? course.score : '-'}
                      </td>
                      <td className="py-1.5 px-2 text-center font-bold border-r border-slate-200">
                        <span className={course.grade === 'F' ? 'text-rose-600' : 'text-slate-900'}>
                          {course.grade || '-'}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono text-slate-700 border-r border-slate-200">
                        {course.gradePoint !== undefined ? course.gradePoint.toFixed(1) : '-'}
                      </td>
                      <td className="py-1.5 px-2.5 text-center font-mono font-bold text-slate-950">
                        {course.qualityPoints !== undefined ? course.qualityPoints.toFixed(1) : (course.units && course.gradePoint !== undefined ? (course.units * course.gradePoint).toFixed(1) : '-')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-4 text-center text-slate-500 italic">
                      No course score records registered for this semester.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-slate-900 text-[11px]">
                  <td colSpan="3" className="py-2 px-3 text-right uppercase border-r border-slate-300">
                    Semester Totals:
                  </td>
                  <td className="py-2 px-2 text-center font-mono border-r border-slate-300">
                    {displayRcu}
                  </td>
                  <td colSpan="3" className="py-2 px-2 text-center text-slate-500 border-r border-slate-300 text-[10px]">
                    Earned Units: {displayEcu}
                  </td>
                  <td className="py-2 px-2.5 text-center font-mono text-indigo-950">
                    {displayCp.toFixed(1)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Academic Performance Summary Grid */}
        <div className="grid grid-cols-2 gap-4 font-sans">
          
          {/* Current Semester Summary */}
          <div className="border border-slate-300 rounded p-3 bg-slate-50/50 space-y-1 text-xs">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-300 pb-1 tracking-wider">
              Current Semester Summary
            </h4>
            <div className="grid grid-cols-2 gap-y-1 pt-1 text-[11px]">
              <div className="text-slate-600">Registered Units (RCU):</div>
              <div className="font-bold font-mono text-slate-900">{displayRcu}</div>
              
              <div className="text-slate-600">Earned Units (ECU):</div>
              <div className="font-bold font-mono text-slate-900">{displayEcu}</div>
              
              <div className="text-slate-600">Total Credit Points (CP):</div>
              <div className="font-bold font-mono text-slate-900">{displayCp.toFixed(2)}</div>
              
              <div className="text-slate-900 font-bold">Semester GPA:</div>
              <div className="font-bold font-mono text-indigo-950 text-sm">{displayGpa.toFixed(2)}</div>
            </div>
          </div>

          {/* Cumulative to Date Summary */}
          <div className="border border-slate-300 rounded p-3 bg-slate-50/50 space-y-1 text-xs">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-300 pb-1 tracking-wider">
              Cumulative to Date Summary
            </h4>
            <div className="grid grid-cols-2 gap-y-1 pt-1 text-[11px]">
              <div className="text-slate-600">Total Registered (TRCU):</div>
              <div className="font-bold font-mono text-slate-900">{displayTrcu}</div>
              
              <div className="text-slate-600">Total Earned (TECU):</div>
              <div className="font-bold font-mono text-slate-900">{displayTecu}</div>
              
              <div className="text-slate-600">Total Points (TCP):</div>
              <div className="font-bold font-mono text-slate-900">{displayTcp.toFixed(2)}</div>
              
              <div className="text-slate-900 font-bold">Cumulative CGPA:</div>
              <div className="font-bold font-mono text-indigo-950 text-sm">{displayCgpa.toFixed(2)}</div>
            </div>
          </div>

        </div>

        {/* Academic Standing & Outstanding Courses */}
        <div className="border border-slate-300 rounded p-3 bg-slate-50/60 font-sans text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="text-slate-500 font-semibold">ACADEMIC STANDING / REMARKS: </span>
            <span className="font-bold text-slate-950 uppercase">{semester.remarks || 'IN GOOD STANDING'}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold">OUTSTANDING / CARRYOVER: </span>
            <span className={`font-mono font-bold ${semester.outstanding && semester.outstanding !== 'None' ? 'text-rose-700' : 'text-slate-700'}`}>
              {semester.outstanding || 'None'}
            </span>
          </div>
        </div>

      </div>

      {/* Official Signatures & Footer Section */}
      <div className="relative z-10 pt-6 mt-6 border-t-2 border-slate-900 space-y-4 font-sans">
        
        <div className="grid grid-cols-3 gap-6 items-end text-center">
          
          {/* HOD Signature */}
          <div className="space-y-1">
            <div className="h-10 border-b border-dashed border-slate-800 flex items-end justify-center pb-1">
              <span className="text-[11px] text-slate-400 italic">Signature &amp; Date</span>
            </div>
            <p className="text-[11px] font-bold text-slate-950 uppercase">
              {institution.hodTitle || 'HEAD OF DEPARTMENT'}
            </p>
            <p className="text-[10px] text-slate-500">Department of {student.department}</p>
          </div>

          {/* Official Stamp Box & QR Verification */}
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="w-18 h-18 border border-slate-300 rounded p-1 bg-white shadow-sm flex items-center justify-center">
              <img
                src={qrDataUrl}
                alt="Document Verification QR"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[9px] font-mono text-slate-500 tracking-wider">
              {verificationId}
            </span>
          </div>

          {/* Exam Officer Signature */}
          <div className="space-y-1">
            <div className="h-10 border-b border-dashed border-slate-800 flex items-end justify-center pb-1">
              <span className="text-[11px] text-slate-400 italic">Signature &amp; Date</span>
            </div>
            <p className="text-[11px] font-bold text-slate-950 uppercase">
              {institution.examOfficerTitle || 'EXAMINATION OFFICER'}
            </p>
            <p className="text-[10px] text-slate-500">Academic Affairs &amp; Records</p>
          </div>

        </div>

        {/* Security / Authentication Notice */}
        <div className="text-center pt-2 border-t border-slate-200 text-[9px] text-slate-500 space-y-0.5">
          <p className="font-semibold text-slate-600 uppercase">
            Official Academic Record &bull; Date of Issue: {issueDate}
          </p>
          <p className="italic">
            Any alteration or erasure renders this official statement of examination results invalid. Verification ID: {verificationId}
          </p>
        </div>

      </div>

    </div>
  );
}
