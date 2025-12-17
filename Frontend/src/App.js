// App.js - Corrected version
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Candidates from "./pages/Candidates";
import Recruiters from "./pages/Recruiters";
import CollegeAdmins from "./pages/CollegeAdmins";
import Jobs from "./pages/Jobs";
import Profile from "./pages/Profile";
import InterviewPrep from "./pages/InterviewPrep";
import MatchScore from "./pages/MatchScore";
import ResumeRanking from "./pages/ResumeRanking";
import Settings from "./pages/Settings";
import JobListings from './pages/JobListings';
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Candidate Routes */}
        <Route element={<ProtectedRoute allowedRoles={["candidate"]} />}>
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/match-score" element={<MatchScore />} />
          <Route path="/interview-prep" element={<InterviewPrep />} />
        </Route>
        
        {/* Recruiter Routes */}
        <Route element={<ProtectedRoute allowedRoles={["recruiter"]} />}>
          <Route path="/recruiters" element={<Recruiters />} />
          <Route path="/rank-candidates" element={<ResumeRanking />} />
        </Route>
        
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/collegeadmins" element={<CollegeAdmins />} />
        </Route>
        
        {/* Shared Routes (all logged-in users) */}
        <Route element={<ProtectedRoute allowedRoles={["candidate", "recruiter", "admin"]} />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/jobs" element={<JobListings />} />
        </Route>
        
        {/* Fallback Routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;