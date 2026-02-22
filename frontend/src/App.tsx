import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import WelcomePage from './pages/WelcomePage'
import HRLayout from './layouts/HRLayout'
import HRDashboard from './pages/hr/HRDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import ComingSoon from './components/ComingSoon'
import { DirectoriKaryawan } from './pages/karyawan/DirectoriKaryawan'
import { ProfilKaryawan } from './pages/karyawan/ProfilKaryawan'

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
          <Route path="karyawan" element={<DirectoriKaryawan />} />
          <Route path="karyawan/:id" element={<ProfilKaryawan />} />
          <Route path="karyawan/tambah" element={<ComingSoon />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
