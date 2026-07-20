const STORAGE_KEY = 'homeManagementData';

const state = {
  bills: [],
  incomes: [],
  investments: [],
  assessments: [],
};

const selectors = {
  billForm: document.getElementById('bill-form'),
  billName: document.getElementById('bill-name'),
  billNameSuggestions: document.getElementById('bill-name-suggestions'),
  billTableBody: document.getElementById('bill-table-body'),
  incomeForm: document.getElementById('income-form'),
  incomeTableBody: document.getElementById('income-table-body'),
  investmentForm: document.getElementById('investment-form'),
  investmentTableBody: document.getElementById('investment-table-body'),
  assessmentForm: document.getElementById('assessment-form'),
  assessmentTableBody: document.getElementById('assessment-table-body'),
  loanTableBody: document.getElementById('loan-table-body'),
  pendingBillTableBody: document.getElementById('pending-bill-table-body'),
  completedBillTableBody: document.getElementById('completed-bill-table-body'),
  incomeSummary: document.getElementById('summary-income'),
  billsSummary: document.getElementById('summary-bills'),
  balanceSummary: document.getElementById('summary-balance'),
  monthlyBillsSummary: document.getElementById('summary-monthly-bills'),
  yearlyBillsSummary: document.getElementById('summary-yearly-bills'),
  monthlyIncomeSummary: document.getElementById('summary-monthly-income'),
  yearlyIncomeSummary: document.getElementById('summary-yearly-income'),
  completedSummary: document.getElementById('summary-completed'),
  fromMonthFilter: document.getElementById('summary-from-month'),
  fromYearFilter: document.getElementById('summary-from-year'),
  toMonthFilter: document.getElementById('summary-to-month'),
  toYearFilter: document.getElementById('summary-to-year'),
  itemFilterRow: document.getElementById('item-filter-row'),
  itemFilterLabel: document.getElementById('summary-item-filter-label'),
  itemFilter: document.getElementById('summary-item-filter'),
  reportFilterRow: document.getElementById('report-filter-row'),
  reportFilter: document.getElementById('summary-report-filter'),
  applyFilterBtn: document.getElementById('summary-apply-filter'),
  reportSelectedPeriod: document.getElementById('report-selected-period'),
  reportMonthlyBills: document.getElementById('report-monthly-bills'),
  reportMonthlyIncome: document.getElementById('report-monthly-income'),
  reportMonthlyLoans: document.getElementById('report-monthly-loans'),
  reportYearlyBills: document.getElementById('report-yearly-bills'),
  reportYearlyIncome: document.getElementById('report-yearly-income'),
  reportYearlyLoans: document.getElementById('report-yearly-loans'),
  reportYearlyCompleted: document.getElementById('report-yearly-completed'),
  reportMonthBillTotal: document.getElementById('report-month-bill-total'),
  reportMonthIncomeTotal: document.getElementById('report-month-income-total'),
  reportMonthLoanTotal: document.getElementById('report-month-loan-total'),
  reportMonthCompletedCount: document.getElementById('report-month-completed-count'),
  reportMonthPendingCount: document.getElementById('report-month-pending-count'),
  reportYearBillTotal: document.getElementById('report-year-bill-total'),
  reportYearIncomeTotal: document.getElementById('report-year-income-total'),
  reportYearLoanTotal: document.getElementById('report-year-loan-total'),
  reportYearCompletedCount: document.getElementById('report-year-completed-count'),
  reportYearPendingCount: document.getElementById('report-year-pending-count'),
  exportBillsExcelBtn: document.getElementById('export-bills-excel'),
  exportBillsPdfBtn: document.getElementById('export-bills-pdf'),
  exportIncomeExcelBtn: document.getElementById('export-income-excel'),
  exportIncomePdfBtn: document.getElementById('export-income-pdf'),
  exportInvestmentExcelBtn: document.getElementById('export-investment-excel'),
  exportInvestmentPdfBtn: document.getElementById('export-investment-pdf'),
  exportAssessmentExcelBtn: document.getElementById('export-assessment-excel'),
  exportAssessmentPdfBtn: document.getElementById('export-assessment-pdf'),
  exportLoanExcelBtn: document.getElementById('export-loan-excel'),
  exportLoanPdfBtn: document.getElementById('export-loan-pdf'),
  exportReportExcelBtn: document.getElementById('export-report-excel'),
  exportReportPdfBtn: document.getElementById('export-report-pdf'),
  exportBackupExcelBtn: document.getElementById('export-backup-excel'),
  importBackupExcelBtn: document.getElementById('import-backup-excel'),
  importBackupInput: document.getElementById('import-backup-input'),
};

const loadState = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed);
    state.incomes = (state.incomes || []).map((inc) => ({
      ...inc,
      period: inc.period || inc.date || '',
      entryDate: inc.entryDate || inc.date || '',
    }));
  } catch (error) {
    console.error('Unable to load saved data', error);
  }
};

const saveState = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const createBadge = (status) => {
  const badge = document.createElement('span');
  badge.className = 'badge';
  if (status === 'Completed') {
    badge.classList.add('completed');
    badge.textContent = 'Completed';
  } else if (status === 'Under Process') {
    badge.classList.add('process');
    badge.textContent = 'Under Process';
  } else if (status === 'Pending') {
    badge.classList.add('pending');
    badge.textContent = 'Pending';
  } else {
    badge.classList.add('planned');
    badge.textContent = 'Planned';
  }
  return badge;
};

const formatMoney = (value) => {
  return `₹${Number(value || 0).toFixed(2)}`;
};

const formatMoneyNoPrecision = (value) => {
  const amount = Math.round(Number(value || 0));
  return `Rs${amount.toLocaleString('en-IN')}`;
};

/* Authentication & inactivity (dynamic password) */
const AUTH_KEY = 'homeManagementAuth';
const DRAFT_KEY = 'homeManagementDraft';
const AUTH_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
let inactivityTimer = null;
let isAppInitialized = false;

const computeDynamicPassword = (dateObj = new Date()) => {
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const yyyy = String(dateObj.getFullYear());
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  return `laxmidevi${dd}${mm}${yyyy}${hh}${min}`;
};

const isAuthenticated = () => sessionStorage.getItem(AUTH_KEY) === 'true';
const setAuthenticated = (val) => {
  if (val) sessionStorage.setItem(AUTH_KEY, 'true');
  else sessionStorage.removeItem(AUTH_KEY);
};

function updateAuthUI() {
  const btn = document.getElementById('logout-button');
  if (!btn) return;
  btn.style.display = isAuthenticated() ? 'inline-flex' : 'none';
}

const showLoginModal = () => {
  const overlay = document.getElementById('login-overlay');
  const msg = document.getElementById('login-message');
  if (!overlay) return;
  overlay.setAttribute('aria-hidden', 'false');
  const pwd = document.getElementById('login-password');
  if (pwd) {
    pwd.value = '';
    pwd.focus();
  }
  if (msg) msg.textContent = '';
};

const hideLoginModal = () => {
  const overlay = document.getElementById('login-overlay');
  if (!overlay) return;
  overlay.setAttribute('aria-hidden', 'true');
};

