import React, { useEffect, useState } from "react";

export default function Recruiters() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);

  // 🔹 Fetch applicants
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "recruiter") return;

    fetch(
      `http://localhost/JobNexus/Backend-PHP/api/get-applicants.php?recruiter_id=${user.id}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setApplications(data.applications);
        }
      })
      .catch((err) => console.error(err));
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
      const response = await fetch(
        "http://localhost/JobNexus/Backend-PHP/api/post-job.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            recruiter_id: user.id
          })
        }
      );

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

  return (
    <>
      <header>
        <h1>Recruiter Dashboard</h1>
      </header>

      <main className="container">
        <section className="card">
          <h2>Post Job</h2>

          <form onSubmit={handlePostJob}>
            <label>Job Title</label><br />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            /><br /><br />

            <label>Job Description</label><br />
            <textarea
              rows="4"
              cols="40"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea><br /><br />

            <button type="submit" disabled={loading}>
              {loading ? "Posting..." : "Post Job"}
            </button>
          </form>
        </section>

        <section className="card">
          <h2>Applied Candidates</h2>

          {applications.length === 0 && (
            <p>No applications yet.</p>
          )}

          {applications.map((app) => (
            <div
              key={app.application_id}
              style={{
                border: "1px solid #e5e7eb",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "6px"
              }}
            >
              <strong>{app.candidate_name}</strong><br />
              {app.candidate_email}<br />
              Job: {app.job_title}<br />
              Status: {app.status}<br />
              Applied on:{" "}
              {new Date(app.applied_at).toLocaleString()}
            </div>
          ))}
        </section>
      </main>

      <footer>&copy; 2025 Job Nexus</footer>
    </>
  );
}
