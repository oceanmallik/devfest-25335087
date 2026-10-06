/**
 * Tender Document Package Builder
 * Pure Vanilla JavaScript (No Frameworks, No Bundlers)
 */

(function () {
  'use strict';

  // Sample requirements data (exact schema from problem-pack)
  const SAMPLE_DATA = {
    "tender": {
      "tender_id": "T-2026-0417",
      "title": "Supply of IT Equipment",
      "procuring_entity": "Directorate of Sample Services",
      "bidder": "Meghna Tech Solutions Ltd.",
      "submission_deadline": "2026-10-20"
    },
    "requirements": [
      {
        "id": "R01",
        "order": 1,
        "title_en": "Trade License",
        "title_bn": "ট্রেড লাইসেন্স",
        "mandatory": true,
        "has_expiry": true
      },
      {
        "id": "R02",
        "order": 2,
        "title_en": "TIN Certificate",
        "title_bn": "টিআইএন সনদ",
        "mandatory": true,
        "has_expiry": false
      },
      {
        "id": "R03",
        "order": 3,
        "title_en": "VAT Registration Certificate",
        "title_bn": "ভ্যাট নিবন্ধন সনদ",
        "mandatory": true,
        "has_expiry": false
      },
      {
        "id": "R04",
        "order": 4,
        "title_en": "Bank Solvency Certificate",
        "title_bn": "ব্যাংক সচ্ছলতা সনদ",
        "mandatory": true,
        "has_expiry": true
      },
      {
        "id": "R05",
        "order": 5,
        "title_en": "Experience Certificate",
        "title_bn": "অভিজ্ঞতার সনদ",
        "mandatory": true,
        "has_expiry": false
      },
      {
        "id": "R06",
        "order": 6,
        "title_en": "Audited Financial Statement",
        "title_bn": "নিরীক্ষিত আর্থিক বিবরণী",
        "mandatory": false,
        "has_expiry": false
      },
      {
        "id": "R07",
        "order": 7,
        "title_en": "Manufacturer's Authorization",
        "title_bn": "প্রস্তুতকারকের অনুমোদনপত্র",
        "mandatory": false,
        "has_expiry": true
      },
      {
        "id": "R08",
        "order": 8,
        "title_en": "Technical Proposal",
        "title_bn": "কারিগরি প্রস্তাব",
        "mandatory": true,
        "has_expiry": false
      },
      {
        "id": "R09",
        "order": 9,
        "title_en": "Financial Proposal",
        "title_bn": "আর্থিক প্রস্তাব",
        "mandatory": true,
        "has_expiry": false
      },
      {
        "id": "R10",
        "order": 10,
        "title_en": "Signed Declaration",
        "title_bn": "স্বাক্ষরিত ঘোষণাপত্র",
        "mandatory": true,
        "has_expiry": false
      }
    ]
  };

  // Translations dictionary for bilingual support
  const I18N = {
    en: {
      appTitle: "Tender Document Package Builder",
      appSubtitle: "Frontend Document Processor & Requirement Validator",
      uploadTitle: "Upload Requirements Configuration",
      uploadDesc: "Upload the tender requirements.json file to inspect details and document checklist.",
      dropText: 'Drag and drop your <strong>requirements.json</strong> here',
      orText: "or",
      browseBtnText: "Select File",
      loadSampleBtnText: "Load Sample Data",
      emptyStateTitle: "No Tender Data Loaded",
      emptyStateDesc: 'Please upload a valid <code>requirements.json</code> or click "Load Sample Data" above to view the tender summary header and ordered requirements.',
      summaryBadge: "Tender Package",
      tenderIdLabel: "Tender ID",
      entityLabel: "Procuring Entity",
      bidderLabel: "Bidder Name",
      deadlineLabel: "Submission Deadline",
      requirementsCountLabel: "Required Documents",
      requirementsTitle: "Required Documents",
      requirementsDesc: "Documents sorted strictly by their specified order property.",
      statMandatory: "Mandatory",
      statOptional: "Optional",
      badgeMandatory: "Mandatory",
      badgeOptional: "Optional",
      badgeExpiryRequired: "Expiry Required",
      badgeNoExpiry: "No Expiry",
      orderLabel: "Order",
      footerText: "Tender Document Package Builder • Vanilla Frontend Web App",
      errorInvalidJson: "Failed to parse JSON file. Please ensure it is valid JSON.",
      errorEmptyFile: "The selected file is empty.",
      errorNoData: "The JSON does not contain valid tender requirements data.",
      copied: "Copied!",
      daysLeft: "days left",
      deadlinePassed: "Deadline passed"
    },
    bn: {
      appTitle: "দরপত্র নথি প্যাকেজ প্রস্তুতকারক",
      appSubtitle: "ফ্রন্টএন্ড নথি প্রক্রিয়াকরণ ও শর্তাবলি যাচাইকারী",
      uploadTitle: "রিকোয়ারমেন্টস কনফিগারেশন আপলোড",
      uploadDesc: "দরপত্রের বিস্তারিত ও প্রয়োজনীয় নথিপত্রের তালিকা দেখতে requirements.json ফাইলটি আপলোড করুন।",
      dropText: 'আপনার <strong>requirements.json</strong> ফাইলটি এখানে ড্র্যাগ করুন',
      orText: "অথবা",
      browseBtnText: "ফাইল নির্বাচন করুন",
      loadSampleBtnText: "নমুনা ডেটা লোড করুন",
      emptyStateTitle: "কোনো দরপত্রের তথ্য লোড করা নেই",
      emptyStateDesc: 'দরপত্রের সারসংক্ষেপ এবং সুবিন্যস্ত নথির তালিকা দেখতে একটি <code>requirements.json</code> ফাইল আপলোড করুন অথবা উপরে "নমুনা ডেটা লোড করুন" বাটনে ক্লিক করুন।',
      summaryBadge: "দরপত্র প্যাকেজ",
      tenderIdLabel: "দরপত্র আইডি",
      entityLabel: "সংগ্রহকারী প্রতিষ্ঠান",
      bidderLabel: "দরপত্রদাতার নাম",
      deadlineLabel: "জমা দেওয়ার শেষ সময়",
      requirementsCountLabel: "প্রয়োজনীয় মোট নথি",
      requirementsTitle: "প্রয়োজনীয় নথিপত্রের তালিকা",
      requirementsDesc: "নির্দিষ্ট ক্রম অনুযায়ী কঠোরভাবে সাজানো নথির তালিকা।",
      statMandatory: "আবশ্যিক",
      statOptional: "ঐচ্ছিক",
      badgeMandatory: "আবশ্যিক",
      badgeOptional: "ঐচ্ছিক",
      badgeExpiryRequired: "মেয়াদ আবশ্যক",
      badgeNoExpiry: "মেয়াদমুক্ত",
      orderLabel: "ক্রম",
      footerText: "দরপত্র নথি প্যাকেজ প্রস্তুতকারক • ভ্যানিলা ফ্রন্টএন্ড ওয়েব অ্যাপ",
      errorInvalidJson: "JSON ফাইলটি পার্স করা সম্ভব হয়নি। ফাইলটির গঠন পরীক্ষা করুন।",
      errorEmptyFile: "নির্বাচিত ফাইলটি সম্পূর্ণ ফাঁকা।",
      errorNoData: "JSON ফাইলে দরপত্রের প্রয়োজনীয় ডেটা খুঁজে পাওয়া যায়নি।",
      copied: "কপি হয়েছে!",
      daysLeft: "দিন বাকি",
      deadlinePassed: "মেয়াদ উত্তীর্ণ"
    }
  };

  // Application State
  const state = {
    currentLang: 'en', // 'en' or 'bn'
    tenderData: null,
    sortedRequirements: []
  };

  // DOM Elements
  const el = {
    langEnBtn: document.getElementById('langEnBtn'),
    langBnBtn: document.getElementById('langBnBtn'),
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('requirementsFileInput'),
    browseBtn: document.getElementById('browseBtn'),
    loadSampleBtn: document.getElementById('loadSampleBtn'),
    fileLoadedBadge: document.getElementById('fileLoadedBadge'),
    loadedFileName: document.getElementById('loadedFileName'),
    clearFileBtn: document.getElementById('clearFileBtn'),
    alertBox: document.getElementById('alertBox'),
    alertText: document.getElementById('alertText'),
    alertCloseBtn: document.getElementById('alertCloseBtn'),
    emptyState: document.getElementById('emptyState'),
    tenderContent: document.getElementById('tenderContent'),
    summaryTitle: document.getElementById('summaryTitle'),
    tenderIdVal: document.getElementById('tenderIdVal'),
    copyIdBtn: document.getElementById('copyIdBtn'),
    entityVal: document.getElementById('entityVal'),
    bidderVal: document.getElementById('bidderVal'),
    deadlineVal: document.getElementById('deadlineVal'),
    totalReqCountVal: document.getElementById('totalReqCountVal'),
    reqListCount: document.getElementById('reqListCount'),
    mandatoryCount: document.getElementById('mandatoryCount'),
    optionalCount: document.getElementById('optionalCount'),
    requirementsList: document.getElementById('requirementsList')
  };

  /**
   * Convert Arabic digits to Bengali digits
   */
  function toBanglaDigits(num) {
    if (num === null || num === undefined) return '';
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, function (w) {
      return bengaliDigits[+w];
    });
  }

  /**
   * Format numbers according to current language
   */
  function formatNumber(num) {
    if (state.currentLang === 'bn') {
      return toBanglaDigits(num);
    }
    return String(num);
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Show alert message
   */
  function showAlert(message, type = 'error') {
    el.alertBox.className = `alert-box alert-${type}`;
    el.alertText.textContent = message;
    el.alertBox.style.display = 'flex';
  }

  /**
   * Hide alert message
   */
  function hideAlert() {
    el.alertBox.style.display = 'none';
  }

  /**
   * Switch active language
   */
  function setLanguage(lang) {
    if (lang !== 'en' && lang !== 'bn') return;
    state.currentLang = lang;

    // Update document lang attribute
    document.documentElement.lang = lang;

    // Update button states
    if (lang === 'en') {
      el.langEnBtn.classList.add('active');
      el.langEnBtn.setAttribute('aria-checked', 'true');
      el.langBnBtn.classList.remove('active');
      el.langBnBtn.setAttribute('aria-checked', 'false');
    } else {
      el.langBnBtn.classList.add('active');
      el.langBnBtn.setAttribute('aria-checked', 'true');
      el.langEnBtn.classList.remove('active');
      el.langEnBtn.setAttribute('aria-checked', 'false');
    }

    // Update static i18n text nodes
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (I18N[lang][key]) {
        // If translation contains html tags like <strong> or <code>
        if (I18N[lang][key].includes('<')) {
          element.innerHTML = I18N[lang][key];
        } else {
          element.textContent = I18N[lang][key];
        }
      }
    });

    // Re-render tender data if loaded
    if (state.tenderData) {
      renderSummaryHeader();
      renderRequirementsList();
    }
  }

  /**
   * Parse and validate the raw JSON data
   */
  function processRequirementsData(rawData, filename = 'requirements.json') {
    hideAlert();

    if (!rawData || typeof rawData !== 'object') {
      showAlert(I18N[state.currentLang].errorInvalidJson);
      return false;
    }

    const tenderObj = rawData.tender || rawData;
    const reqArray = Array.isArray(rawData.requirements)
      ? rawData.requirements
      : (Array.isArray(rawData.documents) ? rawData.documents : []);

    if (!reqArray.length && !tenderObj.title && !tenderObj.tender_id) {
      showAlert(I18N[state.currentLang].errorNoData);
      return false;
    }

    // Strict sort by 'order' property ascending
    const sorted = [...reqArray].sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : (parseInt(a.order, 10) || 0);
      const orderB = typeof b.order === 'number' ? b.order : (parseInt(b.order, 10) || 0);
      return orderA - orderB;
    });

    state.tenderData = rawData;
    state.sortedRequirements = sorted;

    // Update file loaded UI indicator
    el.loadedFileName.textContent = filename;
    el.fileLoadedBadge.style.display = 'inline-flex';

    // Show content, hide empty state
    el.emptyState.style.display = 'none';
    el.tenderContent.style.display = 'block';

    // Render components
    renderSummaryHeader();
    renderRequirementsList();

    return true;
  }

  /**
   * Format deadline string with optional countdown
   */
  function formatDeadline(deadlineStr) {
    if (!deadlineStr || deadlineStr === 'N/A') return 'N/A';
    
    try {
      const date = new Date(deadlineStr);
      if (isNaN(date.getTime())) return escapeHtml(deadlineStr);

      const today = new Date();
      // Reset hours for pure day comparison
      const deadlineDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const nowDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const diffTime = deadlineDate - nowDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const isoDate = deadlineStr; // e.g. "2026-10-20"
      const localizedDate = state.currentLang === 'bn' ? toBanglaDigits(isoDate) : isoDate;

      if (diffDays >= 0) {
        const daysText = state.currentLang === 'bn'
          ? `(${toBanglaDigits(diffDays)} ${I18N.bn.daysLeft})`
          : `(${diffDays} ${I18N.en.daysLeft})`;
        return `${localizedDate} <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted);">${daysText}</span>`;
      } else {
        const passedText = `(${I18N[state.currentLang].deadlinePassed})`;
        return `${localizedDate} <span style="font-size: 0.8rem; color: var(--status-mandatory-text); font-weight: normal;">${passedText}</span>`;
      }
    } catch (e) {
      return escapeHtml(deadlineStr);
    }
  }

  /**
   * Render the Tender Summary Header
   * Fields: Title, Entity, Bidder, Deadline, ID
   */
  function renderSummaryHeader() {
    if (!state.tenderData) return;

    const tender = state.tenderData.tender || state.tenderData;

    // 1. Title
    const title = tender.title || tender.tender_title || tender.tenderTitle || 'Tender Package';
    el.summaryTitle.textContent = title;

    // 2. ID
    const tenderId = tender.tender_id || tender.id || tender.tenderId || 'N/A';
    el.tenderIdVal.textContent = tenderId;

    // 3. Procuring Entity
    const entity = tender.procuring_entity || tender.entity || tender.procuringEntity || tender.organization || 'N/A';
    el.entityVal.textContent = entity;

    // 4. Bidder
    const bidder = tender.bidder || tender.bidder_name || tender.bidderName || tender.vendor || 'N/A';
    el.bidderVal.textContent = bidder;

    // 5. Deadline
    const deadline = tender.submission_deadline || tender.deadline || tender.submissionDeadline || tender.due_date || 'N/A';
    el.deadlineVal.innerHTML = formatDeadline(deadline);

    // Total count
    const totalCount = state.sortedRequirements.length;
    el.totalReqCountVal.textContent = formatNumber(totalCount);
  }

  /**
   * Render the Requirements List
   * Document names strictly switch between title_en and title_bn based on global toggle
   * Sorted strictly by order property
   */
  function renderRequirementsList() {
    const list = state.sortedRequirements;
    el.requirementsList.innerHTML = '';

    const lang = state.currentLang;
    const texts = I18N[lang];

    // Calculate counts
    const mandatoryCount = list.filter(r => r.mandatory === true).length;
    const optionalCount = list.length - mandatoryCount;

    el.reqListCount.textContent = formatNumber(list.length);
    el.mandatoryCount.textContent = formatNumber(mandatoryCount);
    el.optionalCount.textContent = formatNumber(optionalCount);

    if (list.length === 0) {
      el.requirementsList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          ${escapeHtml(texts.errorNoData)}
        </div>
      `;
      return;
    }

    // Render items strictly in order
    list.forEach(req => {
      const order = req.order !== undefined ? req.order : '-';
      const docId = req.id || '';
      
      // Dynamic Title Switching based on active language toggle
      let primaryTitle = '';
      let secondaryTitle = '';

      if (lang === 'bn') {
        // Bengali selected
        primaryTitle = req.title_bn || req.title_en || req.title || 'শিরোনামহীন নথি';
        secondaryTitle = req.title_en || '';
      } else {
        // English selected
        primaryTitle = req.title_en || req.title_bn || req.title || 'Untitled Document';
        secondaryTitle = req.title_bn || '';
      }

      // Mandatory / Optional badge
      const isMandatory = req.mandatory === true;
      const mandatoryBadgeClass = isMandatory ? 'badge-mandatory' : 'badge-optional';
      const mandatoryBadgeText = isMandatory ? texts.badgeMandatory : texts.badgeOptional;

      // Expiry badge
      const hasExpiry = req.has_expiry === true;
      const expiryBadgeClass = hasExpiry ? 'badge-expiry' : 'badge-no-expiry';
      const expiryBadgeText = hasExpiry ? texts.badgeExpiryRequired : texts.badgeNoExpiry;
      const expiryIcon = hasExpiry
        ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
        : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

      const itemCard = document.createElement('div');
      itemCard.className = 'req-item';
      itemCard.setAttribute('role', 'listitem');
      itemCard.dataset.id = docId;
      itemCard.dataset.order = String(order);

      itemCard.innerHTML = `
        <div class="req-left">
          <div class="req-order-badge" title="${texts.orderLabel} ${escapeHtml(order)}">
            #${formatNumber(order)}
          </div>
          <div class="req-info">
            <div class="req-title-wrapper">
              <span class="req-doc-title">${escapeHtml(primaryTitle)}</span>
              ${docId ? `<span class="req-id-tag">${escapeHtml(docId)}</span>` : ''}
            </div>
            ${secondaryTitle ? `<span class="req-sub-title">${escapeHtml(secondaryTitle)}</span>` : ''}
          </div>
        </div>

        <div class="req-badges">
          <span class="badge ${mandatoryBadgeClass}">
            <span class="stat-dot"></span>
            ${escapeHtml(mandatoryBadgeText)}
          </span>
          <span class="badge ${expiryBadgeClass}">
            ${expiryIcon}
            ${escapeHtml(expiryBadgeText)}
          </span>
        </div>
      `;

      el.requirementsList.appendChild(itemCard);
    });
  }

  /**
   * Read and parse a File object from input or drop
   */
  function handleFile(file) {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json') && file.type && !file.type.includes('json')) {
      showAlert('Please upload a valid .json file.', 'error');
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const text = event.target.result;
        if (!text || !text.trim()) {
          showAlert(I18N[state.currentLang].errorEmptyFile);
          return;
        }

        const parsed = JSON.parse(text);
        processRequirementsData(parsed, file.name);
      } catch (err) {
        console.error('JSON parsing error:', err);
        showAlert(`${I18N[state.currentLang].errorInvalidJson} (${err.message})`);
      }
    };

    reader.onerror = function () {
      showAlert('Error reading file from disk.');
    };

    reader.readAsText(file);
  }

  /**
   * Reset the current file and UI
   */
  function resetData() {
    state.tenderData = null;
    state.sortedRequirements = [];
    el.fileInput.value = '';
    el.fileLoadedBadge.style.display = 'none';
    el.tenderContent.style.display = 'none';
    el.emptyState.style.display = 'flex';
    hideAlert();
  }

  /**
   * Setup Event Listeners
   */
  function initEvents() {
    // Language Toggle Click Handlers
    el.langEnBtn.addEventListener('click', () => setLanguage('en'));
    el.langBnBtn.addEventListener('click', () => setLanguage('bn'));

    // Browse Button
    el.browseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      el.fileInput.click();
    });

    // File Input change
    el.fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        handleFile(file);
      }
    });

    // Load Sample Button
    el.loadSampleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      processRequirementsData(SAMPLE_DATA, 'sample-requirements.json');
    });

    // Clear File Button
    el.clearFileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resetData();
    });

    // Alert Close Button
    el.alertCloseBtn.addEventListener('click', hideAlert);

    // Copy Tender ID
    el.copyIdBtn.addEventListener('click', () => {
      const idText = el.tenderIdVal.textContent.trim();
      if (idText && idText !== '--') {
        navigator.clipboard.writeText(idText).then(() => {
          const originalTitle = el.copyIdBtn.title;
          el.copyIdBtn.title = I18N[state.currentLang].copied;
          el.copyIdBtn.style.color = '#16a34a';
          setTimeout(() => {
            el.copyIdBtn.title = originalTitle;
            el.copyIdBtn.style.color = '';
          }, 1500);
        }).catch(err => {
          console.error('Clipboard copy failed:', err);
        });
      }
    });

    // Drag and Drop support
    const dropZone = el.dropZone;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    });

    // Keyboard navigation: pressing Space or Enter on language buttons
    [el.langEnBtn, el.langBnBtn].forEach(btn => {
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }

  // Initialize Application
  function init() {
    initEvents();
    setLanguage('en');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

