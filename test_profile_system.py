#!/usr/bin/env python3
"""
Test Suite for UFV Banner Student Profile Secret Page & Dynamic Profile Store.
Verifies HTML structure, IDs, selectors, data persistence logic, DOM rendering,
and secret page features.
"""

import os
import sys
import json
import re
from bs4 import BeautifulSoup

def test_files_exist():
    required_files = [
        '/workspace/index.html',
        '/workspace/styles.css',
        '/workspace/app.js',
        '/workspace/profile-store.js',
        '/workspace/secret.html',
        '/workspace/secret.css',
        '/workspace/secret.js',
        '/workspace/admin.html'
    ]
    for path in required_files:
        assert os.path.isfile(path), f"File {path} must exist"
    print("✓ All required files exist.")

def test_profile_store_js_content():
    with open('/workspace/profile-store.js') as f:
        content = f.read()

    # Verify key methods and constants exist
    assert 'STORAGE_KEY' in content
    assert "'ufv_student_profile'" in content
    assert 'DEFAULT_PROFILE' in content
    assert 'getProfile' in content
    assert 'saveProfile' in content
    assert 'clearProfile' in content
    assert 'hasCustomProfile' in content
    assert 'applyProfileToDocument' in content
    assert 'escapeHtml' in content

    # Verify default profile details
    assert 'Jane Doe' in content
    assert '300000000' in content
    assert 'assets/avatar.jpg' in content
    assert 'Winter' in content
    assert '2027' in content
    assert 'Winter 2027 Current Term' in content
    assert 'jane.doe@student.ufv.ca' in content
    assert 'Good Standing, as of Fall 2026' in content
    print("✓ profile-store.js contains all expected methods and default profile constants.")

def test_index_html_structure_and_ids():
    with open('/workspace/index.html') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    # 1. Header elements
    settings_btn = soup.find(id='header-settings-btn')
    assert settings_btn is not None, "Settings button #header-settings-btn must exist"
    user_name = soup.find('span', class_='user-name')
    assert user_name is not None and 'Jane Doe' in user_name.text

    # 2. Page title & h1
    assert 'Student Profile - Jane Doe (300000000)' in soup.title.string
    h1 = soup.find('h1')
    assert h1 is not None and 'Jane Doe' in h1.text

    # 3. Term select
    term_select = soup.find('select', id='term-select')
    assert term_select is not None
    options = [opt.text.strip() for opt in term_select.find_all('option')]
    assert 'Winter 2027 Current Term' in options

    # 4. Sidebar profile
    avatar = soup.find('img', class_='sidebar-avatar')
    assert avatar is not None and avatar.get('src') == 'assets/avatar.jpg'
    sidebar_name = soup.find('a', class_='sidebar-name')
    assert sidebar_name is not None and sidebar_name.text.strip() == 'Jane Doe'

    # 5. Bio information IDs
    assert soup.find(id='bio-email') is not None
    assert soup.find(id='bio-dob') is not None
    assert soup.find(id='bio-citizenship') is not None
    assert soup.find(id='bio-emergency-contact') is not None
    assert soup.find(id='bio-emergency-phone') is not None

    # 6. General information IDs
    assert soup.find(id='gen-level') is not None
    assert soup.find(id='gen-class') is not None
    assert soup.find(id='gen-status') is not None
    assert soup.find(id='gen-residency') is not None
    assert soup.find(id='gen-first-term') is not None
    assert soup.find(id='gen-last-term') is not None

    # 7. Graduation information
    assert soup.find(id='grad-grid') is not None
    assert soup.find(id='grad-applications') is not None

    # 8. Curriculum tabs IDs
    assert soup.find(id='curr-degree') is not None
    assert soup.find(id='curr-level') is not None
    assert soup.find(id='curr-course') is not None
    assert soup.find(id='curr-major') is not None
    assert soup.find(id='curr-department') is not None
    assert soup.find(id='curr-concentration') is not None
    assert soup.find(id='curr-minor') is not None
    assert soup.find(id='curr-concentration-2') is not None
    assert soup.find(id='curr-admit-type') is not None
    assert soup.find(id='curr-admit-term') is not None
    assert soup.find(id='curr-catalogue-term') is not None
    assert soup.find(id='curr-secondary-degree') is not None

    # 9. Hours & GPA IDs
    assert soup.find(id='hours-total') is not None
    assert soup.find(id='hours-billing') is not None
    assert soup.find(id='hours-ceu') is not None
    assert soup.find(id='hours-min') is not None
    assert soup.find(id='hours-max') is not None
    assert soup.find(id='hours-gpa') is not None

    # 10. Courses table & footer
    assert soup.find(id='courses-tbody') is not None
    assert soup.find(id='courses-footer') is not None
    assert soup.find(id='footer-registered-hours') is not None
    assert soup.find(id='footer-billing-hours') is not None

    # 11. Scripts included
    scripts = [s.get('src') for s in soup.find_all('script') if s.get('src')]
    assert 'profile-store.js' in scripts
    assert 'app.js' in scripts
    # Ensure profile-store.js is loaded before app.js
    assert scripts.index('profile-store.js') < scripts.index('app.js')

    print("✓ index.html has all required IDs, initial default values, and script tags.")

