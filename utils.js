// Point Allocation Rules & Seed Data for Activity Points Tracker

export const CATEGORIES = [
  {
    id: 'nss_clubs',
    name: 'clubs',
    maxPoints: 20,
    activities: [
      { name: 'Blood Donation (Once a semester)', points: 10 },
      { name: 'Blood Donation (More than once a year)', points: 20 },
      { name: 'Book Collection Drive (Coordinator)', points: 10 },
    ]
  },
  {
    id: 'professional_body',
    name: 'Prof. Bodies',
    maxPoints: 20,
    activities: [
      { name: 'Chairman / Secretary / Treasurer', points: 20 },
      { name: 'Joint Secretary / Vice Chairman', points: 20 },
      { name: 'EC Member', points: 10 },
    ]
  },
  {
    id: 'college_fests',
    name: 'Events',
    maxPoints: 40,
    activities: [
      { name: 'PHASESHIFT - Core Committee', points: 20 },
      { name: 'PHASESHIFT - Senior Coordinator', points: 18 },
      { name: 'PHASESHIFT - Volunteer', points: 10 },
      { name: 'UTSAV - Core Committee', points: 20 },
      { name: 'UTSAV - Volunteer', points: 10 },
    ]
  },
  {
    id: 'qualifying_exams',
    name: 'Exams',
    maxPoints: 20,
    activities: [
      { name: 'GATE/CAT/Govt. Exams (Appeared)', points: 5 },
      { name: 'Qualified in GATE/CAT/GRE', points: 10 },
    ]
  },
  {
    id: 'health_activities',
    name: 'volunteering',
    maxPoints: 20,
    activities: [
      { name: 'Walkathon with 10k steps/day (IMPACT)', points: 2 },
      { name: 'Walk for 10 days (IMPACT)', points: 20 },
    ]
  },
  {
    id: 'value_added_courses',
    name: 'academics',
    maxPoints: 20,
    activities: [
      { name: 'One week course', points: 10 },
      { name: 'Two weeks or more course', points: 20 },
    ]
  },
  {
    id: 'other_activities',
    name: 'cultural',
    maxPoints: 40,
    activities: [
      { name: 'Teaching in Govt. School', points: 20 },
      { name: 'Tech Talk: AI in Education', points: 8 },
      { name: 'Debate Club Meeting', points: 5 },
      { name: 'Organizing Seminar (Dept)', points: 5 },
    ]
  }
];

export const INITIAL_ACTIVITIES = [
  { id: '1', title: 'NSS Blood Donation Camp', category: 'nss_clubs', detail: 'Blood Donation (Once a semester)', date: 'Mar 10, 2026', points: 10, status: 'Approved' },
  { id: '2', title: 'Hackathon 2026', category: 'college_fests', detail: 'PHASESHIFT - Volunteer', date: 'Mar 10, 2026', points: 15, status: 'Pending' },
  { id: '3', title: 'UTSAV 2026 - Volunteer', category: 'college_fests', detail: 'UTSAV - Volunteer', date: 'Mar 05, 2026', points: 10, status: 'Pending' },
  { id: '4', title: 'Tech Talk: AI in Education', category: 'other_activities', detail: 'Tech Talk: AI in Education', date: 'Mar 05, 2026', points: 8, status: 'Approved' },
  { id: '5', title: 'Debate Club Meeting', category: 'other_activities', detail: 'Debate Club Meeting', date: 'Mar 01, 2026', points: 5, status: 'Approved' },
  { id: '6', title: 'IEEE Joint Secretary Role', category: 'professional_body', detail: 'Joint Secretary / Vice Chairman', date: 'Nov 12, 2025', points: 20, status: 'Approved' },
  { id: '7', title: 'Machine Learning Course', category: 'value_added_courses', detail: 'One week course', date: 'Dec 05, 2025', points: 10, status: 'Approved' },
  { id: '8', title: 'GATE Exam Attempt', category: 'qualifying_exams', detail: 'GATE/CAT/Govt. Exams (Appeared)', date: 'Jan 10, 2026', points: 5, status: 'Approved' },
  { id: '9', title: 'Walkathon (IMPACT App)', category: 'health_activities', detail: 'Walkathon with 10k steps/day (IMPACT)', date: 'Feb 15, 2026', points: 2, status: 'Approved' },
  { id: '10', title: 'Robotics Workshop Volunteer', category: 'college_fests', detail: 'PHASESHIFT - Volunteer', date: 'Feb 18, 2026', points: 10, status: 'Pending' }
];

