import React from "react";
import { useNavigate } from "react-router-dom";
import "./Recruiters.css"

export default function Recruiters() {
  const navigate = useNavigate();

  return (
    <>
      {/* Header */}
      <header className="dashboard-header">
        <h1>Recruiter Dashboard</h1>
        <p>Manage jobs, analyze resumes, and hire smarter with AI</p>
      </header>

      {/* Main Content */}
      <main className="dashboard-container">
        
        {/* Job Posting Card */}
        <section className="dashboard-card">
          <h2>Post a Job</h2>
          <p>Create and enhance job descriptions using AI</p>

          <form className="job-form">
            <label>Job Description</label>
            <textarea rows="5" placeholder="Paste or write your job description..." />

            <div className="button-group">
              <button type="button" className="btn secondary">
                Enhance with AI
              </button>
              <button type="submit" className="btn primary">
                Post Job
              </button>
            </div>
          </form>
        </section>

        {/* Resume Tools Card */}
        <section className="dashboard-card">
          <h2>Candidate Management</h2>
          <p>Analyze, rank, and shortlist candidates efficiently</p>

          <div className="feature-grid">
            <div className="feature-box">
              <h3>Bulk Resume Upload</h3>
              <p>Upload multiple resumes for instant processing</p>
              <button className="btn outline">Upload Resumes</button>
            </div>

            <div className="feature-box">
              <h3>AI Resume Ranking</h3>
              <p>Rank candidates based on job match score</p>
              <button
                className="btn outline"
                onClick={() => navigate("/rank-candidates")}
              >
                Rank Candidates
              </button>
            </div>

            <div className="feature-box">
              <h3>Shortlist Talent</h3>
              <p>Filter and contact top-matched candidates</p>
              <button className="btn outline">View Shortlist</button>
            </div>

            <div className="feature-box">
              <h3>Campus Hiring</h3>
              <p>Collaborate with college admins for placements</p>
              <button className="btn outline">Connect Colleges</button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        © 2025 Job Nexus
      </footer>
    </>
  );
}