const saveDraft = () => {
  try {
    const draft = {
      billForm: selectors.billForm ? Object.fromEntries(new FormData(selectors.billForm)) : {},
      incomeForm: selectors.incomeForm ? Object.fromEntries(new FormData(selectors.incomeForm)) : {},
      investmentForm: selectors.investmentForm ? Object.fromEntries(new FormData(selectors.investmentForm)) : {},
      assessmentForm: selectors.assessmentForm ? Object.fromEntries(new FormData(selectors.assessmentForm)) : {},
      timestamp: Date.now(),
      state,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {
    console.error('Unable to save draft', e);
  }
};

const clearDraft = () => localStorage.removeItem(DRAFT_KEY);

const restoreDraftIfAny = () => {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return false;
  try {
    const draft = JSON.parse(raw);
    const banner = document.createElement('div');
    banner.className = 'card';
    banner.style.marginBottom = '1rem';
    banner.innerHTML = `<strong>Draft found</strong> — <button id="restore-draft" class="secondary-button">Restore</button> <button id="clear-draft" class="secondary-button">Clear</button>`;
    const container = document.querySelector('.container');
    if (container) container.insertBefore(banner, container.firstChild);
    document.getElementById('restore-draft').addEventListener('click', () => {
      if (draft.billForm && selectors.billForm) {
        Object.entries(draft.billForm).forEach(([k, v]) => {
          const el = selectors.billForm.elements[k];
          if (el) el.value = v;
        });
      }
      if (draft.incomeForm && selectors.incomeForm) {
        Object.entries(draft.incomeForm).forEach(([k, v]) => {
          const el = selectors.incomeForm.elements[k];
          if (el) el.value = v;
        });
      }
      if (draft.investmentForm && selectors.investmentForm) {
        Object.entries(draft.investmentForm).forEach(([k, v]) => {
          const el = selectors.investmentForm.elements[k];
          if (el) el.value = v;
        });
      }
      if (draft.assessmentForm && selectors.assessmentForm) {
        Object.entries(draft.assessmentForm).forEach(([k, v]) => {
          const el = selectors.assessmentForm.elements[k];
          if (el) el.value = v;
        });
      }
      // restore state arrays
      if (draft.state) {
        Object.assign(state, draft.state);
        saveState();
        renderAll();
      }
      banner.remove();
      clearDraft();
    });
    document.getElementById('clear-draft').addEventListener('click', () => {
      clearDraft();
      banner.remove();
    });
    return true;
  } catch (e) {
    console.error('Unable to restore draft', e);
    return false;
  }
};

const performLogout = (auto = false) => {
  // Save draft then clear auth and show login
  saveDraft();
  setAuthenticated(false);
  clearInactivityTimer();
  showLoginModal();
  if (auto) console.info('Logged out due to inactivity');
  updateAuthUI();
};

const clearInactivityTimer = () => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
};

const startInactivityTimer = () => {
  clearInactivityTimer();
  inactivityTimer = setTimeout(() => {
    performLogout(true);
  }, AUTH_TIMEOUT_MS);
};

const resetInactivityTimer = () => {
  if (!isAuthenticated()) return;
  startInactivityTimer();
};

// attach activity listeners
['click', 'mousemove', 'keydown', 'touchstart'].forEach((ev) => {
  document.addEventListener(ev, () => {
    if (isAuthenticated()) resetInactivityTimer();
  }, { passive: true });
});

// login handling
const handleLoginAttempt = () => {
  const pwdEl = document.getElementById('login-password');
  const msg = document.getElementById('login-message');
  if (!pwdEl) return;
  const provided = pwdEl.value.trim();
  const expected = computeDynamicPassword(new Date());
  if (provided === expected) {
    setAuthenticated(true);
    hideLoginModal();
    updateAuthUI();
    // initialize app once authenticated
    initialize();
    startInactivityTimer();
    restoreDraftIfAny();
    return;
  }
  if (msg) msg.textContent = 'Invalid password.';
};

// wire login button and Enter key
const loginBtn = document.getElementById('login-submit');
const loginPwd = document.getElementById('login-password');
if (loginBtn) loginBtn.addEventListener('click', handleLoginAttempt);
if (loginPwd) loginPwd.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLoginAttempt(); });

// show/hide password toggle
const loginToggle = document.getElementById('login-toggle');
if (loginToggle && loginPwd) {
  loginToggle.addEventListener('click', () => {
    const isPassword = loginPwd.type === 'password';
    loginPwd.type = isPassword ? 'text' : 'password';
    loginToggle.textContent = isPassword ? 'Hide' : 'Show';
    loginToggle.setAttribute('aria-pressed', String(isPassword));
    loginToggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    if (isPassword) loginPwd.focus();
  });
}

// wire logout button
const logoutBtnEl = document.getElementById('logout-button');
if (logoutBtnEl) {
  logoutBtnEl.addEventListener('click', () => {
    performLogout(false);
  });
}

// ensure UI reflects auth state on load
updateAuthUI();

const getImageFormatFromDataUrl = (dataUrl) => {
  const match = /^data:image\/(\w+);base64,/.exec(dataUrl);
  return match ? match[1].toUpperCase() : 'PNG';
};

const getImageExtensionFromDataUrl = (dataUrl) => {
  const match = /^data:image\/(\w+);base64,/.exec(dataUrl);
  return match ? match[1].toLowerCase() : 'png';
};

const makeReceiptImageFilename = (billName, plannedDate, originalName, imageData) => {
  const safeName = String(billName || 'receipt')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w\-\.]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || 'receipt';

  let monthYear = '';
  if (plannedDate) {
    const date = new Date(plannedDate);
    if (!Number.isNaN(date.getTime())) {
      monthYear = date.toLocaleString('en-IN', { month: 'short', year: 'numeric' }).replace(/\s+/g, '');
    }
  }

  const extension = originalName
    ? originalName.split('.').pop().toLowerCase()
    : getImageExtensionFromDataUrl(imageData);

  return `${safeName}${monthYear ? `_${monthYear}` : ''}.${extension}`;
};

const getTodayIso = () => new Date().toISOString().slice(0, 10);

const getCurrentMonthYear = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const parseMonthYear = (monthValue, yearValue) => {
  const month = Number(monthValue);
  const year = Number(yearValue);
  if (!month || !year) return null;
  return { month, year };
};

const getSelectedDateRange = () => {
  const now = new Date();
  const defaultMonth = now.getMonth() + 1;
  const defaultYear = now.getFullYear();
  const from = parseMonthYear(selectors.fromMonthFilter?.value, selectors.fromYearFilter?.value) || { month: defaultMonth, year: defaultYear };
  const to = parseMonthYear(selectors.toMonthFilter?.value, selectors.toYearFilter?.value) || { month: defaultMonth, year: defaultYear };
  const first = { month: from.month, year: from.year };
  const last = { month: to.month, year: to.year };
  if (first.year > last.year || (first.year === last.year && first.month > last.month)) {
    return { start: last, end: first };
  }
  return { start: first, end: last };
};

const getSelectedDateKeys = () => {
  const { start } = getSelectedDateRange();
  return { month: start.month, year: start.year };
};

const getRangeTotals = (range) => {
  const billTotal = state.bills.reduce((sum, bill) => {
    if (normalizeValue(bill.category) === 'loan') return sum;
    return sum + getBillRangeAmount(bill, range);
  }, 0);
  const loanTotal = state.bills.reduce((sum, bill) => {
    if (normalizeValue(bill.category) !== 'loan') return sum;
    return sum + getBillRangeAmount(bill, range);
  }, 0);
  const incomeTotal = state.incomes.reduce((sum, income) => {
    const keys = getIncomeMonthYear(income.period);
    return keys && isMonthYearInRange(keys.month, keys.year, range) ? sum + Number(income.amount || 0) : sum;
  }, 0);
  const completedCount = state.bills.reduce((count, bill) => {
    return getBillOccurrenceCount(bill, range) > 0 && bill.status === 'Completed' ? count + 1 : count;
  }, 0);
  const pendingCount = state.bills.reduce((count, bill) => {
    return getBillOccurrenceCount(bill, range) > 0 && bill.status !== 'Completed' ? count + 1 : count;
  }, 0);
  return { billTotal, loanTotal, incomeTotal, completedCount, pendingCount };
};

const isMonthYearInRange = (month, year, range) => {
  if (!month || !year || !range) return false;
  const { start, end } = range;
  if (year < start.year || year > end.year) return false;
  if (year === start.year && month < start.month) return false;
  if (year === end.year && month > end.month) return false;
  return true;
};

const getSelectedPeriodLabel = () => {
  const { start, end } = getSelectedDateRange();
  const startLabel = new Date(start.year, start.month - 1, 1).toLocaleString('en-IN', { month: 'short', year: 'numeric' });
  const endLabel = new Date(end.year, end.month - 1, 1).toLocaleString('en-IN', { month: 'short', year: 'numeric' });
  return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
};

const getBillMonthYear = (plannedDate) => {
  if (!plannedDate) return null;
  const date = new Date(plannedDate);
  if (Number.isNaN(date.getTime())) return null;
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
};

const getRangeBounds = (range) => {
  const startDate = new Date(range.start.year, range.start.month - 1, 1);
  const endDate = new Date(range.end.year, range.end.month, 0);
  return { startDate, endDate };
};

