# Task Checklist: Bank Management System V2.0 - Extended Features Customization

- [/] **Phase 1: Database Schema & Backend Extensions (Code.gs)**
  - [x] Extend `BANK` sheet schema with new fields: `JENIS_BANK` (DEPO, WD, KAS), `TANGGAL_AKTIF`, `TANGGAL_EXPIRE`, `USER_ID_IB`, `PASSWORD_IB`, `SIM_CARD_INFO`, `LOGO_URL`
  - [x] Add IP Whitelisting security check in `handleLogin` & IP Whitelist management for LEADER
  - [x] Update `setupDatabase()` seed data & `MASTER_STATUS` (including "REK CABUT KAS 1")
  - [x] Update `getBankList`, `addBank`, `editBank` to process new extended fields

- [ ] **Phase 2: Frontend Styling & Modal Dialog Adjustments (styles.css)**
  - [ ] Update CSS for centered Detail Popup Modal with logo header, expiry badges, and IB credentials box
  - [ ] Style badges for `JENIS_BANK` (DEPO, WD, KAS) and `REK CABUT KAS 1`

- [ ] **Phase 3: Frontend Views & Interactivity (dashboard.html & JS)**
  - [ ] Update Detail view from Drawer to Centered Popup Modal
  - [ ] Add countdown logic ("Sisa X Hari") for `TANGGAL_EXPIRE`
  - [ ] Add form input fields in Add/Edit modal for Jenis Bank, Tanggal Aktif, Tanggal Expire, User ID IB, Password IB, Dual SIM Card Info, Logo URL
  - [ ] Update table columns and filter dropdowns for Jenis Bank and new statuses
  - [ ] Add IP Whitelist management UI for LEADER role in User/Settings tab

- [ ] **Phase 4: Archiving & Documentation**
  - [ ] Update project zip archive
  - [ ] Upload updated zip archive to Google Drive
  - [ ] Verify execution and deliver code update to user
