import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import { useAuth } from "./context/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Shared pages
import Profile from "./pages/common/Profile";
import Notifications from "./pages/common/Notifications";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPatients from "./pages/admin/Patients";
import AdminAppointments from "./pages/admin/Appointments";
import Departments from "./pages/admin/Departments";
import Medicines from "./pages/admin/Medicines";
import ManageUsers from "./pages/admin/ManageUsers";
import Reports from "./pages/admin/Reports";

// Doctor pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import TodayAppointments from "./pages/doctor/TodayAppointments";
import AssignedPatients from "./pages/doctor/AssignedPatients";
import HealthRecords from "./pages/doctor/HealthRecords";

// Nurse pages
import NurseDashboard from "./pages/nurse/NurseDashboard";
import WardBoard from "./pages/nurse/WardBoard";
import EnterVitals from "./pages/nurse/EnterVitals";

// Staff pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import RegisterPatient from "./pages/staff/RegisterPatient";
import BookAppointment from "./pages/staff/BookAppointment";
import AppointmentQueue from "./pages/staff/AppointmentQueue";
import StaffPatients from "./pages/admin/Patients"; // reused (role-aware) for "Search Patient"

// Patient pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import MyAppointments from "./pages/patient/MyAppointments";
import Prescriptions from "./pages/patient/Prescriptions";

function App() {
  const { loading, user } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}`} replace /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout title="Admin Dashboard" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="patients" element={<AdminPatients />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="departments" element={<Departments />} />
        <Route path="medicines" element={<Medicines />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Doctor */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DashboardLayout title="Doctor Dashboard" />
          </ProtectedRoute>
        }
      >
        <Route index element={<DoctorDashboard />} />
        <Route path="appointments" element={<TodayAppointments />} />
        <Route path="patients" element={<AssignedPatients />} />
        <Route path="records" element={<HealthRecords />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Nurse */}
      <Route
        path="/nurse"
        element={
          <ProtectedRoute allowedRoles={["nurse"]}>
            <DashboardLayout title="Nurse Dashboard" />
          </ProtectedRoute>
        }
      >
        <Route index element={<NurseDashboard />} />
        <Route path="ward-board" element={<WardBoard />} />
        <Route path="vitals" element={<EnterVitals />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Staff / Receptionist */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <DashboardLayout title="Staff Dashboard" />
          </ProtectedRoute>
        }
      >
        <Route index element={<StaffDashboard />} />
        <Route path="register-patient" element={<RegisterPatient />} />
        <Route path="appointments" element={<BookAppointment />} />
        <Route path="queue" element={<AppointmentQueue />} />
        <Route path="search" element={<StaffPatients />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Patient */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <DashboardLayout title="Patient Dashboard" />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientDashboard />} />
        <Route path="appointments" element={<MyAppointments />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Root + fallback */}
      <Route path="/" element={<Navigate to={user ? `/${user.role}` : "/login"} replace />} />
      <Route path="*" element={<Navigate to={user ? `/${user.role}` : "/login"} replace />} />
    </Routes>
  );
}

export default App;
