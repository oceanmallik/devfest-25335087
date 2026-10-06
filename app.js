/**
 * Tender Document Package Builder
 * Pure Vanilla JavaScript (No Frameworks, No Bundlers)
 * Features:
 * - Requirements JSON loading & strict sorting
 * - PDF uploads with pdf.js page counting
 * - Duplicate content detection (SHA-256)
 * - 1-to-1 Document matching UI
 * - Conditional expiry date input (has_expiry = true & file matched)
 * - Strict live document status rules ('Missing', 'Expiry date needed', 'Expired', 'Not provided', 'OK')
 * - Package generation validation & blocking issue reporting
 * - Full bilingual support (English & Bangla)
 */

(function () {
  'use strict';

  // Configure pdf.js worker if library is loaded from CDN
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

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
      deadlinePassed: "Deadline passed",
      // PDF & Matching strings
      pdfUploadTitle: "Upload Tender Documents (PDF)",
      pdfUploadDesc: "Upload PDF files to match against required documents. Non-PDF files are strictly rejected.",
      pdfDropText: "Drag and drop <strong>PDF files</strong> here (multiple files supported)",
      browsePdfBtnText: "Select PDF Files",
      uploadedPdfsHeading: "Uploaded PDF Files",
      badgeDuplicate: "Duplicate",
      duplicateDetectedText: "Duplicate files detected",
      duplicateOf: "Duplicate of",
      pageSingular: "page",
      pagePlural: "pages",
      selectPdfPlaceholder: "Select a PDF file to match...",
      unmatchBtnText: "Unmatch",
      unmatchTooltip: "Remove match",
      matchedBadge: "Matched",
      assignedToPrefix: "Assigned to",
      unassignedText: "Unassigned",
      duplicateBlockedMsg: "Blocked: Duplicate of file assigned to another document",
      duplicateMatchPreventedAlert: "Cannot match: A duplicate of this file is already matched to another document.",
      rejectNonPdfMsg: "Rejected non-PDF file(s): ",
      // Status Rules strings
      statusMissing: "Missing",
      statusExpiryNeeded: "Expiry date needed",
      statusExpired: "Expired",
      statusNotProvided: "Not provided",
      statusOk: "OK",
      expiryDateLabel: "Expiry Date",
      expiryDateInputPlaceholder: "YYYY-MM-DD",
      // Generate Package strings
      generateTitle: "Generate Package",
      generateDesc: "Package generation is blocked while any document has an issue.",
      generateBtnText: "Generate Package",
      generationBlockedHeader: "Package generation is blocked by the following issue(s):",
      generationReadyMsg: "All documents are compliant and verified! Package is ready to generate.",
      reasonMissing: "Required document has no file matched",
      reasonExpiryNeeded: "Expiry date must be entered",
      reasonExpired: "Expiry date ({exp}) is before submission deadline ({dl})",
      reasonNotProvided: "Optional document not provided",
      reasonOk: "Verified and compliant"
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
      deadlinePassed: "মেয়াদ উত্তীর্ণ",
      // PDF & Matching strings
      pdfUploadTitle: "দরপত্র নথিপত্র আপলোড (PDF)",
      pdfUploadDesc: "প্রয়োজনীয় নথির সাথে ম্যাচ করার জন্য PDF ফাইল আপলোড করুন। নন-PDF ফাইল সম্পূর্ণরূপে বাতিল হবে।",
      pdfDropText: "এখানে একাধিক <strong>PDF ফাইল</strong> ড্র্যাগ ও ড্রপ করুন",
      browsePdfBtnText: "পিডিএফ ফাইল নির্বাচন করুন",
      uploadedPdfsHeading: "আপলোডকৃত পিডিএফ ফাইলসমূহ",
      badgeDuplicate: "ডুপ্লিকেট ফাইল",
      duplicateDetectedText: "ডুপ্লিকেট ফাইল শনাক্ত হয়েছে",
      duplicateOf: "ডুপ্লিকেট ফাইল:",
      pageSingular: "পৃষ্ঠা",
      pagePlural: "পৃষ্ঠা",
      selectPdfPlaceholder: "ম্যাচ করতে একটি পিডিএফ নির্বাচন করুন...",
      unmatchBtnText: "ম্যাচ বাতিল",
      unmatchTooltip: "ফাইল ম্যাচটি বাতিল করুন",
      matchedBadge: "সংযুক্ত",
      assignedToPrefix: "সংযুক্ত:",
      unassignedText: "অসংযুক্ত",
      duplicateBlockedMsg: "নিষিদ্ধ: অন্য নথিতে সংযুক্ত ফাইলের হুবহু ডুপ্লিকেট",
      duplicateMatchPreventedAlert: "ম্যাচ করা সম্ভব নয়: এই ফাইলের একটি ডুপ্লিকেট ইতিমধ্যে অন্য নথিতে সংযুক্ত আছে।",
      rejectNonPdfMsg: "নন-PDF ফাইল বাতিল করা হয়েছে: ",
      // Status Rules strings
      statusMissing: "অনুপস্থিত (Missing)",
      statusExpiryNeeded: "মেয়াদ আবশ্যক (Expiry needed)",
      statusExpired: "মেয়াদোত্তীর্ণ (Expired)",
      statusNotProvided: "দেওয়া হয়নি (Not provided)",
      statusOk: "সঠিক (OK)",
      expiryDateLabel: "মেয়াদ উত্তীর্ণের তারিখ",
      expiryDateInputPlaceholder: "YYYY-MM-DD",
      // Generate Package strings
      generateTitle: "প্যাকেজ তৈরি করুন",
      generateDesc: "কোনো নথিতে সমস্যা থাকলে প্যাকেজ তৈরি ব্লক থাকবে।",
      generateBtnText: "প্যাকেজ তৈরি করুন",
      generationBlockedHeader: "নিম্নলিখিত সমস্যার কারণে প্যাকেজ তৈরি বন্ধ রয়েছে:",
      generationReadyMsg: "সমস্ত নথি যথাযথভাবে যাচাই করা হয়েছে! প্যাকেজ তৈরি করতে প্রস্তুত।",
      reasonMissing: "আবশ্যিক নথিতে কোনো ফাইল সংযুক্ত করা হয়নি",
      reasonExpiryNeeded: "মেয়াদ উত্তীর্ণের তারিখ প্রবেশ করানো প্রয়োজন",
      reasonExpired: "মেয়াদ উত্তীর্ণের তারিখ ({exp}) জমা দেওয়ার শেষ সময়ের ({dl}) পূর্বে",
      reasonNotProvided: "ঐচ্ছিক নথি প্রদান করা হয়নি",
      reasonOk: "যাচাইকৃত ও প্রস্তুত"
    }
  };

  // Application State
  const state = {
    currentLang: 'en', // 'en' or 'bn'
    tenderData: null,
    sortedRequirements: [],
    uploadedFiles: [], // Array of { id, file, name, size, hash, pageCount, isDuplicate, duplicateWith: [], matchedReqId }
    documentMatches: {}, // Map: reqId -> fileId
    expiryDates: {} // Map: reqId -> 'YYYY-MM-DD'
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
    requirementsList: document.getElementById('requirementsList'),
    // PDF elements
    pdfDropZone: document.getElementById('pdfDropZone'),
    pdfFileInput: document.getElementById('pdfFileInput'),
    browsePdfBtn: document.getElementById('browsePdfBtn'),
    pdfAlertBox: document.getElementById('pdfAlertBox'),
    pdfAlertText: document.getElementById('pdfAlertText'),
    pdfAlertCloseBtn: document.getElementById('pdfAlertCloseBtn'),
    uploadedFilesContainer: document.getElementById('uploadedFilesContainer'),
    uploadedFilesList: document.getElementById('uploadedFilesList'),
    pdfUploadedCount: document.getElementById('pdfUploadedCount'),
    duplicateSummaryBadge: document.getElementById('duplicateSummaryBadge'),
    duplicateSummaryText: document.getElementById('duplicateSummaryText'),
    // Generate Package elements
    generateSection: document.getElementById('generateSection'),
    generatePackageBtn: document.getElementById('generatePackageBtn'),
    generateStatusSummary: document.getElementById('generateStatusSummary'),
    generateWarningBox: document.getElementById('generateWarningBox')
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
   * Format page count string
   */
  function formatPages(count) {
    const texts = I18N[state.currentLang];
    const formattedNum = formatNumber(count);
    const label = count === 1 ? texts.pageSingular : texts.pagePlural;
    return `${formattedNum} ${label}`;
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
   * Show alert message for JSON upload
   */
  function showAlert(message, type = 'error') {
    el.alertBox.className = `alert-box alert-${type}`;
    el.alertText.textContent = message;
    el.alertBox.style.display = 'flex';
  }

  function hideAlert() {
    el.alertBox.style.display = 'none';
  }

  /**
   * Show PDF alert message
   */
  function showPdfAlert(message, type = 'error') {
    el.pdfAlertBox.className = `alert-box alert-${type}`;
    el.pdfAlertText.textContent = message;
    el.pdfAlertBox.style.display = 'flex';
  }

  function hidePdfAlert() {
    el.pdfAlertBox.style.display = 'none';
  }

  /**
   * Switch active language
   */
  function setLanguage(lang) {
    if (lang !== 'en' && lang !== 'bn') return;
    state.currentLang = lang;

    document.documentElement.lang = lang;

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
        if (I18N[lang][key].includes('<')) {
          element.innerHTML = I18N[lang][key];
        } else {
          element.textContent = I18N[lang][key];
        }
      }
    });

    if (state.tenderData) {
      renderSummaryHeader();
      renderRequirementsList();
      validateAndRenderPackageStatus();
    }

    renderUploadedFilesList();
  }

  /**
   * Calculate SHA-256 hash using native Web Crypto API
   */
  async function computeFileHash(arrayBuffer) {
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('Crypto subtle digest error:', e);
      let hash = 0;
      const bytes = new Uint8Array(arrayBuffer);
      for (let i = 0; i < bytes.length; i += 4) {
        hash = ((hash << 5) - hash) + bytes[i];
        hash |= 0;
      }
      return 'fallback_' + Math.abs(hash).toString(16);
    }
  }

  /**
   * Binary fallback page counter for PDFs
   */
  function fallbackCountPdfPages(arrayBuffer) {
    try {
      const bytes = new Uint8Array(arrayBuffer);
      const text = new TextDecoder('latin1').decode(bytes);
      const matches = text.match(/\/Type\s*\/Page(?![sA-Za-z])/g);
      if (matches && matches.length > 0) {
        return matches.length;
      }
      const countMatch = text.match(/\/Type\s*\/Pages[^>]*\/Count\s+(\d+)/);
      if (countMatch && countMatch[1]) {
        return parseInt(countMatch[1], 10);
      }
    } catch (e) {
      console.error('Binary page counting fallback error:', e);
    }
    return 1;
  }

  /**
   * Calculate PDF page count using pdf.js from CDN
   */
  async function getPdfPageCount(arrayBuffer) {
    if (window.pdfjsLib) {
      try {
        const loadingTask = window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) });
        const pdf = await loadingTask.promise;
        if (pdf && typeof pdf.numPages === 'number') {
          return pdf.numPages;
        }
      } catch (err) {
        console.warn('pdf.js count failed, using binary inspection:', err);
      }
    }
    return fallbackCountPdfPages(arrayBuffer);
  }

  /**
   * Update duplicate flags across all uploaded files
   */
  function refreshDuplicateFlags() {
    const hashCounts = {};
    state.uploadedFiles.forEach(f => {
      hashCounts[f.hash] = (hashCounts[f.hash] || 0) + 1;
    });

    let duplicateTotal = 0;
    state.uploadedFiles.forEach(f => {
      const isDup = hashCounts[f.hash] > 1;
      f.isDuplicate = isDup;
      if (isDup) {
        duplicateTotal++;
        f.duplicateWith = state.uploadedFiles
          .filter(other => other.id !== f.id && other.hash === f.hash)
          .map(o => o.name);
      } else {
        f.duplicateWith = [];
      }
    });

    if (duplicateTotal > 0) {
      el.duplicateSummaryBadge.style.display = 'inline-flex';
      el.duplicateSummaryText.textContent = I18N[state.currentLang].duplicateDetectedText;
    } else {
      el.duplicateSummaryBadge.style.display = 'none';
    }
  }

  /**
   * Process multiple uploaded PDF files
   */
  async function handlePdfFiles(fileList) {
    hidePdfAlert();
    if (!fileList || fileList.length === 0) return;

    const rejectedFiles = [];
    const validFiles = [];

    // 1. Strictly validate PDF type
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const name = file.name || '';
      const isPdfName = name.toLowerCase().endsWith('.pdf');
      const isPdfMime = file.type === 'application/pdf';

      if (!isPdfName && (!file.type || !isPdfMime)) {
        rejectedFiles.push(name || `File ${i + 1}`);
      } else {
        validFiles.push(file);
      }
    }

    if (rejectedFiles.length > 0) {
      const alertMsg = `${I18N[state.currentLang].rejectNonPdfMsg}${rejectedFiles.join(', ')} (Only PDF files are supported).`;
      showPdfAlert(alertMsg, 'error');
    }

    if (validFiles.length === 0) return;

    // 2. Process valid PDF files: read arrayBuffer, compute hash & pages
    for (const file of validFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const hash = await computeFileHash(arrayBuffer);
        const pageCount = await getPdfPageCount(arrayBuffer);

        const fileRecord = {
          id: 'pdf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
          file: file,
          name: file.name,
          size: file.size,
          hash: hash,
          pageCount: pageCount,
          isDuplicate: false,
          duplicateWith: [],
          matchedReqId: null
        };

        state.uploadedFiles.push(fileRecord);
      } catch (err) {
        console.error('Error processing PDF file:', file.name, err);
        showPdfAlert(`Failed to process "${file.name}": ${err.message}`, 'error');
      }
    }

    // 3. Update duplicate statuses & re-render UI
    refreshDuplicateFlags();
    renderUploadedFilesList();
    renderRequirementsList();
    validateAndRenderPackageStatus();
  }

  /**
   * Remove an uploaded PDF file
   */
  function removePdfFile(fileId) {
    const fileIndex = state.uploadedFiles.findIndex(f => f.id === fileId);
    if (fileIndex === -1) return;

    // If file was matched to a requirement, unmatch it
    for (const [reqId, matchedId] of Object.entries(state.documentMatches)) {
      if (matchedId === fileId) {
        delete state.documentMatches[reqId];
      }
    }

    state.uploadedFiles.splice(fileIndex, 1);
    refreshDuplicateFlags();
    renderUploadedFilesList();
    renderRequirementsList();
    validateAndRenderPackageStatus();
  }

  /**
   * Render the list of uploaded PDF files
   */
  function renderUploadedFilesList() {
    const count = state.uploadedFiles.length;
    el.pdfUploadedCount.textContent = `${formatNumber(count)} ${count === 1 ? 'file' : 'files'}`;

    if (count === 0) {
      el.uploadedFilesContainer.style.display = 'none';
      el.uploadedFilesList.innerHTML = '';
      return;
    }

    el.uploadedFilesContainer.style.display = 'block';
    el.uploadedFilesList.innerHTML = '';

    const texts = I18N[state.currentLang];

    state.uploadedFiles.forEach(f => {
      const row = document.createElement('div');
      row.className = `uploaded-file-row ${f.isDuplicate ? 'is-duplicate' : ''}`;

      let matchInfoHtml = `<span style="color: var(--text-subtle); font-size: 0.775rem;">${escapeHtml(texts.unassignedText)}</span>`;
      if (f.matchedReqId && state.sortedRequirements) {
        const req = state.sortedRequirements.find(r => r.id === f.matchedReqId);
        if (req) {
          const title = state.currentLang === 'bn'
            ? (req.title_bn || req.title_en)
            : (req.title_en || req.title_bn);
          matchInfoHtml = `<span class="matched-pill">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ${escapeHtml(texts.assignedToPrefix)} #${formatNumber(req.order)} ${escapeHtml(title)}
          </span>`;
        }
      }

      let duplicateBadgeHtml = '';
      if (f.isDuplicate) {
        const dupNames = f.duplicateWith.join(', ');
        duplicateBadgeHtml = `
          <span class="badge badge-duplicate" title="${escapeHtml(texts.duplicateOf)} ${escapeHtml(dupNames)}">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            ${escapeHtml(texts.badgeDuplicate)}
          </span>
        `;
      }

      row.innerHTML = `
        <div class="file-row-left">
          <div class="file-row-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <span class="file-row-name" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</span>
          <span class="file-page-pill">${formatPages(f.pageCount)}</span>
          ${duplicateBadgeHtml}
        </div>
        <div class="file-row-right">
          ${matchInfoHtml}
          <button type="button" class="file-delete-btn" data-file-id="${f.id}" title="Remove file">&times;</button>
        </div>
      `;

      row.querySelector('.file-delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        removePdfFile(f.id);
      });

      el.uploadedFilesList.appendChild(row);
    });
  }

  /**
   * =========================================================================
   * Document Status Validation Logic (Section 5 Rules)
   *
   * Exact Rules:
   * 'Missing': Required document (mandatory = true), no file matched. -> BLOCKS
   * 'Expiry date needed': has_expiry = true, file matched, but no date entered. -> BLOCKS
   * 'Expired': Date entered is before the tender's submission_deadline. -> BLOCKS
   * 'Not provided': Optional document (mandatory = false), no file matched. -> DOES NOT BLOCK
   * 'OK': File matched, and (if applicable) expiry date is on or after the deadline. -> DOES NOT BLOCK
   * =========================================================================
   */
  function getDocumentStatus(req) {
    const isMandatory = req.mandatory === true;
    const hasExpiry = req.has_expiry === true;
    const matchedFileId = state.documentMatches[req.id];
    const matchedFile = state.uploadedFiles.find(f => f.id === matchedFileId);
    const expiryDate = (state.expiryDates[req.id] || '').trim();

    const tender = state.tenderData ? (state.tenderData.tender || state.tenderData) : {};
    const deadlineStr = (tender.submission_deadline || tender.deadline || '').trim();

    // 1. No file matched
    if (!matchedFile) {
      if (isMandatory) {
        return {
          code: 'Missing',
          cssClass: 'status-pill-missing',
          borderClass: 'status-border-missing',
          isBlocking: true,
          label: I18N[state.currentLang].statusMissing,
          reason: I18N[state.currentLang].reasonMissing
        };
      } else {
        return {
          code: 'Not provided',
          cssClass: 'status-pill-not-provided',
          borderClass: 'status-border-not-provided',
          isBlocking: false,
          label: I18N[state.currentLang].statusNotProvided,
          reason: I18N[state.currentLang].reasonNotProvided
        };
      }
    }

    // 2. File IS matched: Check expiry if required
    if (hasExpiry) {
      // Expiry date needed
      if (!expiryDate) {
        return {
          code: 'Expiry date needed',
          cssClass: 'status-pill-needed',
          borderClass: 'status-border-needed',
          isBlocking: true,
          label: I18N[state.currentLang].statusExpiryNeeded,
          reason: I18N[state.currentLang].reasonExpiryNeeded
        };
      }

      // Check if expired: before submission_deadline
      // YYYY-MM-DD string comparison is lexicographically identical to chronological order
      if (deadlineStr && expiryDate < deadlineStr) {
        const reasonText = I18N[state.currentLang].reasonExpired
          .replace('{exp}', expiryDate)
          .replace('{dl}', deadlineStr);

        return {
          code: 'Expired',
          cssClass: 'status-pill-expired',
          borderClass: 'status-border-expired',
          isBlocking: true,
          label: I18N[state.currentLang].statusExpired,
          reason: reasonText
        };
      }
    }

    // 3. Otherwise OK
    return {
      code: 'OK',
      cssClass: 'status-pill-ok',
      borderClass: 'status-border-ok',
      isBlocking: false,
      label: I18N[state.currentLang].statusOk,
      reason: I18N[state.currentLang].reasonOk
    };
  }

  /**
   * Evaluate all documents and update 'Generate Package' button & warning message
   */
  function validateAndRenderPackageStatus() {
    if (!state.sortedRequirements || state.sortedRequirements.length === 0) {
      if (el.generatePackageBtn) el.generatePackageBtn.disabled = true;
      if (el.generateWarningBox) el.generateWarningBox.style.display = 'none';
      return;
    }

    const blockingItems = [];

    state.sortedRequirements.forEach(req => {
      const status = getDocumentStatus(req);
      if (status.isBlocking) {
        blockingItems.push({
          req: req,
          status: status
        });
      }
    });

    const texts = I18N[state.currentLang];

    if (blockingItems.length > 0) {
      // Disable Generate button
      el.generatePackageBtn.disabled = true;
      el.generateStatusSummary.textContent = texts.generateDesc;

      // Show warning message explaining why it is blocked
      el.generateWarningBox.className = 'generate-warning-box';
      el.generateWarningBox.style.display = 'block';

      let listHtml = `
        <div style="font-weight: 700; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          ${escapeHtml(texts.generationBlockedHeader)}
        </div>
        <ul>
      `;

      blockingItems.forEach(item => {
        const orderNum = formatNumber(item.req.order);
        const docTitle = state.currentLang === 'bn'
          ? (item.req.title_bn || item.req.title_en)
          : (item.req.title_en || item.req.title_bn);

        listHtml += `
          <li>
            <strong>#${orderNum} ${escapeHtml(docTitle)}</strong> (${item.req.id}):
            <span style="font-weight: 600; text-decoration: underline;">${escapeHtml(item.status.label)}</span> &mdash;
            ${escapeHtml(item.status.reason)}
          </li>
        `;
      });

      listHtml += `</ul>`;
      el.generateWarningBox.innerHTML = listHtml;
    } else {
      // No blocking problems: enable Generate button
      el.generatePackageBtn.disabled = false;
      el.generateStatusSummary.textContent = texts.generationReadyMsg;

      el.generateWarningBox.className = 'generate-success-box';
      el.generateWarningBox.style.display = 'flex';
      el.generateWarningBox.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${escapeHtml(texts.generationReadyMsg)}</span>
      `;
    }
  }

  /**
   * Handle matching assignment between a requirement and a file
   */
  function handleMatchChange(reqId, selectedFileId) {
    hidePdfAlert();
    const texts = I18N[state.currentLang];

    if (!selectedFileId) {
      delete state.documentMatches[reqId];
      state.uploadedFiles.forEach(f => {
        if (f.matchedReqId === reqId) f.matchedReqId = null;
      });
      renderUploadedFilesList();
      renderRequirementsList();
      validateAndRenderPackageStatus();
      return;
    }

    const selectedFile = state.uploadedFiles.find(f => f.id === selectedFileId);
    if (!selectedFile) return;

    // Check duplicate restriction
    const duplicateAssignedToOther = state.uploadedFiles.find(other => 
      other.id !== selectedFile.id &&
      other.hash === selectedFile.hash &&
      other.matchedReqId !== null &&
      other.matchedReqId !== reqId
    );

    if (duplicateAssignedToOther) {
      showPdfAlert(texts.duplicateMatchPreventedAlert, 'error');
      renderRequirementsList();
      return;
    }

    // Unassign previous file for this req
    state.uploadedFiles.forEach(f => {
      if (f.matchedReqId === reqId) f.matchedReqId = null;
    });

    // Unassign selectedFile if it was assigned to another req (one file -> at most one doc)
    for (const [rId, fId] of Object.entries(state.documentMatches)) {
      if (fId === selectedFileId && rId !== reqId) {
        delete state.documentMatches[rId];
      }
    }

    // Assign
    state.documentMatches[reqId] = selectedFileId;
    selectedFile.matchedReqId = reqId;

    renderUploadedFilesList();
    renderRequirementsList();
    validateAndRenderPackageStatus();
  }

  /**
   * Handle Expiry Date change
   */
  function handleExpiryDateChange(reqId, newDateStr) {
    state.expiryDates[reqId] = newDateStr;
    renderRequirementsList();
    validateAndRenderPackageStatus();
  }

  /**
   * Parse and validate raw JSON data
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

    el.loadedFileName.textContent = filename;
    el.fileLoadedBadge.style.display = 'inline-flex';

    el.emptyState.style.display = 'none';
    el.tenderContent.style.display = 'block';

    renderSummaryHeader();
    renderRequirementsList();
    validateAndRenderPackageStatus();

    return true;
  }

  /**
   * Format deadline string with countdown
   */
  function formatDeadline(deadlineStr) {
    if (!deadlineStr || deadlineStr === 'N/A') return 'N/A';
    
    try {
      const date = new Date(deadlineStr);
      if (isNaN(date.getTime())) return escapeHtml(deadlineStr);

      const today = new Date();
      const deadlineDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const nowDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const diffTime = deadlineDate - nowDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const isoDate = deadlineStr;
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
   */
  function renderSummaryHeader() {
    if (!state.tenderData) return;

    const tender = state.tenderData.tender || state.tenderData;

    el.summaryTitle.textContent = tender.title || tender.tender_title || tender.tenderTitle || 'Tender Package';
    el.tenderIdVal.textContent = tender.tender_id || tender.id || tender.tenderId || 'N/A';
    el.entityVal.textContent = tender.procuring_entity || tender.entity || tender.procuringEntity || tender.organization || 'N/A';
    el.bidderVal.textContent = tender.bidder || tender.bidder_name || tender.bidderName || tender.vendor || 'N/A';
    el.deadlineVal.innerHTML = formatDeadline(tender.submission_deadline || tender.deadline || tender.submissionDeadline || tender.due_date || 'N/A');

    const totalCount = state.sortedRequirements.length;
    el.totalReqCountVal.textContent = formatNumber(totalCount);
  }

  /**
   * Render the Requirements List with Live Status, File Matching, and Expiry Inputs
   */
  function renderRequirementsList() {
    const list = state.sortedRequirements;
    el.requirementsList.innerHTML = '';

    const lang = state.currentLang;
    const texts = I18N[lang];

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

    list.forEach(req => {
      const order = req.order !== undefined ? req.order : '-';
      const docId = req.id || '';
      const matchedFileId = state.documentMatches[docId] || null;
      const matchedFile = state.uploadedFiles.find(f => f.id === matchedFileId);
      const currentExpiryDate = state.expiryDates[docId] || '';

      // Live status calculation
      const docStatus = getDocumentStatus(req);

      // Dynamic Title Switching
      let primaryTitle = '';
      let secondaryTitle = '';

      if (lang === 'bn') {
        primaryTitle = req.title_bn || req.title_en || req.title || 'শিরোনামহীন নথি';
        secondaryTitle = req.title_en || '';
      } else {
        primaryTitle = req.title_en || req.title_bn || req.title || 'Untitled Document';
        secondaryTitle = req.title_bn || '';
      }

      // Mandatory / Optional badge
      const isMandatory = req.mandatory === true;
      const mandatoryBadgeClass = isMandatory ? 'badge-mandatory' : 'badge-optional';
      const mandatoryBadgeText = isMandatory ? texts.badgeMandatory : texts.badgeOptional;

      // Expiry requirement badge
      const hasExpiry = req.has_expiry === true;
      const expiryBadgeClass = hasExpiry ? 'badge-expiry' : 'badge-no-expiry';
      const expiryBadgeText = hasExpiry ? texts.badgeExpiryRequired : texts.badgeNoExpiry;
      const expiryIcon = hasExpiry
        ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
        : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

      // Generate options for File Matching dropdown
      let dropdownOptionsHtml = `<option value="">-- ${escapeHtml(texts.selectPdfPlaceholder)} --</option>`;

      state.uploadedFiles.forEach(fileItem => {
        const isCurrentMatch = fileItem.id === matchedFileId;
        const isAssignedToOther = fileItem.matchedReqId !== null && fileItem.matchedReqId !== docId;

        const duplicateAssignedToOther = state.uploadedFiles.find(other =>
          other.id !== fileItem.id &&
          other.hash === fileItem.hash &&
          other.matchedReqId !== null &&
          other.matchedReqId !== docId
        );

        let optionLabel = `${fileItem.name} (${formatPages(fileItem.pageCount)})`;
        let isDisabled = false;

        if (isCurrentMatch) {
          optionLabel = `✓ ${optionLabel} [${texts.matchedBadge}]`;
        } else if (isAssignedToOther) {
          const otherReq = state.sortedRequirements.find(r => r.id === fileItem.matchedReqId);
          const otherTitle = otherReq ? `#${otherReq.order}` : '';
          optionLabel = `${optionLabel} (${texts.assignedToPrefix} ${otherTitle})`;
          isDisabled = true;
        } else if (duplicateAssignedToOther) {
          optionLabel = `${optionLabel} (${texts.duplicateBlockedMsg})`;
          isDisabled = true;
        } else if (fileItem.isDuplicate) {
          optionLabel = `[${texts.badgeDuplicate}] ${optionLabel}`;
        }

        dropdownOptionsHtml += `
          <option value="${fileItem.id}" ${isCurrentMatch ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}>
            ${escapeHtml(optionLabel)}
          </option>
        `;
      });

      // Conditional Expiry Date Input:
      // "If a document has has_expiry = true and a file is matched to it, reveal a date input field for the user to enter the expiry date."
      let expiryInputHtml = '';
      if (hasExpiry && matchedFile) {
        expiryInputHtml = `
          <div class="expiry-input-group">
            <label class="expiry-label" for="expiry_${docId}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              ${escapeHtml(texts.expiryDateLabel)}:
            </label>
            <input
              type="date"
              id="expiry_${docId}"
              class="expiry-date-input"
              data-req-id="${docId}"
              value="${escapeHtml(currentExpiryDate)}"
              aria-label="${escapeHtml(texts.expiryDateLabel)} for ${escapeHtml(primaryTitle)}"
            >
          </div>
        `;
      }

      const itemCard = document.createElement('div');
      itemCard.className = `req-item ${docStatus.borderClass}`;
      itemCard.setAttribute('role', 'listitem');
      itemCard.dataset.id = docId;
      itemCard.dataset.order = String(order);

      itemCard.innerHTML = `
        <div class="req-main-row">
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

            <!-- LIVE STATUS BADGE -->
            <span class="status-pill ${docStatus.cssClass}" title="${escapeHtml(docStatus.reason)}">
              ${escapeHtml(docStatus.label)}
            </span>
          </div>
        </div>

        <!-- Controls Row: Matching Dropdown + Expiry Input -->
        <div class="req-controls-row">
          <div class="req-match-container">
            <span class="match-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              PDF:
            </span>
            <div class="match-select-wrapper">
              <select class="match-dropdown" data-req-id="${docId}" aria-label="Assign PDF file to ${escapeHtml(primaryTitle)}">
                ${dropdownOptionsHtml}
              </select>
              ${matchedFile ? `
                <button type="button" class="unmatch-btn" data-req-id="${docId}" title="${texts.unmatchTooltip}">
                  &times; ${escapeHtml(texts.unmatchBtnText)}
                </button>
              ` : ''}
            </div>
          </div>

          ${expiryInputHtml}
        </div>
      `;

      // Event listener: dropdown change
      const selectEl = itemCard.querySelector('.match-dropdown');
      selectEl.addEventListener('change', (e) => {
        handleMatchChange(docId, e.target.value);
      });

      // Event listener: unmatch button
      const unmatchBtn = itemCard.querySelector('.unmatch-btn');
      if (unmatchBtn) {
        unmatchBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleMatchChange(docId, '');
        });
      }

      // Event listener: expiry date change
      const expiryInput = itemCard.querySelector('.expiry-date-input');
      if (expiryInput) {
        expiryInput.addEventListener('change', (e) => {
          handleExpiryDateChange(docId, e.target.value);
        });
        expiryInput.addEventListener('input', (e) => {
          // If 10 characters (YYYY-MM-DD), update live immediately
          if (e.target.value.length === 10) {
            handleExpiryDateChange(docId, e.target.value);
          }
        });
      }

      el.requirementsList.appendChild(itemCard);
    });
  }

  /**
   * Read and parse a JSON File
   */
  function handleJsonFile(file) {
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
   * Reset data
   */
  function resetData() {
    state.tenderData = null;
    state.sortedRequirements = [];
    state.documentMatches = {};
    state.expiryDates = {};
    state.uploadedFiles.forEach(f => f.matchedReqId = null);
    el.fileInput.value = '';
    el.fileLoadedBadge.style.display = 'none';
    el.tenderContent.style.display = 'none';
    el.emptyState.style.display = 'flex';
    hideAlert();
    renderUploadedFilesList();
    validateAndRenderPackageStatus();
  }

  /**
   * Setup Event Listeners
   */
  function initEvents() {
    // Language Toggle Click Handlers
    el.langEnBtn.addEventListener('click', () => setLanguage('en'));
    el.langBnBtn.addEventListener('click', () => setLanguage('bn'));

    // JSON Browse Button
    el.browseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      el.fileInput.click();
    });

    // JSON File Input change
    el.fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        handleJsonFile(file);
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

    // Alert Close Buttons
    el.alertCloseBtn.addEventListener('click', hideAlert);
    el.pdfAlertCloseBtn.addEventListener('click', hidePdfAlert);

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

    // Drag and Drop for JSON
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
        handleJsonFile(files[0]);
      }
    });

    // PDF Browse Button
    el.browsePdfBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      el.pdfFileInput.click();
    });

    // PDF File Input change
    el.pdfFileInput.addEventListener('change', (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handlePdfFiles(files);
        el.pdfFileInput.value = '';
      }
    });

    // PDF Drag and Drop
    const pdfDropZone = el.pdfDropZone;
    ['dragenter', 'dragover'].forEach(eventName => {
      pdfDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        pdfDropZone.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(eventName => {
      pdfDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        pdfDropZone.classList.remove('dragover');
      });
    });
    pdfDropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        handlePdfFiles(files);
      }
    });

    // Generate Package Button Click
    el.generatePackageBtn.addEventListener('click', () => {
      if (el.generatePackageBtn.disabled) return;
      const texts = I18N[state.currentLang];
      alert(texts.generationReadyMsg);
    });

    // Keyboard navigation for language buttons
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