const getBillOccurrenceCount = (bill, range) => {
  if (!bill || !bill.plannedDate) return 0;
  const plannedDate = new Date(bill.plannedDate);
  if (Number.isNaN(plannedDate.getTime())) return 0;
  const { startDate, endDate } = getRangeBounds(range);
  const repeat = normalizeValue(bill.repeat || 'One-time');

  const isInRange = (date) => date >= startDate && date <= endDate;
  if (bill.category === 'Loan' || repeat === 'one-time') {
    return isInRange(plannedDate) ? 1 : 0;
  }

  let count = 0;
  let occurrence = new Date(plannedDate);
  const incrementMonths = repeat === 'monthly' ? 1 : repeat === 'quarterly' ? 3 : repeat === 'yearly' ? 12 : 0;
  const incrementDays = repeat === 'weekly' ? 7 : 0;

  if (occurrence > endDate) {
    return 0;
  }
  if (occurrence < startDate && incrementMonths === 0 && incrementDays === 0) {
    return 0;
  }

  if (incrementMonths > 0) {
    while (occurrence <= endDate) {
      if (isInRange(occurrence)) count += 1;
      occurrence = new Date(occurrence);
      occurrence.setMonth(occurrence.getMonth() + incrementMonths);
    }
  } else if (incrementDays > 0) {
    while (occurrence <= endDate) {
      if (isInRange(occurrence)) count += 1;
      occurrence = new Date(occurrence);
      occurrence.setDate(occurrence.getDate() + incrementDays);
    }
  } else {
    if (isInRange(occurrence)) count = 1;
  }

  return count;
};

const getBillRangeAmount = (bill, range) => {
  return getBillOccurrenceCount(bill, range) * Number(bill.amount || 0);
};

const getIncomeMonthYear = (period) => {
  if (!period) return null;
  const [year, month] = period.split('-').map(Number);
  if (!year || !month) return null;
  return { year, month };
};

const createActionButton = (label, className, onClick) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.className = `action-button ${className}`;
  button.addEventListener('click', onClick);
  return button;
};

const formatMonthLabel = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
};

const downloadFile = (filename, content, type) => {
  const blob = new Blob([content], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

const escapeCsvValue = (value) => {
  const stringValue = value == null ? '' : String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const escapeHtml = (value) => {
  const stringValue = value == null ? '' : String(value);
  return stringValue
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const exportCsv = (filename, rows) => {
  const csvData = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\r\n');
  downloadFile(filename, `\uFEFF${csvData}`, 'application/vnd.ms-excel');
};

const buildBackupSections = () => {
  const sections = [];

  const buildSection = (sectionName, rows) => {
    sections.push([`#SECTION ${sectionName}`]);
    sections.push(rows[0]);
    rows.slice(1).forEach((row) => sections.push(row));
    sections.push([]);
  };

  const billRows = [
    ['id', 'name', 'category', 'repeat', 'amount', 'plannedDate', 'completedDate', 'status', 'incomeSource', 'imageName', 'image', 'remarks'],
    ...state.bills.map((bill) => [
      bill.id,
      bill.name,
      bill.category,
      bill.repeat,
      bill.amount,
      bill.plannedDate,
      bill.completedDate,
      bill.status,
      bill.incomeSource,
      bill.imageName,
      bill.image,
      bill.remarks,
    ]),
  ];

  const incomeRows = [
    ['id', 'name', 'amount', 'period', 'entryDate'],
    ...state.incomes.map((income) => [income.id, income.name, income.amount, income.period, income.entryDate]),
  ];

  const investmentRows = [
    ['id', 'name', 'target', 'monthly', 'notes'],
    ...state.investments.map((investment) => [investment.id, investment.name, investment.target, investment.monthly, investment.notes]),
  ];

  const assessmentRows = [
    ['id', 'name', 'dueDate', 'status', 'notes'],
    ...state.assessments.map((assessment) => [assessment.id, assessment.name, assessment.dueDate, assessment.status, assessment.notes]),
  ];

  buildSection('bills', billRows);
  buildSection('incomes', incomeRows);
  buildSection('investments', investmentRows);
  buildSection('assessments', assessmentRows);
  return sections;
};

const exportBackupExcel = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const rows = buildBackupSections();
  exportCsv(`home_management_backup_${timestamp}.xls`, rows);
};

const parseCsvLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
};

const parseBackupCsv = (text) => {
  const lines = text.split(/\r?\n/);
  const result = {
    bills: [],
    incomes: [],
    investments: [],
    assessments: [],
  };

  let currentSection = null;
  let headers = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }
    if (line.startsWith('#SECTION ')) {
      currentSection = line.slice(9).trim();
      headers = null;
      continue;
    }
    if (!currentSection) {
      continue;
    }

    const values = parseCsvLine(rawLine);
    if (!headers) {
      headers = values;
      continue;
    }

    const item = values.reduce((obj, value, index) => {
      obj[headers[index]] = value;
      return obj;
    }, {});

    if (currentSection === 'bills') {
      result.bills.push({
        id: Number(item.id) || Date.now(),
        name: item.name || '',
        category: item.category || '',
        repeat: item.repeat || '',
        amount: Number(item.amount) || 0,
        plannedDate: item.plannedDate || '',
        completedDate: item.completedDate || '',
        status: item.status || '',
        incomeSource: item.incomeSource || '',
        imageName: item.imageName || '',
        image: item.image || '',
        remarks: item.remarks || '',
      });
    }
    if (currentSection === 'incomes') {
      result.incomes.push({
        id: Number(item.id) || Date.now(),
        name: item.name || '',
        amount: Number(item.amount) || 0,
        period: item.period || '',
        entryDate: item.entryDate || '',
      });
    }
    if (currentSection === 'investments') {
      result.investments.push({
        id: Number(item.id) || Date.now(),
        name: item.name || '',
        target: Number(item.target) || 0,
        monthly: Number(item.monthly) || 0,
        notes: item.notes || '',
      });
    }
    if (currentSection === 'assessments') {
      result.assessments.push({
        id: Number(item.id) || Date.now(),
        name: item.name || '',
        dueDate: item.dueDate || '',
        status: item.status || '',
        notes: item.notes || '',
      });
    }
  }

  return result;
};

const handleImportBackup = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = parseBackupCsv(reader.result);
      state.bills = imported.bills;
      state.incomes = imported.incomes;
      state.investments = imported.investments;
      state.assessments = imported.assessments;
      saveState();
      updateAllFilterDropdowns();
      renderAll();
      selectors.importBackupInput.value = '';
      alert('Backup imported successfully. Your entered data has been restored.');
    } catch (error) {
      console.error('Import failed', error);
      alert('Unable to import backup. Please select a valid Excel-compatible CSV backup file.');
    }
  };
  reader.onerror = () => {
    alert('Failed to read backup file.');
  };
  reader.readAsText(file);
};

const requestImportBackup = () => {
  selectors.importBackupInput.click();
};

const getActiveTabId = () => document.querySelector('.tab-button.active')?.dataset.tab || 'bills';

const setActiveTab = (tabId) => {
  document.querySelectorAll('.tab-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === tabId);
  });
};

const normalizeValue = (value) => String(value || '').trim().toLowerCase();

const getItemFilterValue = () => {
  return normalizeValue(selectors.itemFilter?.value);
};

const getFilteredBills = () => {
  const range = getSelectedDateRange();
  const filterValue = getItemFilterValue();
  return state.bills.filter((bill) => {
    if (filterValue && normalizeValue(bill.name) !== filterValue) {
      return false;
    }
    return getBillOccurrenceCount(bill, range) > 0;
  });
};

const getFilteredIncomes = () => {
  const range = getSelectedDateRange();
  const filterValue = getItemFilterValue();
  return state.incomes.filter((income) => {
    const keys = getIncomeMonthYear(income.period);
    if (!keys || !isMonthYearInRange(keys.month, keys.year, range)) {
      return false;
    }
    if (filterValue && normalizeValue(income.name) !== filterValue) {
      return false;
    }
    return true;
  });
};

