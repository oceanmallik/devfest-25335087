# Tender Document Package Builder

A client-side web application built with vanilla HTML5, CSS3, and JavaScript for parsing tender specifications, matching required documents to PDF attachments, validating document expiry dates against tender deadlines, and assembling a unified, publication-ready PDF submission package complete with a dynamic cover page and page footers.

---

## Participant Information

- **Developer Name:** Ocean Mallik
- **Registration Number:** `253-35-087`
- **Live Website Link (HTTPS):** [https://contest.oceanmallik.com/](https://contest.oceanmallik.com/)

---

## How to Run the App

This project is strictly frontend-only with **zero dependencies, build steps, or backend server requirements**. All PDF reading and generation occurs entirely within the client's browser.

### Option 1: Direct Browser Launch (Quickest)
1. Locate the `index.html` file in the project root directory.
2. Double-click `index.html`, or right-click and select **Open with Google Chrome** (or Edge, Firefox, Brave, Safari).
3. The application is ready to use immediately.

### Option 2: Run via Local HTTP Server (Recommended)
Running through a local web server ensures optimal loading of external CDN libraries and asset fetching:

- **Using Python 3:**
  ```bash
  python -m http.server 8000
  ```
  Then visit `http://localhost:8000` in your web browser.

- **Using Node.js (`serve` or `http-server`):**
  ```bash
  npx serve .
  ```
  Then open the URL printed in your terminal (typically `http://localhost:3000`).

- **Using VS Code Live Server:**
  Right-click `index.html` in VS Code and select **"Open with Live Server"**.

---

## Main Features Implemented

### 1. Requirements Configuration Parsing & Tender Summary
- **JSON File Processing:** Drag-and-drop or select a `requirements.json` file to parse and extract tender metadata.
- **Built-in Sample Data:** Includes a "Load Sample Data" button to quickly preview application capabilities without requiring a manual file upload.
- **Tender Header Details:** Displays Tender Title, Tender ID (with a 1-click clipboard copy button), Procuring Entity, Bidder Name, and Submission Deadline (with a dynamic countdown indicator).
- **Strict Sorting:** Requirements are dynamically sorted strictly in ascending sequence according to their `order` attribute.

### 2. Bilingual UI & Dynamic Localization
- **Language Switcher:** Global toggle for English and Bengali (`বাংলা`).
- **Dynamic Document Titles:** Document names seamlessly alternate between `title_en` and `title_bn` based on active locale.
- **Bengali Digit Conversion:** Dates, item counts, and order indices format using standard Bengali numerals (`০-৯`) in Bengali mode.
- **Full Interface Translation:** Status indicators, alerts, tooltips, and explanatory messages are fully translated.

### 3. Client-Side PDF Upload & Page Counting
- **Strict PDF Filtering:** Multi-file uploader that accepts only `.pdf` files, rejecting non-PDF inputs with clear user alerts.
- **Page Count Calculation:** Uses `pdf.js` via CDN to read and display exact page counts for every uploaded document before merging.
- **Managed File List:** Displays all uploaded files with page counts, match statuses, and deletion options.

### 4. Duplicate File Detection & Conflict Prevention
- **SHA-256 Checksum Hashing:** Computes cryptographic hashes of PDF contents using the Web Crypto API (`crypto.subtle.digest`).
- **Duplicate Badge Alerts:** Clearly flags duplicate files in the upload list and dropdown menus.
- **Assignment Guard:** Strictly prevents identical files from being assigned to multiple distinct document requirements.

### 5. Document Matching System
- **1-to-1 Mapping UI:** Intuitive dropdown selectors on each requirement card to assign uploaded PDFs.
- **Conflict Prevention:** Once a file is assigned to a requirement, it is marked and disabled for other requirements.
- **Reassignment & Unmatching:** Easily remove or reassign matches at any time with a single click.

### 6. Live Status Engine & Expiry Validation
- **Conditional Expiry Input:** Dynamically unveils an expiry date input field when `has_expiry = true` and a file is matched.
- **State Machine Rules:**
  - **`Missing`** *(Blocking)*: Mandatory requirement (`mandatory = true`) without a matched file.
  - **`Expiry date needed`** *(Blocking)*: `has_expiry = true`, file matched, but no expiry date specified.
  - **`Expired`** *(Blocking)*: Entered expiry date is prior to the tender's `submission_deadline`.
  - **`Not provided`** *(Non-blocking)*: Optional requirement (`mandatory = false`) without a matched file.
  - **`OK`** *(Non-blocking)*: File successfully matched and valid (or unexpired).
- **Interactive Blocking Diagnostics:** Lists each blocking issue with clear guidance on what must be resolved before package generation.

### 7. Final Package PDF Assembly (`pdf-lib`)
- **Generation Button Lock:** Kept disabled with detailed warning explanations while any blocking document status remains.
- **Page 1 Cover Page (English):**
  - Displays official header with company branding logo (`company_logo.png`).
  - Formatted tender metadata summary box (Tender ID, Title, Entity, Bidder, Deadline, Submission Date).
  - Comprehensive table listing all included documents in order, their IDs, attached filenames, page counts, and verification status.
  - Automatically omits optional documents that have no attached file.
- **Sequential Page Merging:** Appends all pages of matched PDFs in their designated requirement order.
- **Page Footers:** Applies a uniform footer across all pages (including the cover):  
  `<Tender ID> | Page X of Y`  
  Calculates positioning safely away from content and compensates for rotated pages (0°, 90°, 180°, 270°).
- **Direct Browser Download:** Instantly triggers client-side download named exactly `<Tender ID>_Package.pdf`.

---

## AI Tools Used

- **Google Antigravity IDE (Gemini 3.8 Flash)**: Used as the primary AI pair programmer for iterative UI architecture design, client-side PDF manipulation routines, event state management, and edge-case handling.

---

## Most Useful Prompt Utilized Today

The most effective prompt utilized during development was the **Status Validation & State Logic prompt**:

> *"Implement the document status validation logic.*  
> *If a document has has_expiry = true and a file is matched to it, reveal a date input field for the user to enter the expiry date.*  
> *Next to each document, display a live status based on these exact rules:*  
> *'Missing': Required document (mandatory = true), no file matched.*  
> *'Expiry date needed': has_expiry = true, file matched, but no date entered.*  
> *'Expired': Date entered is before the tender's submission_deadline.*  
> *'Not provided': Optional document (mandatory = false), no file matched.*  
> *'OK': File matched, and (if applicable) expiry date is on or after the deadline.*  
> *Create a 'Generate Package' button at the bottom. Keep it disabled if ANY document has a 'Missing', 'Expiry date needed', or 'Expired' status, and show a warning message explaining why it is blocked.*  
> *Provide the updated JS logic."*

### Why This Prompt Was Most Useful:
- **Precise Domain Specifications:** It clearly defined a 5-state validation state machine without ambiguity.
- **Distinction Between Blocking & Non-Blocking Rules:** It explicitly separated blocking requirements (`Missing`, `Expiry date needed`, `Expired`) from non-blocking states (`Not provided`, `OK`).
- **Conditional UI Triggers:** Specifying the conditional visibility for the date input and the dynamic warning panel ensured seamless UX and rock-solid validation before package generation.