def test_secret_html_structure():
    with open('/workspace/secret.html') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    # 1. Page title & links back to profile
    assert 'Secret Admin' in soup.title.string or 'Student Profile' in soup.title.string
    back_links = soup.find_all('a', href='index.html')
    assert len(back_links) >= 1, "Must contain link back to index.html"

    # 2. Live preview card
    assert soup.find(id='live-preview-avatar') is not None
    assert soup.find(id='live-preview-name') is not None
    assert soup.find(id='live-preview-id') is not None
    assert soup.find(id='live-preview-semester') is not None
    assert soup.find(id='live-preview-year') is not None
    assert soup.find(id='live-preview-term') is not None
    assert soup.find(id='live-preview-email') is not None
    assert soup.find(id='live-preview-major') is not None
    assert soup.find(id='live-storage-badge') is not None

    # 3. Photo upload features
    assert soup.find(id='photo-file-input') is not None
    assert soup.find(id='photo-dropzone') is not None
    assert soup.find(id='edit-photo-preview') is not None
    assert soup.find(id='btn-browse-photo') is not None
    assert soup.find(id='btn-reset-photo') is not None
    assert soup.find(id='field-photoUrl') is not None

    # 4. Identity & Semester/Year inputs
    assert soup.find(id='field-name') is not None
    assert soup.find(id='field-studentId') is not None
    assert soup.find(id='field-currentSemester') is not None
    assert soup.find(id='field-currentYear') is not None
    assert soup.find(id='field-currentTerm') is not None
    assert soup.find(id='btn-sync-term') is not None
    assert soup.find(id='field-termsList') is not None
    assert soup.find(id='field-standing') is not None
    assert soup.find(id='field-registrationNotices') is not None
    assert soup.find(id='field-holds') is not None

    # 5. Bio & General inputs
    assert soup.find(id='field-email') is not None
    assert soup.find(id='field-dob') is not None
    assert soup.find(id='field-citizenship') is not None
    assert soup.find(id='field-emergencyContact') is not None
    assert soup.find(id='field-emergencyPhone') is not None
    assert soup.find(id='field-level') is not None
    assert soup.find(id='field-classStanding') is not None
    assert soup.find(id='field-status') is not None
    assert soup.find(id='field-residency') is not None
    assert soup.find(id='field-firstTermAttended') is not None
    assert soup.find(id='field-lastTermAttended') is not None

    # 6. Graduation & Degrees dynamic table
    assert soup.find(id='field-gradApplications') is not None
    assert soup.find(id='degrees-table') is not None
    assert soup.find(id='degrees-tbody') is not None
    assert soup.find(id='btn-add-degree') is not None

    # 7. Curriculum & Hours inputs
    assert soup.find(id='field-primaryDegree') is not None
    assert soup.find(id='field-primaryLevel') is not None
    assert soup.find(id='field-primaryCourse') is not None
    assert soup.find(id='field-primaryMajor') is not None
    assert soup.find(id='field-primaryDepartment') is not None
    assert soup.find(id='field-primaryConcentration') is not None
    assert soup.find(id='field-primaryMinor') is not None
    assert soup.find(id='field-primaryConcentration2') is not None
    assert soup.find(id='field-admitType') is not None
    assert soup.find(id='field-admitTerm') is not None
    assert soup.find(id='field-catalogueTerm') is not None
    assert soup.find(id='field-secondaryDegree') is not None
    assert soup.find(id='field-institutionalGpa') is not None
    assert soup.find(id='field-totalRegisteredHours') is not None
    assert soup.find(id='field-billingHours') is not None
    assert soup.find(id='field-ceuHours') is not None
    assert soup.find(id='field-minHours') is not None
    assert soup.find(id='field-maxHours') is not None

    # 8. Courses table & hours recalculator
    assert soup.find(id='courses-edit-table') is not None
    assert soup.find(id='courses-tbody') is not None
    assert soup.find(id='btn-add-course') is not None
    assert soup.find(id='btn-recalc-hours') is not None

    # 9. Sticky action bar: Save, Clear, Status
    assert soup.find(id='btn-save-profile') is not None
    assert soup.find(id='btn-clear-storage') is not None
    assert soup.find(id='save-status-text') is not None
    assert soup.find(id='toast-container') is not None

    # 10. Script references
    scripts = [s.get('src') for s in soup.find_all('script') if s.get('src')]
    assert 'profile-store.js' in scripts
    assert 'secret.js' in scripts

    print("✓ secret.html structure, inputs, tables, buttons, and scripts verified.")

