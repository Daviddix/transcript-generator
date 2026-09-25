import zipfile
import xml.etree.ElementTree as ET
import json
import os
import re

xlsx_path = r"C:\Users\Nsikan-David\Documents\transcript-generator\result-gp.xlsx"
output_dir = r"C:\Users\Nsikan-David\Documents\transcript-generator\public"
os.makedirs(output_dir, exist_ok=True)
output_json = os.path.join(output_dir, "default_data.json")

print("Starting Excel parsing to JSON...")

with zipfile.ZipFile(xlsx_path, 'r') as z:
    file_list = z.namelist()
    workbook_xml = z.read('xl/workbook.xml')
    wb_tree = ET.fromstring(workbook_xml)
    ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    rels_xml = z.read('xl/_rels/workbook.xml.rels')
    rels_tree = ET.fromstring(rels_xml)
    r_ns = {'rel': 'http://schemas.openxmlformats.org/package/2006/relationships'}
    rel_map = {rel.attrib.get('Id'): rel.attrib.get('Target') for rel in rels_tree.findall('.//rel:Relationship', r_ns)}
    
    shared_strings = []
    if 'xl/sharedStrings.xml' in file_list:
        ss_xml = z.read('xl/sharedStrings.xml')
        ss_tree = ET.fromstring(ss_xml)
        for si in ss_tree.findall('.//main:si', ns):
            texts = [t.text for t in si.findall('.//main:t', ns) if t.text is not None]
            shared_strings.append("".join(texts))

    def col_to_num(col_str):
        num = 0
        for c in col_str:
            num = num * 26 + (ord(c.upper()) - ord('A')) + 1
        return num

    def split_cell_ref(cell_ref):
        match = re.match(r"([A-Z]+)([0-9]+)", cell_ref)
        if match:
            return match.group(1), int(match.group(2))
        return "", 0

    all_sheets_data = {}
    all_students_map = {} # key: matric_number -> student object
    cohorts_list = []

    # Map sheet names to readable department & cohort
    sheet_meta = {
        'PH 23': {'dept': 'Public Health', 'cohort': '2023 Cohort', 'prog': 'National Diploma in Public Health Technology'},
        'PH 24': {'dept': 'Public Health', 'cohort': '2024 Cohort', 'prog': 'National Diploma in Public Health Technology'},
        'PH 24 Orig': {'dept': 'Public Health', 'cohort': '2024 Cohort (Original)', 'prog': 'National Diploma in Public Health Technology'},
        'PH 25': {'dept': 'Public Health', 'cohort': '2025 Cohort', 'prog': 'National Diploma in Public Health Technology'},
        'MLT 2023 R': {'dept': 'Medical Laboratory Technology', 'cohort': '2023 Cohort', 'prog': 'Medical Laboratory Technician Diploma'},
        'MLT 2020 R': {'dept': 'Medical Laboratory Technology', 'cohort': '2020 Cohort', 'prog': 'Medical Laboratory Technician Diploma'},
    }

    for sheet in wb_tree.findall('.//main:sheet', ns):
        name = sheet.attrib.get('name')
        if name in ['Sheet1', 'Sheet2', 'Sheet4', 'PH 24 Orig'] or 'ORIG' in name.upper():
            continue
        r_id = sheet.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
        target = rel_map.get(r_id, '')
        if target.startswith('/'): target = target[1:]
        elif not target.startswith('xl/'): target = 'xl/' + target
        if target not in file_list: continue

        tree = ET.fromstring(z.read(target))
        rows = tree.findall('.//main:row', ns)
        if not rows: continue

        print(f"Parsing sheet: {name} ({len(rows)} rows)")
        
        # Build grid row_idx -> {col_str: value}
        grid = {}
        for r in rows:
            r_idx = int(r.attrib.get('r', 0))
            row_dict = {}
            for c in r.findall('.//main:c', ns):
                ref = c.attrib.get('r')
                col_str, _ = split_cell_ref(ref)
                t = c.attrib.get('t')
                v_el = c.find('main:v', ns)
                val = v_el.text if v_el is not None else ''
                if t == 's' and val.isdigit():
                    idx = int(val)
                    if idx < len(shared_strings):
                        val = shared_strings[idx]
                elif t == 'inlineStr':
                    is_el = c.find('.//main:t', ns)
                    val = is_el.text if is_el is not None else ''
                row_dict[col_str] = val
            grid[r_idx] = row_dict

        # Identify semester sections
        semester_sections = []
        row_keys = sorted(grid.keys())
        
        for idx in row_keys:
            r_data = grid[idx]
            # Check if any cell has SEMESTER
            for c, val in r_data.items():
                val_s = str(val).strip()
                if 'SEMESTER' in val_s.upper() and ('YEAR' in val_s.upper() or 'FIRST' in val_s.upper() or 'SECOND' in val_s.upper()):
                    semester_sections.append((idx, val_s))
                    break

        print(f"  Found {len(semester_sections)} semester sections in '{name}'")
        
        # For sheet with 1 section or no section header, handle as single semester
        if not semester_sections:
            header_row_idx = None
            for idx in row_keys[:10]:
                if any('MATRIC' in str(v).upper() for v in grid[idx].values()):
                    header_row_idx = idx
                    break
            if header_row_idx:
                semester_sections = [(header_row_idx - 1 if header_row_idx > 1 else 1, 'Semester 1')]

        # For each semester section:
        for s_i, (start_row, sem_title) in enumerate(semester_sections):
            end_row = semester_sections[s_i + 1][0] if s_i + 1 < len(semester_sections) else max(row_keys) + 1
            
            # Find header row in this section (has S/N, MATRIC, course codes)
            header_row_idx = None
            units_row_idx = None
            
            for idx in range(start_row, min(start_row + 8, end_row)):
                if idx in grid:
                    r_vals = [str(v).upper() for v in grid[idx].values()]
                    if any('MATRIC' in v for v in r_vals):
                        header_row_idx = idx
                        if idx + 1 in grid:
                            units_row_idx = idx + 1
                        break
            
            if not header_row_idx:
                continue

            # Identify course columns in header row
            header_dict = grid[header_row_idx]
            units_dict = grid.get(units_row_idx, {}) if units_row_idx else {}
            
            matric_col = 'B'
            name_col = 'C'
            for c, v in header_dict.items():
                if 'MATRIC' in str(v).upper(): matric_col = c
                elif 'NAME' in str(v).upper(): name_col = c

            courses_in_sem = [] # list of {code, col, grade_col, units}
            seen_course_codes = set()
            sorted_cols = sorted(header_dict.keys(), key=col_to_num)
            name_col_num = col_to_num(name_col)
            
            first_summary_col_num = 9999
            # First check if summary columns exist in header or next row to avoid reading beyond summary
            for test_idx in [header_row_idx, header_row_idx + 1, header_row_idx + 2]:
                if test_idx in grid:
                    for c, v in grid[test_idx].items():
                        v_u = str(v).strip().upper()
                        if v_u in ['RCU', 'ECU', 'CP', 'EGP', 'GPA', 'TRCU', 'TECU', 'TCP', 'CGPA']:
                            c_n = col_to_num(c)
                            if c_n > name_col_num and c_n < first_summary_col_num:
                                first_summary_col_num = c_n

            for c in sorted_cols:
                c_num = col_to_num(c)
                if c_num <= name_col_num: continue
                if c_num >= first_summary_col_num: break # Stop when reaching summary columns!

                val = str(header_dict[c]).strip()
                # If column val looks like a course code
                if re.match(r"^[A-Z]{3,4}\s*[0-9]{3}$", val.replace(" ", "").upper()) or (len(val) in [6, 7] and val[:3].isalpha() and val[-3:].isdigit()):
                    course_code = val.replace(" ", "").upper()
                    if course_code in seen_course_codes:
                        continue # Skip duplicate audit table repetition
                    seen_course_codes.add(course_code)

                    grade_col_num = c_num + 1
                    def num_to_col(n):
                        res = ""
                        while n > 0:
                            n, rem = divmod(n - 1, 26)
                            res = chr(65 + rem) + res
                        return res
                    grade_col = num_to_col(grade_col_num)
                    
                    units_val = units_dict.get(c, '2')
                    try:
                        units = int(float(str(units_val).strip()))
                        if units <= 0: units = 2
                    except:
                        units = 2
                        
                    courses_in_sem.append({
                        'code': course_code,
                        'score_col': c,
                        'grade_col': grade_col,
                        'units': units
                    })

            # Identify Summary Columns (Take FIRST occurrence right after courses)
            summary_cols = {}
            for test_idx in [header_row_idx, header_row_idx + 1, header_row_idx + 2]:
                if test_idx in grid:
                    for c in sorted(grid[test_idx].keys(), key=col_to_num):
                        v = grid[test_idx][c]
                        v_u = str(v).strip().upper()
                        if col_to_num(c) > name_col_num:
                            if v_u == 'RCU' and 'rcu' not in summary_cols: summary_cols['rcu'] = c
                            elif v_u == 'ECU' and 'ecu' not in summary_cols: summary_cols['ecu'] = c
                            elif v_u in ['CP', 'EGP'] and 'cp' not in summary_cols: summary_cols['cp'] = c
                            elif v_u == 'GPA' and 'gpa' not in summary_cols: summary_cols['gpa'] = c
                            elif v_u == 'TRCU' and 'trcu' not in summary_cols: summary_cols['trcu'] = c
                            elif v_u == 'TECU' and 'tecu' not in summary_cols: summary_cols['tecu'] = c
                            elif v_u == 'TCP' and 'tcp' not in summary_cols: summary_cols['tcp'] = c
                            elif v_u == 'CGPA' and 'cgpa' not in summary_cols: summary_cols['cgpa'] = c
                            elif 'OUTSTANDING' in v_u and 'outstanding' not in summary_cols: summary_cols['outstanding'] = c
                            elif 'REMARK' in v_u and 'remarks' not in summary_cols: summary_cols['remarks'] = c

            # Student data rows
            data_start = (units_row_idx + 1) if units_row_idx else (header_row_idx + 1)
            if data_start in grid and any(str(v).strip() in ['CR', 'EGP', 'RCU'] for v in grid[data_start].values()):
                data_start += 1

            for s_row_idx in range(data_start, end_row):
                if s_row_idx not in grid: continue
                r_dict = grid[s_row_idx]
                
                # If contains SUMMARY, break or stop students
                if any('SUMMARY' in str(v).upper() for v in r_dict.values()):
                    break
                    
                matric = str(r_dict.get(matric_col, '')).strip()
                name_val = str(r_dict.get(name_col, '')).strip()
                
                # Must be a valid student row
                if not matric or matric == '0' or matric.upper() == 'MATRIC. NUMBER' or len(matric) < 4:
                    continue
                if name_val == '0' and not any(r_dict.get(c['score_col']) for c in courses_in_sem):
                    continue

                # Parse courses taken in this semester
                student_courses = []
                sem_total_units = 0
                sem_passed_units = 0
                calc_points = 0
                
                for crs in courses_in_sem:
                    raw_score = r_dict.get(crs['score_col'], '')
                    raw_grade = r_dict.get(crs['grade_col'], '')
                    
                    score_str = str(raw_score).strip() if raw_score is not None else ''
                    grade_str = str(raw_grade).strip().upper() if raw_grade is not None else ''
                    
                    if not score_str and not grade_str:
                        continue
                    if score_str in ['0', 'None', ''] and not grade_str:
                        continue

                    # Score numeric
                    score_num = None
                    try:
                        score_num = round(float(score_str))
                    except:
                        score_num = None

                    # If grade_str is a digit (e.g. from misaligned columns), clear it
                    if grade_str.isdigit():
                        grade_str = ''

                    # Calculate Grade & Point if missing
                    # A: 70-100 (4), B: 60-69 (3), C: 50-59 (2), D: 40-49 (1), F: 0-39 (0)
                    gp = 0
                    if not grade_str and score_num is not None:
                        if score_num >= 70: grade_str = 'A'; gp = 4
                        elif score_num >= 60: grade_str = 'B'; gp = 3
                        elif score_num >= 50: grade_str = 'C'; gp = 2
                        elif score_num >= 40: grade_str = 'D'; gp = 1
                        else: grade_str = 'F'; gp = 0
                    else:
                        grade_map = {'A': 4, 'B': 3, 'C': 2, 'D': 1, 'E': 1, 'F': 0}
                        gp = grade_map.get(grade_str, 0)

                    u = crs['units']
                    qp = u * gp
                    sem_total_units += u
                    if gp > 0:
                        sem_passed_units += u
                    calc_points += qp

                    student_courses.append({
                        'code': crs['code'],
                        'units': u,
                        'score': score_num if score_num is not None else score_str,
                        'grade': grade_str or ('F' if score_num == 0 else ''),
                        'gradePoint': gp,
                        'qualityPoints': qp
                    })

                # Metrics helpers
                def get_num(key, default=0.0):
                    col = summary_cols.get(key)
                    if col and col in r_dict:
                        v = str(r_dict[col]).strip()
                        try:
                            val_f = float(v)
                            if val_f > 0 or default == 0.0:
                                return val_f
                        except: pass
                    return default

                def get_str(key, default=''):
                    col = summary_cols.get(key)
                    if col and col in r_dict:
                        v = str(r_dict[col]).strip()
                        if v and v != 'None' and v != '0': return v
                    return default

                raw_rcu = get_num('rcu', 0.0)
                raw_ecu = get_num('ecu', 0.0)
                raw_cp = get_num('cp', 0.0)
                raw_gpa = get_num('gpa', 0.0)

                # If student took no courses in this semester and has no GPA/RCU
                if not student_courses and raw_gpa == 0 and raw_rcu == 0 and raw_cp == 0:
                    if s_i > 0:
                        continue  # Skip empty subsequent template semester blocks!

                # Strictly enforce mathematical consistency between registered courses and semester totals
                if student_courses:
                    rcu = sem_total_units
                    ecu = sem_passed_units
                    cp = calc_points
                    gpa = round(cp / rcu, 2) if rcu > 0 else 0.0
                else:
                    rcu = raw_rcu
                    ecu = raw_ecu
                    cp = raw_cp
                    gpa = raw_gpa
                
                trcu = get_num('trcu', rcu)
                tecu = get_num('tecu', ecu)
                tcp = get_num('tcp', cp)
                cgpa = get_num('cgpa', round(tcp / trcu, 2) if trcu > 0 else gpa)
                
                outstanding = get_str('outstanding', 'None')
                remarks = get_str('remarks', 'In good standing' if cgpa >= 2.0 else 'Probation')

                # Create semester record
                sem_record = {
                    'semesterTitle': sem_title,
                    'semesterIndex': s_i + 1,
                    'courses': student_courses,
                    'rcu': int(rcu),
                    'ecu': int(ecu),
                    'cp': float(cp),
                    'gpa': round(float(gpa), 2),
                    'trcu': int(trcu),
                    'tecu': int(tecu),
                    'tcp': float(tcp),
                    'cgpa': round(float(cgpa), 2),
                    'outstanding': outstanding,
                    'remarks': remarks
                }

                # Add to student map
                clean_matric = matric.strip().upper()
                meta = sheet_meta.get(name, {
                    'dept': 'Health Sciences',
                    'cohort': name,
                    'prog': 'Diploma in Health Sciences'
                })

                if clean_matric not in all_students_map:
                    all_students_map[clean_matric] = {
                        'matricNumber': clean_matric,
                        'name': name_val.strip().upper() if (name_val and name_val != '0') else 'STUDENT',
                        'department': meta['dept'],
                        'cohort': meta['cohort'],
                        'programme': meta['prog'],
                        'sheetName': name,
                        'semesters': []
                    }
                elif name_val and name_val != '0' and all_students_map[clean_matric]['name'] == 'STUDENT':
                    all_students_map[clean_matric]['name'] = name_val.strip().upper()

                all_students_map[clean_matric]['semesters'].append(sem_record)

    # Convert student map to list
    students_list = list(all_students_map.values())
    
    # Calculate overall stats & cumulative aggregates
    for s in students_list:
        if s['semesters']:
            latest = s['semesters'][-1]
            s['latestCGPA'] = latest['cgpa']
            s['latestRemarks'] = latest['remarks']
            s['totalSemestersCompleted'] = len(s['semesters'])
        else:
            s['latestCGPA'] = 0.0
            s['latestRemarks'] = 'N/A'
            s['totalSemestersCompleted'] = 0

    print(f"\nFinished parsing! Total parsed students: {len(students_list)}")
    
    # Cohorts summary
    cohorts_summary = {}
    for s in students_list:
        c_name = s['sheetName']
        if c_name not in cohorts_summary:
            cohorts_summary[c_name] = {'name': c_name, 'department': s['department'], 'studentCount': 0}
        cohorts_summary[c_name]['studentCount'] += 1

    payload = {
        'institution': {
            'name': 'GARKI COLLEGE OF MEDICAL SCIENCES & HEALTH TECHNOLOGY',
            'subName': 'DEPARTMENT OF EXAMINATION & ACADEMIC RECORDS',
            'address': 'Kano / Abuja Academic Campus, Nigeria',
            'crest': '/logo.svg',
            'examOfficerTitle': 'Examination Officer',
            'hodTitle': 'Head of Department',
            'registrarTitle': 'Registrar / Academic Secretary'
        },
        'cohorts': list(cohorts_summary.values()),
        'students': students_list
    }

    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=2)

    print(f"Saved JSON database to {output_json} ({os.path.getsize(output_json)} bytes)")
