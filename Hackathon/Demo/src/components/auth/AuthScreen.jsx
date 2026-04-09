export default function AuthScreen({
  email,
  password,
  signupName,
  setEmail,
  setPassword,
  setSignupName,
  onMemberLogin,
  onGuest,
  onSignup,
  mode,
  setMode,
  StatusBar,
  VinFastMark,
}) {
  const isSignup = mode === "signup";

  return (
    <div className="screen login-screen">
      <StatusBar />

      <button type="button" className="lang-pill" aria-label="Language switcher">
        <span className="lang-globe" aria-hidden="true">
          ◌
        </span>
        <span>EN</span>
      </button>

      <div className="login-mark-wrap">
        <VinFastMark />
      </div>

      <div className="login-fields">
        <div className="auth-mode-row">
          <button
            type="button"
            className={!isSignup ? "auth-mode active" : "auth-mode"}
            onClick={() => setMode("login")}
          >
            Log in
          </button>
          <button
            type="button"
            className={isSignup ? "auth-mode active" : "auth-mode"}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>

        {isSignup && (
          <label>
            <span>Full name</span>
            <input
              type="text"
              placeholder="Your name"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
            />
          </label>
        )}

        <label>
          <span>Email Address</span>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {!isSignup && (
          <div className="login-row">
            <label className="check-row">
              <input type="checkbox" defaultChecked />
              <span>Keep Me Logged In</span>
            </label>
            <button type="button" className="text-link">
              Forgot password
            </button>
          </div>
        )}

        <button
          type="button"
          className="primary-btn"
          onClick={() => (isSignup ? onSignup() : onMemberLogin())}
          disabled={!email.trim() || !password.trim() || (isSignup && !signupName.trim())}
        >
          {isSignup ? "Create account (mock)" : "Log In"}
        </button>

        <button type="button" className="secondary-btn guest-btn" onClick={onGuest}>
          Continue as guest
        </button>

        <p className="version-line">Prototype — session stored in this browser only.</p>
      </div>
    </div>
  );
}