const getFilteredInvestments = () => {
  const filterValue = getItemFilterValue();
  return state.investments.filter((investment) => {
    if (filterValue && normalizeValue(investment.name) !== filterValue) {
      return false;
    }
    return true;
  });
};

const getFilteredAssessments = () => {
  const range = getSelectedDateRange();
  const filterValue = getItemFilterValue();
  return state.assessments.filter((assessment) => {
    const keys = getBillMonthYear(assessment.dueDate);
    if (!keys || !isMonthYearInRange(keys.month, keys.year, range)) {
      return false;
    }
    if (filterValue && normalizeValue(assessment.name) !== filterValue) {
      return false;
    }
    return true;
  });
};

const getFilteredLoans = () => {
  const range = getSelectedDateRange();
  const filterValue = getItemFilterValue();
  return state.bills.filter((bill) => {
    if (bill.category !== 'Loan') {
      return false;
    }
    const keys = getBillMonthYear(bill.plannedDate);
    if (!keys || !isMonthYearInRange(keys.month, keys.year, range)) {
      return false;
    }
    if (filterValue && normalizeValue(bill.name) !== filterValue) {
      return false;
    }
    return true;
  });
};

const getFilterItemsForTab = (tabId) => {
  const range = getSelectedDateRange();
  const items = new Set();
  if (tabId === 'bills') {
    state.bills.forEach((bill) => {
      const keys = getBillMonthYear(bill.plannedDate);
      if (keys && isMonthYearInRange(keys.month, keys.year, range)) {
        items.add(bill.name);
      }
    });
  } else if (tabId === 'income') {
    state.incomes.forEach((income) => {
      const keys = getIncomeMonthYear(income.period);
      if (keys && isMonthYearInRange(keys.month, keys.year, range)) {
        items.add(income.name);
      }
    });
  } else if (tabId === 'investments') {
    state.investments.forEach((investment) => items.add(investment.name));
  } else if (tabId === 'assets') {
    state.assessments.forEach((assessment) => {
      const keys = getBillMonthYear(assessment.dueDate);
      if (keys && isMonthYearInRange(keys.month, keys.year, range)) {
        items.add(assessment.name);
      }
    });
  } else if (tabId === 'loans') {
    state.bills.forEach((bill) => {
      if (bill.category !== 'Loan') return;
      const keys = getBillMonthYear(bill.plannedDate);
      if (keys && isMonthYearInRange(keys.month, keys.year, range)) {
        items.add(bill.name);
      }
    });
  }
  return Array.from(items).sort();
};

const populateItemFilterDropdown = () => {
  const activeTab = getActiveTabId();
  const previousValue = selectors.itemFilter.value;
  selectors.itemFilter.innerHTML = '<option value="">All</option>';
  getFilterItemsForTab(activeTab).forEach((name) => {
    const option = document.createElement('option');
    option.value = normalizeValue(name);
    option.textContent = name;
    selectors.itemFilter.appendChild(option);
  });
  selectors.itemFilter.value = normalizeValue(previousValue);
  if (!selectors.itemFilter.querySelector(`option[value="${selectors.itemFilter.value}"]`)) {
    selectors.itemFilter.value = '';
  }
};

