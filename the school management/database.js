/* ============================================================
   EduManage Pro — database.js
   Alag database file — sab seed data yahan hai
   Classes: 1 to 12 (Primary, Middle, Secondary, Senior Secondary)
   Senior Secondary Streams: Arts, Science, Bio, Commerce
   Students: 20 per class
============================================================ */

'use strict';

const SchoolSeedData = (function () {

  /* ----------------------------------------------------------
     CLASSES
     - Class 1–8   : Primary & Middle (single section A)
     - Class 9–10  : Secondary (section A)
     - Class 11–12 : Senior Secondary — 4 streams
  ---------------------------------------------------------- */
  const classes = [
    // ── Primary ──────────────────────────────────────────────
    { id:'C01', name:'Class 1-A',  grade:'1',  section:'A', teacher:'Mrs. Anita Sharma',    subjects:['English','Hindi','Maths','EVS','Drawing'],                                      fee:8000  },
    { id:'C02', name:'Class 2-A',  grade:'2',  section:'A', teacher:'Mrs. Rekha Joshi',     subjects:['English','Hindi','Maths','EVS','Drawing'],                                      fee:8000  },
    { id:'C03', name:'Class 3-A',  grade:'3',  section:'A', teacher:'Mrs. Pooja Yadav',     subjects:['English','Hindi','Maths','EVS','GK','Drawing'],                                 fee:9000  },
    { id:'C04', name:'Class 4-A',  grade:'4',  section:'A', teacher:'Mr. Deepak Tiwari',    subjects:['English','Hindi','Maths','Science','Social','GK'],                              fee:9000  },
    { id:'C05', name:'Class 5-A',  grade:'5',  section:'A', teacher:'Mrs. Seema Rao',       subjects:['English','Hindi','Maths','Science','Social','GK'],                              fee:10000 },
    // ── Middle ───────────────────────────────────────────────
    { id:'C06', name:'Class 6-A',  grade:'6',  section:'A', teacher:'Mr. Vijay Pandey',     subjects:['English','Hindi','Maths','Science','Social','Sanskrit','GK'],                   fee:12000 },
    { id:'C07', name:'Class 7-A',  grade:'7',  section:'A', teacher:'Mrs. Kavita Singh',    subjects:['English','Hindi','Maths','Science','Social','Sanskrit','GK'],                   fee:12000 },
    { id:'C08', name:'Class 8-A',  grade:'8',  section:'A', teacher:'Mr. Suresh Gupta',     subjects:['English','Hindi','Maths','Science','Social','Sanskrit','Computer'],              fee:14000 },
    // ── Secondary ────────────────────────────────────────────
    { id:'C09', name:'Class 9-A',  grade:'9',  section:'A', teacher:'Mrs. Priya Sharma',    subjects:['English','Hindi','Maths','Science','Social','Computer'],                        fee:18000 },
    { id:'C10', name:'Class 10-A', grade:'10', section:'A', teacher:'Mr. Rajan Mehta',      subjects:['English','Hindi','Maths','Science','Social','Computer'],                        fee:20000 },
    // ── Senior Secondary — Class 11 ──────────────────────────
    { id:'C11', name:'Class 11-Science', grade:'11', section:'Science', teacher:'Mr. Anil Verma',    subjects:['Physics','Chemistry','Maths','English','CS'],             fee:28000 },
    { id:'C12', name:'Class 11-Bio',     grade:'11', section:'Bio',     teacher:'Mrs. Sunita Gupta', subjects:['Physics','Chemistry','Biology','English','GK'],           fee:28000 },
    { id:'C13', name:'Class 11-Arts',    grade:'11', section:'Arts',    teacher:'Mr. Harish Dubey',  subjects:['History','Geography','Political Science','English','Hindi','Sociology'], fee:22000 },
    { id:'C14', name:'Class 11-Commerce',grade:'11', section:'Commerce',teacher:'Mrs. Meena Kapoor', subjects:['Accounts','Business Studies','Economics','English','Maths'], fee:24000 },
    // ── Senior Secondary — Class 12 ──────────────────────────
    { id:'C15', name:'Class 12-Science', grade:'12', section:'Science', teacher:'Mr. Amar Singh',     subjects:['Physics','Chemistry','Maths','English','CS'],             fee:30000 },
    { id:'C16', name:'Class 12-Bio',     grade:'12', section:'Bio',     teacher:'Mrs. Leela Nair',    subjects:['Physics','Chemistry','Biology','English','GK'],           fee:30000 },
    { id:'C17', name:'Class 12-Arts',    grade:'12', section:'Arts',    teacher:'Mr. Ramesh Shukla',  subjects:['History','Geography','Political Science','English','Hindi','Sociology'], fee:24000 },
    { id:'C18', name:'Class 12-Commerce',grade:'12', section:'Commerce',teacher:'Mrs. Nisha Bajaj',   subjects:['Accounts','Business Studies','Economics','English','Maths'], fee:26000 },
  ];

  /* ----------------------------------------------------------
     TEACHERS (18 teachers — one per class + extras)
  ---------------------------------------------------------- */
  const teachers = [
    { id:'T01', empId:'EMP-001', name:'Mrs. Anita Sharma',   subject:'EVS & English',    qual:'B.Ed, M.A',          contact:'9801111001', email:'anita@school.edu',   salary:32000, join:'2018-06-01', cls:'Class 1-A'           },
    { id:'T02', empId:'EMP-002', name:'Mrs. Rekha Joshi',    subject:'Hindi',            qual:'M.A Hindi, B.Ed',    contact:'9801111002', email:'rekha@school.edu',   salary:31000, join:'2019-07-01', cls:'Class 2-A'           },
    { id:'T03', empId:'EMP-003', name:'Mrs. Pooja Yadav',    subject:'Drawing & EVS',    qual:'B.Ed, B.F.A',        contact:'9801111003', email:'pooja@school.edu',   salary:30000, join:'2020-04-01', cls:'Class 3-A'           },
    { id:'T04', empId:'EMP-004', name:'Mr. Deepak Tiwari',   subject:'Maths',            qual:'M.Sc Maths, B.Ed',   contact:'9801111004', email:'deepak@school.edu',  salary:34000, join:'2017-06-01', cls:'Class 4-A'           },
    { id:'T05', empId:'EMP-005', name:'Mrs. Seema Rao',      subject:'Science',          qual:'M.Sc, B.Ed',         contact:'9801111005', email:'seema@school.edu',   salary:33000, join:'2019-06-01', cls:'Class 5-A'           },
    { id:'T06', empId:'EMP-006', name:'Mr. Vijay Pandey',    subject:'Social Studies',   qual:'M.A, B.Ed',          contact:'9801111006', email:'vijay@school.edu',   salary:35000, join:'2016-04-01', cls:'Class 6-A'           },
    { id:'T07', empId:'EMP-007', name:'Mrs. Kavita Singh',   subject:'Sanskrit',         qual:'M.A Sanskrit, B.Ed', contact:'9801111007', email:'kavita@school.edu',  salary:34000, join:'2018-07-01', cls:'Class 7-A'           },
    { id:'T08', empId:'EMP-008', name:'Mr. Suresh Gupta',    subject:'Computer',         qual:'MCA, B.Ed',          contact:'9801111008', email:'suresh@school.edu',  salary:38000, join:'2017-06-01', cls:'Class 8-A'           },
    { id:'T09', empId:'EMP-009', name:'Mrs. Priya Sharma',   subject:'Mathematics',      qual:'M.Sc Maths, B.Ed',   contact:'9801111009', email:'priya@school.edu',   salary:42000, join:'2015-04-01', cls:'Class 9-A'           },
    { id:'T10', empId:'EMP-010', name:'Mr. Rajan Mehta',     subject:'Science',          qual:'M.Sc Phys, B.Ed',    contact:'9801111010', email:'rajan@school.edu',   salary:43000, join:'2016-07-01', cls:'Class 10-A'          },
    { id:'T11', empId:'EMP-011', name:'Mr. Anil Verma',      subject:'Physics',          qual:'M.Sc Phys, B.Ed',    contact:'9801111011', email:'anil@school.edu',    salary:48000, join:'2014-04-01', cls:'Class 11-Science'    },
    { id:'T12', empId:'EMP-012', name:'Mrs. Sunita Gupta',   subject:'Biology',          qual:'M.Sc Bio, B.Ed',     contact:'9801111012', email:'sunita@school.edu',  salary:46000, join:'2015-06-01', cls:'Class 11-Bio'        },
    { id:'T13', empId:'EMP-013', name:'Mr. Harish Dubey',    subject:'History',          qual:'M.A History, B.Ed',  contact:'9801111013', email:'harish@school.edu',  salary:40000, join:'2017-04-01', cls:'Class 11-Arts'       },
    { id:'T14', empId:'EMP-014', name:'Mrs. Meena Kapoor',   subject:'Accounts',         qual:'M.Com, B.Ed',        contact:'9801111014', email:'meena@school.edu',   salary:44000, join:'2016-06-01', cls:'Class 11-Commerce'   },
    { id:'T15', empId:'EMP-015', name:'Mr. Amar Singh',      subject:'Computer Science', qual:'M.Tech, B.Ed',       contact:'9801111015', email:'amar@school.edu',    salary:52000, join:'2013-04-01', cls:'Class 12-Science'    },
    { id:'T16', empId:'EMP-016', name:'Mrs. Leela Nair',     subject:'Chemistry',        qual:'M.Sc Chem, B.Ed',    contact:'9801111016', email:'leela@school.edu',   salary:49000, join:'2014-07-01', cls:'Class 12-Bio'        },
    { id:'T17', empId:'EMP-017', name:'Mr. Ramesh Shukla',   subject:'Geography',        qual:'M.A Geography, B.Ed',contact:'9801111017', email:'ramesh@school.edu',  salary:41000, join:'2016-04-01', cls:'Class 12-Arts'       },
    { id:'T18', empId:'EMP-018', name:'Mrs. Nisha Bajaj',    subject:'Business Studies', qual:'MBA, B.Ed',          contact:'9801111018', email:'nisha@school.edu',   salary:47000, join:'2015-06-01', cls:'Class 12-Commerce'   },
    { id:'T19', empId:'EMP-019', name:'Mr. Keshav Mishra',   subject:'English',          qual:'M.A English, B.Ed',  contact:'9801111019', email:'keshav@school.edu',  salary:39000, join:'2018-04-01', cls:''                    },
    { id:'T20', empId:'EMP-020', name:'Mrs. Divya Tripathi', subject:'Physical Education',qual:'M.P.Ed',            contact:'9801111020', email:'divya@school.edu',   salary:36000, join:'2019-06-01', cls:''                    },
  ];

  /* ----------------------------------------------------------
     STUDENTS  — 20 per class × 18 classes = 360 students
     Roll format: [gradeCode][streamCode][serial]
       Class 1  → 0100x , Class 2 → 0200x … Class 10 → 1000x
       Class 11-Science → 1100x, Class 11-Bio → 1200x
       Class 11-Arts → 1300x, Class 11-Commerce → 1400x
       Class 12-Science → 1500x, Class 12-Bio → 1600x
       Class 12-Arts → 1700x, Class 12-Commerce → 1800x
  ---------------------------------------------------------- */

  // Helper arrays for generating realistic names
  const firstNamesM = ['Aarav','Arjun','Rohan','Karan','Vivek','Rahul','Sanjay','Nikhil','Akash','Dev',
                       'Prateek','Mohit','Amit','Ravi','Suraj','Harsh','Shivam','Gaurav','Tarun','Abhishek'];
  const firstNamesF = ['Priya','Neha','Anjali','Pooja','Sneha','Riya','Ananya','Preeti','Sunita','Kavita',
                       'Divya','Shreya','Nidhi','Sanya','Ishita','Nikita','Meera','Tanvi','Ritika','Simran'];
  const lastNames   = ['Kumar','Sharma','Verma','Singh','Gupta','Tiwari','Joshi','Mishra','Yadav','Pandey',
                       'Dubey','Mehta','Patel','Nair','Bose','Reddy','Iyer','Kapoor','Bajaj','Shukla'];
  const parentPre   = ['Mr.','Mr.','Mr.','Mr.','Mr.','Mrs.'];
  const bloodGroups = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
  const cities      = ['Gandhi Nagar','Nehru Colony','Laxmi Nagar','Rohini Sec-5','Dwarka Sec-7',
                       'Janakpuri','Pitampura','Saket','Vasant Kunj','Patparganj',
                       'Mayur Vihar','Preet Vihar','Noida Sec-62','Gurgaon Sec-14','Faridabad'];
  const admYear     = ['2024-04-01','2024-04-02','2024-04-03','2024-04-05','2024-04-08','2024-07-01'];

  /**
   * generateStudents(classObj, startRoll, dobYearRange, count)
   * classObj     : a class record from the classes array above
   * rollPrefix   : e.g. '010' → rolls become '0101','0102'…
   * dobYearRange : [startYear, endYear] (birth year range)
   */
  function generateStudents(classObj, rollPrefix, dobYearRange, count = 20) {
    const list = [];
    const fee  = classObj.fee;

    for (let i = 0; i < count; i++) {
      const isFemale = i % 2 === 1;                                  // alternating gender
      const fNames   = isFemale ? firstNamesF : firstNamesM;
      const first    = fNames[i % fNames.length];
      const last     = lastNames[i % lastNames.length];
      const name     = `${first} ${last}`;
      const gender   = isFemale ? 'Female' : 'Male';
      const roll     = rollPrefix + String(i + 1).padStart(2, '0'); // e.g. 010101

      // Date of birth — spread across dobYearRange
      const year  = dobYearRange[0] + (i % (dobYearRange[1] - dobYearRange[0] + 1));
      const month = String((i % 12) + 1).padStart(2, '0');
      const day   = String((i % 28) + 1).padStart(2, '0');
      const dob   = `${year}-${month}-${day}`;

      const parentLast = lastNames[(i + 3) % lastNames.length];
      const parentName = `${parentPre[i % parentPre.length]} ${first.charAt(0)}. ${parentLast}`;
      const contact    = '98' + String(10000000 + parseInt(rollPrefix) * 100 + i).toString().slice(-8);
      const addr       = `${(i + 1) * 12} ${cities[i % cities.length]}`;
      const blood      = bloodGroups[i % bloodGroups.length];
      const admDate    = admYear[i % admYear.length];

      list.push({
        id:      `ST${rollPrefix}${String(i+1).padStart(2,'0')}`,
        roll,
        name,
        cls:     classObj.name,
        gender,
        dob,
        blood,
        parent:  parentName,
        contact,
        addr,
        fee,
        admDate
      });
    }
    return list;
  }

  // ── Build all students ──────────────────────────────────────
  const students = [
    ...generateStudents(classes[0],  '0101', [2018, 2019]),  // Class 1-A
    ...generateStudents(classes[1],  '0201', [2017, 2018]),  // Class 2-A
    ...generateStudents(classes[2],  '0301', [2016, 2017]),  // Class 3-A
    ...generateStudents(classes[3],  '0401', [2015, 2016]),  // Class 4-A
    ...generateStudents(classes[4],  '0501', [2014, 2015]),  // Class 5-A
    ...generateStudents(classes[5],  '0601', [2013, 2014]),  // Class 6-A
    ...generateStudents(classes[6],  '0701', [2012, 2013]),  // Class 7-A
    ...generateStudents(classes[7],  '0801', [2011, 2012]),  // Class 8-A
    ...generateStudents(classes[8],  '0901', [2010, 2011]),  // Class 9-A
    ...generateStudents(classes[9],  '1001', [2009, 2010]),  // Class 10-A
    ...generateStudents(classes[10], '1101', [2008, 2009]),  // Class 11-Science
    ...generateStudents(classes[11], '1201', [2008, 2009]),  // Class 11-Bio
    ...generateStudents(classes[12], '1301', [2008, 2009]),  // Class 11-Arts
    ...generateStudents(classes[13], '1401', [2008, 2009]),  // Class 11-Commerce
    ...generateStudents(classes[14], '1501', [2007, 2008]),  // Class 12-Science
    ...generateStudents(classes[15], '1601', [2007, 2008]),  // Class 12-Bio
    ...generateStudents(classes[16], '1701', [2007, 2008]),  // Class 12-Arts
    ...generateStudents(classes[17], '1801', [2007, 2008]),  // Class 12-Commerce
  ];

  /* ----------------------------------------------------------
     NOTICES
  ---------------------------------------------------------- */
  const notices = [
    { id:'N1', title:'Annual Sports Day',           cat:'Sports',  prio:'High',   date:'2026-03-10', content:'Annual Sports Day on 25th March 2026. All students must participate. Practice starts next week.' },
    { id:'N2', title:'Mid-Term Exam Schedule',      cat:'Exam',    prio:'Urgent', date:'2026-03-12', content:'Mid-Term exams for all classes: 1st April – 10th April 2026. Time-tables distributed in class by Friday.' },
    { id:'N3', title:'Fee Submission Deadline',     cat:'Fee',     prio:'Urgent', date:'2026-03-14', content:'Last date for March fee is 20th March 2026. Late fee of ₹50/day after due date.' },
    { id:'N4', title:'Holi Holiday Announcement',  cat:'Holiday', prio:'Normal', date:'2026-03-08', content:'School will remain closed on 14th March 2026 for Holi. Classes resume 17th March 2026.' },
    { id:'N5', title:'Board Exam Admit Cards',      cat:'Exam',    prio:'Urgent', date:'2026-02-28', content:'Class 10 & 12 students: Collect board exam admit cards from the office 1st–5th March 2026.' },
    { id:'N6', title:'Parent-Teacher Meeting',      cat:'General', prio:'High',   date:'2026-03-20', content:'PTM scheduled for 28th March 2026. All parents are requested to attend. Timing: 9 AM – 1 PM.' },
    { id:'N7', title:'Science Exhibition',          cat:'Sports',  prio:'Normal', date:'2026-03-05', content:'Inter-school Science Exhibition on 15th April 2026. Entries open. Contact Science department.' },
    { id:'N8', title:'Library Book Return',         cat:'General', prio:'Normal', date:'2026-03-01', content:'All students must return library books by 31st March 2026 to avoid fine.' },
  ];

  /* ----------------------------------------------------------
     PUBLIC EXPORT
  ---------------------------------------------------------- */
  return { classes, teachers, students, notices };

})();
