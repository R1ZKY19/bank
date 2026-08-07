/**
 * BANK MANAGEMENT SYSTEM V2.0 - API SERVICE LAYER (EXTENDED)
 */

const ApiService = {
  async request(action, payload = {}) {
    const apiUrl = CONFIG.API_URL || localStorage.getItem('BANK_APP_GAS_URL') || '';
    if (!apiUrl) {
      Swal.fire({
        icon: 'warning',
        title: 'Google Apps Script URL Not Configured',
        html: `Silakan set <b>Google Apps Script Web App URL</b> di menu Pengaturan.`,
        confirmButtonColor: '#6366f1'
      });
      throw new Error('API_URL_MISSING');
    }

    const token = localStorage.getItem(CONFIG.SESSION_KEY);
    const body = JSON.stringify({
      action: action,
      token: token,
      ...payload
    });

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: body
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'unauthorized') {
        Swal.fire({
          icon: 'error',
          title: 'Sesi Berakhir',
          text: data.message || 'Silakan login kembali.',
          confirmButtonColor: '#6366f1'
        }).then(() => {
          AuthService.logout();
        });
        throw new Error('UNAUTHORIZED');
      }

      return data;
    } catch (error) {
      console.error(`[ApiService Error] Action: ${action}`, error);
      throw error;
    }
  },

  async login(username, password, clientIp = '') {
    return this.request('login', { username, password, clientIp });
  },

  async verifySession() {
    return this.request('verifySession');
  },

  async getDashboardStats() {
    return this.request('getDashboardStats');
  },

  async getBankList(params = {}) {
    return this.request('getBankList', params);
  },

  async getBankById(id) {
    return this.request('getBankById', { id });
  },

  async addBank(data) {
    return this.request('addBank', { data });
  },

  async editBank(id, data) {
    return this.request('editBank', { id, data });
  },

  async deleteBank(id) {
    return this.request('deleteBank', { id });
  },

  async importBankData(items) {
    return this.request('importBankData', { items });
  },

  async getUsers() {
    return this.request('getUsers');
  },

  async addUser(data) {
    return this.request('addUser', { data });
  },

  async updateUser(id, data) {
    return this.request('updateUser', { id, data });
  },

  async deleteUser(id) {
    return this.request('deleteUser', { id });
  },

  async getMasterData() {
    return this.request('getMasterData');
  },

  async getActivityLogs(params = {}) {
    return this.request('getActivityLogs', params);
  }
};
