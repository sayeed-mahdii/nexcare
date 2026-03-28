import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Doctors from './pages/public/Doctors';
import Hospitals from './pages/public/Hospitals';
import Diagnostics from './pages/public/Diagnostics';
import DiagnosticCheckout from './pages/public/DiagnosticCheckout';
import GuestDashboard from './pages/public/GuestDashboard';
import GuestLogin from './pages/public/GuestLogin';

// Patient pages
import PatientDashboard from './pages/patient/Dashboard';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import PatientLabReports from './pages/patient/LabReports';
import PatientProfile from './pages/patient/Profile';

// Doctor pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import PatientHistory from './pages/doctor/PatientHistory';
import DoctorProfile from './pages/doctor/Profile';
import OrderTests from './pages/doctor/OrderTests';
import TestRecords from './pages/doctor/TestRecords';
import DoctorReviews from './pages/doctor/Reviews';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManageBranches from './pages/admin/ManageBranches';
import ManageDoctors from './pages/admin/ManageDoctors';
import PendingDoctors from './pages/admin/PendingDoctors';
import AdminProfile from './pages/admin/Profile';
import GuestBookings from './pages/admin/GuestBookings';
import ManagePathologists from './pages/admin/ManagePathologists';
import LabReports from './pages/admin/LabReports';

// Pathologist pages
import PathologistDashboard from './pages/pathologist/Dashboard';
import UploadReport from './pages/pathologist/UploadReport';
import PathologistProfile from './pages/pathologist/Profile';
import PendingTests from './pages/pathologist/PendingTests';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1f2937',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
          <Route path="/diagnostics/checkout" element={<DiagnosticCheckout />} />
          <Route path="/guest-dashboard" element={<GuestDashboard />} />
          <Route path="/guest/login" element={<GuestLogin />} />

          {/* Patient Routes */}
          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/patient/book-appointment" element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <BookAppointment />
            </ProtectedRoute>
          } />
          <Route path="/patient/appointments" element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <MyAppointments />
            </ProtectedRoute>
          } />
          <Route path="/patient/lab-reports" element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <PatientLabReports />
            </ProtectedRoute>
          } />
          <Route path="/patient/profile" element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <PatientProfile />
            </ProtectedRoute>
          } />

          {/* Doctor Routes */}
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor/appointments" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <DoctorAppointments />
            </ProtectedRoute>
          } />
          <Route path="/doctor/patients" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <PatientHistory />
            </ProtectedRoute>
          } />
          <Route path="/doctor/profile" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <DoctorProfile />
            </ProtectedRoute>
          } />
          <Route path="/doctor/order-tests/:appointmentId" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <OrderTests />
            </ProtectedRoute>
          } />
          <Route path="/doctor/test-records" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <TestRecords />
            </ProtectedRoute>
          } />
          <Route path="/doctor/reviews" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <DoctorReviews />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Administrator']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['Administrator']}>
              <ManageUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/doctors" element={
            <ProtectedRoute allowedRoles={['Administrator']}>
              <ManageDoctors />
            </ProtectedRoute>
          } />
          <Route path="/admin/departments" element={
            <ProtectedRoute allowedRoles={['Administrator']}>
              <ManageDepartments />
            </ProtectedRoute>
          } />
          <Route path="/admin/branches" element={
            <ProtectedRoute allowedRoles={['Administrator']}>
              <ManageBranches />
            </ProtectedRoute>
          } />
          <Route path="/admin/pending-doctors" element={
            <ProtectedRoute allowedRoles={['Administrator']}>
              <PendingDoctors />
            </ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute allowedRoles={['Administrator']}>
              <AdminProfile />
            </ProtectedRoute>
          } />
          <Route path="/admin/guest-bookings" element={
            <ProtectedRoute allowedRoles={['Administrator']}>
              <GuestBookings />
            </ProtectedRoute>
          } />
          <Route path="/admin/pathologists" element={
            <ProtectedRoute allowedRoles={['Administrator']}>
              <ManagePathologists />
            </ProtectedRoute>
          } />
          <Route path="/admin/lab-reports" element={
            <ProtectedRoute allowedRoles={['Administrator']}>
              <LabReports />
            </ProtectedRoute>
          } />

          {/* Pathologist Routes */}
          <Route path="/pathologist" element={
            <ProtectedRoute allowedRoles={['Pathologist']}>
              <PathologistDashboard />
            </ProtectedRoute>
          } />
          <Route path="/pathologist/upload-report" element={
            <ProtectedRoute allowedRoles={['Pathologist']}>
              <UploadReport />
            </ProtectedRoute>
          } />
          <Route path="/pathologist/profile" element={
            <ProtectedRoute allowedRoles={['Pathologist']}>
              <PathologistProfile />
            </ProtectedRoute>
          } />
          <Route path="/pathologist/pending-tests" element={
            <ProtectedRoute allowedRoles={['Pathologist']}>
              <PendingTests />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