export const DEMO_CERTIFICATES = [
  {
    title: 'NSS Blood Donation Certificate',
    category: 'nss_clubs',
    detail: 'Blood Donation (Once a semester)',
    points: 10,
    org: 'BMSCE NSS CELL',
    date: 'Mar 10, 2026',
    desc: 'Awarded to Sahil for donating blood in the Blood Donation Camp.'
  },
  {
    title: 'PHASESHIFT Volunteer Certificate',
    category: 'college_fests',
    detail: 'PHASESHIFT - Volunteer',
    points: 10,
    org: 'PHASESHIFT COMMITTEE',
    date: 'Mar 10, 2026',
    desc: 'Awarded to Sahil for contribution as a volunteer in PHASESHIFT.'
  },
  {
    title: 'IEEE Committee Member Certificate',
    category: 'professional_body',
    detail: 'EC Member',
    points: 10,
    org: 'IEEE BMSCE STUDENT BRANCH',
    date: 'Nov 12, 2025',
    desc: 'Awarded to Sahil for working as an EC Member of IEEE BMSCE.'
  },
  {
    title: 'Machine Learning Value Course',
    category: 'value_added_courses',
    detail: 'One week course',
    points: 10,
    org: 'BMSCE CSE DEPT',
    date: 'Dec 05, 2025',
    desc: 'Awarded to Sahil for completing the one week Value Added Course on ML.'
  },
  {
    title: 'GATE 2025 Scorecard',
    category: 'qualifying_exams',
    detail: 'GATE/CAT/Govt. Exams (Appeared)',
    points: 5,
    org: 'IIT BOMBAY (GATE)',
    date: 'Jan 10, 2026',
    desc: 'GATE scorecard issued to Sahil indicating appearance and score.'
  }
];

// Helper calculations for 8 specific categories:
// Events, Prof. Bodies, Exams, Seminars, clubs, volunteering, academics, cultural
export const calculateStats = (activities) => {
  const approved = activities.filter(a => a.status === 'Approved');
  const pending = activities.filter(a => a.status === 'Pending' || a.status === 'Verifying');
  
  const totalPoints = approved.reduce((sum, a) => sum + a.points, 0);
  
  const chartPoints = {
    'Events': 0,
    'Prof. Bodies': 0,
    'Exams': 0,
    'Seminars': 0,
    'clubs': 0,
    'volunteering': 0,
    'academics': 0,
    'cultural': 0
  };
  
  approved.forEach(a => {
    if (a.category === 'college_fests') {
      chartPoints['Events'] += a.points;
    } else if (a.category === 'professional_body') {
      chartPoints['Prof. Bodies'] += a.points;
    } else if (a.category === 'qualifying_exams') {
      chartPoints['Exams'] += a.points;
    } else if (a.category === 'nss_clubs') {
      chartPoints['clubs'] += a.points;
    } else if (a.category === 'value_added_courses') {
      chartPoints['academics'] += a.points;
    } else if (a.category === 'health_activities') {
      chartPoints['volunteering'] += a.points;
    } else if (a.category === 'other_activities') {
      if (a.title.toLowerCase().includes('talk') || a.title.toLowerCase().includes('seminar') || a.title.toLowerCase().includes('webinar')) {
        chartPoints['Seminars'] += a.points;
      } else if (a.title.toLowerCase().includes('teaching') || a.title.toLowerCase().includes('volunteer')) {
        chartPoints['volunteering'] += a.points;
      } else {
        chartPoints['cultural'] += a.points;
      }
    } else {
      chartPoints['cultural'] += a.points;
    }
  });

  return {
    totalPoints,
    pendingCount: pending.length,
    activitiesCount: activities.length,
    chartPoints
  };
};