const exportBillsCsv = () => {
  const bills = getFilteredBills();
  const range = getSelectedDateRange();
  const totalIncome = state.incomes.reduce((sum, income) => {
    const keys = getIncomeMonthYear(income.period);
    return keys && isMonthYearInRange(keys.month, keys.year, range) ? sum + Number(income.amount || 0) : sum;
  }, 0);
  const period = getSelectedPeriodLabel().replace(/\s+/g, '_');
  const rows = bills.map((bill) => `
      <tr>
        <td>${escapeHtml(bill.name)}</td>
        <td>${escapeHtml(bill.category)}</td>
        <td>${escapeHtml(bill.repeat)}</td>
        <td>${escapeHtml(formatMoney(bill.amount))}</td>
        <td>${escapeHtml(formatMoney(getBillRangeAmount(bill, range)))}</td>
        <td>${escapeHtml(formatMonthLabel(bill.plannedDate))}</td>
        <td>${escapeHtml(bill.plannedDate || '-')}</td>
        <td>${escapeHtml(bill.completedDate || '-')}</td>
        <td>${escapeHtml(bill.status)}</td>
        <td>${escapeHtml(bill.incomeSource)}</td>
        <td>${escapeHtml(bill.remarks || '-')}</td>
        <td>${escapeHtml(bill.imageName || '')}</td>
        <td>${bill.image ? `<img src="${bill.image}" width="80" style="max-height:80px;display:block;"/>` : '-'}</td>
      </tr>`);

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 6px; vertical-align: middle; }
  th { background: #f4f4f8; }
  img { border: 1px solid #ccc; max-width: 80px; max-height: 80px; }
  .summary-row td { font-weight: bold; }
</style>
</head>
<body>
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Category</th>
      <th>Repeat</th>
      <th>Amount</th>
      <th>Total</th>
      <th>Month</th>
      <th>Planned</th>
      <th>Completed</th>
      <th>Status</th>
      <th>Income Source</th>
      <th>Remarks</th>
      <th>Receipt Name</th>
      <th>Receipt</th>
    </tr>
  </thead>
  <tbody>
    ${rows.join('')}
  </tbody>
  <tfoot>
    <tr class="summary-row">
      <td colspan="11" style="text-align:right;">Total Income</td>
      <td>${escapeHtml(formatMoney(totalIncome))}</td>
    </tr>
  </tfoot>
</table>
</body>
</html>`;

  downloadFile(`bills_${period}.xls`, html, 'application/vnd.ms-excel');
};

const exportReportCsv = () => {
  const range = getSelectedDateRange();
  const period = getSelectedPeriodLabel();
  const { billTotal, loanTotal, incomeTotal } = getRangeTotals(range);
  const rows = [
    ['Report Name', 'Home Management Summary'],
    ['Period', period],
    [],
    ['Metric', 'Range Total'],
    ['Bills Total', formatMoneyNoPrecision(billTotal)],
    ['Income Total', formatMoneyNoPrecision(incomeTotal)],
    ['Loan Total', formatMoneyNoPrecision(loanTotal)],
  ];
  exportCsv(`report_${period.replace(/\s+/g, '_')}.csv`, rows);
};

const exportBillsPdf = () => {
  const bills = getFilteredBills();
  const period = getSelectedPeriodLabel();
  const doc = new window.jspdf.jsPDF();
  doc.setFontSize(14);
  doc.text(`Bills Report - ${period}`, 14, 18);
  const range = getSelectedDateRange();
  const totalIncome = state.incomes.reduce((sum, income) => {
    const keys = getIncomeMonthYear(income.period);
    return keys && isMonthYearInRange(keys.month, keys.year, range) ? sum + Number(income.amount || 0) : sum;
  }, 0);
  const rows = bills.map((bill) => [
    bill.name,
    bill.category,
    bill.repeat,
    formatMoneyNoPrecision(bill.amount),
    formatMoneyNoPrecision(getBillRangeAmount(bill, range)),
    formatMonthLabel(bill.plannedDate),
    bill.plannedDate || '-',
    bill.completedDate || '-',
    bill.status,
    bill.incomeSource,
    bill.imageName || '',
  ]);
  doc.autoTable({
    head: [[ 'Name', 'Cat', 'Rep', 'Amt', 'Total', 'Month', 'Plan', 'Done', 'Status', 'Income', 'Receipt' ]],
    body: rows,
    startY: 24,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: 'linebreak',
      valign: 'middle',
    },
    columnStyles: {
      3: { halign: 'right', cellWidth: 'auto' },
      10: { halign: 'center', cellWidth: 45 },
    },
    headStyles: { fillColor: '#2f6bf4', halign: 'center' },
    theme: 'striped',
    didParseCell: (data) => {
      if (data.column.index === 10 && data.cell.section === 'body') {
        data.cell.styles.minCellHeight = 22;
      }
    },
    didDrawCell: (data) => {
      if (data.column.index === 10 && data.cell.section === 'body') {
        const bill = bills[data.row.index];
        if (bill?.image) {
          try {
            const imageSize = 18;
            const x = data.cell.x + (data.cell.width - imageSize) / 2;
            const y = data.cell.y + (data.cell.height - imageSize) / 2;
            doc.addImage(bill.image, getImageFormatFromDataUrl(bill.image), x, y, imageSize, imageSize);
          } catch (error) {
            // Ignore image drawing errors and leave the cell blank.
          }
        }
      }
    },
  });
  const finalY = doc.lastAutoTable?.finalY || 24;
  const incomes = state.incomes.filter((income) => {
    const keys = getIncomeMonthYear(income.period);
    return keys && isMonthYearInRange(keys.month, keys.year, range);
  });
  const incomeRows = incomes.map((income) => [
    income.name,
    formatMoney(income.amount),
    income.period || '-',
    income.entryDate || '-',
  ]);

  if (incomeRows.length) {
    doc.setFontSize(12);
    doc.text('Income Details', 14, finalY + 14);
    doc.autoTable({
      head: [[ 'Source', 'Amount', 'Month / Year', 'Date' ]],
      body: incomeRows,
      startY: finalY + 18,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: 'ellipsize',
      },
      headStyles: { fillColor: '#2f6bf4', halign: 'center' },
      theme: 'grid',
      columnStyles: {
        1: { halign: 'right', cellWidth: 'auto' },
      },
    });
    const incomeTableEnd = doc.lastAutoTable?.finalY || finalY + 18;
    doc.setFontSize(10);
    doc.text(`Total Income: ${formatMoney(totalIncome)}`, 14, incomeTableEnd + 8);
  } else {
    doc.setFontSize(10);
    doc.text('No income entries found for the selected period.', 14, finalY + 14);
    doc.text(`Total Income: ${formatMoney(totalIncome)}`, 14, finalY + 22);
  }

  doc.save(`bills_${period.replace(/\s+/g, '_')}.pdf`);
};

const exportReportPdf = () => {
  const period = getSelectedPeriodLabel();
  const range = getSelectedDateRange();
  const { billTotal, loanTotal, incomeTotal } = getRangeTotals(range);
  const doc = new window.jspdf.jsPDF();
  doc.setFontSize(14);
  doc.text(`Report - ${period}`, 14, 18);
  doc.autoTable({
    head: [[ 'Metric', 'Total' ]],
    body: [
      ['Bills Total', formatMoneyNoPrecision(billTotal)],
      ['Income Total', formatMoneyNoPrecision(incomeTotal)],
      ['Loan Total', formatMoneyNoPrecision(loanTotal)],
    ],
    startY: 24,
    styles: { fontSize: 10 },
    headStyles: { fillColor: '#2f6bf4' },
    theme: 'striped',
  });
  doc.save(`report_${period.replace(/\s+/g, '_')}.pdf`);
};
const exportIncomeCsv = () => {
  const incomes = getFilteredIncomes();
  const rows = [
    ['Source', 'Amount', 'Month / Year', 'Date'],
    ...incomes.map((income) => [
      income.name,
      formatMoney(income.amount),
      income.period || '-',
      income.entryDate || '-',
    ]),
  ];
  exportCsv(`income_${getSelectedPeriodLabel().replace(/\s+/g, '_')}.csv`, rows);
};

const exportIncomePdf = () => {
  const incomes = getFilteredIncomes();
  const period = getSelectedPeriodLabel();
  const doc = new window.jspdf.jsPDF();
  doc.setFontSize(14);
  doc.text(`Income Report - ${period}`, 14, 18);
  const rows = incomes.map((income) => [
    income.name,
    formatMoneyNoPrecision(income.amount),
    income.period || '-',
    income.entryDate || '-',
  ]);
  doc.autoTable({
    head: [[ 'Source', 'Amt', 'Month', 'Date' ]],
    body: rows,
    startY: 24,
    styles: { fontSize: 9 },
    headStyles: { fillColor: '#2f6bf4' },
    theme: 'striped',
  });
  doc.save(`income_${period.replace(/\s+/g, '_')}.pdf`);
};

const exportInvestmentCsv = () => {
  const investments = getFilteredInvestments();
  const rows = [
    ['Plan', 'Target', 'Monthly', 'Notes'],
    ...investments.map((item) => [
      item.name,
      formatMoney(item.target),
      formatMoney(item.monthly),
      item.notes || '-',
    ]),
  ];
  exportCsv(`investment_${getSelectedPeriodLabel().replace(/\s+/g, '_')}.csv`, rows);
};

const exportInvestmentPdf = () => {
  const investments = getFilteredInvestments();
  const period = getSelectedPeriodLabel();
  const doc = new window.jspdf.jsPDF();
  doc.setFontSize(14);
  doc.text(`Investment Report - ${period}`, 14, 18);
  const rows = investments.map((item) => [
    item.name,
    formatMoneyNoPrecision(item.target),
    formatMoneyNoPrecision(item.monthly),
    item.notes || '-',
  ]);
  doc.autoTable({
    head: [[ 'Plan', 'Target', 'Monthly', 'Notes' ]],
    body: rows,
    startY: 24,
    styles: { fontSize: 9 },
    headStyles: { fillColor: '#2f6bf4' },
    theme: 'striped',
  });
  doc.save(`investment_${period.replace(/\s+/g, '_')}.pdf`);
};

const exportAssessmentCsv = () => {
  const assessments = getFilteredAssessments();
  const rows = [
    ['Name', 'Due Date', 'Status', 'Notes'],
    ...assessments.map((item) => [
      item.name,
      item.dueDate || '-',
      item.status,
      item.notes || '-',
    ]),
  ];
  exportCsv(`assessment_${getSelectedPeriodLabel().replace(/\s+/g, '_')}.csv`, rows);
};

const exportAssessmentPdf = () => {
  const assessments = getFilteredAssessments();
  const period = getSelectedPeriodLabel();
  const doc = new window.jspdf.jsPDF();
  doc.setFontSize(14);
  doc.text(`Assessment Report - ${period}`, 14, 18);
  const rows = assessments.map((item) => [
    item.name,
    item.dueDate || '-',
    item.status,
    item.notes || '-',
  ]);
  doc.autoTable({
    head: [[ 'Name', 'Due Date', 'Status', 'Notes' ]],
    body: rows,
    startY: 24,
    styles: { fontSize: 9 },
    headStyles: { fillColor: '#2f6bf4' },
    theme: 'striped',
  });
  doc.save(`assessment_${period.replace(/\s+/g, '_')}.pdf`);
};

const exportLoanCsv = () => {
  const loans = getFilteredLoans();
  const rows = [
    ['Loan Name', 'Amount', 'Planned Date', 'Completed Date', 'Status'],
    ...loans.map((loan) => [
      loan.name,
      formatMoney(loan.amount),
      loan.plannedDate || '-',
      loan.completedDate || '-',
      loan.status,
    ]),
  ];
  exportCsv(`loan_${getSelectedPeriodLabel().replace(/\s+/g, '_')}.csv`, rows);
};

const exportLoanPdf = () => {
  const loans = getFilteredLoans();
  const period = getSelectedPeriodLabel();
  const doc = new window.jspdf.jsPDF();
  doc.setFontSize(14);
  doc.text(`Loan Report - ${period}`, 14, 18);
  const rows = loans.map((loan) => [
    loan.name,
    formatMoneyNoPrecision(loan.amount),
    loan.plannedDate || '-',
    loan.completedDate || '-',
    loan.status,
  ]);
  doc.autoTable({
    head: [[ 'Loan', 'Amt', 'Planned', 'Done', 'Status' ]],
    body: rows,
    startY: 24,
    styles: { fontSize: 9 },
    headStyles: { fillColor: '#2f6bf4' },
    theme: 'striped',
  });
  doc.save(`loan_${period.replace(/\s+/g, '_')}.pdf`);
};
const updateAllFilterDropdowns = () => {
  populateItemFilterDropdown();
};

const updateFilterRowVisibility = (activeTabId) => {
  selectors.itemFilterRow.style.display = ['bills', 'income', 'investments', 'assets', 'loans'].includes(activeTabId) ? '' : 'none';
  selectors.reportFilterRow.style.display = activeTabId === 'reports' ? '' : 'none';
  if (selectors.itemFilterRow.style.display !== 'none') {
    const labels = {
      bills: 'Bill Name',
      income: 'Income Source',
      investments: 'Investment',
      assets: 'Asset',
      loans: 'Loan Name',
    };
    selectors.itemFilterLabel.textContent = labels[activeTabId] || 'Filter Item';
  }
};


const renderDashboard = () => {
  const totalBills = state.bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
  const totalIncome = state.incomes.reduce((sum, inc) => sum + Number(inc.amount || 0), 0);
  const completedCount = state.bills.filter((bill) => bill.status === 'Completed').length;
  const { month, year } = getSelectedDateKeys();
  const monthlyBills = state.bills.reduce((sum, bill) => {
    const keys = getBillMonthYear(bill.plannedDate);
    return keys && keys.month === month && keys.year === year ? sum + Number(bill.amount || 0) : sum;
  }, 0);
  const yearlyBills = state.bills.reduce((sum, bill) => {
    const keys = getBillMonthYear(bill.plannedDate);
    return keys && keys.year === year ? sum + Number(bill.amount || 0) : sum;
  }, 0);
  const monthlyIncome = state.incomes.reduce((sum, income) => {
    const keys = getIncomeMonthYear(income.period);
    return keys && keys.month === month && keys.year === year ? sum + Number(income.amount || 0) : sum;
  }, 0);
  const yearlyIncome = state.incomes.reduce((sum, income) => {
    const keys = getIncomeMonthYear(income.period);
    return keys && keys.year === year ? sum + Number(income.amount || 0) : sum;
  }, 0);
  selectors.billsSummary.textContent = formatMoney(totalBills);
  selectors.monthlyBillsSummary.textContent = formatMoney(monthlyBills);
  selectors.yearlyBillsSummary.textContent = formatMoney(yearlyBills);
  selectors.incomeSummary.textContent = formatMoney(totalIncome);
  selectors.monthlyIncomeSummary.textContent = formatMoney(monthlyIncome);
  selectors.yearlyIncomeSummary.textContent = formatMoney(yearlyIncome);
  selectors.balanceSummary.textContent = formatMoney(totalIncome - totalBills);
  selectors.completedSummary.textContent = completedCount;
};

const renderBills = () => {
  selectors.pendingBillTableBody.innerHTML = '';
  selectors.completedBillTableBody.innerHTML = '';
  const range = getSelectedDateRange();
  const bills = getFilteredBills();
  bills.forEach((bill) => {
    const keys = getBillMonthYear(bill.plannedDate);
    if (!keys) {
      return;
    }

    const row = document.createElement('tr');
    const imageCell = document.createElement('td');
    if (bill.image) {
      const img = document.createElement('img');
      img.src = bill.image;
      img.alt = bill.name;
      img.className = 'bill-image';
      imageCell.appendChild(img);
    } else {
      imageCell.textContent = '-';
    }

    row.innerHTML = `
      <td>${bill.name}</td>
      <td>${bill.category}</td>
      <td>${bill.repeat}</td>
      <td>${formatMoney(bill.amount)}</td>
      <td>${formatMoney(getBillRangeAmount(bill, range))}</td>
      <td>${formatMonthLabel(bill.plannedDate)}</td>
      <td>${bill.plannedDate || '-'}</td>
      <td>${bill.completedDate || '-'}</td>
      <td></td>
      <td>${bill.incomeSource}</td>
    `;
    const statusCell = row.querySelector('td:nth-child(9)');
    statusCell.appendChild(createBadge(bill.status));
    row.appendChild(imageCell);
    row.insertCell(-1).textContent = bill.remarks || '-';

    const actionsCell = document.createElement('td');
    actionsCell.className = 'actions';
    actionsCell.appendChild(createActionButton('Edit', 'edit-btn', () => editBill(bill.id)));
    actionsCell.appendChild(createActionButton('Delete', 'delete-btn', () => deleteBill(bill.id)));
    row.appendChild(actionsCell);

    if (bill.status === 'Completed') {
      selectors.completedBillTableBody.appendChild(row);
    } else {
      selectors.pendingBillTableBody.appendChild(row);
    }
  });
};

const renderIncome = () => {
  selectors.incomeTableBody.innerHTML = '';
  const incomes = getFilteredIncomes();
  incomes.forEach((income) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${income.name}</td>
      <td>${formatMoney(income.amount)}</td>
      <td>${income.period || '-'}</td>
      <td>${income.entryDate || '-'}</td>
    `;
    const actionsCell = document.createElement('td');
    actionsCell.className = 'actions';
    actionsCell.appendChild(createActionButton('Edit', 'edit-btn', () => editIncome(income.id)));
    actionsCell.appendChild(createActionButton('Delete', 'delete-btn', () => deleteIncome(income.id)));
    row.appendChild(actionsCell);
    selectors.incomeTableBody.appendChild(row);
  });
};

