import * as XLSX from 'xlsx';

export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const allStudentsMap = {};
        const cohortsSummary = {};

        workbook.SheetNames.forEach((sheetName) => {
          if (['Sheet1', 'Sheet2', 'Sheet4', 'PH 24 Orig'].includes(sheetName) || sheetName.toUpperCase().includes('ORIG')) {
            return;
          }
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) return;

          // Convert sheet to array of arrays (matrix)
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          if (!rows || rows.length < 5) return;

          let dept = 'Health Sciences';
          let prog = 'National Diploma in Health Science & Technology';
          if (sheetName.toUpperCase().includes('PH')) {
            dept = 'Public Health';
            prog = 'National Diploma in Public Health Technology';
          } else if (sheetName.toUpperCase().includes('MLT')) {
            dept = 'Medical Laboratory Technology';
            prog = 'Medical Laboratory Technician Diploma';
          }

          // Scan for semester blocks
          const semesterSections = [];
          rows.forEach((row, rIdx) => {
            const rowStr = row.map(cell => String(cell).trim().toUpperCase()).join(' ');
            if (rowStr.includes('SEMESTER') && (rowStr.includes('YEAR') || rowStr.includes('FIRST') || rowStr.includes('SECOND'))) {
              const titleCell = row.find(c => String(c).toUpperCase().includes('SEMESTER')) || `Semester ${semesterSections.length + 1}`;
              semesterSections.push({ startRow: rIdx, title: String(titleCell).trim() });
            }
          });

          if (semesterSections.length === 0) {
            semesterSections.push({ startRow: 0, title: 'Semester 1' });
          }

          semesterSections.forEach((section, sIdx) => {
            const startRow = section.startRow;
            const endRow = (sIdx + 1 < semesterSections.length) ? semesterSections[sIdx + 1].startRow : rows.length;

            // Find header row with MATRIC
            let headerRowIdx = -1;
            let unitsRowIdx = -1;
            for (let i = startRow; i < Math.min(startRow + 8, endRow); i++) {
              if (rows[i] && rows[i].some(cell => String(cell).toUpperCase().includes('MATRIC'))) {
                headerRowIdx = i;
                if (i + 1 < rows.length) unitsRowIdx = i + 1;
                break;
              }
            }

            if (headerRowIdx === -1) return;

            const headerRow = rows[headerRowIdx];
            const unitsRow = unitsRowIdx !== -1 ? rows[unitsRowIdx] : [];

            let matricColIdx = -1;
            let nameColIdx = -1;
            const courses = [];
            const seenCourseCodes = new Set();
            const summaryCols = {};

            // Find where summary columns start to avoid reading into duplicate audit grids
            let firstSummaryColIdx = 9999;
            for (let testIdx of [headerRowIdx, headerRowIdx + 1, headerRowIdx + 2]) {
              if (rows[testIdx]) {
                rows[testIdx].forEach((cell, cIdx) => {
                  const v = String(cell).trim().toUpperCase();
                  if (['RCU', 'ECU', 'CP', 'EGP', 'GPA', 'TRCU', 'TECU', 'TCP', 'CGPA'].includes(v)) {
                    if (cIdx < firstSummaryColIdx) firstSummaryColIdx = cIdx;
                  }
                });
              }
            }

            headerRow.forEach((cell, cIdx) => {
              const val = String(cell).trim().toUpperCase();
              if (val.includes('MATRIC')) matricColIdx = cIdx;
              else if (val.includes('NAME')) nameColIdx = cIdx;
              else if (cIdx < firstSummaryColIdx && /^[A-Z]{3,4}\s*[0-9]{3}$/.test(val.replace(/\s+/g, ''))) {
                const code = val.replace(/\s+/g, '');
                if (!seenCourseCodes.has(code)) {
                  seenCourseCodes.add(code);
                  const unitsVal = unitsRow[cIdx];
                  const units = parseInt(unitsVal, 10) || 2;
                  courses.push({
                    code: code,
                    colIdx: cIdx,
                    gradeColIdx: cIdx + 1,
                    units: units > 0 ? units : 2
                  });
                }
              }
            });

            // Identify Summary Columns (take first valid column occurrence)
            [headerRowIdx, headerRowIdx + 1, headerRowIdx + 2].forEach(testIdx => {
              if (rows[testIdx]) {
                rows[testIdx].forEach((cell, cIdx) => {
                  const v = String(cell).trim().toUpperCase();
                  if (cIdx > nameColIdx) {
                    if (v === 'RCU' && !summaryCols.rcu) summaryCols.rcu = cIdx;
                    else if (v === 'ECU' && !summaryCols.ecu) summaryCols.ecu = cIdx;
                    else if ((v === 'CP' || v === 'EGP') && !summaryCols.cp) summaryCols.cp = cIdx;
                    else if (v === 'GPA' && !summaryCols.gpa) summaryCols.gpa = cIdx;
                    else if (v === 'TRCU' && !summaryCols.trcu) summaryCols.trcu = cIdx;
                    else if (v === 'TECU' && !summaryCols.tecu) summaryCols.tecu = cIdx;
                    else if (v === 'TCP' && !summaryCols.tcp) summaryCols.tcp = cIdx;
                    else if (v === 'CGPA' && !summaryCols.cgpa) summaryCols.cgpa = cIdx;
                    else if (v.includes('OUTSTANDING') && !summaryCols.outstanding) summaryCols.outstanding = cIdx;
                    else if (v.includes('REMARK') && !summaryCols.remarks) summaryCols.remarks = cIdx;
                  }
                });
              }
            });

            if (matricColIdx === -1) return;

            const dataStart = Math.max(headerRowIdx + 1, (unitsRowIdx !== -1 ? unitsRowIdx + 1 : headerRowIdx + 1));

            for (let r = dataStart; r < endRow; r++) {
              const row = rows[r];
              if (!row) continue;

              const rowSummaryCheck = row.map(c => String(c).toUpperCase()).join(' ');
              if (rowSummaryCheck.includes('SUMMARY') || rowSummaryCheck.includes('NUMBER IN GOOD')) {
                break;
              }

              const matric = String(row[matricColIdx] || '').trim();
              const name = String(row[nameColIdx] || '').trim();

              if (!matric || matric === '0' || matric.toUpperCase().includes('MATRIC') || matric.length < 4) {
                continue;
              }

              const studentCourses = [];
              let semTotalUnits = 0;
              let semPassedUnits = 0;
              let calcPoints = 0;

              courses.forEach(crs => {
                const rawScore = row[crs.colIdx];
                const rawGrade = row[crs.gradeColIdx];

                const scoreStr = (rawScore !== undefined && rawScore !== null) ? String(rawScore).trim() : '';
                let gradeStr = (rawGrade !== undefined && rawGrade !== null) ? String(rawGrade).trim().toUpperCase() : '';

                if (!scoreStr && !gradeStr) return;
                if (scoreStr === '0' && !gradeStr) return;

                const scoreNum = !isNaN(parseFloat(scoreStr)) ? Math.round(parseFloat(scoreStr)) : null;

                // Clean grade string if numeric artifact
                if (gradeStr.length === 1 && !isNaN(parseInt(gradeStr, 10))) {
                  gradeStr = '';
                }

                let gp = 0;
                let finalGrade = gradeStr;
                if (!finalGrade && scoreNum !== null) {
                  if (scoreNum >= 70) { finalGrade = 'A'; gp = 4; }
                  else if (scoreNum >= 60) { finalGrade = 'B'; gp = 3; }
                  else if (scoreNum >= 50) { finalGrade = 'C'; gp = 2; }
                  else if (scoreNum >= 40) { finalGrade = 'D'; gp = 1; }
                  else { finalGrade = 'F'; gp = 0; }
                } else {
                  const gMap = { 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'E': 1, 'F': 0 };
                  gp = gMap[finalGrade] || 0;
                }

                const u = crs.units;
                const qp = u * gp;
                semTotalUnits += u;
                if (gp > 0) semPassedUnits += u;
                calcPoints += qp;

                studentCourses.push({
                  code: crs.code,
                  units: u,
                  score: scoreNum !== null ? scoreNum : scoreStr,
                  grade: finalGrade || (scoreNum === 0 ? 'F' : ''),
                  gradePoint: gp,
                  qualityPoints: qp
                });
              });

              const getValNum = (col, def = 0) => {
                if (col !== undefined && row[col] !== undefined) {
                  const parsed = parseFloat(row[col]);
                  if (!isNaN(parsed) && parsed > 0) return parsed;
                }
                return def;
              };

              const getValStr = (col, def = '') => {
                if (col !== undefined && row[col] !== undefined) {
                  const s = String(row[col]).trim();
                  if (s && s !== 'None' && s !== '0') return s;
                }
                return def;
              };

              const rawRcu = getValNum(summaryCols.rcu, 0);
              const rawEcu = getValNum(summaryCols.ecu, 0);
              const rawCp = getValNum(summaryCols.cp, 0);
              const rawGpa = getValNum(summaryCols.gpa, 0);

              if (studentCourses.length === 0 && rawGpa === 0 && rawRcu === 0 && rawCp === 0) {
                if (sIdx > 0) {
                  continue; // Skip empty subsequent template semester blocks
                }
              }

              const rcu = studentCourses.length > 0 ? semTotalUnits : rawRcu;
              const ecu = studentCourses.length > 0 ? semPassedUnits : rawEcu;
              const cp = studentCourses.length > 0 ? calcPoints : rawCp;
              const gpa = rcu > 0 ? +(cp / rcu).toFixed(2) : (rawGpa > 0 ? rawGpa : 0);

              const trcu = getValNum(summaryCols.trcu, rcu);
              const tecu = getValNum(summaryCols.tecu, ecu);
              const tcp = getValNum(summaryCols.tcp, cp);
              const cgpa = getValNum(summaryCols.cgpa, trcu > 0 ? +(tcp / trcu).toFixed(2) : gpa);

              const outstanding = getValStr(summaryCols.outstanding, 'None');
              const remarks = getValStr(summaryCols.remarks, cgpa >= 2.0 ? 'In good standing' : 'Probation');

              const semRecord = {
                semesterTitle: section.title,
                semesterIndex: sIdx + 1,
                courses: studentCourses,
                rcu: Math.round(rcu),
                ecu: Math.round(ecu),
                cp: +cp.toFixed(2),
                gpa: +gpa.toFixed(2),
                trcu: Math.round(trcu),
                tecu: Math.round(tecu),
                tcp: +tcp.toFixed(2),
                cgpa: +cgpa.toFixed(2),
                outstanding: outstanding,
                remarks: remarks
              };

              const cleanMatric = matric.toUpperCase();
              if (!allStudentsMap[cleanMatric]) {
                allStudentsMap[cleanMatric] = {
                  matricNumber: cleanMatric,
                  name: name && name !== '0' ? name.toUpperCase() : 'STUDENT',
                  department: dept,
                  cohort: `${sheetName} Cohort`,
                  programme: prog,
                  sheetName: sheetName,
                  semesters: []
                };
              } else if (name && name !== '0' && allStudentsMap[cleanMatric].name === 'STUDENT') {
                allStudentsMap[cleanMatric].name = name.toUpperCase();
              }

              allStudentsMap[cleanMatric].semesters.push(semRecord);
            }
          });
        });

        const studentsList = Object.values(allStudentsMap);
        studentsList.forEach(s => {
          if (s.semesters.length > 0) {
            const latest = s.semesters[s.semesters.length - 1];
            s.latestCGPA = latest.cgpa;
            s.latestRemarks = latest.remarks;
            s.totalSemestersCompleted = s.semesters.length;
          } else {
            s.latestCGPA = 0;
            s.latestRemarks = 'N/A';
            s.totalSemestersCompleted = 0;
          }
        });

        studentsList.forEach(s => {
          const cName = s.sheetName;
          if (!cohortsSummary[cName]) {
            cohortsSummary[cName] = { name: cName, department: s.department, studentCount: 0 };
          }
          cohortsSummary[cName].studentCount++;
        });

        resolve({
          cohorts: Object.values(cohortsSummary),
          students: studentsList
        });
      } catch (err) {
        console.error('Error parsing Excel:', err);
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
