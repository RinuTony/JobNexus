import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (location.state?.role) {
      setRole(location.state.role);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "login" : "register";
      const url = `http://localhost/job-nexus/api/${endpoint}.php`;
      
      const payload = isLogin 
        ? { email, password, role }
        : { email, password, role, firstName, lastName };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      // In your handleSubmit function, update the switch statement:
if (data.success) {
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("user", JSON.stringify(data.user));
  localStorage.setItem("token", data.token);
  localStorage.setItem("userRole", data.user.role); // Store role separately
  
  // Navigate to appropriate dashboard
  switch (data.user.role) {
    case "candidate":
      navigate("/candidate-dashboard");
      break;
    case "recruiter":
      navigate("/recruiter-dashboard");
      break;
    case "admin":
      navigate("/admin-dashboard");
      break;
    default:
      navigate("/");
  }
}else {
        alert(data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to server. Make sure XAMPP is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-compact">
      {/* Back to Home Link */}
      <div className="back-home">
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
      </div>

      {/* Main Content */}
      <div className="login-container-compact">
        {/* Logo/Brand */}
        <div className="brand-compact">
          <h1 className="logo-compact">
            <span className="logo-gradient">Job</span>Nexus
          </h1>
          <p className="tagline-compact">
            {isLogin ? "Welcome back! Sign in to continue" : "Join our community today"}
          </p>
        </div>

        {/* Role Selection */}
        <div className="role-selection-compact">
          <div className="role-tabs-compact">
            <button
              className={`role-tab-compact ${role === "candidate" ? "active" : ""}`}
              onClick={() => setRole("candidate")}
              type="button"
            >
              <span className="role-icon">👤</span>
              Candidate
            </button>
            <button
              className={`role-tab-compact ${role === "recruiter" ? "active" : ""}`}
              onClick={() => setRole("recruiter")}
              type="button"
            >
              <span className="role-icon">💼</span>
              Recruiter
            </button>
            <button
              className={`role-tab-compact ${role === "admin" ? "active" : ""}`}
              onClick={() => setRole("admin")}
              type="button"
            >
              <span className="role-icon">🏛️</span>
              Admin
            </button>
          </div>
          
          <div className="role-description-compact">
            {role === "candidate" && "Find jobs, build your resume, and get AI-powered career guidance"}
            {role === "recruiter" && "Post jobs, find candidates, and streamline your hiring process"}
            {role === "admin" && "Manage student placements and connect with recruiters"}
          </div>
        </div>

        {/* Login/Signup Form */}
        <div className="form-card-compact">
          <div className="form-header-compact">
            <h2>{isLogin ? "Sign In" : "Create Account"}</h2>
            <button
              type="button"
              className="toggle-form-btn"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Need an account? Sign up" : "Have an account? Sign in"}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="form-compact">
            {!isLogin && (
              <div className="name-fields-compact">
                <div className="form-group-compact">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    required
                  />
                </div>
                <div className="form-group-compact">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group-compact">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
              />
            </div>

            <div className="form-group-compact">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                minLength="6"
                required
              />
              {!isLogin && (
                <p className="password-hint-compact">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            {isLogin && (
              <div className="forgot-password-compact">
                <Link to="/forgot-password" className="forgot-link-compact">
                  Forgot password?
                </Link>
              </div>
            )}

            <button 
              type="submit" 
              className="submit-btn-compact" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-compact"></span>
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>

            <div className="divider-compact">
              <span>or continue with</span>
            </div>

            <div className="social-login-compact">
              <button type="button" className="social-btn-compact google">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button type="button" className="social-btn-compact github">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>
          </form>

          <div className="terms-compact">
            <p>
              By continuing, you agree to our{" "}
              <Link to="/terms">Terms</Link> and{" "}
              <Link to="/privacy">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}