/**
 * BANK MANAGEMENT SYSTEM V2.0 - MAIN DASHBOARD MODULE (EXTENDED)
 */

let state = {
  user: null,
  master: { banks: [], groups: [], statuses: [], jenisBanks: ['BANK DEPO', 'BANK WD', 'BANK KAS'] },
  pagination: { limit: 50, offset: 0, total: 0, page: 1 },
  filters: { search: '', bank: '', jenis: '', group: '', status: '' },
  currentData: [],
  selectedRecord: null,
  charts: { bank: null, group: null, jenis: null }
};

let searchDebounceTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!AuthService.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  state.user = AuthService.getUser();
  initUI();
  setupEventListeners();

  if (!CONFIG.API_URL) {
    showSettingsModal();
    return;
  }

  await loadMasterData();
  await refreshDashboard();
});

function initUI() {
  const user = state.user;
  document.getElementById('user-display-name').textContent = user.username;
  document.getElementById('user-role-badge').textContent = user.role;

  const badgeEl = document.getElementById('user-role-badge');
  if (user.role === 'LEADER') badgeEl.className = 'badge badge-rose';
  else if (user.role === 'KAPTEN') badgeEl.className = 'badge badge-indigo';
  else if (user.role === 'CS') badgeEl.className = 'badge badge-amber';
  else badgeEl.className = 'badge badge-emerald';

  const perms = getRolePermissions(user.role);

  if (!perms.canAdd) document.getElementById('btn-add-data')?.classList.add('d-none');
  if (!perms.canImport) document.getElementById('btn-import-data')?.classList.add('d-none');
  if (!perms.canExport) document.getElementById('btn-export-dropdown')?.classList.add('d-none');
  if (!perms.canManageUsers) document.getElementById('nav-users')?.classList.add('d-none');
  if (!perms.canAuditLog) document.getElementById('nav-logs')?.classList.add('d-none');
  if (!perms.canManageIp) document.getElementById('nav-ip')?.classList.add('d-none');
}

function setupEventListeners() {
  document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      switchTab(item.getAttribute('data-tab'));
    });
  });

  document.getElementById('input-search').addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      state.filters.search = e.target.value.trim();
      state.pagination.offset = 0;
      fetchTableData();
    }, 300);
  });

  document.getElementById('select-filter-bank').addEventListener('change', (e) => {
    state.filters.bank = e.target.value;
    state.pagination.offset = 0;
    fetchTableData();
  });

  document.getElementById('select-filter-jenis').addEventListener('change', (e) => {
    state.filters.jenis = e.target.value;
    state.pagination.offset = 0;
    fetchTableData();
  });

  document.getElementById('select-filter-group').addEventListener('change', (e) => {
    state.filters.group = e.target.value;
    state.pagination.offset = 0;
    fetchTableData();
  });

  document.getElementById('select-filter-status').addEventListener('change', (e) => {
    state.filters.status = e.target.value;
    state.pagination.offset = 0;
    fetchTableData();
  });

  document.getElementById('select-limit').addEventListener('change', (e) => {
    state.pagination.limit = parseInt(e.target.value);
    state.pagination.offset = 0;
    fetchTableData();
  });

  document.getElementById('btn-theme-toggle').addEventListener('click', () => {
    AuthService.toggleTheme();
  });

  document.getElementById('btn-logout').addEventListener('click', () => {
    AuthService.logout();
  });
}

function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('d-none'));
  const target = document.getElementById(`tab-${tab}`);
  if (target) target.classList.remove('d-none');

  if (tab === 'dashboard') refreshDashboard();
  if (tab === 'users') loadUsersList();
  if (tab === 'logs') loadActivityLogs();
  if (tab === 'ip') loadIpSettings();
}

async function loadMasterData() {
  try {
    const res = await ApiService.getMasterData();
    if (res.status === 'success') {
      state.master = res.master;
      populateMasterDropdowns();
    }
  } catch (e) {
    console.error('Failed to load master data', e);
  }
}

