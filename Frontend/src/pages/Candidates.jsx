import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, X } from "lucide-react";

export default function Candidates() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [userResumes, setUserResumes] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  // Memoized fetch functions to prevent dependency warnings
  const fetchUserResumes = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(
        `http://localhost/JobNexus/Backend-PHP/api/get-candidate-resumes.php?candidate_id=${user.id}`
      );
      const data = await response.json();
      if (data.success) {
        setUserResumes(data.resumes);
      }
    } catch (err) {
      console.error(err);
    }
  }, [user?.id]);

  const fetchAppliedJobs = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(
        `http://localhost/JobNexus/Backend-PHP/api/get-applied-jobs.php?candidate_id=${user.id}`
      );
      const data = await response.json();
      if (data.success) {
        setAppliedJobs(data.applications);
      }
    } catch (err) {
      console.error(err);
    }
  }, [user?.id]);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch("http://localhost/JobNexus/Backend-PHP/api/get-jobs.php");
      const data = await response.json();
      if (data.success) {
        setJobs(data.jobs);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Fetch Jobs
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // 🔹 Fetch user-specific data
  useEffect(() => {
    if (user?.id) {
      fetchUserResumes();
      fetchAppliedJobs();
    }
  }, [user?.id, fetchUserResumes, fetchAppliedJobs]);

  // 🔹 Open Upload Modal
  const openUploadModal = (job) => {
    if (!user || user.role !== "candidate") {
      alert("Please login as candidate");
      return;
    }
    
    if (appliedJobs.some(app => app.job_id === job.id)) {
      alert("You have already applied for this job");
      return;
    }
    
    setSelectedJob(job);
    setResumeFile(null);
    setShowUploadModal(true);
  };

  // 🔹 Handle File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf" || 
          file.type === "application/msword" || 
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.type === "text/plain") {
        setResumeFile(file);
      } else {
        alert("Please upload a PDF, DOC, DOCX, or TXT file");
      }
    }
  };

  // 🔹 Apply to Job with Resume
  const handleApplyWithResume = async () => {
    if (!resumeFile) {
      alert("Please upload a resume");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("job_id", selectedJob.id);
    formData.append("candidate_id", user.id);
    formData.append("resume", resumeFile);

    try {
      const response = await fetch(
        "http://localhost/JobNexus/Backend-PHP/api/apply-job.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Applied successfully!");
        setShowUploadModal(false);
        fetchAppliedJobs();
        fetchUserResumes();
      } else {
        alert(data.message || "Application failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    } finally {
      setUploading(false);
    }
  };

  // 🔹 Check if already applied
  const hasApplied = (jobId) => {
    return appliedJobs.some(app => app.job_id === jobId);
  };

  return (
    <>
      <header>
        <h1>Candidate Dashboard</h1>
      </header>

      <main className="container">
        {/* My Resumes Section */}
        <section className="card">
          <h2>My Resumes</h2>
          <button
            onClick={() => navigate("/upload-resume")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginBottom: "1rem"
            }}
          >
            Upload New Resume
          </button>
          
          {userResumes.length > 0 ? (
            <div className="resume-list">
              {userResumes.map((resume, index) => (
                <div key={index} className="resume-item">
                  <FileText size={20} />
                  <span>{resume.filename}</span>
                  <small>Uploaded: {new Date(resume.uploaded_at).toLocaleDateString()}</small>
                  <a 
                    href={`http://localhost/JobNexus/Backend-PHP/uploads/${resume.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#4f46e5", marginLeft: "auto" }}
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p>No resumes uploaded yet.</p>
          )}
        </section>

        {/* Available Jobs Section */}
        <section className="card">
          <h2>Available Job Openings</h2>

          {loading && <p>Loading jobs...</p>}
          {!loading && jobs.length === 0 && (
            <p>No jobs available at the moment.</p>
          )}

          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                border: "1px solid #e5e7eb",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                position: "relative"
              }}
            >
              {hasApplied(job.id) && (
                <span style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  backgroundColor: "#10b981",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "12px"
                }}>
                  Applied
                </span>
              )}
              
              <h3>{job.title}</h3>
              <p style={{ whiteSpace: "pre-line" }}>{job.description}</p>
              
              <small>Posted by: {job.recruiter_email}</small>
              <br />
              <small>{new Date(job.created_at).toLocaleString()}</small>
              <br />

              <button
                onClick={() => openUploadModal(job)}
                disabled={hasApplied(job.id)}
                style={{
                  marginTop: "10px",
                  padding: "8px 16px",
                  backgroundColor: hasApplied(job.id) ? "#9ca3af" : "#4f46e5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: hasApplied(job.id) ? "not-allowed" : "pointer"
                }}
              >
                {hasApplied(job.id) ? "Applied" : "Apply with Resume"}
              </button>
            </div>
          ))}
        </section>

        {/* Resume Analysis Section */}
        <section className="card">
          <h2>Resume Analysis & Feedback</h2>
          <ul>
            <li
              style={{ cursor: "pointer", color: "#4f46e5" }}
              onClick={() => navigate("/match-score")}
            >
              View your match score
            </li>
            <li
              style={{ cursor: "pointer", color: "#4f46e5" }}
              onClick={() => navigate("/interview-prep")}
            >
              AI interview preparation
            </li>
          </ul>
        </section>
      </main>

      {/* Upload Resume Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Upload Resume for {selectedJob?.title}</h3>
              <button onClick={() => setShowUploadModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="file-upload-area">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="resume-upload" className="file-upload-label">
                  <Upload size={48} />
                  <span>Click to upload resume</span>
                  <small>PDF, DOC, DOCX, or TXT files only</small>
                </label>
                
                {resumeFile && (
                  <div className="selected-file">
                    <FileText size={20} />
                    <span>{resumeFile.name}</span>
                    <button onClick={() => setResumeFile(null)}>
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleApplyWithResume}
                disabled={!resumeFile || uploading}
                className="apply-button"
              >
                {uploading ? "Applying..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .resume-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          margin-bottom: 10px;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: white;
          border-radius: 8px;
          padding: 20px;
          width: 500px;
          max-width: 90%;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .file-upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 40px 20px;
          text-align: center;
          margin-bottom: 20px;
        }
        
        .file-upload-label {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        
        .selected-file {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f3f4f6;
          padding: 10px;
          border-radius: 6px;
          margin-top: 10px;
        }
        
        .apply-button {
          width: 100%;
          padding: 12px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .apply-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>

      <footer>&copy; 2025 Job Nexus</footer>
    </>
  );
}