const renderInvestments = () => {
  selectors.investmentTableBody.innerHTML = '';
  const investments = getFilteredInvestments();
  investments.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${formatMoney(item.target)}</td>
      <td>${formatMoney(item.monthly)}</td>
      <td>${item.notes || '-'}</td>
    `;
    const actionsCell = document.createElement('td');
    actionsCell.className = 'actions';
    actionsCell.appendChild(createActionButton('Edit', 'edit-btn', () => editInvestment(item.id)));
    actionsCell.appendChild(createActionButton('Delete', 'delete-btn', () => deleteInvestment(item.id)));
    row.appendChild(actionsCell);
    selectors.investmentTableBody.appendChild(row);
  });
};

const renderAssessments = () => {
  selectors.assessmentTableBody.innerHTML = '';
  const assessments = getFilteredAssessments();
  assessments.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.dueDate || '-'}</td>
      <td></td>
      <td>${item.notes || '-'}</td>
    `;
    row.querySelector('td:nth-child(3)').appendChild(createBadge(item.status));
    const actionsCell = document.createElement('td');
    actionsCell.className = 'actions';
    actionsCell.appendChild(createActionButton('Edit', 'edit-btn', () => editAssessment(item.id)));
    actionsCell.appendChild(createActionButton('Delete', 'delete-btn', () => deleteAssessment(item.id)));
    row.appendChild(actionsCell);
    selectors.assessmentTableBody.appendChild(row);
  });
};

