# Complete Guide & Breakdown of Academic Excel Master Ledger (`result-gp.xlsx`)

---

## 1. Executive Summary & Workbook Architecture

The spreadsheet file `result-gp.xlsx` is a **Standardized Academic Broad-Sheet / Master Grading Ledger** used by Health Technology and Polytechnic institutions across Nigeria (specifically for **Garki College of Medical Sciences & Health Technology**). 

The workbook is structured into **9 worksheets**, containing two main academic programs:
1. **Public Health Technology (`PH`)**
2. **Medical Laboratory Technology (`MLT`)**

---

## 2. Sheet Naming Anatomy

| Sheet Name | Department / Programme | Cohort / Entry Year | Academic Level / Description |
| :--- | :--- | :--- | :--- |
| **`MLT 2020 R`** | Medical Laboratory Technology | 2020 Entry Cohort | **Year 3 / Final Diploma Level** (`MLT301` - `MLT313`). Contains final semester exam records. |
| **`MLT 2023 R`** | Medical Laboratory Technology | 2023 Entry Cohort | **Year 1 Level** (`ELS102`, `CSC102`, `PHY102`, `CHM102`, `BIO102`, `MTH102`, `FAP102`, `GST102`). |
| **`PH 25`** | Public Health Technology | 2024/2025 Cohort (*Class of '25*) | **Year 1, First Semester** (`EHT111`, `BCH111`, `CHE116`, `GNS102`, `CHE112`, `COM111`, `GNS111`, `PHY101`, `BIO101`, `MTH101`). |
| **`PH 24`** | Public Health Technology | 2023/2024 Cohort (*Class of '24*) | **Year 1, First Semester** with full student names, scores, grades, and remarks. |
| **`PH 24 Orig`** | Public Health Technology | 2023/2024 Cohort | Unmodified original master template backup created prior to student score finalization. |
| **`PH 23`** | Public Health Technology | 2022/2023 Cohort (*Class of '23*) | **Year 1, First Semester** (`GCMSHT/PH/.../23`). |
| **`Sheet1`**, **`Sheet2`**, **`Sheet4`** | Auxiliary / System Default | N/A | Blank default worksheets created when the workbook was first initialized. |

> *Note on Suffixes*: The **`R`** suffix in `MLT 2020 R` stands for **Results** (official signed ledger sheet).

---

## 3. The Mystery of "Seventh Year, First Semester" Explained

When inspecting sheets such as `PH 25`, `PH 24`, and `PH 23`, you will see section titles stretching all the way down to **"Seventh Year, Second Semester"** (Row 2287).

### Why are there 7 Years in a 2-Year or 3-Year Diploma Sheet?
In Nigerian Tertiary Institutions (Universities, Polytechnics, and Colleges of Health Technology), the Academic Registry utilizes a **Universal Multi-Session Master Template**:

1. **Pre-Formatted Multi-Year Shell**: Rather than creating a new file every session, the master template is pre-constructed with **14 semester blocks** (Years 1 to 7) in fixed vertical positions:
   * **Row 8**: `FIRST YEAR, FIRST SEMESTER`
   * **Row 223**: `FIRST YEAR, SECOND SEMESTER`
   * **Row 438**: `SECOND YEAR, FIRST SEMESTER`
   * **Row 652**: `SECOND YEAR, SECOND SEMESTER`
   * **Row 866**: `THIRD YEAR, FIRST SEMESTER`
   * **Row 1080**: `THIRD YEAR, SECOND SEMESTER`
   * **Row 1294**: `FOURTH YEAR, FIRST SEMESTER`
   * **Row 1508**: `FOURTH YEAR, SECOND SEMESTER`
   * **Row 1722**: `FIFTH YEAR, FIRST SEMESTER`
   * **Row 1835**: `FIFTH YEAR, SECOND SEMESTER`
   * **Row 1948**: `SIXTH YEAR, FIRST SEMESTER`
   * **Row 2061**: `SIXTH YEAR, SECOND SEMESTER`
   * **Row 2174**: `SEVENTH YEAR, FIRST SEMESTER`
   * **Row 2287**: `SEVENTH YEAR, SECOND SEMESTER`
2. **Maximum Permissible Academic Residency**: Under National Board for Technical Education (NBTE) regulations, students who encounter academic deficiencies, medical deferments, or repeated carryovers have a maximum statutory limit of **7 academic years (140% - 200% normal duration)** to clear all outstanding courses before mandatory academic withdrawal.
3. **Active vs Inactive Blocks**: For the current cohorts (`PH 25`, `PH 24`), only **Row 8 (First Year, First Semester)** is active and populated with live student examination data. The blocks for subsequent years are empty pre-formatted structures ready for future semesters.

---

## 4. The Two-Grid Architecture (Why Course Codes Appear Twice)

Each Public Health sheet is divided horizontally into **Two Distinct Grids**:

```
+-------------------------------------------------------------+-------------------------------------------------------------+
|               GRID A: PRIMARY RESULTS TABLE                |               GRID B: FORMULA AUDIT MATRIX                  |
|                   (Columns A to CB)                         |                   (Columns CC to GU)                        |
|  - Student Info (S/N, Matric, Name)                         |  - Repeats Student Matric & Name                            |
|  - Course Scores (0-100) & Letter Grades (A, B, C, D, F)    |  - 4-column breakdown per course: [RCU, ECU, CP, EGP]       |
|  - Semester Totals (RCU, ECU, CP, GPA, TRCU, TECU, TCP...)  |  - Automated Excel formulas computing grade points          |
|  - Academic Remarks & Carryover Courses                     |                                                             |
+-------------------------------------------------------------+-------------------------------------------------------------+
```

### Purpose of Grid B:
In Microsoft Excel, computing a Grade Point Average dynamically requires calculating `(Units × Grade Point)` for every course. Grid B provides the behind-the-scenes calculation cells:
* Column `CF` (`RCU`): Registered Units for `EHT111` (e.g. `2`)
* Column `CG` (`ECU`): Earned Units for `EHT111` (e.g. `2` if passed, `0` if failed)
* Column `CH` (`CP`): Grade Point earned (`4` for A, `3` for B, `2` for C, `1` for D, `0` for F)
* Column `CI` (`EGP` / `QP`): Quality Points = `Units × CP` (e.g. `2 × 4 = 8.0`)

---

## 5. Complete Dictionary of Headings, Acronyms & Abbreviations

### A. Student Identification Fields
* **`S/N`**: Serial Number (Sequential list index: 1, 2, 3...).
* **`MATRIC. NUMBER`** (or **`MATRIC NO`**): Official Matriculation Number assigned by the College Registrar (e.g. `GCMSHT/PH/001/25`, `GCMSHT/MLT/001/23`).
  * `GCMSHT` = Garki College of Medical Sciences & Health Technology
  * `PH` = Department of Public Health
  * `MLT` = Department of Medical Laboratory Technology
  * `001` = Student Number in Set
  * `25` / `24` / `23` / `20` = Entry/Cohort Year
* **`NAME`**: Full legal name of the candidate (Surname First or Full Academic Name).
* **`SEX`**: Gender of the candidate (`M` / `F`).

---

### B. Course-Level Academic Metrics
* **`CR`** (or **`CU`** / **`UNIT`**): **Credit Units / Registered Credit**. The academic weight assigned to a specific course (e.g. `2` units or `3` units).
* **`SCORE`** (or **`%`**): The raw composite examination score (0 - 100) combining Continuous Assessment (CA 30-40%) and End-of-Semester Examination (60-70%).
* **`GRADE`**: The official letter grade assigned according to the score:
  * **`A`**: 70% - 100% (Distinction / Excellent)
  * **`B`**: 60% - 69% (Upper Credit / Very Good)
  * **`C`**: 50% - 59% (Lower Credit / Good)
  * **`D`**: 40% - 49% (Pass / Fair)
  * **`E`**: 40% - 44% (Conditional Pass in legacy scale)
  * **`F`**: 0% - 39% (Fail / Unsatisfactory)
* **`GP`**: **Grade Point**. The numeric weight of the letter grade on the 4.00 scale:
  $$\text{A} = 4.0,\quad \text{B} = 3.0,\quad \text{C} = 2.0,\quad \text{D} = 1.0,\quad \text{F} = 0.0$$
* **`QP`** (or **`EGP`** / **`EP`**): **Quality Points / Earned Grade Points / Earned Points**.
  $$\text{QP} = \text{Course Units} \times \text{Grade Point (GP)}$$
  * *Example*: A 3-unit course with grade `B` (3.0 GP) gives $3 \times 3.0 = 9.0\text{ QP}$.

---

### C. Current Semester Summary Metrics
* **`RCU`**: **Registered Credit Units**. Total credit units the student enrolled in for that semester.
  $$\text{RCU} = \sum \text{Units of all enrolled courses in semester}$$
* **`ECU`** (sometimes written as **`EUC`** due to clerical typo): **Earned Credit Units**. Total credit units passed (where grade is A, B, C, or D). Courses with grade `F` contribute 0 to ECU.
* **`CP`**: **Credit Points (Total Quality Points)**. The sum of all Quality Points earned across all courses in the semester:
  $$\text{CP} = \sum (\text{Course Units} \times \text{GP})$$
* **`GPA`**: **Grade Point Average**. The weighted performance index for the specific semester:
  $$\text{GPA} = \frac{\text{Semester Total Credit Points (CP)}}{\text{Semester Registered Credit Units (RCU)}}$$

---

### D. Cumulative (To-Date) Performance Metrics
* **`TRCU`** (or **`TCU`**): **Total Registered Credit Units**. Cumulative sum of registered units across all semesters completed to date.
* **`TECU`**: **Total Earned Credit Units**. Cumulative sum of passed units across all semesters to date.
* **`TCP`**: **Total Credit Points**. Cumulative sum of quality points earned across all semesters to date.
* **`CGPA`**: **Cumulative Grade Point Average**. The overall academic average used for graduation classification:
  $$\text{CGPA} = \frac{\text{Total Cumulative Credit Points (TCP)}}{\text{Total Cumulative Registered Units (TRCU)}}$$

---

### E. Academic Standing, Deficiencies & Board Decisions
* **`OUTSTANDING COURSES`** (or **`CARRYOVER`**): Specific course codes that the student failed (grade `F`) or was absent from, requiring re-registration and re-examination.
* **`REMARKS`**: Academic Board status determination:
  * **`In good standing`**: Student is performing satisfactorily ($\text{CGPA} \ge 2.00$) with no critical deficiencies.
  * **`Deficient`**: Student has achieved the minimum passing GPA but carries 1 or more failed/outstanding courses that must be cleared.
  * **`Probation`**: Student's CGPA has dropped below $2.00$ ($\text{CGPA} < 2.00$). The student is placed on academic probation for one semester to improve performance.
  * **`Absent`**: Student was officially registered but failed to attend examinations.
  * **`Withdrawal`**: Student failed to meet probationary progression criteria and is advised/required to withdraw from the diploma programme.

---

### F. Class Summary Block (At Bottom of Sheets)
At the bottom of each semester section (e.g. Rows 21-27 in `MLT 2023 R`), the spreadsheet calculates aggregate cohort statistics for the Academic Board:
* **`Number in good standing`**: Count of students with $\text{CGPA} \ge 2.00$ and no deficiencies.
* **`Number with deficiency`**: Count of students carrying failed courses.
* **`Number on probation`**: Count of students with $\text{CGPA} < 2.00$.
* **`Number of withdrawals`**: Count of students exiting the program.
* **`Number Absent`**: Count of students with unrecorded attendance.
* **`Total number of students`**: Total class enrollment count.

---

## 6. Course Prefixes & Academic Disciplines in the Workbook

| Prefix | Discipline / Area | Typical Course Examples |
| :--- | :--- | :--- |
| **`EHT`** | Environmental Health Technology | `EHT111` (Fundamentals of Environmental Health), `EHT101` |
| **`PHT`** | Public Health Technology | `PHT111` (Introduction to Public Health Technology) |
| **`HET`** | Health Extension Techniques | `HET101` (Human Ecology & Health Systems) |
| **`MLT`** | Medical Laboratory Technology | `MLT301` (Clinical Chemistry), `MLT303` (Bacteriology), `MLT305` (Haematology), `MLT307` (Histopathology), `MLT309` (Parasitology), `MLT311` (Immunology), `MLT313` (Laboratory Management) |
| **`BCH`** | Biochemistry | `BCH111` (General Biochemistry & Bio-molecules) |
| **`CHE` / `CHM`** | Chemistry | `CHE112` (Inorganic Chemistry), `CHE116` (Practical Chemistry), `CHM102` (General Chemistry) |
| **`BIO`** | Biological Sciences | `BIO101` (General Biology I), `BIO102` (General Biology II) |
| **`PHY`** | Physics | `PHY101` (General Physics I), `PHY102` (General Physics II) |
| **`MTH`** | Mathematics & Biostatistics | `MTH101` (General Mathematics I), `MTH102` (Calculus & Vectors) |
| **`GNS` / `GST`** | General Studies | `GNS111` (Use of English), `GNS102` (Citizenship Education), `GST102` (Nigerian Peoples and Culture) |
| **`COM` / `CSC`** | Computer Science & Informatics | `COM111` (Introduction to Computing), `CSC102` (Computer Applications) |
| **`ELS`** | English & Communication Skills | `ELS102` (English Language & Communication II) |
| **`FAP`** | First Aid & Practical Skills | `FAP102` (First Aid & Patient Triage Procedures) |

---

## 7. Nigerian College 4.00 Grading Scale & Graduation Classification

| Score Range (%) | Letter Grade | Grade Point (GP) | Academic Classification (Graduation) |
| :---: | :---: | :---: | :--- |
| **70 - 100%** | **A** | **4.00** | **Distinction** ($\text{CGPA} \ge 3.50$) |
| **60 - 69%** | **B** | **3.00** | **Upper Credit** ($3.00 \le \text{CGPA} \le 3.49$) |
| **50 - 59%** | **C** | **2.00** | **Lower Credit** ($2.50 \le \text{CGPA} \le 2.99$) |
| **40 - 49%** | **D** | **1.00** | **Pass** ($2.00 \le \text{CGPA} \le 2.49$) |
| **0 - 39%** | **F** | **0.00** | **Fail / Deficient** ($\text{CGPA} < 2.00$) |

---

## 8. Worked Calculation Example

Take Student **`GCMSHT/PH/001/25`** from sheet `PH 25`:

| Course Code | Course Title | Units | Score | Grade | GP | Quality Points (QP) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `EHT111` | Fundamentals of Environmental Health | 2 | 48 | D | 1.0 | $2 \times 1.0 = 2.0$ |
| `BCH111` | General Biochemistry | 2 | 58 | C | 2.0 | $2 \times 2.0 = 4.0$ |
| `CHE116` | Practical Chemistry | 2 | 86 | A | 4.0 | $2 \times 4.0 = 8.0$ |
| `GNS102` | Citizenship Education | 2 | 83 | A | 4.0 | $2 \times 4.0 = 8.0$ |
| `CHE112` | Inorganic Chemistry | 3 | 42 | D | 1.0 | $3 \times 1.0 = 3.0$ |
| `COM111` | Introduction to Computing | 2 | 68 | B | 3.0 | $2 \times 3.0 = 6.0$ |
| `GNS111` | Use of English I | 2 | 42 | D | 1.0 | $2 \times 1.0 = 2.0$ |
| `PHY101` | General Physics I | 2 | 80 | A | 4.0 | $2 \times 4.0 = 8.0$ |
| `BIO101` | General Biology I | 2 | 60 | B | 3.0 | $2 \times 3.0 = 6.0$ |
| **Totals** | | **19 RCU** | | | | **47.0 Total QP (CP)** |

$$\text{Semester GPA} = \frac{\text{Total CP}}{\text{Total RCU}} = \frac{47.0}{19} = \mathbf{2.47}$$
* **Academic Standing**: *In good standing* (Passed all 19 units, $\text{GPA} = 2.47 \ge 2.00$).
