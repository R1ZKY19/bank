/**
 * BANK MANAGEMENT SYSTEM V2.0 - AUTHENTICATION & SESSION MODULE
 */

const AuthService = {
  inactivityTimer: null,

  init() {
    this.initTheme();
    this.setupInactivityListener();
  },

  /**
   * Check if User is Logged In
   */
  isAuthenticated() {
    const token = localStorage.getItem(CONFIG.SESSION_KEY);
    const user = localStorage.getItem(CONFIG.USER_KEY);
    return !!(token && user);
  },

  /**
   * Get Active User Profile
   */
  getUser() {
    const userStr = localStorage.getItem(CONFIG.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },

  /**
   * Store Session Data
   */
  setSession(token, user) {
    localStorage.setItem(CONFIG.SESSION_KEY, token);
    localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
  },

  /**
   * Perform Logout
   */
  logout() {
    localStorage.removeItem(CONFIG.SESSION_KEY);
    localStorage.removeItem(CONFIG.USER_KEY);
    window.location.href = 'login.html';
  },

  /**
   * Auto Logout Inactivity Handler (30 Minutes)
   */
  setupInactivityListener() {
    if (!this.isAuthenticated()) return;

    const resetTimer = () => {
      if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
      this.inactivityTimer = setTimeout(() => {
        Swal.fire({
          icon: 'info',
          title: 'Sesi Berakhir Karena Inaktivitas',
          text: 'Anda tidak melakukan aktivitas selama 30 menit.',
          confirmButtonColor: '#6366f1'
        }).then(() => {
          AuthService.logout();
        });
      }, CONFIG.AUTO_LOGOUT_MINUTES * 60 * 1000);
    };

    ['mousemove', 'keydown', 'scroll', 'click'].forEach(evt => {
      window.addEventListener(evt, resetTimer, { passive: true });
    });

    resetTimer();
  },

  /**
   * Dark / Light Theme Manager
   */
  initTheme() {
    const savedTheme = localStorage.getItem(CONFIG.THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  },

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(CONFIG.THEME_KEY, newTheme);
  }
};

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  AuthService.init();
});