const renderLoans = () => {
  selectors.loanTableBody.innerHTML = '';
  const loans = getFilteredLoans();
  loans.forEach((loan) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${loan.name}</td>
      <td>${formatMoney(loan.amount)}</td>
      <td>${loan.plannedDate || '-'}</td>
      <td>${loan.completedDate || '-'}</td>
      <td></td>
    `;
    row.querySelector('td:nth-child(5)').appendChild(createBadge(loan.status));
    selectors.loanTableBody.appendChild(row);
  });
};

const renderReports = () => {
  const range = getSelectedDateRange();
  const selectedLabel = getSelectedPeriodLabel();
  const { billTotal, loanTotal, incomeTotal, completedCount, pendingCount } = getRangeTotals(range);
  const yearlyCompletedCount = state.bills.reduce((count, bill) => {
    const keys = getBillMonthYear(bill.plannedDate);
    return keys && keys.year === range.end.year && bill.status === 'Completed' ? count + 1 : count;
  }, 0);
  const yearlyPendingCount = state.bills.reduce((count, bill) => {
    const keys = getBillMonthYear(bill.plannedDate);
    return keys && keys.year === range.end.year && bill.status !== 'Completed' ? count + 1 : count;
  }, 0);

  selectors.reportSelectedPeriod.textContent = selectedLabel;
  selectors.reportMonthlyBills.textContent = formatMoney(billTotal);
  selectors.reportMonthlyIncome.textContent = formatMoney(incomeTotal);
  selectors.reportMonthlyLoans.textContent = formatMoney(loanTotal);
  selectors.reportYearlyBills.textContent = formatMoney(billTotal);
  selectors.reportYearlyIncome.textContent = formatMoney(incomeTotal);
  selectors.reportYearlyLoans.textContent = formatMoney(loanTotal);
  selectors.reportYearlyCompleted.textContent = yearlyCompletedCount;
  selectors.reportMonthBillTotal.textContent = formatMoney(billTotal);
  selectors.reportMonthIncomeTotal.textContent = formatMoney(incomeTotal);
  selectors.reportMonthLoanTotal.textContent = formatMoney(loanTotal);
  selectors.reportMonthCompletedCount.textContent = completedCount;
  selectors.reportMonthPendingCount.textContent = pendingCount;
  selectors.reportYearBillTotal.textContent = formatMoney(billTotal);
  selectors.reportYearIncomeTotal.textContent = formatMoney(incomeTotal);
  selectors.reportYearLoanTotal.textContent = formatMoney(loanTotal);
  selectors.reportYearCompletedCount.textContent = yearlyCompletedCount;
  selectors.reportYearPendingCount.textContent = yearlyPendingCount;
};

const renderAll = () => {
  renderDashboard();
  renderBills();
  renderIncome();
  renderInvestments();
  renderAssessments();
  renderLoans();
  renderReports();
};

const getFormData = (form) => {
  return new FormData(form);
};

const resetBillForm = () => {
  const form = selectors.billForm;
  form.reset();
  form.billId.value = '';
  form.plannedDate.value = getTodayIso();
  form.completedDate.value = '';
  updateRepeatNameSuggestions();
  form.querySelector('button[type="submit"]').textContent = 'Add Bill';
};

const resetIncomeForm = () => {
  const form = selectors.incomeForm;
  form.reset();
  form.incomeId.value = '';
  form.incomeMonth.value = getCurrentMonthYear();
  form.incomeDate.value = getTodayIso();
  form.querySelector('button[type="submit"]').textContent = 'Add Income';
};

const resetInvestmentForm = () => {
  const form = selectors.investmentForm;
  form.reset();
  form.querySelector('button[type="submit"]').textContent = 'Add Investment';
};

const resetAssessmentForm = () => {
  const form = selectors.assessmentForm;
  form.reset();
  form.assessmentDue.value = getTodayIso();
  form.querySelector('button[type="submit"]').textContent = 'Add Assessment';
};

const populateBillForm = (bill) => {
  const form = selectors.billForm;
  form.billId.value = bill.id;
  form.billName.value = bill.name;
  form.billCategory.value = bill.category;
  form.billRepeat.value = bill.repeat;
  updateRepeatNameSuggestions();
  form.billAmount.value = bill.amount;
  form.plannedDate.value = bill.plannedDate;
  form.completedDate.value = bill.completedDate;
  form.billStatus.value = bill.status;
  form.incomeSource.value = bill.incomeSource;
  form.billRemarks.value = bill.remarks;
  form.querySelector('button[type="submit"]').textContent = 'Update Bill';
};

const populateIncomeForm = (income) => {
  const form = selectors.incomeForm;
  form.incomeId.value = income.id;
  form.incomeName.value = income.name;
  form.incomeAmount.value = income.amount;
  form.incomeMonth.value = income.period;
  form.incomeDate.value = income.entryDate;
  form.querySelector('button[type="submit"]').textContent = 'Update Income';
};

const populateInvestmentForm = (item) => {
  const form = selectors.investmentForm;
  form.investmentName.value = item.name;
  form.investmentTarget.value = item.target;
  form.investmentMonthly.value = item.monthly;
  form.investmentNotes.value = item.notes;
  form.querySelector('button[type="submit"]').textContent = 'Update Investment';
};

const populateAssessmentForm = (item) => {
  const form = selectors.assessmentForm;
  form.assessmentName.value = item.name;
  form.assessmentDue.value = item.dueDate;
  form.assessmentStatus.value = item.status;
  form.assessmentNotes.value = item.notes;
  form.querySelector('button[type="submit"]').textContent = 'Update Assessment';
};

const handleBillForm = async (event) => {
  event.preventDefault();
  const form = event.target;
  const data = getFormData(form);
  const editId = data.get('billId');

  const billNameValue = data.get('billName');

  const imageFile = data.get('billImage');
  let image = '';
  let imageName = '';
  if (imageFile && imageFile.size > 0) {
    image = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(imageFile);
    });
    imageName = makeReceiptImageFilename(data.get('billName'), data.get('plannedDate'), imageFile.name, image);
  }

  const status = data.get('billStatus');
  const completedDate = status === 'Completed' ? data.get('completedDate') || new Date().toISOString().slice(0, 10) : '';

  if (editId) {
    const bill = state.bills.find((item) => item.id === Number(editId));
    if (bill) {
      bill.name = billNameValue;
      bill.category = data.get('billCategory');
      bill.repeat = data.get('billRepeat');
      bill.amount = Number(data.get('billAmount') || 0);
      bill.plannedDate = data.get('plannedDate');
      bill.status = status;
      bill.completedDate = completedDate;
      bill.incomeSource = data.get('incomeSource');
      bill.remarks = data.get('billRemarks');
      if (image) {
        bill.image = image;
        bill.imageName = imageName;
      }
    }
  } else {
    state.bills.push({
      id: Date.now(),
      name: billNameValue,
      category: data.get('billCategory'),
      repeat: data.get('billRepeat'),
      amount: Number(data.get('billAmount') || 0),
      plannedDate: data.get('plannedDate'),
      completedDate,
      status,
      incomeSource: data.get('incomeSource'),
      image,
      imageName,
      remarks: data.get('billRemarks'),
    });
  }

  saveState();
  updateAllFilterDropdowns();
  renderAll();
  resetBillForm();
};

const getRepeatBillNames = () => {
  return Array.from(new Set(
    state.bills
      .filter((bill) => normalizeValue(bill.repeat) !== normalizeValue('One-time'))
      .map((bill) => bill.name)
      .filter(Boolean)
  )).sort();
};

const updateRepeatNameSuggestions = () => {
  const repeatValue = selectors.billForm.billRepeat.value;
  const tallies = getRepeatBillNames();
  if (repeatValue && repeatValue !== 'One-time' && tallies.length) {
    selectors.billNameSuggestions.style.display = 'block';
    selectors.billNameSuggestions.innerHTML = tallies
      .map((name) => `<div class="suggestion-item" data-value="${escapeHtml(name)}">${escapeHtml(name)}</div>`)
      .join('');
  } else {
    selectors.billNameSuggestions.style.display = 'none';
    selectors.billNameSuggestions.innerHTML = '';
  }
};

const hideBillNameSuggestions = () => {
  selectors.billNameSuggestions.style.display = 'none';
};

const showBillNameSuggestions = () => {
  if (selectors.billNameSuggestions.innerHTML.trim()) {
    selectors.billNameSuggestions.style.display = 'block';
  }
};

const handleIncomeForm = (event) => {
  event.preventDefault();
  const form = event.target;
  const data = getFormData(form);
  const editId = data.get('incomeId');
  const incomeItem = {
    id: editId ? Number(editId) : Date.now(),
    name: data.get('incomeName'),
    amount: Number(data.get('incomeAmount') || 0),
    period: data.get('incomeMonth'),
    entryDate: data.get('incomeDate'),
  };

  if (editId) {
    const existing = state.incomes.find((item) => item.id === Number(editId));
    if (existing) {
      Object.assign(existing, incomeItem);
    }
  } else {
    state.incomes.push(incomeItem);
  }

  saveState();
  updateAllFilterDropdowns();
  renderAll();
  resetIncomeForm();
};

const handleInvestmentForm = (event) => {
  event.preventDefault();
  const data = getFormData(event.target);
  const editId = data.get('investmentId');
  const investmentItem = {
    id: editId ? Number(editId) : Date.now(),
    name: data.get('investmentName'),
    target: Number(data.get('investmentTarget') || 0),
    monthly: Number(data.get('investmentMonthly') || 0),
    notes: data.get('investmentNotes'),
  };

  if (editId) {
    const existing = state.investments.find((item) => item.id === Number(editId));
    if (existing) {
      Object.assign(existing, investmentItem);
    }
  } else {
    state.investments.push(investmentItem);
  }
  saveState();
  updateAllFilterDropdowns();
  renderAll();
  resetInvestmentForm();
};

const handleAssessmentForm = (event) => {
  event.preventDefault();
  const data = getFormData(event.target);
  const editId = data.get('assessmentId');
  const assessmentItem = {
    id: editId ? Number(editId) : Date.now(),
    name: data.get('assessmentName'),
    dueDate: data.get('assessmentDue'),
    status: data.get('assessmentStatus'),
    notes: data.get('assessmentNotes'),
  };

  if (editId) {
    const existing = state.assessments.find((item) => item.id === Number(editId));
    if (existing) {
      Object.assign(existing, assessmentItem);
    }
  } else {
    state.assessments.push(assessmentItem);
  }
  saveState();
  updateAllFilterDropdowns();
  renderAll();
  resetAssessmentForm();
};

const editBill = (id) => {
  const bill = state.bills.find((item) => item.id === id);
  if (bill) {
    populateBillForm(bill);
    document.querySelector('.tab-button[data-tab="bills"]').click();
  }
};

const deleteBill = (id) => {
  state.bills = state.bills.filter((item) => item.id !== id);
  saveState();
  renderAll();
};

const editIncome = (id) => {
  const income = state.incomes.find((item) => item.id === id);
  if (income) {
    populateIncomeForm(income);
    document.querySelector('.tab-button[data-tab="income"]').click();
  }
};

const deleteIncome = (id) => {
  state.incomes = state.incomes.filter((item) => item.id !== id);
  saveState();
  renderAll();
};

const editInvestment = (id) => {
  const investment = state.investments.find((item) => item.id === id);
  if (investment) {
    populateInvestmentForm(investment);
    document.querySelector('.tab-button[data-tab="investments"]').click();
  }
};

const deleteInvestment = (id) => {
  state.investments = state.investments.filter((item) => item.id !== id);
  saveState();
  renderAll();
};

const editAssessment = (id) => {
  const assessment = state.assessments.find((item) => item.id === id);
  if (assessment) {
    populateAssessmentForm(assessment);
    document.querySelector('.tab-button[data-tab="assets"]').click();
  }
};

const deleteAssessment = (id) => {
  state.assessments = state.assessments.filter((item) => item.id !== id);
  saveState();
  renderAll();
};

const getMobileTabMenu = () => document.getElementById('mobile-tab-menu');

const buildMobileTabMenu = () => {
  const menu = getMobileTabMenu();
  if (!menu) return;
  const tabs = Array.from(document.querySelectorAll('.tab-button')).filter((b) => b.dataset.tab !== 'home');
  menu.innerHTML = '';
  tabs.forEach((b) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'mobile-menu-item';
    item.dataset.tab = b.dataset.tab;
    const label = b.querySelector('.tab-label')?.textContent?.trim() || b.textContent.trim();
    item.textContent = label;
    item.addEventListener('click', () => {
      setActiveTab(item.dataset.tab);
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      const homeBtn = document.querySelector('.tab-button[data-tab="home"]');
      if (homeBtn) homeBtn.setAttribute('aria-expanded', 'false');
      updateFilterRowVisibility(item.dataset.tab);
      updateAllFilterDropdowns();
      renderAll();
    });
    menu.appendChild(item);
  });
};

// close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  const menu = getMobileTabMenu();
  if (!menu || !menu.classList.contains('open')) return;
  const nav = document.querySelector('.header-tabs');
  if (nav && (nav.contains(e.target) || menu.contains(e.target))) return;
  menu.classList.remove('open');
  menu.setAttribute('aria-hidden', 'true');
  const homeBtn = document.querySelector('.tab-button[data-tab="home"]');
  if (homeBtn) homeBtn.setAttribute('aria-expanded', 'false');
});

const setupTabs = () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      // Home toggles the mobile tab menu (shows names)
      if (tabId === 'home') {
        const menu = getMobileTabMenu();
        if (menu) {
          const isOpen = menu.classList.toggle('open');
          menu.setAttribute('aria-hidden', (!isOpen).toString());
          const homeBtn = document.querySelector('.tab-button[data-tab="home"]');
          if (homeBtn) homeBtn.setAttribute('aria-expanded', String(isOpen));
          if (isOpen) buildMobileTabMenu();
        }
        // keep current active tab visually and just show menu
        return;
      }

      setActiveTab(tabId);
      tabPanels.forEach((panel) => panel.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
      updateFilterRowVisibility(tabId);
      updateAllFilterDropdowns();
      renderAll();
    });
  });
  updateFilterRowVisibility('bills');
};

const initializePeriodFilters = () => {
  const defaultYear = new Date().getFullYear();
  const defaultMonth = new Date().getMonth() + 1;
  selectors.fromMonthFilter.value = String(defaultMonth);
  selectors.toMonthFilter.value = String(defaultMonth);
  selectors.fromYearFilter.value = String(defaultYear);
  selectors.toYearFilter.value = String(defaultYear);
  selectors.fromYearFilter.min = String(defaultYear - 10);
  selectors.fromYearFilter.max = String(defaultYear + 10);
  selectors.toYearFilter.min = String(defaultYear - 10);
  selectors.toYearFilter.max = String(defaultYear + 10);
};

const initialize = () => {
  if (!isAuthenticated()) {
    showLoginModal();
    return;
  }
  if (isAppInitialized) {
    // already initialized; just reset inactivity timer
    startInactivityTimer();
    return;
  }
  isAppInitialized = true;
  loadState();
  initializePeriodFilters();
  resetBillForm();
  resetIncomeForm();
  resetAssessmentForm();
  updateAllFilterDropdowns();
  setupTabs();
  selectors.billForm.addEventListener('submit', handleBillForm);
  selectors.incomeForm.addEventListener('submit', handleIncomeForm);
  selectors.investmentForm.addEventListener('submit', handleInvestmentForm);
  selectors.assessmentForm.addEventListener('submit', handleAssessmentForm);
  selectors.billForm.billRepeat.addEventListener('change', updateRepeatNameSuggestions);
  selectors.fromMonthFilter.addEventListener('change', () => {
    updateAllFilterDropdowns();
  });
  selectors.fromYearFilter.addEventListener('change', () => {
    updateAllFilterDropdowns();
  });
  selectors.toMonthFilter.addEventListener('change', () => {
    updateAllFilterDropdowns();
  });
  selectors.toYearFilter.addEventListener('change', () => {
    updateAllFilterDropdowns();
  });
  selectors.applyFilterBtn.addEventListener('click', () => {
    updateAllFilterDropdowns();
    renderAll();
  });
  selectors.billForm.billRepeat.addEventListener('change', updateRepeatNameSuggestions);
  selectors.billName.addEventListener('focus', showBillNameSuggestions);
  selectors.billName.addEventListener('input', () => {
    if (selectors.billForm.billRepeat.value !== 'One-time') {
      updateRepeatNameSuggestions();
    }
  });
  selectors.billName.addEventListener('blur', () => {
    setTimeout(hideBillNameSuggestions, 150);
  });
  selectors.billNameSuggestions.addEventListener('click', (event) => {
    const item = event.target.closest('.suggestion-item');
    if (item) {
      selectors.billName.value = item.dataset.value || item.textContent;
      hideBillNameSuggestions();
    }
  });
  selectors.exportBillsExcelBtn.addEventListener('click', exportBillsCsv);
  selectors.exportBillsPdfBtn.addEventListener('click', exportBillsPdf);
  selectors.exportIncomeExcelBtn.addEventListener('click', exportIncomeCsv);
  selectors.exportIncomePdfBtn.addEventListener('click', exportIncomePdf);
  selectors.exportInvestmentExcelBtn.addEventListener('click', exportInvestmentCsv);
  selectors.exportInvestmentPdfBtn.addEventListener('click', exportInvestmentPdf);
  selectors.exportAssessmentExcelBtn.addEventListener('click', exportAssessmentCsv);
  selectors.exportAssessmentPdfBtn.addEventListener('click', exportAssessmentPdf);
  selectors.exportLoanExcelBtn.addEventListener('click', exportLoanCsv);
  selectors.exportLoanPdfBtn.addEventListener('click', exportLoanPdf);
  selectors.exportReportExcelBtn.addEventListener('click', exportReportCsv);
  selectors.exportReportPdfBtn.addEventListener('click', exportReportPdf);
  selectors.exportBackupExcelBtn.addEventListener('click', exportBackupExcel);
  selectors.importBackupExcelBtn.addEventListener('click', requestImportBackup);
  selectors.importBackupInput.addEventListener('change', handleImportBackup);
  renderAll();
};

initialize();