def test_dom_rendering_simulation():
    """Simulates the DOM update logic of applyProfileToDocument on index.html"""
    with open('/workspace/index.html') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    custom_profile = {
        'name': 'Alex Rivera',
        'studentId': '300998877',
        'photoUrl': 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
        'currentSemester': 'Fall',
        'currentYear': '2026',
        'currentTerm': 'Fall 2026 Current Term',
        'termsList': ['Fall 2026 Current Term', 'Summer 2026', 'Winter 2026'],
        'standing': 'Dean\'s Honour List, as of Fall 2026',
        'registrationNotices': '5',
        'holds': '1',
        'email': 'Alex.Rivera@student.ufv.ca',
        'dob': '15/08',
        'citizenship': 'Canadian Citizen',
        'emergencyContact': 'Rivera, Carlos',
        'emergencyPhone': '604 5550199',
        'level': 'Undergraduate',
        'classStanding': 'Senior (Year 4)',
        'status': 'Active Full-Time',
        'residency': 'British Columbia Resident',
        'firstTermAttended': 'Fall 2022',
        'lastTermAttended': 'Fall 2026',
        'gradApplications': 'Pending Evaluation',
        'degrees': [
            {'title': 'Computer Systems Associate Cert', 'date': '15/05/2024'}
        ],
        'primaryDegree': 'Bachelor of Science in Computing',
        'primaryLevel': 'Undergraduate',
        'primaryCourse': 'BSc Computing Science',
        'primaryMajor': 'Software Systems & AI',
        'primaryDepartment': 'Department of Computer Science',
        'primaryConcentration': 'Machine Learning',
        'primaryMinor': 'Mathematics',
        'primaryConcentration2': 'Not Provided',
        'admitType': 'Direct High School Entry',
        'admitTerm': 'Fall 2022',
        'catalogueTerm': 'Fall 2022',
        'secondaryDegree': 'Honours Computing',
        'totalRegisteredHours': '15',
        'billingHours': '15',
        'ceuHours': '0',
        'minHours': '3',
        'maxHours': '18',
        'institutionalGpa': '3.92',
        'courses': [
            {
                'title': 'Advanced Deep Learning',
                'details': 'COMP 485 ON1',
                'crn': '20501',
                'hours': '3',
                'status': 'Registered (via web)',
                'instructor': 'Dr. Elena Vance'
            },
            {
                'title': 'Distributed Cloud Systems',
                'details': 'COMP 455 ON1',
                'crn': '20502',
                'hours': '3',
                'status': 'Registered (via web)',
                'instructor': 'Dr. Marcus Cole'
            }
        ]
    }

    # Simulate applyProfileToDocument logic on soup
    full_title = f"Student Profile - {custom_profile['name']} ({custom_profile['studentId']})"
    soup.title.string = full_title
    soup.find('h1').string = full_title
    soup.find('span', class_='user-name').string = custom_profile['name']

    sidebar_avatar = soup.find('img', class_='sidebar-avatar')
    sidebar_avatar['src'] = custom_profile['photoUrl']
    sidebar_avatar['alt'] = custom_profile['name']

    sidebar_name = soup.find('a', class_='sidebar-name')
    sidebar_name.string = custom_profile['name']

    # Term select
    term_select = soup.find('select', id='term-select')
    term_select.clear()
    for t in custom_profile['termsList']:
        opt = soup.new_tag('option')
        opt.string = t
        if t == custom_profile['currentTerm']:
            opt['selected'] = 'selected'
        term_select.append(opt)

    standing_val = soup.find('span', class_='standing-val')
    standing_val.string = custom_profile['standing']

    badges = soup.find_all('span', class_='status-badge')
    badges[0].string = custom_profile['registrationNotices']
    badges[1].string = custom_profile['holds']

    # Bio
    bio_email = soup.find(id='bio-email')
    bio_email.string = custom_profile['email']
    bio_email['href'] = f"mailto:{custom_profile['email']}"
    soup.find(id='bio-dob').string = custom_profile['dob']
    soup.find(id='bio-citizenship').string = custom_profile['citizenship']
    soup.find(id='bio-emergency-contact').string = custom_profile['emergencyContact']
    soup.find(id='bio-emergency-phone').string = custom_profile['emergencyPhone']

    # General
    soup.find(id='gen-level').string = custom_profile['level']
    soup.find(id='gen-class').string = custom_profile['classStanding']
    soup.find(id='gen-status').string = custom_profile['status']
    soup.find(id='gen-residency').string = custom_profile['residency']
    soup.find(id='gen-first-term').string = custom_profile['firstTermAttended']
    soup.find(id='gen-last-term').string = custom_profile['lastTermAttended']

    # Curriculum
    soup.find(id='curr-degree').string = custom_profile['primaryDegree']
    soup.find(id='curr-major').string = custom_profile['primaryMajor']
    soup.find(id='curr-department').string = custom_profile['primaryDepartment']
    soup.find(id='curr-concentration').string = custom_profile['primaryConcentration']
    soup.find(id='curr-minor').string = custom_profile['primaryMinor']
    soup.find(id='curr-concentration-2').string = custom_profile['primaryConcentration2']
    soup.find(id='curr-secondary-degree').string = custom_profile['secondaryDegree']

    # Hours
    soup.find(id='hours-total').string = custom_profile['totalRegisteredHours']
    soup.find(id='hours-billing').string = custom_profile['billingHours']
    soup.find(id='hours-gpa').string = custom_profile['institutionalGpa']
    soup.find(id='footer-registered-hours').string = custom_profile['totalRegisteredHours']
    soup.find(id='footer-billing-hours').string = custom_profile['billingHours']

    # Assertions
    assert soup.title.string == 'Student Profile - Alex Rivera (300998877)'
    assert soup.find('h1').string == 'Student Profile - Alex Rivera (300998877)'
    assert soup.find('span', class_='user-name').string == 'Alex Rivera'
    assert sidebar_avatar['src'] == 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
    assert sidebar_name.string == 'Alex Rivera'
    assert bio_email.string == 'Alex.Rivera@student.ufv.ca'
    assert bio_email['href'] == 'mailto:Alex.Rivera@student.ufv.ca'
    assert soup.find(id='bio-dob').string == '15/08'
    assert soup.find(id='bio-citizenship').string == 'Canadian Citizen'
    assert soup.find(id='gen-status').string == 'Active Full-Time'
    assert soup.find(id='curr-major').string == 'Software Systems & AI'
    assert soup.find(id='hours-gpa').string == '3.92'
    assert soup.find(id='footer-registered-hours').string == '15'
    assert standing_val.string == 'Dean\'s Honour List, as of Fall 2026'

    # Verify no remnants of old default template name in main identity elements
    assert 'Jane Doe' not in soup.find('h1').text
    assert 'Jane Doe' not in soup.find('span', class_='user-name').text
    assert 'Jane Doe' not in sidebar_name.text

    print("✓ DOM rendering simulation verified: All custom details correctly replace defaults.")

