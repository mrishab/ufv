/**
 * University of the Fraser Valley - Student Profile Store
 * Centralized data management, localStorage persistence, and DOM rendering
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ProfileStore = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'ufv_student_profile';

  const DEFAULT_PROFILE = {
    // Identity & Profile
    name: 'Jane Doe',
    studentId: '300000000',
    photoUrl: 'assets/avatar.jpg',

    // Term, Semester & Status Features
    currentSemester: 'Winter',
    currentYear: '2027',
    currentTerm: 'Winter 2027 Current Term',
    termsList: [
      'Winter 2027 Current Term',
      'Fall 2026',
      'Summer 2026',
      'Winter 2026'
    ],
    standing: 'Good Standing, as of Fall 2026',
    registrationNotices: '3',
    holds: '0',

    // Bio Information
    email: 'jane.doe@student.ufv.ca',
    dob: '01/01',
    citizenship: 'Canadian Citizen',
    emergencyContact: 'Doe, John',
    emergencyPhone: '604 555 0100',

    // General Information
    level: 'Credit',
    classStanding: '91 or more credits completed',
    status: 'Active',
    residency: 'Fraser Valley (UFV) region',
    firstTermAttended: 'Fall 2023',
    lastTermAttended: 'Winter 2027',

    // Graduation Information
    gradApplications: 'None',
    degrees: [
      { title: 'Associate of Science', date: '01/05/2024' },
      { title: 'Computing Studies Certificate', date: '01/05/2024' }
    ],

    // Curriculum Primary Tab
    primaryDegree: 'Bach of Comp Info Systems',
    primaryLevel: 'Credit',
    primaryCourse: 'Bachelor of Computer Info Sys',
    primaryMajor: 'Computer Info Systems Deg',
    primaryDepartment: 'School of Computing',
    primaryConcentration: 'Not Provided',
    primaryMinor: 'Not Provided',
    primaryConcentration2: 'Not Provided',
    admitType: 'Post-Secondary Entry',
    admitTerm: 'Fall 2023',
    catalogueTerm: 'Fall 2023',

    // Curriculum Secondary Tab
    secondaryDegree: 'None',

    // Hours & GPA Tab
    totalRegisteredHours: '17',
    billingHours: '17',
    ceuHours: '0',
    minHours: '0',
    maxHours: '20',
    institutionalGpa: 'Not Provided',

    // Registered Courses
    courses: [
      {
        title: 'Design & Analysis: Algorithms',
        details: 'COMP 359 ON1',
        crn: '10444',
        hours: '3',
        status: 'Registered (via web)',
        instructor: 'Maryam Siahbani'
      },
      {
        title: 'Introduction to Robotics',
        details: 'COMP 361 ON1',
        crn: '10446',
        hours: '3',
        status: 'Registered (via web)',
        instructor: 'Amir Shabani'
      },
      {
        title: 'Web Server Installation & Main',
        details: 'COMP 445 ON1',
        crn: '10457',
        hours: '3',
        status: 'Registered (via web)',
        instructor: 'Talia Q'
      },
      {
        title: 'Natural Language Processing',
        details: 'COMP 482 AB1',
        crn: '10458',
        hours: '3',
        status: 'Registered (via web)',
        instructor: 'Matthew Huang'
      },
      {
        title: 'Waves/Optics/Electromagnetism',
        details: 'PHYS 118 A#C',
        crn: '10941',
        hours: '0',
        status: 'Registered (via web)',
        instructor: 'Mark Rempel'
      },
      {
        title: 'Waves/Optics/Electromagnetism',
        details: 'PHYS 118 AB2',
        crn: '10945',
        hours: '5',
        status: 'Registered (via web)',
        instructor: 'Shahrazad Malek'
      }
    ]
  };

  /**
   * Deep clone a plain JavaScript object
   */
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Safely retrieve the profile from localStorage.
   * If absent or corrupted, returns a clean clone of DEFAULT_PROFILE.
   */
  function getProfile() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return clone(DEFAULT_PROFILE);
      }
      const parsed = JSON.parse(stored);
      // Merge with defaults so newly added fields have safe fallbacks
      return Object.assign(clone(DEFAULT_PROFILE), parsed);
    } catch (e) {
      console.warn('ProfileStore: Error reading localStorage profile, using defaults.', e);
      return clone(DEFAULT_PROFILE);
    }
  }

  /**
   * Check if customized profile data exists in localStorage
   */
  function hasCustomProfile() {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch (e) {
      return false;
    }
  }

  /**
   * Save profile object to localStorage.
   * Returns true on success, throws or returns false on failure.
   */
  function saveProfile(profile) {
    try {
      const serialized = JSON.stringify(profile);
      localStorage.setItem(STORAGE_KEY, serialized);
      return true;
    } catch (e) {
      console.error('ProfileStore: Failed to save profile to localStorage', e);
      throw e;
    }
  }

  /**
   * Clear profile from localStorage and return defaults
   */
  function clearProfile() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      console.error('ProfileStore: Failed to clear profile from localStorage', e);
      return false;
    }
  }

  /**
   * Renders profile data into the DOM of index.html
   */
  function applyProfileToDocument(customProfile) {
    const profile = customProfile || getProfile();

    // 1. Page Title & Heading
    const fullTitle = `Student Profile - ${profile.name} (${profile.studentId})`;
    if (document.title !== undefined) {
      document.title = fullTitle;
    }

    const titleH1 = document.querySelector('.title-bar h1');
    if (titleH1) {
      titleH1.textContent = fullTitle;
    }

    // 2. Header User Name
    const headerUserName = document.querySelector('.header-user .user-name');
    if (headerUserName) {
      headerUserName.textContent = profile.name;
    }

    // 3. Sidebar Profile (Name and Avatar)
    const sidebarAvatar = document.querySelector('.sidebar-avatar');
    if (sidebarAvatar) {
      sidebarAvatar.src = profile.photoUrl || DEFAULT_PROFILE.photoUrl;
      sidebarAvatar.alt = profile.name;
      sidebarAvatar.onerror = function () {
        this.onerror = null;
        this.src = DEFAULT_PROFILE.photoUrl;
      };
    }

    const sidebarName = document.querySelector('.sidebar-name');
    if (sidebarName) {
      sidebarName.textContent = profile.name;
    }

    // 4. Term Dropdown & Standing
    const termSelect = document.getElementById('term-select');
    if (termSelect) {
      // Re-populate options if termsList is provided
      if (Array.isArray(profile.termsList) && profile.termsList.length > 0) {
        termSelect.innerHTML = '';
        profile.termsList.forEach((term) => {
          const opt = document.createElement('option');
          opt.value = term;
          opt.textContent = term;
          if (term === profile.currentTerm) {
            opt.selected = true;
          }
          termSelect.appendChild(opt);
        });
        if (profile.currentTerm && !profile.termsList.includes(profile.currentTerm)) {
          const customOpt = document.createElement('option');
          customOpt.value = profile.currentTerm;
          customOpt.textContent = profile.currentTerm;
          customOpt.selected = true;
          termSelect.insertBefore(customOpt, termSelect.firstChild);
        }
      }
    }

    const standingVal = document.querySelector('.standing-val');
    if (standingVal) {
      standingVal.textContent = profile.standing;
    }

    // 5. Status Badges: Registration Notices & Holds
    const statusBadges = document.querySelectorAll('.status-badge');
    if (statusBadges.length >= 2) {
      statusBadges[0].textContent = profile.registrationNotices !== undefined ? profile.registrationNotices : '3';
      statusBadges[1].textContent = profile.holds !== undefined ? profile.holds : '0';
    }

    // 6. Bio Information
    const bioEmail = document.getElementById('bio-email');
    if (bioEmail) {
      bioEmail.textContent = profile.email;
      bioEmail.href = `mailto:${profile.email}`;
    }

    const bioDob = document.getElementById('bio-dob');
    if (bioDob) bioDob.textContent = profile.dob;

    const bioCitizenship = document.getElementById('bio-citizenship');
    if (bioCitizenship) bioCitizenship.textContent = profile.citizenship;

    const bioEmergencyContact = document.getElementById('bio-emergency-contact');
    if (bioEmergencyContact) bioEmergencyContact.textContent = profile.emergencyContact;

    const bioEmergencyPhone = document.getElementById('bio-emergency-phone');
    if (bioEmergencyPhone) bioEmergencyPhone.textContent = profile.emergencyPhone;

    // 7. General Information
    const genLevel = document.getElementById('gen-level');
    if (genLevel) genLevel.textContent = profile.level;

    const genClass = document.getElementById('gen-class');
    if (genClass) genClass.textContent = profile.classStanding;

    const genStatus = document.getElementById('gen-status');
    if (genStatus) genStatus.textContent = profile.status;

    const genResidency = document.getElementById('gen-residency');
    if (genResidency) genResidency.textContent = profile.residency;

    const genFirstTerm = document.getElementById('gen-first-term');
    if (genFirstTerm) genFirstTerm.textContent = profile.firstTermAttended;

    const genLastTerm = document.getElementById('gen-last-term');
    if (genLastTerm) genLastTerm.textContent = profile.lastTermAttended;

    // 8. Graduation Information
    const gradApps = document.getElementById('grad-applications');
    if (gradApps) gradApps.textContent = profile.gradApplications;

    const gradGrid = document.getElementById('grad-grid');
    if (gradGrid && Array.isArray(profile.degrees)) {
      // Keep first kv-label and kv-value (Applications) and re-render degrees
      gradGrid.innerHTML = `
        <div class="kv-label">Graduation Applications:</div>
        <div class="kv-value" id="grad-applications">${escapeHtml(profile.gradApplications || 'None')}</div>
      `;
      profile.degrees.forEach((deg) => {
        const degLabel = document.createElement('div');
        degLabel.className = 'kv-label';
        degLabel.textContent = 'Awarded Degree:';

        const degValue = document.createElement('div');
        degValue.className = 'kv-value';
        degValue.textContent = deg.title || '';

        const dateLabel = document.createElement('div');
        dateLabel.className = 'kv-label';
        dateLabel.textContent = 'Date:';

        const dateValue = document.createElement('div');
        dateValue.className = 'kv-value';
        dateValue.textContent = deg.date || '';

        gradGrid.appendChild(degLabel);
        gradGrid.appendChild(degValue);
        gradGrid.appendChild(dateLabel);
        gradGrid.appendChild(dateValue);
      });
    }

    // 9. Curriculum Primary Tab
    const currDegree = document.getElementById('curr-degree');
    if (currDegree) currDegree.textContent = profile.primaryDegree;

    const currLevel = document.getElementById('curr-level');
    if (currLevel) currLevel.textContent = profile.primaryLevel;

    const currCourse = document.getElementById('curr-course');
    if (currCourse) currCourse.textContent = profile.primaryCourse;

    const currMajor = document.getElementById('curr-major');
    if (currMajor) currMajor.textContent = profile.primaryMajor;

    const currDepartment = document.getElementById('curr-department');
    if (currDepartment) currDepartment.textContent = profile.primaryDepartment;

    const currConcentration = document.getElementById('curr-concentration');
    if (currConcentration) currConcentration.textContent = profile.primaryConcentration;

    const currMinor = document.getElementById('curr-minor');
    if (currMinor) currMinor.textContent = profile.primaryMinor;

    const currConcentration2 = document.getElementById('curr-concentration-2');
    if (currConcentration2) currConcentration2.textContent = profile.primaryConcentration2 || 'Not Provided';

    const currAdmitType = document.getElementById('curr-admit-type');
    if (currAdmitType) currAdmitType.textContent = profile.admitType;

    const currAdmitTerm = document.getElementById('curr-admit-term');
    if (currAdmitTerm) currAdmitTerm.textContent = profile.admitTerm;

    const currCatalogueTerm = document.getElementById('curr-catalogue-term');
    if (currCatalogueTerm) currCatalogueTerm.textContent = profile.catalogueTerm;

    // 10. Secondary Tab
    const currSecondaryDegree = document.getElementById('curr-secondary-degree');
    if (currSecondaryDegree) currSecondaryDegree.textContent = profile.secondaryDegree;

    // 11. Hours & GPA Tab
    const hoursTotal = document.getElementById('hours-total');
    if (hoursTotal) hoursTotal.textContent = profile.totalRegisteredHours;

    const hoursBilling = document.getElementById('hours-billing');
    if (hoursBilling) hoursBilling.textContent = profile.billingHours;

    const hoursCeu = document.getElementById('hours-ceu');
    if (hoursCeu) hoursCeu.textContent = profile.ceuHours;

    const hoursMin = document.getElementById('hours-min');
    if (hoursMin) hoursMin.textContent = profile.minHours;

    const hoursMax = document.getElementById('hours-max');
    if (hoursMax) hoursMax.textContent = profile.maxHours;

    const hoursGpa = document.getElementById('hours-gpa');
    if (hoursGpa) hoursGpa.textContent = profile.institutionalGpa;

    // 12. Registered Courses Table
    const coursesTbody = document.getElementById('courses-tbody');
    if (coursesTbody && Array.isArray(profile.courses)) {
      coursesTbody.innerHTML = '';
      profile.courses.forEach((c) => {
        const tr = document.createElement('tr');
        const crnDisplay = c.crn ? `<a href="#" class="table-link">${escapeHtml(c.crn)}</a>` : '';
        const instructorDisplay = c.instructor ? `<a href="#" class="table-link">${escapeHtml(c.instructor)}</a>` : '';
        const hoursDisplay = c.hours !== undefined && c.hours !== null ? escapeHtml(String(c.hours)) : '';
        tr.innerHTML = `
          <td>${escapeHtml(c.title || '')}</td>
          <td>${escapeHtml(c.details || '')}</td>
          <td>${crnDisplay}</td>
          <td>${hoursDisplay}</td>
          <td>${escapeHtml(c.status || '')}</td>
          <td>${instructorDisplay}</td>
        `;
        coursesTbody.appendChild(tr);
      });
    }

    // 13. Courses Footer Summary
    const footerRegHours = document.getElementById('footer-registered-hours');
    if (footerRegHours) footerRegHours.textContent = profile.totalRegisteredHours;

    const footerBillHours = document.getElementById('footer-billing-hours');
    if (footerBillHours) footerBillHours.textContent = profile.billingHours;

    const footerCeuHours = document.getElementById('footer-ceu-hours');
    if (footerCeuHours) footerCeuHours.textContent = profile.ceuHours;

    const footerMinHours = document.getElementById('footer-min-hours');
    if (footerMinHours) footerMinHours.textContent = profile.minHours;

    const footerMaxHours = document.getElementById('footer-max-hours');
    if (footerMaxHours) footerMaxHours.textContent = profile.maxHours;
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  return {
    STORAGE_KEY,
    DEFAULT_PROFILE,
    clone,
    getProfile,
    hasCustomProfile,
    saveProfile,
    clearProfile,
    applyProfileToDocument,
    escapeHtml
  };
}));
