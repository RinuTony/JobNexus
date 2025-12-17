import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Candidates() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch Jobs
  useEffect(() => {
    fetch("http://localhost/JobNexus/Backend-PHP/api/get-jobs.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setJobs(data.jobs);
        } else {
          setJobs([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // 🔹 Apply to Job
  const handleApply = async (jobId) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "candidate") {
      alert("Please login as candidate");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/JobNexus/Backend-PHP/api/apply-job.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            job_id: jobId,
            candidate_id: user.id
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Applied successfully!");
      } else {
        alert(data.message || "Already applied");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <>
      <header>
        <h1>Candidate Dashboard</h1>
      </header>

      <main className="container">
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
                marginBottom: "1rem"
              }}
            >
              <h3>{job.title}</h3>

              <p style={{ whiteSpace: "pre-line" }}>
                {job.description}
              </p>

              <small>Posted by: {job.recruiter_email}</small>
              <br />
              <small>
                {new Date(job.created_at).toLocaleString()}
              </small>
              <br />

              <button
                onClick={() => handleApply(job.id)}
                style={{
                  marginTop: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#4f46e5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Apply
              </button>
            </div>
          ))}
        </section>

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

      <footer>&copy; 2025 Job Nexus</footer>
    </>
  );
}
