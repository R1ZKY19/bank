/**
 * BANK MANAGEMENT SYSTEM V2.0 - CONFIGURATION MODULE
 */

const CONFIG = {
  // URL Google Apps Script Web App
  API_URL: 'https://script.google.com/macros/s/AKfycbxmFbGGU5U4qExHx7o0TZk7JrmjM1I7vx14XucOJRtoglaCWpkMkbFDrylNY_d15P4j6w/exec',
  
  APP_NAME: 'Bank Admin V2',
  VERSION: '2.0.0',
  SESSION_KEY: 'BANK_APP_SESSION_TOKEN',
  USER_KEY: 'BANK_APP_USER_PROFILE',
  THEME_KEY: 'BANK_APP_THEME',
  AUTO_LOGOUT_MINUTES: 30,

  // Role Permissions Definition
  PERMISSIONS: {
    LEADER: {
      canAdd: true,
      canEdit: true,
      canDelete: true,
      canManageUsers: true,
      canImport: true,
      canExport: true,
      canBackup: true,
      canRestore: true,
      canAuditLog: true
    },
    KAPTEN: {
      canAdd: true,
      canEdit: true,
      canDelete: false,
      canManageUsers: false,
      canImport: false,
      canExport: true,
      canBackup: false,
      canRestore: false,
      canAuditLog: true
    },
    CS: {
      canAdd: true,
      canEdit: true,
      canDelete: false,
      canManageUsers: false,
      canImport: false,
      canExport: false,
      canBackup: false,
      canRestore: false,
      canAuditLog: false
    },
    KASIR: {
      canAdd: false,
      canEdit: false,
      canUpdateStatusNotes: true,
      canDelete: false,
      canManageUsers: false,
      canImport: false,
      canExport: false,
      canBackup: false,
      canRestore: false,
      canAuditLog: false
    }
  }
};

/**
 * Utility: Get Active Role Permissions
 */
function getRolePermissions(role) {
  return CONFIG.PERMISSIONS[role] || {
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canImport: false,
    canExport: false
  };
}

function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(num || 0);
}

function formatDate(isoString) {
  if (!isoString || isoString === '-') return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
}