function populateMasterDropdowns() {
  const bankFilter = document.getElementById('select-filter-bank');
  const groupFilter = document.getElementById('select-filter-group');

  bankFilter.innerHTML = '<option value="">Semua Bank</option>';
  state.master.banks.forEach(b => bankFilter.innerHTML += `<option value="${b}">${b}</option>`);

  groupFilter.innerHTML = '<option value="">Semua Group</option>';
  state.master.groups.forEach(g => groupFilter.innerHTML += `<option value="${g}">${g}</option>`);
}

async function refreshDashboard() {
  try {
    const statsRes = await ApiService.getDashboardStats();
    if (statsRes.status === 'success') {
      renderStatsCards(statsRes.stats);
      renderCharts(statsRes.stats);
    }
    await fetchTableData();
  } catch (e) {
    console.error('Error refreshing dashboard', e);
  }
}

function renderStatsCards(stats) {
  document.getElementById('stat-total-data').textContent = formatNumber(stats.totalData);
  document.getElementById('stat-total-bank').textContent = formatNumber(stats.totalBankCount);
  document.getElementById('stat-total-user').textContent = formatNumber(stats.totalUsers);
  document.getElementById('stat-total-aktif').textContent = formatNumber(stats.totalAktif);
  document.getElementById('stat-total-nonaktif').textContent = formatNumber(stats.totalNonaktif);
  document.getElementById('stat-today-data').textContent = formatNumber(stats.todayCount);
}

