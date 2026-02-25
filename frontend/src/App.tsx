import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import WelcomePage from './pages/WelcomePage'
import HRLayout from './layouts/HRLayout'
import MessLayout from './layouts/MessLayout'
import AccessLayout from './layouts/AccessLayout'
import HRDashboard from './pages/hr/HRDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { DirectoriKaryawan } from './pages/karyawan/DirectoriKaryawan'
import { ProfilKaryawan } from './pages/karyawan/ProfilKaryawan'
import { FormKaryawan } from './pages/karyawan/FormKaryawan'
import OnboardingTracker from './pages/hr/OnboardingTracker'
import OffboardingTracker from './pages/hr/OffboardingTracker'

// Master Data Pages
import DivisiPage from './pages/hr/master/DivisiPage'
import DepartemenPage from './pages/hr/master/DepartemenPage'
import PosisiJabatanPage from './pages/hr/master/PosisiJabatanPage'
import GolonganPage from './pages/hr/master/GolonganPage'
import SubGolonganPage from './pages/hr/master/SubGolonganPage'
import KategoriPangkatPage from './pages/hr/master/KategoriPangkatPage'
import JenisHubunganKerjaPage from './pages/hr/master/JenisHubunganKerjaPage'
import StatusKaryawanPage from './pages/hr/master/StatusKaryawanPage'
import LokasiKerjaPage from './pages/hr/master/LokasiKerjaPage'
import TagPage from './pages/hr/master/TagPage'
import UserManagementPage from './pages/hr/UserManagementPage'
import RoleManagementPage from './pages/access/RoleManagementPage'
import PermissionMatrixPage from './pages/access/PermissionMatrixPage'

// Mess Module Pages
import MessDashboard from './pages/mess/MessDashboard'
import MessMasterPage from './pages/mess/MessMasterPage'
import MessOperationalPage from './pages/mess/MessOperationalPage'
import MessMaintenancePage from './pages/mess/MessMaintenancePage'
import MessFacilityPage from './pages/mess/MessFacilityPage'
import MessPetugasPage from './pages/mess/MessPetugasPage'
import MessCleaningPage from './pages/mess/MessCleaningPage'
import MessResidentPage from './pages/mess/MessResidentPage'
import MessReportPage from './pages/mess/MessReportPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/welcome" element={<WelcomePage />} />

      {/* HR Module Routes */}
      <Route path="/hr" element={<ProtectedRoute />}>
        <Route element={<HRLayout />}>
          <Route index element={<HRDashboard />} />
          <Route path="master/divisi" element={<DivisiPage />} />
          <Route path="master/departemen" element={<DepartemenPage />} />
          <Route path="master/posisi-jabatan" element={<PosisiJabatanPage />} />
          <Route path="master/golongan" element={<GolonganPage />} />
          <Route path="master/sub-golongan" element={<SubGolonganPage />} />
          <Route path="master/kategori-pangkat" element={<KategoriPangkatPage />} />
          <Route path="master/jenis-hubungan-kerja" element={<JenisHubunganKerjaPage />} />
          <Route path="master/status-karyawan" element={<StatusKaryawanPage />} />
          <Route path="master/lokasi-kerja" element={<LokasiKerjaPage />} />
          <Route path="master/tag" element={<TagPage />} />
          <Route path="onboarding" element={<OnboardingTracker />} />
          <Route path="offboarding" element={<OffboardingTracker />} />
          <Route path="karyawan" element={<DirectoriKaryawan />} />
          <Route path="karyawan/tambah" element={<FormKaryawan mode="add" />} />
          <Route path="karyawan/:id" element={<ProfilKaryawan />} />
          <Route path="karyawan/:id/edit" element={<FormKaryawan mode="edit" />} />
        </Route>
      </Route>

      {/* Mess Management Module */}
      <Route path="/mess" element={<ProtectedRoute />}>
        <Route element={<MessLayout />}>
          <Route index element={<MessDashboard />} />
          <Route path="gedung" element={<MessMasterPage />} />
          <Route path="penghuni" element={<MessResidentPage />} />
          <Route path="operasional" element={<MessOperationalPage />} />
          <Route path="perawatan" element={<MessMaintenancePage />} />
          <Route path="cleaning" element={<MessCleaningPage />} />
          <Route path="laporan" element={<MessReportPage />} />
          <Route path="master/fasilitas" element={<MessFacilityPage />} />
          <Route path="master/petugas" element={<MessPetugasPage />} />
        </Route>
      </Route>

      {/* Access Management Module */}
      <Route path="/access" element={<ProtectedRoute />}>
        <Route element={<AccessLayout />}>
          <Route index element={<Navigate to="/access/users" replace />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="roles" element={<RoleManagementPage />} />
          <Route path="permissions" element={<PermissionMatrixPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
