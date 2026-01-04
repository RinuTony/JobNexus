import React, { useEffect, useState } from "react";
import "./Recruiters.css";

export default function Recruiters() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [statusUpdates, setStatusUpdates] = useState({});
  
  const API_BASE = "http://localhost/JobNexus/Backend-PHP/api";


  // 🔹 Fetch applicants
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "recruiter") return;

    fetch(`${API_BASE}/get-applicants.php?recruiter_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setApplications(data.applications);
          // Initialize status updates
          const initialStatuses = {};
          data.applications.forEach(app => {
            initialStatuses[app.application_id] = app.status;
          });
          setStatusUpdates(initialStatuses);
        }
      })
      .catch((err) => console.error("Error fetching applications:", err));
  }, []);

  // 🔹 Post job
  const handlePostJob = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "recruiter") {
      alert("Please login as recruiter");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/post-job.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          recruiter_id: user.id
        })
      });

      const data = await response.json();

      if (data.success) {
        alert("Job posted successfully");
        setTitle("");
        setDescription("");
      } else {
        alert(data.message || "Failed to post job");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 View Resume
  const handleViewResume = (application) => {
    if (!application.resume_filename) {
      alert("No resume available for this candidate");
      return;
    }

    setSelectedResume({
      application_id: application.application_id,
      filename: application.resume_filename,
      candidate_name: application.candidate_name,
      job_title: application.job_title
    });
    setResumeModalOpen(true);
  };

  // 🔹 Download Resume
  const handleDownloadResume = (application) => {
    if (!application.resume_filename) {
      alert("No resume available for download");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const url = `${API_BASE}/download-resume.php?application_id=${application.application_id}&recruiter_id=${user.id}`;
    
    // Open in new tab to trigger download
    window.open(url, "_blank");
  };

  // 🔹 Close Resume Modal
  const closeResumeModal = () => {
    setResumeModalOpen(false);
    setSelectedResume(null);
  };

  // 🔹 Update Application Status
  const handleStatusChange = async (applicationId, newStatus) => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    // Update local state immediately for better UX
    setStatusUpdates(prev => ({
      ...prev,
      [applicationId]: newStatus
    }));

    try {
      const response = await fetch(`${API_BASE}/update-application-status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: applicationId,
          status: newStatus,
          recruiter_id: user.id
        })
      });

      const data = await response.json();
      if (!data.success) {
        alert("Failed to update status");
        // Revert local state if failed
        setStatusUpdates(prev => ({
          ...prev,
          [applicationId]: applications.find(app => app.application_id === applicationId)?.status
        }));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  // 🔹 Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'reviewed': return 'status-reviewed';
      case 'shortlisted': return 'status-shortlisted';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  // 🔹 Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <header className="dashboard-header">
        <h1>Recruiter Dashboard</h1>
        <p>Manage job postings and review candidate applications</p>
      </header>

      <main className="container">
        {/* Left Column: Post Job Form */}
        <section className="card">
          <h2>📝 Post New Job</h2>

          <form onSubmit={handlePostJob} className="job-form">
            <label><strong>Job Title</strong></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Senior Frontend Developer"
              style={{
                width: '100%',
                padding: '0.8rem',
                margin: '0.5rem 0 1rem 0',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />

            <label><strong>Job Description</strong></label>
            <textarea
              rows="6"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe the job responsibilities, requirements, and benefits..."
              style={{
                width: '100%',
                padding: '0.8rem',
                margin: '0.5rem 0 1rem 0',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            ></textarea>

            <div className="button-group">
              <button 
                type="submit" 
                disabled={loading}
                className="btn primary"
                style={{ padding: '0.8rem 2rem' }}
              >
                {loading ? "Posting..." : "Post Job"}
              </button>
              <button 
                type="button" 
                onClick={() => { setTitle(""); setDescription(""); }}
                className="btn outline"
              >
                Clear Form
              </button>
            </div>
          </form>

          <div className="feature-grid">
            <div className="feature-box">
              <h3>📊 Analytics</h3>
              <p>Track application metrics</p>
            </div>
            <div className="feature-box">
              <h3>🔍 Search</h3>
              <p>Find ideal candidates</p>
            </div>
            <div className="feature-box">
              <h3>📧 Notify</h3>
              <p>Send updates to candidates</p>
            </div>
            <div className="feature-box">
              <h3>📄 Templates</h3>
              <p>Use job description templates</p>
            </div>
          </div>
        </section>

        {/* Right Column: Applications */}
        <section className="card">
          <h2>👥 Applied Candidates ({applications.length})</h2>

          {applications.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem', 
              color: '#6b7280' 
            }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                No applications yet.
              </p>
              <p>Applications will appear here when candidates apply to your jobs.</p>
            </div>
          ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {applications.map((app) => (
                <div key={app.application_id} className="application-card">
                  <div className="application-header">
                    <div>
                      <div className="candidate-name">{app.candidate_name}</div>
                      <span className={`application-status ${getStatusClass(app.status)}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      {formatDate(app.applied_at)}
                    </div>
                  </div>

                  <div className="application-details">
                    <div><strong>Email:</strong> {app.candidate_email}</div>
                    <div><strong>Job:</strong> {app.job_title}</div>
                  </div>

                  <div className="resume-section">
                    <strong>Resume:</strong>
                    {app.resume_filename ? (
                      <div style={{ marginTop: '0.5rem' }}>
                        <button 
                          onClick={() => handleViewResume(app)}
                          className="btn-resume btn-view"
                        >
                          👁️ View Resume
                        </button>
                        <button 
                          onClick={() => handleDownloadResume(app)}
                          className="btn-resume btn-download"
                        >
                          ⬇️ Download
                        </button>
                      </div>
                    ) : (
                      <span className="no-resume"> No resume uploaded</span>
                    )}
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <label><strong>Update Status:</strong></label>
                    <select
                      value={statusUpdates[app.application_id] || app.status}
                      onChange={(e) => handleStatusChange(app.application_id, e.target.value)}
                      className="status-selector"
                      style={{ marginLeft: '0.5rem' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Resume Modal */}
      {resumeModalOpen && selectedResume && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>
                Resume: {selectedResume.candidate_name} - {selectedResume.job_title}
              </h3>
              <button onClick={closeResumeModal} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-body">
              {selectedResume.filename.endsWith('.pdf') ? (
                <iframe
                  src={`${API_BASE}/download-resume.php?application_id=${selectedResume.application_id}&recruiter_id=${JSON.parse(localStorage.getItem("user"))?.id}`}
                  title="Resume Preview"
                  className="resume-frame"
                />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                  <h3>Document Preview</h3>
                  <p>This document type cannot be previewed in browser.</p>
                  <p>Please download to view.</p>
                  <button
                    onClick={() => window.open(`${API_BASE}/download-resume.php?application_id=${selectedResume.application_id}&recruiter_id=${JSON.parse(localStorage.getItem("user"))?.id}`, '_blank')}
                    className="btn primary"
                    style={{ marginTop: '1rem' }}
                  >
                    Download Resume
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="dashboard-footer">
        <p>&copy; 2025 Job Nexus - Recruiter Dashboard</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          {applications.length} total applications • Last updated: {new Date().toLocaleDateString()}
        </p>
      </footer>
    </>
  );
}