function renderCharts(stats) {
  const ctxBank = document.getElementById('chart-bank-breakdown')?.getContext('2d');
  if (ctxBank) {
    if (state.charts.bank) state.charts.bank.destroy();
    state.charts.bank = new Chart(ctxBank, {
      type: 'bar',
      data: {
        labels: Object.keys(stats.bankBreakdown),
        datasets: [{ label: 'Jumlah Rekening', data: Object.values(stats.bankBreakdown), backgroundColor: '#6366f1', borderRadius: 8 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }

  const ctxGroup = document.getElementById('chart-group-breakdown')?.getContext('2d');
  if (ctxGroup) {
    if (state.charts.group) state.charts.group.destroy();
    state.charts.group = new Chart(ctxGroup, {
      type: 'doughnut',
      data: {
        labels: Object.keys(stats.groupBreakdown),
        datasets: [{ data: Object.values(stats.groupBreakdown), backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#f43f5e'] }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}

async function fetchTableData() {
  const tbody = document.getElementById('table-bank-body');
  tbody.innerHTML = `<tr><td colspan="10" class="text-center py-4"><span class="skeleton" style="width:100%; height:30px;"></span></td></tr>`;

  try {
    const params = {
      limit: state.pagination.limit,
      offset: state.pagination.offset,
      search: state.filters.search,
      filterBank: state.filters.bank,
      filterJenis: state.filters.jenis,
      filterGroup: state.filters.group,
      filterStatus: state.filters.status
    };

    const res = await ApiService.getBankList(params);
    if (res.status === 'success') {
      state.currentData = res.items;
      state.pagination.total = res.total;
      renderTableData(res.items);
      renderPaginationControls();
    }
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center text-danger py-4">Gagal memuat data. Periksa koneksi API.</td></tr>`;
  }
}

function calculateRemainingDays(expireDateStr) {
  if (!expireDateStr) return { days: null, text: 'Tidak Diset', badgeClass: 'badge-indigo' };
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const exp = new Date(expireDateStr);
    exp.setHours(0,0,0,0);

    const diffTime = exp - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { days: diffDays, text: 'Expired', badgeClass: 'badge-rose' };
    if (diffDays === 0) return { days: 0, text: 'Masa Aktif Habis Hari Ini', badgeClass: 'badge-rose' };
    if (diffDays <= 7) return { days: diffDays, text: `Sisa ${diffDays} Hari`, badgeClass: 'badge-amber' };
    return { days: diffDays, text: `Sisa ${diffDays} Hari`, badgeClass: 'badge-emerald' };
  } catch (e) {
    return { days: null, text: expireDateStr, badgeClass: 'badge-indigo' };
  }
}

function renderTableData(items) {
  const tbody = document.getElementById('table-bank-body');
  if (!items || items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted py-4">Tidak ada data ditemukan</td></tr>`;
    return;
  }

  const rowsHtml = items.map((item, index) => {
    const rowNum = state.pagination.offset + index + 1;
    let badgeClass = 'badge-emerald';
    if (item.STATUS === 'NONAKTIF' || item.STATUS === 'SUSPENDED') badgeClass = 'badge-rose';
    else if (item.STATUS === 'REK CABUT KAS 1') badgeClass = 'badge-rose';
    else if (item.STATUS === 'PENDING') badgeClass = 'badge-amber';
    else if (item.STATUS === 'LIMIT') badgeClass = 'badge-indigo';

    let jenisBadge = 'badge-indigo';
    if (item.JENIS_BANK === 'BANK DEPO') jenisBadge = 'badge-emerald';
    else if (item.JENIS_BANK === 'BANK WD') jenisBadge = 'badge-cyan';
    else if (item.JENIS_BANK === 'BANK KAS') jenisBadge = 'badge-amber';

    const expInfo = calculateRemainingDays(item.TANGGAL_EXPIRE);

    return `
      <tr onclick="openBankDetailModal('${item.ID}')">
        <td class="sticky-col">${rowNum}</td>
        <td>
          <div class="d-flex align-items-center gap-2">
            ${item.LOGO_URL ? `<img src="${item.LOGO_URL}" style="width:20px; height:20px; object-fit:contain;">` : ''}
            <b class="text-accent">${item.BANK || '-'}</b>
          </div>
        </td>
        <td><span class="badge ${jenisBadge}">${item.JENIS_BANK || 'BANK DEPO'}</span></td>
        <td><span class="badge badge-indigo">${item.GROUP || '-'}</span></td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <span class="text-mono font-bold">${item.NO_REKENING || '-'}</span>
            <button class="btn btn-icon btn-outline btn-xs" onclick="event.stopPropagation(); copyText('${item.NO_REKENING}')" title="Copy Rekening">
              <i data-lucide="copy"></i>
            </button>
          </div>
        </td>
        <td><b>${item.NAMA_REKENING || '-'}</b></td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <span>${item.NO_HP || '-'}</span>
            <button class="btn btn-icon btn-outline btn-xs" onclick="event.stopPropagation(); copyText('${item.NO_HP}')" title="Copy HP">
              <i data-lucide="phone"></i>
            </button>
          </div>
        </td>
        <td><span class="badge ${badgeClass}">${item.STATUS}</span></td>
        <td><span class="badge ${expInfo.badgeClass}">${expInfo.text}</span></td>
        <td>
          <button class="btn btn-xs btn-outline" onclick="event.stopPropagation(); openBankDetailModal('${item.ID}')">Detail</button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = rowsHtml;
  if (window.lucide) lucide.createIcons();
}

function renderPaginationControls() {
  const total = state.pagination.total;
  const limit = state.pagination.limit;
  const offset = state.pagination.offset;

  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(offset + limit, total);
  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.floor(offset / limit) + 1;

  document.getElementById('pagination-info').textContent = `Menampilkan ${start}-${end} dari ${formatNumber(total)} data (Halaman ${currentPage}/${totalPages})`;

  const btnPrev = document.getElementById('btn-prev-page');
  const btnNext = document.getElementById('btn-next-page');

  btnPrev.disabled = offset === 0;
  btnNext.disabled = offset + limit >= total;

  btnPrev.onclick = () => {
    if (offset > 0) {
      state.pagination.offset -= limit;
      fetchTableData();
    }
  };

  btnNext.onclick = () => {
    if (offset + limit < total) {
      state.pagination.offset += limit;
      fetchTableData();
    }
  };
}

/**
 * Centered Popup Modal Detail View
 */
function openBankDetailModal(id) {
  const record = state.currentData.find(r => r.ID === id);
  if (!record) return;

  state.selectedRecord = record;

  document.getElementById('detail-modal-bank').textContent = record.BANK;
  document.getElementById('detail-modal-jenis').textContent = record.JENIS_BANK || 'BANK DEPO';
  document.getElementById('detail-modal-group').textContent = record.GROUP || '-';
  document.getElementById('detail-modal-no-rek').textContent = record.NO_REKENING || '-';
  document.getElementById('detail-modal-nama-rek').textContent = record.NAMA_REKENING || '-';
  document.getElementById('detail-modal-no-hp').textContent = record.NO_HP || '-';
  document.getElementById('detail-modal-sim-info').textContent = record.SIM_CARD_INFO || 'SIM 1';
  document.getElementById('detail-modal-user-ib').textContent = record.USER_ID_IB || '-';
  document.getElementById('detail-modal-pass-ib').textContent = record.PASSWORD_IB || '-';
  document.getElementById('detail-modal-status').textContent = record.STATUS;
  document.getElementById('detail-modal-tgl-aktif').textContent = record.TANGGAL_AKTIF || '-';
  document.getElementById('detail-modal-tgl-expire').textContent = record.TANGGAL_EXPIRE || '-';
  document.getElementById('detail-modal-catatan').textContent = record.CATATAN || 'Tidak ada catatan';

  const expInfo = calculateRemainingDays(record.TANGGAL_EXPIRE);
  const expBadgeEl = document.getElementById('detail-modal-exp-badge');
  expBadgeEl.textContent = expInfo.text;
  expBadgeEl.className = `badge ${expInfo.badgeClass}`;

  // Logo Rendering
  const logoImg = document.getElementById('detail-modal-logo-img');
  const defaultLogos = {
    BCA: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia_logo.svg',
    MANDIRI: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg',
    BRI: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg',
    BNI: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_BNI_logo.svg'
  };

  logoImg.src = record.LOGO_URL || defaultLogos[record.BANK] || 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png';

  // Screenshot Preview
  const ssImg = document.getElementById('detail-modal-ss-img');
  if (record.SCREENSHOT) {
    ssImg.src = record.SCREENSHOT;
    ssImg.parentElement.classList.remove('d-none');
  } else {
    ssImg.parentElement.classList.add('d-none');
  }

  // Setup Actions
  const perms = getRolePermissions(state.user.role);
  const btnEdit = document.getElementById('detail-modal-btn-edit');
  const btnDelete = document.getElementById('detail-modal-btn-delete');

  if (perms.canEdit || perms.canUpdateStatusNotes) {
    btnEdit.classList.remove('d-none');
    btnEdit.onclick = () => {
      closeBankDetailModal();
      openBankModal(record);
    };
  } else {
    btnEdit.classList.add('d-none');
  }

  if (perms.canDelete) {
    btnDelete.classList.remove('d-none');
    btnDelete.onclick = () => {
      closeBankDetailModal();
      confirmDeleteRecord(record.ID);
    };
  } else {
    btnDelete.classList.add('d-none');
  }

  document.getElementById('modal-detail-backdrop').classList.add('open');
  if (window.lucide) lucide.createIcons();
}

function closeBankDetailModal() {
  document.getElementById('modal-detail-backdrop').classList.remove('open');
}

/**
 * Add / Edit Modal Window
 */
function openBankModal(record = null) {
  const isEdit = !!record;
  document.getElementById('modal-title').textContent = isEdit ? 'Edit Data Bank' : 'Tambah Data Bank Baru';

  document.getElementById('form-bank-id').value = isEdit ? record.ID : '';
  document.getElementById('form-bank').value = isEdit ? record.BANK : 'BCA';
  document.getElementById('form-jenis-bank').value = isEdit ? (record.JENIS_BANK || 'BANK DEPO') : 'BANK DEPO';
  document.getElementById('form-group').value = isEdit ? record.GROUP : 'GROUP VIP 1';
  document.getElementById('form-no-hp').value = isEdit ? record.NO_HP : '';
  document.getElementById('form-sim-info').value = isEdit ? record.SIM_CARD_INFO : 'Dual SIM (SIM 1 Active)';
  document.getElementById('form-nama-rek').value = isEdit ? record.NAMA_REKENING : '';
  document.getElementById('form-no-rek').value = isEdit ? record.NO_REKENING : '';
  document.getElementById('form-user-id-ib').value = isEdit ? record.USER_ID_IB : '';
  document.getElementById('form-pass-ib').value = isEdit ? record.PASSWORD_IB : '';
  document.getElementById('form-status').value = isEdit ? record.STATUS : 'AKTIF';
  document.getElementById('form-tgl-aktif').value = isEdit ? record.TANGGAL_AKTIF : new Date().toISOString().slice(0, 10);
  document.getElementById('form-tgl-expire').value = isEdit ? record.TANGGAL_EXPIRE : '';
  document.getElementById('form-catatan').value = isEdit ? record.CATATAN : '';
  document.getElementById('form-logo-url').value = isEdit ? record.LOGO_URL : '';
  document.getElementById('form-screenshot').value = isEdit ? record.SCREENSHOT : '';

  const isKasir = state.user.role === 'KASIR';
  [
    'form-bank', 'form-jenis-bank', 'form-group', 'form-no-hp', 'form-sim-info',
    'form-nama-rek', 'form-no-rek', 'form-user-id-ib', 'form-pass-ib', 'form-tgl-aktif', 'form-tgl-expire'
  ].forEach(fieldId => {
    document.getElementById(fieldId).disabled = isKasir;
  });

  document.getElementById('modal-backdrop').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-backdrop').classList.remove('open');
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('form-bank-id').value;
  const isEdit = !!id;

  const formData = {
    BANK: document.getElementById('form-bank').value,
    JENIS_BANK: document.getElementById('form-jenis-bank').value,
    GROUP: document.getElementById('form-group').value,
    NO_HP: document.getElementById('form-no-hp').value,
    SIM_CARD_INFO: document.getElementById('form-sim-info').value,
    NAMA_REKENING: document.getElementById('form-nama-rek').value,
    NO_REKENING: document.getElementById('form-no-rek').value,
    USER_ID_IB: document.getElementById('form-user-id-ib').value,
    PASSWORD_IB: document.getElementById('form-pass-ib').value,
    STATUS: document.getElementById('form-status').value,
    TANGGAL_AKTIF: document.getElementById('form-tgl-aktif').value,
    TANGGAL_EXPIRE: document.getElementById('form-tgl-expire').value,
    CATATAN: document.getElementById('form-catatan').value,
    LOGO_URL: document.getElementById('form-logo-url').value,
    SCREENSHOT: document.getElementById('form-screenshot').value
  };

  try {
    let res = isEdit ? await ApiService.editBank(id, formData) : await ApiService.addBank(formData);
    if (res.status === 'success') {
      Swal.fire('Sukses', res.message, 'success');
      closeModal();
      refreshDashboard();
    } else {
      Swal.fire('Error', res.message, 'error');
    }
  } catch (err) {
    Swal.fire('Error', 'Gagal menyimpan data', 'error');
  }
}

async function confirmDeleteRecord(id) {
  const confirm = await Swal.fire({
    title: 'Hapus Rekening Ini?',
    text: 'Tindakan ini tidak dapat dibatalkan.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f43f5e',
    confirmButtonText: 'Ya, Hapus'
  });

  if (confirm.isConfirmed) {
    try {
      const res = await ApiService.deleteBank(id);
      if (res.status === 'success') {
        Swal.fire('Terhapus', res.message, 'success');
        refreshDashboard();
      } else {
        Swal.fire('Error', res.message, 'error');
      }
    } catch (e) {
      Swal.fire('Error', 'Gagal menghapus data', 'error');
    }
  }
}

function togglePasswordVisibility(fieldId) {
  const el = document.getElementById(fieldId);
  if (el.type === 'password') {
    el.type = 'text';
  } else {
    el.type = 'password';
  }
}

function showSettingsModal() {
  Swal.fire({
    title: 'Pengaturan REST API',
    html: `
      <p class="text-xs text-muted mb-3">Masukkan Web App Deployment URL Google Apps Script Anda:</p>
      <input id="swal-input-url" class="swal2-input" placeholder="https://script.google.com/macros/s/.../exec" value="${CONFIG.API_URL}">
    `,
    showCancelButton: true,
    confirmButtonText: 'Simpan URL',
    preConfirm: () => {
      const url = document.getElementById('swal-input-url').value.trim();
      if (!url) Swal.showValidationMessage('URL tidak boleh kosong');
      return url;
    }
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.setItem('BANK_APP_GAS_URL', result.value);
      CONFIG.API_URL = result.value;
      Swal.fire('Saved', 'URL API berhasil disimpan', 'success').then(() => window.location.reload());
    }
  });
}

function copyText(text) {
  navigator.clipboard.writeText(text);
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: 'Tercopy!',
    showConfirmButton: false,
    timer: 1500
  });
}
