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
      uploadDesc: "Upload the tender requirements file to inspect details and document checklist.",
      dropText: 'Drag and drop your <strong>JSON file</strong> here',
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
      reasonOk: "Verified and compliant",
      generatingPackageBtnText: "Generating Package...",
      generatingPackageStatus: "Generating PDF package, please wait...",
      packageGeneratedSuccess: "Tender package generated and downloaded successfully!",
      generationFailedError: "Failed to generate package: "
    },
    bn: {
      appTitle: "দরপত্র নথি প্যাকেজ প্রস্তুতকারক",
      appSubtitle: "ফ্রন্টএন্ড নথি প্রক্রিয়াকরণ ও শর্তাবলি যাচাইকারী",
      uploadTitle: "রিকোয়ারমেন্টস কনফিগারেশন আপলোড",
      uploadDesc: "দরপত্রের বিস্তারিত ও প্রয়োজনীয় নথিপত্রের তালিকা দেখতে কনফিগারেশন ফাইলটি আপলোড করুন।",
      dropText: 'আপনার <strong>JSON ফাইল</strong> এখানে ড্র্যাগ করুন',
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
      reasonOk: "যাচাইকৃত ও প্রস্তুত",
      generatingPackageBtnText: "প্যাকেজ তৈরি হচ্ছে...",
      generatingPackageStatus: "পিডিএফ প্যাকেজ প্রস্তুত হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...",
      packageGeneratedSuccess: "দরপত্র প্যাকেজ সফলভাবে তৈরি এবং ডাউনলোড করা হয়েছে!",
      generationFailedError: "প্যাকেজ তৈরি করতে ব্যর্থ হয়েছে: "
    }
  };

  // Application State
  const state = {
    currentLang: 'en', // 'en' or 'bn'
    tenderData: null,
    sortedRequirements: [],
    uploadedFiles: [], // Array of { id, file, name, size, hash, pageCount, isDuplicate, duplicateWith: [], matchedReqId }
    documentMatches: {}, // Map: reqId -> fileId
    expiryDates: {}, // Map: reqId -> 'YYYY-MM-DD'
    isGeneratingPackage: false
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
    const hasJson = !!state.tenderData;
    const count = state.uploadedFiles.length;
    el.pdfUploadedCount.textContent = `${formatNumber(count)} ${count === 1 ? 'file' : 'files'}`;

    if (!hasJson && count === 0) {
      el.uploadedFilesContainer.style.display = 'none';
      el.uploadedFilesList.innerHTML = '';
      return;
    }

    el.uploadedFilesContainer.style.display = 'block';
    el.uploadedFilesList.innerHTML = '';

    const texts = I18N[state.currentLang];

    // If requirements.json is loaded, render it FIRST in line
    if (hasJson) {
      const jsonCard = document.createElement('div');
      jsonCard.className = 'uploaded-file-row file-row-json';
      const jsonFileName = el.loadedFileName.textContent || 'requirements.json';
      const reqCount = state.sortedRequirements ? state.sortedRequirements.length : 0;
      const countLabel = state.currentLang === 'bn' ? `${formatNumber(reqCount)}টি শর্ত` : `${formatNumber(reqCount)} requirements`;
      const configLabel = state.currentLang === 'bn' ? 'কনফিগ সক্রিয়' : 'Config Active';

      jsonCard.innerHTML = `
        <div class="file-row-left">
          <div class="file-row-icon file-row-icon-json">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="9" y1="13" x2="15" y2="13"></line>
              <line x1="9" y1="17" x2="13" y2="17"></line>
            </svg>
          </div>
          <span class="file-row-name" title="${escapeHtml(jsonFileName)}">${escapeHtml(jsonFileName)}</span>
          <span class="file-page-pill file-json-pill">${countLabel}</span>
        </div>
        <div class="file-row-right">
          <span class="matched-pill matched-pill-json">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ${configLabel}
          </span>
          <button type="button" class="file-delete-btn" id="jsonCardRemoveBtn" title="Reset requirements file">&times;</button>
        </div>
      `;

      jsonCard.querySelector('#jsonCardRemoveBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        resetData();
      });

      el.uploadedFilesList.appendChild(jsonCard);
    }

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
      if (!state.isGeneratingPackage) {
        el.generatePackageBtn.disabled = false;
        el.generateStatusSummary.textContent = texts.generationReadyMsg;
      }

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
    el.fileLoadedBadge.style.display = 'none';

    el.emptyState.style.display = 'none';
    el.tenderContent.style.display = 'block';

    renderSummaryHeader();
    renderRequirementsList();
    validateAndRenderPackageStatus();
    renderUploadedFilesList();

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
   * =========================================================================
   * PDF Package Generation via pdf-lib CDN
   * =========================================================================
   */

  /**
   * Ensure pdf-lib library is loaded from public CDN
   */
  async function ensurePdfLib() {
    if (window.PDFLib) return window.PDFLib;

    const existingScript = document.querySelector('script[src*="pdf-lib"]');
    if (existingScript) {
      if (window.PDFLib) return window.PDFLib;
      await new Promise((resolve, reject) => {
        existingScript.addEventListener('load', () => resolve(window.PDFLib));
        existingScript.addEventListener('error', () => reject(new Error('Failed to load pdf-lib CDN.')));
        setTimeout(() => {
          if (window.PDFLib) resolve(window.PDFLib);
          else reject(new Error('Timeout loading pdf-lib.'));
        }, 8000);
      });
      if (window.PDFLib) return window.PDFLib;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        if (window.PDFLib) resolve(window.PDFLib);
        else reject(new Error('pdf-lib loaded but PDFLib is undefined.'));
      };
      script.onerror = () => reject(new Error('Failed to load pdf-lib from CDN.'));
      document.head.appendChild(script);
    });
  }

  /**
   * Sanitize text to ensure WinAnsi / ASCII compatibility with pdf-lib standard fonts
   */
  function sanitizeForPdf(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/\u2022/g, '*')
      .replace(/\u2026/g, '...')
      .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ')
      .trim();
  }

  /**
   * Truncate text to fit within a maxWidth for a given font and size
   */
  function fitText(text, font, size, maxWidth) {
    let str = sanitizeForPdf(text);
    if (!str) return '';
    if (font.widthOfTextAtSize(str, size) <= maxWidth) {
      return str;
    }
    while (str.length > 1 && font.widthOfTextAtSize(str + '...', size) > maxWidth) {
      str = str.slice(0, -1);
    }
    return str ? str + '...' : '';
  }

  /**
   * Draw footer text '<Tender ID> | Page X of Y' on a page
   * Places the text cleanly in the bottom margin without obscuring document content.
   * Handles page dimensions and page rotation (0, 90, 180, 270 deg).
   */
  function drawFooterOnPage(page, footerText, font, size = 9) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(footerText, size);
    const rotation = ((page.getRotation().angle || 0) % 360 + 360) % 360;
    const margin = 20; // 20pt from the bottom edge
    const color = window.PDFLib.rgb(0.25, 0.28, 0.32);

    let x, y, rotateAngle;

    if (rotation === 90) {
      x = width - margin;
      y = (height - textWidth) / 2;
      rotateAngle = window.PDFLib.degrees(90);
    } else if (rotation === 180) {
      x = (width + textWidth) / 2;
      y = height - margin;
      rotateAngle = window.PDFLib.degrees(180);
    } else if (rotation === 270) {
      x = margin;
      y = (height + textWidth) / 2;
      rotateAngle = window.PDFLib.degrees(270);
    } else {
      // Standard 0 deg rotation
      x = (width - textWidth) / 2;
      y = margin;
      rotateAngle = window.PDFLib.degrees(0);
    }

    page.drawText(footerText, {
      x,
      y,
      size,
      font,
      color,
      rotate: rotateAngle
    });
  }

  /**
   * Generate Final Tender Package PDF using pdf-lib
   *
   * 1. Creates a new PDF document.
   * 2. Page 1 is a Cover Page (in English) displaying tender ID, title, procuring entity,
   *    bidder, deadline, today's date, and the list of included documents in their correct order.
   * 3. Appends all pages of successfully matched PDF files in required order (skipping optional docs with no file).
   * 4. Adds footer to every single page: '<Tender ID> | Page X of Y' (where Y is total page count).
   * 5. Triggers browser download named exactly '<Tender ID>_Package.pdf'.
   */
  async function generatePackagePdf() {
    if (el.generatePackageBtn.disabled || state.isGeneratingPackage) return;

    // Check for any blocking issues
    const blockingItems = [];
    state.sortedRequirements.forEach(req => {
      const status = getDocumentStatus(req);
      if (status.isBlocking) {
        blockingItems.push({ req, status });
      }
    });

    if (blockingItems.length > 0) {
      validateAndRenderPackageStatus();
      return;
    }

    const texts = I18N[state.currentLang];
    const tender = state.tenderData ? (state.tenderData.tender || state.tenderData) : {};
    const tenderId = sanitizeForPdf(tender.tender_id || tender.id || tender.tenderId || 'TENDER');
    const tenderTitle = sanitizeForPdf(tender.title || tender.tender_title || tender.tenderTitle || 'Tender Package');
    const procuringEntity = sanitizeForPdf(tender.procuring_entity || tender.entity || tender.procuringEntity || tender.organization || 'N/A');
    const bidder = sanitizeForPdf(tender.bidder || tender.bidder_name || tender.bidderName || tender.vendor || 'N/A');
    const deadline = sanitizeForPdf(tender.submission_deadline || tender.deadline || tender.submissionDeadline || tender.due_date || 'N/A');

    // Today's date in YYYY-MM-DD
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayDate = `${yyyy}-${mm}-${dd}`;

    // Set UI loading state
    state.isGeneratingPackage = true;
    el.generatePackageBtn.disabled = true;
    const originalBtnHtml = el.generatePackageBtn.innerHTML;
    el.generatePackageBtn.innerHTML = `
      <svg class="spinner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"></path>
      </svg>
      <span>${escapeHtml(texts.generatingPackageBtnText || 'Generating Package...')}</span>
    `;
    el.generateStatusSummary.textContent = texts.generatingPackageStatus || 'Generating PDF package, please wait...';

    try {
      // 1. Ensure pdf-lib is loaded
      const PDFLib = await ensurePdfLib();

      // 2. Identify included documents in correct order (skip optional docs with no file)
      const includedDocs = [];
      for (const req of state.sortedRequirements) {
        const fileId = state.documentMatches[req.id];
        if (!fileId) {
          // Skip optional documents that have no file
          continue;
        }
        const fileRecord = state.uploadedFiles.find(f => f.id === fileId);
        if (!fileRecord || !fileRecord.file) {
          continue;
        }

        // Load source PDF document
        const arrayBuffer = await fileRecord.file.arrayBuffer();
        const srcDoc = await PDFLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pageIndices = srcDoc.getPageIndices();

        includedDocs.push({
          req,
          fileRecord,
          srcDoc,
          pageIndices,
          pageCount: pageIndices.length
        });
      }

      // 3. Create new PDF document
      const pdfDoc = await PDFLib.PDFDocument.create();

      // Embed standard fonts (Helvetica)
      const fontRegular = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
      const fontOblique = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaOblique);

      // Colors
      const cPrimary = PDFLib.rgb(0.09, 0.28, 0.65);
      const cTextMain = PDFLib.rgb(0.12, 0.16, 0.22);
      const cTextMuted = PDFLib.rgb(0.40, 0.45, 0.52);
      const cBorder = PDFLib.rgb(0.85, 0.88, 0.92);
      const cBoxBg = PDFLib.rgb(0.97, 0.98, 0.99);
      const cHeaderBg = PDFLib.rgb(0.92, 0.94, 0.98);
      const cRowAlt = PDFLib.rgb(0.98, 0.99, 1.0);
      const cGreen = PDFLib.rgb(0.08, 0.60, 0.25);

      // 4. Create Page 1: Cover Page (in English)
      const pageSize = (PDFLib.PageSizes && PDFLib.PageSizes.A4) ? PDFLib.PageSizes.A4 : [595.28, 841.89];
      const coverPage = pdfDoc.addPage(pageSize);
      const { width, height } = coverPage.getSize();
      const marginX = 45;
      const contentWidth = width - marginX * 2;

      // Top decorative accent bar
      coverPage.drawRectangle({
        x: marginX,
        y: height - 34,
        width: contentWidth,
        height: 4,
        color: cPrimary
      });

      // Cover Title
      coverPage.drawText('TENDER SUBMISSION PACKAGE', {
        x: marginX,
        y: height - 60,
        size: 18,
        font: fontBold,
        color: cPrimary
      });

      coverPage.drawText('Official Tender Document Submission & Verification Summary', {
        x: marginX,
        y: height - 76,
        size: 9,
        font: fontRegular,
        color: cTextMuted
      });

      // Embed Company Logo on Cover Page if available
      try {
        const logoResp = await fetch('company_logo.png');
        if (logoResp.ok) {
          const logoBytes = await logoResp.arrayBuffer();
          const embeddedLogo = await pdfDoc.embedPng(logoBytes);
          const logoDims = embeddedLogo.scaleToFit(44, 44);
          coverPage.drawImage(embeddedLogo, {
            x: marginX + contentWidth - logoDims.width,
            y: height - 80,
            width: logoDims.width,
            height: logoDims.height
          });
        }
      } catch (err) {
        // Fallback gracefully if logo cannot be fetched
      }

      coverPage.drawLine({
        start: { x: marginX, y: height - 86 },
        end: { x: marginX + contentWidth, y: height - 86 },
        thickness: 0.75,
        color: cBorder
      });

      // Metadata Box (Tender ID, Title, Procuring Entity, Bidder, Deadline, Today's Date)
      const metaBoxY = height - 200;
      const metaBoxHeight = 104;

      coverPage.drawRectangle({
        x: marginX,
        y: metaBoxY,
        width: contentWidth,
        height: metaBoxHeight,
        color: cBoxBg,
        borderColor: cBorder,
        borderWidth: 0.75
      });

      coverPage.drawText('TENDER DETAILS', {
        x: marginX + 14,
        y: metaBoxY + metaBoxHeight - 16,
        size: 9,
        font: fontBold,
        color: cPrimary
      });

      coverPage.drawLine({
        start: { x: marginX + 14, y: metaBoxY + metaBoxHeight - 22 },
        end: { x: marginX + contentWidth - 14, y: metaBoxY + metaBoxHeight - 22 },
        thickness: 0.5,
        color: cBorder
      });

      // Row 1: Tender ID & Today's Date
      coverPage.drawText('Tender ID:', { x: marginX + 14, y: metaBoxY + 62, size: 8.5, font: fontBold, color: cTextMain });
      coverPage.drawText(tenderId, { x: marginX + 115, y: metaBoxY + 62, size: 8.5, font: fontRegular, color: cTextMain });

      coverPage.drawText('Date:', { x: marginX + 325, y: metaBoxY + 62, size: 8.5, font: fontBold, color: cTextMain });
      coverPage.drawText(todayDate, { x: marginX + 375, y: metaBoxY + 62, size: 8.5, font: fontRegular, color: cTextMain });

      // Row 2: Title
      coverPage.drawText('Title:', { x: marginX + 14, y: metaBoxY + 44, size: 8.5, font: fontBold, color: cTextMain });
      coverPage.drawText(fitText(tenderTitle, fontRegular, 8.5, contentWidth - 130), { x: marginX + 115, y: metaBoxY + 44, size: 8.5, font: fontRegular, color: cTextMain });

      // Row 3: Procuring Entity
      coverPage.drawText('Procuring Entity:', { x: marginX + 14, y: metaBoxY + 26, size: 8.5, font: fontBold, color: cTextMain });
      coverPage.drawText(fitText(procuringEntity, fontRegular, 8.5, contentWidth - 130), { x: marginX + 115, y: metaBoxY + 26, size: 8.5, font: fontRegular, color: cTextMain });

      // Row 4: Bidder & Deadline
      coverPage.drawText('Bidder:', { x: marginX + 14, y: metaBoxY + 8, size: 8.5, font: fontBold, color: cTextMain });
      coverPage.drawText(fitText(bidder, fontRegular, 8.5, 200), { x: marginX + 115, y: metaBoxY + 8, size: 8.5, font: fontRegular, color: cTextMain });

      coverPage.drawText('Deadline:', { x: marginX + 325, y: metaBoxY + 8, size: 8.5, font: fontBold, color: cTextMain });
      coverPage.drawText(deadline, { x: marginX + 375, y: metaBoxY + 8, size: 8.5, font: fontRegular, color: cTextMain });

      // Included Documents Section Header
      const docsHeadingY = metaBoxY - 24;
      coverPage.drawText('INCLUDED DOCUMENTS', {
        x: marginX,
        y: docsHeadingY,
        size: 11,
        font: fontBold,
        color: cPrimary
      });

      coverPage.drawText(`The following ${includedDocs.length} document(s) are attached in required order:`, {
        x: marginX,
        y: docsHeadingY - 14,
        size: 8,
        font: fontOblique,
        color: cTextMuted
      });

      // Table Header
      const tableHeaderY = docsHeadingY - 38;
      const tableHeaderHeight = 20;

      coverPage.drawRectangle({
        x: marginX,
        y: tableHeaderY,
        width: contentWidth,
        height: tableHeaderHeight,
        color: cHeaderBg,
        borderColor: cBorder,
        borderWidth: 0.75
      });

      coverPage.drawText('#', { x: marginX + 8, y: tableHeaderY + 6, size: 8, font: fontBold, color: cTextMain });
      coverPage.drawText('DOCUMENT TITLE', { x: marginX + 30, y: tableHeaderY + 6, size: 8, font: fontBold, color: cTextMain });
      coverPage.drawText('ID', { x: marginX + 220, y: tableHeaderY + 6, size: 8, font: fontBold, color: cTextMain });
      coverPage.drawText('ATTACHED FILE', { x: marginX + 265, y: tableHeaderY + 6, size: 8, font: fontBold, color: cTextMain });
      coverPage.drawText('PAGES', { x: marginX + 415, y: tableHeaderY + 6, size: 8, font: fontBold, color: cTextMain });
      coverPage.drawText('STATUS', { x: marginX + 465, y: tableHeaderY + 6, size: 8, font: fontBold, color: cTextMain });

      // Table Rows
      const availableTableHeight = tableHeaderY - 70; // ensure table ends above y=70, keeping clear distance from footer at y=20
      const numDocs = includedDocs.length;
      const rowHeight = Math.max(16, Math.min(26, Math.floor(availableTableHeight / Math.max(numDocs, 1))));
      const fontSize = rowHeight >= 22 ? 8.5 : (rowHeight >= 18 ? 8 : 7.5);

      for (let i = 0; i < numDocs; i++) {
        const item = includedDocs[i];
        const rowY = tableHeaderY - (i + 1) * rowHeight;
        const isAlt = i % 2 === 1;

        if (isAlt) {
          coverPage.drawRectangle({
            x: marginX,
            y: rowY,
            width: contentWidth,
            height: rowHeight,
            color: cRowAlt
          });
        }

        coverPage.drawLine({
          start: { x: marginX, y: rowY },
          end: { x: marginX + contentWidth, y: rowY },
          thickness: 0.5,
          color: cBorder
        });

        const textY = rowY + Math.floor((rowHeight - fontSize) / 2) + 2;

        // Order
        const orderStr = String(item.req.order !== undefined ? item.req.order : i + 1);
        coverPage.drawText(orderStr, { x: marginX + 8, y: textY, size: fontSize, font: fontRegular, color: cTextMain });

        // English Title
        const titleStr = fitText(item.req.title_en || item.req.title_bn || item.req.id, fontBold, fontSize, 185);
        coverPage.drawText(titleStr, { x: marginX + 30, y: textY, size: fontSize, font: fontBold, color: cTextMain });

        // ID
        coverPage.drawText(sanitizeForPdf(item.req.id || ''), { x: marginX + 220, y: textY, size: fontSize, font: fontRegular, color: cTextMuted });

        // File name
        const fileNameStr = fitText(item.fileRecord.name || '', fontRegular, fontSize, 140);
        coverPage.drawText(fileNameStr, { x: marginX + 265, y: textY, size: fontSize, font: fontRegular, color: cTextMain });

        // Page count
        const pCountStr = `${item.pageCount} ${item.pageCount === 1 ? 'page' : 'pages'}`;
        coverPage.drawText(pCountStr, { x: marginX + 415, y: textY, size: fontSize, font: fontRegular, color: cTextMuted });

        // Status
        let statusText = 'OK';
        let statusColor = cGreen;
        if (item.req.has_expiry && state.expiryDates[item.req.id]) {
          statusText = 'Valid';
        }
        coverPage.drawText(statusText, { x: marginX + 465, y: textY, size: fontSize, font: fontBold, color: statusColor });
      }

      // 5. Append all pages of the successfully matched PDF files in required order
      for (const item of includedDocs) {
        const copiedPages = await pdfDoc.copyPages(item.srcDoc, item.pageIndices);
        for (const page of copiedPages) {
          pdfDoc.addPage(page);
        }
      }

      // 6. Add footer to every single page (including the cover):
      // Reads: <Tender ID> | Page X of Y (where Y is total page count)
      const totalPages = pdfDoc.getPageCount();
      for (let i = 0; i < totalPages; i++) {
        const page = pdfDoc.getPage(i);
        const pageNumber = i + 1;
        const footerText = `${tenderId} | Page ${pageNumber} of ${totalPages}`;
        drawFooterOnPage(page, footerText, fontRegular, 9);
      }

      // 7. Trigger download named exactly <Tender ID>_Package.pdf
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `${tenderId}_Package.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();

      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadUrl);
      }, 200);

      // Success notification
      if (el.generateWarningBox) {
        el.generateWarningBox.className = 'generate-success-box';
        el.generateWarningBox.style.display = 'flex';
        el.generateWarningBox.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>${escapeHtml(texts.packageGeneratedSuccess || 'Tender package generated and downloaded successfully!')}</span>
        `;
      }
    } catch (err) {
      console.error('PDF Package generation error:', err);
      showAlert(`${texts.generationFailedError || 'Failed to generate package: '}${err.message}`, 'error');
    } finally {
      state.isGeneratingPackage = false;
      el.generatePackageBtn.innerHTML = originalBtnHtml;
      validateAndRenderPackageStatus();
    }
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
      generatePackagePdf();
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
