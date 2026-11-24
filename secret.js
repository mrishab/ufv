/**
 * University of the Fraser Valley - Secret Admin Page Logic
 * Manages form interactions, image uploads, dynamic tables, and localStorage persistence.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Current photo data (data URL, asset path, or remote URL)
  let currentPhotoData = ProfileStore.DEFAULT_PROFILE.photoUrl;

  // DOM Elements
  const toastContainer = document.getElementById('toast-container');
  const livePreviewAvatar = document.getElementById('live-preview-avatar');
  const livePreviewName = document.getElementById('live-preview-name');
  const livePreviewId = document.getElementById('live-preview-id');
  const livePreviewSemester = document.getElementById('live-preview-semester');
  const livePreviewYear = document.getElementById('live-preview-year');
  const livePreviewTerm = document.getElementById('live-preview-term');
  const livePreviewEmail = document.getElementById('live-preview-email');
  const livePreviewMajor = document.getElementById('live-preview-major');
  const liveStorageBadge = document.getElementById('live-storage-badge');

  const photoFileInput = document.getElementById('photo-file-input');
  const photoDropzone = document.getElementById('photo-dropzone');
  const editPhotoPreview = document.getElementById('edit-photo-preview');
  const btnBrowsePhoto = document.getElementById('btn-browse-photo');
  const btnResetPhoto = document.getElementById('btn-reset-photo');
  const fieldPhotoUrl = document.getElementById('field-photoUrl');

  const fieldCurrentSemester = document.getElementById('field-currentSemester');
  const fieldCurrentYear = document.getElementById('field-currentYear');
  const fieldCurrentTerm = document.getElementById('field-currentTerm');
  const btnSyncTerm = document.getElementById('btn-sync-term');

  const degreesTbody = document.getElementById('degrees-tbody');
  const btnAddDegree = document.getElementById('btn-add-degree');

  const coursesTbody = document.getElementById('courses-tbody');
  const btnAddCourse = document.getElementById('btn-add-course');
  const btnRecalcHours = document.getElementById('btn-recalc-hours');

  const btnSaveProfile = document.getElementById('btn-save-profile');
  const btnClearStorage = document.getElementById('btn-clear-storage');
  const saveStatusText = document.getElementById('save-status-text');
  const saveStatusDot = document.getElementById('save-status-dot');

  // All single-value fields mapping
  const fieldIds = [
    'name', 'studentId', 'standing', 'registrationNotices', 'holds',
    'email', 'dob', 'citizenship', 'emergencyContact', 'emergencyPhone',
    'level', 'classStanding', 'status', 'residency', 'firstTermAttended', 'lastTermAttended',
    'gradApplications',
    'primaryDegree', 'primaryLevel', 'primaryCourse', 'primaryMajor', 'primaryDepartment',
    'primaryConcentration', 'primaryMinor', 'primaryConcentration2', 'admitType', 'admitTerm', 'catalogueTerm',
    'secondaryDegree', 'institutionalGpa',
    'totalRegisteredHours', 'billingHours', 'ceuHours', 'minHours', 'maxHours'
  ];

  /**
   * Display toast notification
   */
  function showToast(message, type = 'success') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `${iconSvg} <span>${ProfileStore.escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Fallback handlers for broken or invalid avatar images
  if (editPhotoPreview) {
    editPhotoPreview.onerror = function () {
      this.onerror = null;
      this.src = ProfileStore.DEFAULT_PROFILE.photoUrl;
    };
  }
  if (livePreviewAvatar) {
    livePreviewAvatar.onerror = function () {
      this.onerror = null;
      this.src = ProfileStore.DEFAULT_PROFILE.photoUrl;
    };
  }

  /**
   * Update photo display
   */
  function setPhoto(urlOrData, updateInput = true) {
    currentPhotoData = urlOrData || ProfileStore.DEFAULT_PROFILE.photoUrl;
    if (editPhotoPreview) editPhotoPreview.src = currentPhotoData;
    if (livePreviewAvatar) livePreviewAvatar.src = currentPhotoData;
    if (updateInput && fieldPhotoUrl && document.activeElement !== fieldPhotoUrl) {
      fieldPhotoUrl.value = currentPhotoData;
    }
  }

  /**
   * Resize and compress an image file to fit safely within localStorage
   */
  function processImageFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (PNG, JPG, WebP, etc.).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 360;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round(height * (MAX_DIM / width));
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round(width * (MAX_DIM / height));
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        let compressedDataUrl = canvas.toDataURL(mime, 0.85);

        // Safeguard: If PNG data URL is exceptionally large (> 1MB), re-encode as JPEG with white background
        if (compressedDataUrl.length > 1000000) {
          const bgCanvas = document.createElement('canvas');
          bgCanvas.width = width;
          bgCanvas.height = height;
          const bgCtx = bgCanvas.getContext('2d');
          bgCtx.fillStyle = '#FFFFFF';
          bgCtx.fillRect(0, 0, width, height);
          bgCtx.drawImage(img, 0, 0, width, height);
          compressedDataUrl = bgCanvas.toDataURL('image/jpeg', 0.82);
        }

        setPhoto(compressedDataUrl, true);
        if (fieldPhotoUrl) fieldPhotoUrl.value = compressedDataUrl;
        showToast('Photo uploaded and compressed successfully!', 'success');
        markUnsaved();
      };
      img.onerror = () => {
        showToast('Could not process this image file.', 'error');
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      showToast('Error reading the image file.', 'error');
    };
    reader.readAsDataURL(file);
  }

  /**
   * Render dynamic degrees table
   */
  function renderDegreesRows(degrees) {
    if (!degreesTbody) return;
    degreesTbody.innerHTML = '';

    const list = Array.isArray(degrees) ? degrees : [];
    list.forEach((deg, idx) => {
      addDegreeRow(deg.title || '', deg.date || '');
    });
  }

  function addDegreeRow(title = '', date = '') {
    if (!degreesTbody) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" class="form-input deg-title" value="${ProfileStore.escapeHtml(title)}" placeholder="Degree / Credential Title"></td>
      <td><input type="text" class="form-input deg-date" value="${ProfileStore.escapeHtml(date)}" placeholder="DD/MM/YYYY"></td>
      <td style="text-align: center;">
        <button type="button" class="btn-sm btn-danger btn-remove-row" title="Delete credential">✕</button>
      </td>
    `;
    degreesTbody.appendChild(tr);

    tr.querySelector('.btn-remove-row').addEventListener('click', () => {
      tr.remove();
      markUnsaved();
    });

    tr.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', markUnsaved);
    });
  }

  /**
   * Render dynamic courses table
   */
  function renderCoursesRows(courses) {
    if (!coursesTbody) return;
    coursesTbody.innerHTML = '';

    const list = Array.isArray(courses) ? courses : [];
    list.forEach(c => {
      addCourseRow(c);
    });
  }

  function addCourseRow(c = {}) {
    if (!coursesTbody) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" class="form-input course-title" value="${ProfileStore.escapeHtml(c.title || '')}" placeholder="Unit Title"></td>
      <td><input type="text" class="form-input course-details" value="${ProfileStore.escapeHtml(c.details || '')}" placeholder="e.g. COMP 359 ON1"></td>
      <td><input type="text" class="form-input course-crn" value="${ProfileStore.escapeHtml(c.crn || '')}" placeholder="CRN"></td>
      <td><input type="number" class="form-input course-hours" value="${ProfileStore.escapeHtml(String(c.hours !== undefined ? c.hours : '3'))}" style="width: 60px;" min="0"></td>
      <td><input type="text" class="form-input course-status" value="${ProfileStore.escapeHtml(c.status || 'Registered (via web)')}" placeholder="Registration Status"></td>
      <td><input type="text" class="form-input course-instructor" value="${ProfileStore.escapeHtml(c.instructor || '')}" placeholder="Instructor"></td>
      <td style="text-align: center;">
        <button type="button" class="btn-sm btn-danger btn-remove-row" title="Delete course">✕</button>
      </td>
    `;
    coursesTbody.appendChild(tr);

    tr.querySelector('.btn-remove-row').addEventListener('click', () => {
      tr.remove();
      markUnsaved();
    });

    tr.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', markUnsaved);
    });
  }

  /**
   * Recalculate total hours from courses rows
   */
  function recalcHours() {
    let sum = 0;
    const hourInputs = document.querySelectorAll('.course-hours');
    hourInputs.forEach(inp => {
      const val = parseFloat(inp.value) || 0;
      sum += val;
    });

    const totalRegHoursInp = document.getElementById('field-totalRegisteredHours');
    const billingHoursInp = document.getElementById('field-billingHours');
    if (totalRegHoursInp) totalRegHoursInp.value = String(sum);
    if (billingHoursInp) billingHoursInp.value = String(sum);

    showToast(`Recalculated: Total registered & billing hours set to ${sum}`, 'info');
    markUnsaved();
  }

  /**
   * Populate entire form from a profile object
   */
  function populateForm(profile) {
    // 1. Photo
    setPhoto(profile.photoUrl || ProfileStore.DEFAULT_PROFILE.photoUrl);

    // 2. Simple fields
    fieldIds.forEach(id => {
      const el = document.getElementById(`field-${id}`);
      if (el) {
        el.value = profile[id] !== undefined ? profile[id] : '';
      }
    });

    // 3. Semester, Year, Term
    if (fieldCurrentSemester) fieldCurrentSemester.value = profile.currentSemester || 'Winter';
    if (fieldCurrentYear) fieldCurrentYear.value = profile.currentYear || '2027';
    if (fieldCurrentTerm) fieldCurrentTerm.value = profile.currentTerm || 'Winter 2027 Current Term';

    // 4. Terms List
    const fieldTermsList = document.getElementById('field-termsList');
    if (fieldTermsList) {
      const list = Array.isArray(profile.termsList) ? profile.termsList : ProfileStore.DEFAULT_PROFILE.termsList;
      fieldTermsList.value = list.join('\n');
    }

    // 5. Degrees dynamic table
    renderDegreesRows(profile.degrees || ProfileStore.DEFAULT_PROFILE.degrees);

    // 6. Courses dynamic table
    renderCoursesRows(profile.courses || ProfileStore.DEFAULT_PROFILE.courses);

    // 7. Update Live Preview
    updateLivePreview();
    updateStorageStatus();
  }

  /**
   * Gather form data into profile object
   */
  function collectFormData() {
    const profile = {};

    // Photo
    profile.photoUrl = currentPhotoData || ProfileStore.DEFAULT_PROFILE.photoUrl;

    // Simple fields
    fieldIds.forEach(id => {
      const el = document.getElementById(`field-${id}`);
      if (el) {
        profile[id] = el.value.trim();
      }
    });

    // Semester, Year, Term
    profile.currentSemester = fieldCurrentSemester ? fieldCurrentSemester.value : 'Winter';
    profile.currentYear = fieldCurrentYear ? fieldCurrentYear.value.trim() : '2027';
    profile.currentTerm = fieldCurrentTerm ? fieldCurrentTerm.value.trim() : `${profile.currentSemester} ${profile.currentYear} Current Term`;

    // Terms List
    const fieldTermsList = document.getElementById('field-termsList');
    if (fieldTermsList && fieldTermsList.value.trim()) {
      profile.termsList = fieldTermsList.value
        .split('\n')
        .map(t => t.trim())
        .filter(t => t.length > 0);
    } else {
      profile.termsList = [profile.currentTerm];
    }

    // Degrees
    profile.degrees = [];
    if (degreesTbody) {
      const rows = degreesTbody.querySelectorAll('tr');
      rows.forEach(tr => {
        const title = (tr.querySelector('.deg-title')?.value || '').trim();
        const date = (tr.querySelector('.deg-date')?.value || '').trim();
        if (title || date) {
          profile.degrees.push({ title, date });
        }
      });
    }

    // Courses
    profile.courses = [];
    if (coursesTbody) {
      const rows = coursesTbody.querySelectorAll('tr');
      rows.forEach(tr => {
        const title = (tr.querySelector('.course-title')?.value || '').trim();
        const details = (tr.querySelector('.course-details')?.value || '').trim();
        const crn = (tr.querySelector('.course-crn')?.value || '').trim();
        const hours = (tr.querySelector('.course-hours')?.value || '0').trim();
        const status = (tr.querySelector('.course-status')?.value || 'Registered (via web)').trim();
        const instructor = (tr.querySelector('.course-instructor')?.value || '').trim();
        if (title || crn) {
          profile.courses.push({ title, details, crn, hours, status, instructor });
        }
      });
    }

    return profile;
  }

  /**
   * Update live preview card
   */
  function updateLivePreview() {
    const nameVal = document.getElementById('field-name')?.value || 'Rishab Manocha';
    const idVal = document.getElementById('field-studentId')?.value || '300139589';
    const semVal = fieldCurrentSemester?.value || 'Winter';
    const yearVal = fieldCurrentYear?.value || '2027';
    const termVal = fieldCurrentTerm?.value || `${semVal} ${yearVal} Current Term`;
    const emailVal = document.getElementById('field-email')?.value || 'Rishab.Manocha@student.ufv.ca';
    const majorVal = document.getElementById('field-primaryMajor')?.value || 'Computer Info Systems Deg';

    if (livePreviewName) livePreviewName.textContent = nameVal;
    if (livePreviewId) livePreviewId.textContent = `ID: ${idVal}`;
    if (livePreviewSemester) livePreviewSemester.textContent = semVal;
    if (livePreviewYear) livePreviewYear.textContent = yearVal;
    if (livePreviewTerm) livePreviewTerm.textContent = termVal;
    if (livePreviewEmail) livePreviewEmail.textContent = emailVal;
    if (livePreviewMajor) livePreviewMajor.textContent = majorVal;
  }

  /**
   * Update storage status badge and sticky bar indicator
   */
  function updateStorageStatus(isSaved = true) {
    const hasCustom = ProfileStore.hasCustomProfile();
    if (liveStorageBadge) {
      if (hasCustom) {
        liveStorageBadge.className = 'preview-badge-status custom';
        liveStorageBadge.textContent = '● Custom Profile Active';
      } else {
        liveStorageBadge.className = 'preview-badge-status default';
        liveStorageBadge.textContent = '○ Default Profile (Unsaved)';
      }
    }

    if (saveStatusDot && saveStatusText) {
      if (isSaved) {
        saveStatusDot.className = 'sticky-status-dot active';
        saveStatusText.textContent = hasCustom ? 'Custom profile saved in localStorage.' : 'Default profile active.';
      } else {
        saveStatusDot.className = 'sticky-status-dot';
        saveStatusText.textContent = 'Unsaved changes! Click "Save Changes" to apply.';
      }
    }
  }

  function markUnsaved() {
    updateLivePreview();
    updateStorageStatus(false);
  }

  // -------------------------------------------------------------
  // EVENT LISTENERS
  // -------------------------------------------------------------

  // Form input changes -> mark unsaved & update live preview
  document.querySelectorAll('.secret-form-column input, .secret-form-column select, .secret-form-column textarea').forEach(el => {
    el.addEventListener('input', markUnsaved);
    el.addEventListener('change', markUnsaved);
  });

  // Direct image URL input (updates live previews without clobbering input)
  if (fieldPhotoUrl) {
    fieldPhotoUrl.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      currentPhotoData = val || ProfileStore.DEFAULT_PROFILE.photoUrl;
      if (editPhotoPreview) editPhotoPreview.src = currentPhotoData;
      if (livePreviewAvatar) livePreviewAvatar.src = currentPhotoData;
      markUnsaved();
    });
  }

  // Browse photo button
  if (btnBrowsePhoto && photoFileInput) {
    btnBrowsePhoto.addEventListener('click', () => photoFileInput.click());
  }

  // Dropzone click
  if (photoDropzone && photoFileInput) {
    photoDropzone.addEventListener('click', (e) => {
      if (e.target !== photoFileInput) {
        photoFileInput.click();
      }
    });

    photoDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      photoDropzone.classList.add('drag-active');
    });

    photoDropzone.addEventListener('dragleave', () => {
      photoDropzone.classList.remove('drag-active');
    });

    photoDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      photoDropzone.classList.remove('drag-active');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processImageFile(e.dataTransfer.files[0]);
      }
    });
  }

  // Global window drag & drop prevention (prevents browser navigating away on miss)
  window.addEventListener('dragover', (e) => e.preventDefault(), false);
  window.addEventListener('drop', (e) => e.preventDefault(), false);

  // File input change
  if (photoFileInput) {
    photoFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processImageFile(e.target.files[0]);
      }
    });
  }

  // Revert photo button
  if (btnResetPhoto) {
    btnResetPhoto.addEventListener('click', () => {
      setPhoto(ProfileStore.DEFAULT_PROFILE.photoUrl, true);
      if (fieldPhotoUrl) fieldPhotoUrl.value = ProfileStore.DEFAULT_PROFILE.photoUrl;
      if (photoFileInput) photoFileInput.value = '';
      showToast('Photo reverted to default avatar.', 'info');
      markUnsaved();
    });
  }

  // Semester / Year changes -> Auto-sync term text and term options
  function syncTermFromSemesterAndYear() {
    const sem = fieldCurrentSemester ? fieldCurrentSemester.value : 'Winter';
    const yr = fieldCurrentYear ? fieldCurrentYear.value.trim() : '2027';
    const newTerm = `${sem} ${yr} Current Term`;
    if (fieldCurrentTerm) {
      fieldCurrentTerm.value = newTerm;
    }

    const fieldTermsList = document.getElementById('field-termsList');
    if (fieldTermsList && fieldTermsList.value) {
      const lines = fieldTermsList.value.split('\n').map(l => l.trim()).filter(Boolean);
      let updated = false;
      const newLines = lines.map(line => {
        if (/current term/i.test(line)) {
          updated = true;
          return newTerm;
        }
        return line;
      });
      if (!updated) {
        newLines.unshift(newTerm);
      }
      fieldTermsList.value = newLines.join('\n');
    }

    markUnsaved();
  }

  if (btnSyncTerm) {
    btnSyncTerm.addEventListener('click', () => {
      syncTermFromSemesterAndYear();
      showToast('Term label synced with semester and year.', 'info');
    });
  }

  if (fieldCurrentSemester) {
    fieldCurrentSemester.addEventListener('change', syncTermFromSemesterAndYear);
  }
  if (fieldCurrentYear) {
    fieldCurrentYear.addEventListener('input', syncTermFromSemesterAndYear);
  }

  // Add degree button
  if (btnAddDegree) {
    btnAddDegree.addEventListener('click', () => {
      addDegreeRow('', '');
      markUnsaved();
    });
  }

  // Add course button
  if (btnAddCourse) {
    btnAddCourse.addEventListener('click', () => {
      addCourseRow({
        title: '',
        details: '',
        crn: '',
        hours: 3,
        status: 'Registered (via web)',
        instructor: ''
      });
      markUnsaved();
    });
  }

  // Recalculate hours button
  if (btnRecalcHours) {
    btnRecalcHours.addEventListener('click', recalcHours);
  }

  // Save changes handler
  function saveProfileChanges() {
    const nameInp = document.getElementById('field-name');
    const idInp = document.getElementById('field-studentId');
    if (!nameInp || !nameInp.value.trim()) {
      showToast('Full Name cannot be empty.', 'error');
      if (nameInp) nameInp.focus();
      return;
    }
    if (!idInp || !idInp.value.trim()) {
      showToast('Student ID cannot be empty.', 'error');
      if (idInp) idInp.focus();
      return;
    }

    try {
      const profile = collectFormData();
      ProfileStore.saveProfile(profile);
      showToast('All changes saved to localStorage! Website now renders your custom profile.', 'success');
      updateStorageStatus(true);
    } catch (err) {
      showToast(`Failed to save: ${err.message || 'Storage quota exceeded'}`, 'error');
    }
  }

  if (btnSaveProfile) {
    btnSaveProfile.addEventListener('click', saveProfileChanges);
  }

  // Keyboard shortcut: Ctrl+S or Cmd+S to save on secret page
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveProfileChanges();
    }
  });

  // Clear localStorage (Reset) button
  if (btnClearStorage) {
    btnClearStorage.addEventListener('click', () => {
      const confirmClear = confirm('Are you sure you want to clear localStorage and restore all default details?');
      if (!confirmClear) return;

      ProfileStore.clearProfile();
      if (photoFileInput) photoFileInput.value = '';
      populateForm(ProfileStore.DEFAULT_PROFILE);
      showToast('localStorage cleared! Original profile details restored.', 'info');
      updateStorageStatus(true);
    });
  }

  // Initial load
  const initialProfile = ProfileStore.getProfile();
  populateForm(initialProfile);
});
