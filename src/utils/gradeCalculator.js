// Academic Grade & Metric Utilities

export function getGradePoint(score, grade) {
  if (grade) {
    const g = grade.trim().toUpperCase();
    if (g === 'A') return 4.0;
    if (g === 'B') return 3.0;
    if (g === 'C') return 2.0;
    if (g === 'D') return 1.0;
    if (g === 'E') return 1.0;
    if (g === 'F') return 0.0;
  }
  if (typeof score === 'number') {
    if (score >= 70) return 4.0;
    if (score >= 60) return 3.0;
    if (score >= 50) return 2.0;
    if (score >= 40) return 1.0;
    return 0.0;
  }
  return 0.0;
}

export function getGradeLetter(score, existingGrade) {
  if (existingGrade && existingGrade.trim()) return existingGrade.trim().toUpperCase();
  if (typeof score === 'number') {
    if (score >= 70) return 'A';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  }
  return 'F';
}

export function getClassification(cgpa) {
  const val = parseFloat(cgpa) || 0.0;
  if (val >= 3.50) return { label: 'DISTINCTION', color: 'text-[#171717] bg-[#f5f5f5] border-[#171717]' };
  if (val >= 3.00) return { label: 'UPPER CREDIT', color: 'text-[#0761d1] bg-[#d3e5ff]/60 border-[#0070f3]/40' };
  if (val >= 2.50) return { label: 'LOWER CREDIT', color: 'text-[#ab570a] bg-[#ffefcf]/60 border-[#f5a623]/40' };
  if (val >= 2.00) return { label: 'PASS', color: 'text-[#4d4d4d] bg-[#f5f5f5] border-[#ebebeb]' };
  return { label: 'FAIL / DEFICIENT', color: 'text-[#c50000] bg-[#f7d4d6]/60 border-[#ee0000]/40' };
}

export function getStandingBadge(remarks, cgpa) {
  const r = (remarks || '').toLowerCase();
  const c = parseFloat(cgpa) || 0.0;
  if (r.includes('good') || (!r && c >= 2.0)) {
    return { 
      text: 'In Good Standing', 
      style: 'bg-[#0070f3]/10 text-[#0070f3] border-[#0070f3]/25',
      dot: 'bg-[#0070f3]'
    };
  }
  if (r.includes('probation') || c < 2.0) {
    return { 
      text: 'Probation', 
      style: 'bg-[#ffefcf] text-[#ab570a] border-[#f5a623]/40',
      dot: 'bg-[#f5a623]'
    };
  }
  if (r.includes('deficient')) {
    return { 
      text: 'Deficient (Carryover)', 
      style: 'bg-[#f7d4d6] text-[#c50000] border-[#ee0000]/30',
      dot: 'bg-[#ee0000]'
    };
  }
  if (r.includes('absent')) {
    return { 
      text: 'Absent', 
      style: 'bg-[#f7d4d6] text-[#c50000] border-[#ee0000]/30',
      dot: 'bg-[#ee0000]'
    };
  }
  if (r.includes('withdr')) {
    return { 
      text: 'Withdrawn', 
      style: 'bg-[#f7d4d6] text-[#c50000] border-[#ee0000]/30',
      dot: 'bg-[#ee0000]'
    };
  }
  return { 
    text: remarks || 'Active', 
    style: 'bg-[#f5f5f5] text-[#4d4d4d] border-[#ebebeb]',
    dot: 'bg-[#888888]'
  };
}

export function generateVerificationCode(matricNo, type = 'DOC') {
  const hash = Math.abs(
    (matricNo + type + 'GCMSHT-VERIFY').split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  ).toString(36).toUpperCase().padStart(8, '0');
  return `VER-${type}-${hash.substring(0, 4)}-${hash.substring(4, 8)}`;
}

export function formatAcademicSession(yearStr) {
  if (!yearStr) return '2023/2024';
  const num = parseInt(yearStr.replace(/\D/g, ''), 10);
  if (num && num >= 2000) {
    return `${num}/${num + 1}`;
  }
  return '2023/2024';
}
