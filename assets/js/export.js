/**
 * BANK MANAGEMENT SYSTEM V2.0 - EXPORT & IMPORT UTILITIES
 */

const ExportService = {
  /**
   * Export Table Data to Excel (.xlsx) using SheetJS
   */
  exportToExcel(data, fileName = 'Bank_Data_Export') {
    if (!data || data.length === 0) {
      Swal.fire('Warning', 'Tidak ada data untuk diexport', 'warning');
      return;
    }

    // Clean data for export
    const cleanData = data.map((item, index) => ({
      No: index + 1,
      Bank: item.BANK,
      Group: item.GROUP,
      'No Rekening': item.NO_REKENING,
      'Nama Rekening': item.NAMA_REKENING,
      'No HP': item.NO_HP,
      Status: item.STATUS,
      Catatan: item.CATATAN,
      'Dibuat Pada': item.CREATED_AT,
      'Diubah Oleh': item.UPDATED_BY
    }));

    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bank Data');

    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  },

  /**
   * Export Table Data to CSV
   */
  exportToCSV(data, fileName = 'Bank_Data_Export') {
    if (!data || data.length === 0) {
      Swal.fire('Warning', 'Tidak ada data untuk diexport', 'warning');
      return;
    }

    const headers = ['Bank', 'Group', 'No Rekening', 'Nama Rekening', 'No HP', 'Status', 'Catatan', 'Created At'];
    const rows = data.map(item => [
      `"${item.BANK || ''}"`,
      `"${item.GROUP || ''}"`,
      `"${item.NO_REKENING || ''}"`,
      `"${item.NAMA_REKENING || ''}"`,
      `"${item.NO_HP || ''}"`,
      `"${item.STATUS || ''}"`,
      `"${(item.CATATAN || '').replace(/"/g, '""')}"`,
      `"${item.CREATED_AT || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Print Data Table
   */
  printTable(data) {
    if (!data || data.length === 0) {
      Swal.fire('Warning', 'Tidak ada data untuk dicetak', 'warning');
      return;
    }

    const printWindow = window.open('', '_blank');
    const rowsHtml = data.map((item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td><b>${item.BANK}</b></td>
        <td>${item.GROUP}</td>
        <td>${item.NO_REKENING}</td>
        <td>${item.NAMA_REKENING}</td>
        <td>${item.NO_HP}</td>
        <td>${item.STATUS}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Data Bank - ${CONFIG.APP_NAME}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #1e293b; }
            h2 { margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 12px; text-align: left; }
            th { background: #f1f5f9; }
          </style>
        </head>
        <body>
          <h2>LAPORAN ADMINISTRASI BANK</h2>
          <p>Tanggal Cetak: ${new Date().toLocaleString('id-ID')}</p>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Bank</th>
                <th>Group</th>
                <th>No Rekening</th>
                <th>Nama Rekening</th>
                <th>No HP</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  },

  /**
   * Parse File for Data Import (Excel/CSV)
   */
  parseImportFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Standardize column keys
          const standardized = jsonData.map(row => ({
            BANK: row.Bank || row.BANK || '',
            GROUP: row.Group || row.GROUP || '',
            NO_HP: row['No HP'] || row.NO_HP || row.HP || '',
            NAMA_REKENING: row['Nama Rekening'] || row.NAMA_REKENING || row.REKENING_NAMA || '',
            NO_REKENING: row['No Rekening'] || row.NO_REKENING || row.REKENING || '',
            STATUS: row.Status || row.STATUS || 'AKTIF',
            CATATAN: row.Catatan || row.CATATAN || 'Imported Excel'
          }));

          resolve(standardized);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }
};