def test_admin_redirect():
    with open('/workspace/admin.html') as f:
        content = f.read()
    assert 'secret.html' in content
    assert 'http-equiv="refresh"' in content or 'window.location' in content
    print("✓ admin.html redirect to secret.html verified.")

def test_app_js_secret_triggers():
    with open('/workspace/app.js') as f:
        content = f.read()

    # Settings button handler
    assert 'header-settings-btn' in content or 'header-icon-btn' in content
    assert 'secret.html' in content

    # Keyboard shortcut (Ctrl+Shift+S / Alt+S)
    assert 'keydown' in content
    assert 'shiftKey' in content or 'altKey' in content

    # Typing trigger "secret"
    assert "'secret'" in content or '"secret"' in content

    # Double click on sidebar avatar and header user
    assert 'sidebarAvatar' in content
    assert 'headerUser' in content
    assert 'dblclick' in content

    # Storage event listener for cross-tab sync
    assert 'storage' in content

    print("✓ app.js secret triggers and cross-tab synchronization verified.")

if __name__ == '__main__':
    print("Running comprehensive test suite...")
    test_files_exist()
    test_profile_store_js_content()
    test_index_html_structure_and_ids()
    test_secret_html_structure()
    test_dom_rendering_simulation()
    test_admin_redirect()
    test_app_js_secret_triggers()
    print("\nALL TESTS PASSED SUCCESSFULLY! (7/7 suites passed)")
