import { useState } from "react";
import CompassScreen from "./components/compass/CompassScreen";

const TAB_HOME = "home";
const TAB_COMPASS = "compass";

function StatusBar() {
  return (
    <div className="status-bar" aria-hidden="true">
      <span className="status-time">09:11</span>
      <div className="status-icons">
        <span className="signal-bars">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="status-wifi" />
        <span className="status-battery" />
      </div>
    </div>
  );
}

function VinFastMark({ small = false }) {
  return (
    <svg className={small ? "vinfast-mark small" : "vinfast-mark"} viewBox="0 0 160 120" aria-hidden="true">
      <defs>
        <linearGradient id="vf-metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fbff" />
          <stop offset="18%" stopColor="#8f949e" />
          <stop offset="48%" stopColor="#ffffff" />
          <stop offset="72%" stopColor="#71757d" />
          <stop offset="100%" stopColor="#eef2f9" />
        </linearGradient>
      </defs>
      <path
        d="M18 20L80 102L142 20"
        fill="none"
        stroke="url(#vf-metal)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M30 22L80 86L130 22"
        fill="none"
        stroke="rgba(255,255,255,0.86)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2c-3.3 0-6 2.7-6 6v2.2c0 1.2-.4 2.4-1.1 3.4l-1.2 1.7A1 1 0 0 0 4 17h16a1 1 0 0 0 .8-1.6l-1.2-1.7c-.7-1-1.1-2.2-1.1-3.4V8c0-3.3-2.7-6-6-6Zm0 20a2.5 2.5 0 0 0 2.4-1.8H9.6A2.5 2.5 0 0 0 12 22Z" fill="currentColor"/>
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 11.2 12 4l9 7.2V20a1 1 0 0 1-1 1h-5.5v-5.5h-5V21H4a1 1 0 0 1-1-1v-8.8Z" fill="currentColor"/>
    </svg>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 10.1A3.1 3.1 0 1 1 12 6.9a3.1 3.1 0 0 1 0 6.2Z" fill="currentColor"/>
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm3.6 6.4-2.2 5.8-5.8 2.2 2.2-5.8 5.8-2.2Z" fill="currentColor"/>
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2c-4.2 0-8 2.1-8 5v3h16v-3c0-2.9-3.8-5-8-5Z" fill="currentColor"/>
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h12.2l-4.6-4.6 1.4-1.4L21 12l-7 6-1.4-1.4 4.6-4.6H5z" fill="currentColor"/>
    </svg>
  );
}

function BottomTabBar({ activeTab, onChangeTab }) {
  return (
    <nav className="tab-bar" aria-label="Main navigation">
      <button
        type="button"
        className={activeTab === TAB_HOME ? "tab-btn active" : "tab-btn"}
        aria-label="Home"
        onClick={() => onChangeTab(TAB_HOME)}
      >
        <HomeIcon />
        <span>Home</span>
      </button>
      <button type="button" className="tab-btn" aria-label="Map" aria-disabled="true">
        <MapIcon />
      </button>
      <button
        type="button"
        className={activeTab === TAB_COMPASS ? "tab-btn active" : "tab-btn"}
        aria-label="Explore"
        onClick={() => onChangeTab(TAB_COMPASS)}
      >
        <CompassIcon />
      </button>
      <button type="button" className="tab-btn" aria-label="Account" aria-disabled="true">
        <ProfileIcon />
      </button>
    </nav>
  );
}

function CarVisual({ variant }) {
  return (
    <div className={`car-visual ${variant}`} aria-hidden="true">
      <svg viewBox="0 0 360 180">
        <path
          d="M52 114c16-29 35-48 80-53l42-18c20-8 55-7 76 4l32 16 32 7c15 4 25 14 31 28l9 21v17H21v-13c0-7 2-13 6-19l25-24Z"
          fill="currentColor"
        />
        <path
          d="M96 74c23-12 51-18 76-16l39 3c20 2 39 12 53 28l18 20H72l24-35Z"
          fill="rgba(255,255,255,0.14)"
        />
        <path d="M70 119h230c14 0 25 9 31 21H39c6-13 18-21 31-21Z" fill="#10131b" />
        <circle cx="108" cy="150" r="28" fill="#0d1117" />
        <circle cx="108" cy="150" r="15" fill="#aeb5c4" />
        <circle cx="261" cy="150" r="28" fill="#0d1117" />
        <circle cx="261" cy="150" r="15" fill="#aeb5c4" />
        <path d="M64 110h40l10-13H72c-5 0-8 4-8 10Z" fill="rgba(255,255,255,0.4)" />
        <path d="M276 110h44c-1-6-6-11-13-11h-23l-8 11Z" fill="rgba(255,255,255,0.4)" />
      </svg>
    </div>
  );
}

function LoginScreen({ email, password, setEmail, setPassword, onLogin }) {
  return (
    <div className="screen login-screen">
      <StatusBar />

      <button type="button" className="lang-pill" aria-label="Language switcher">
        <span className="lang-globe" aria-hidden="true">◌</span>
        <span>EN</span>
      </button>

      <div className="login-mark-wrap">
        <VinFastMark />
      </div>

      <div className="login-fields">
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

        <div className="login-row">
          <label className="check-row">
            <input type="checkbox" defaultChecked />
            <span>Keep Me Logged In</span>
          </label>
          <button type="button" className="text-link">
            Forgot password
          </button>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={onLogin}
          disabled={!email.trim() || !password.trim()}
        >
          Log In
        </button>

        <div className="face-id" aria-hidden="true">
          <div className="face-id-frame">
            <span />
            <span />
            <span />
            <span />
            <em />
          </div>
        </div>

        <p className="register-line">
          Don’t have an account? <button type="button">Register</button>
        </p>

        <p className="version-line">Version VN 2.19.18</p>
      </div>
    </div>
  );
}

function HomeScreen({ activeTab, onChangeTab }) {
  return (
    <div className="screen home-screen">
      <StatusBar />

      <div className="home-top">
        <VinFastMark small />
        <button type="button" className="icon-bubble" aria-label="Notifications">
          <BellIcon />
        </button>
      </div>

      <section className="hero-section">
        <div className="hero-header">
          <p>DISCOVER VINFAST</p>
        </div>

        <div className="car-grid">
          <article className="car-card dark">
            <div className="car-copy">
              <h2>VF 9</h2>
              <span>VinFast</span>
            </div>
            <button type="button" className="car-arrow" aria-label="Open VF 9 details">
              <ArrowIcon />
            </button>
            <CarVisual variant="black" />
          </article>

          <article className="car-card light">
            <div className="car-copy">
              <h2>VF 8</h2>
              <span>VinFast</span>
            </div>
            <button type="button" className="car-arrow" aria-label="Open VF 8 details">
              <ArrowIcon />
            </button>
            <CarVisual variant="silver" />
          </article>
        </div>

        <div className="page-dots" aria-hidden="true">
          <span className="active" />
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="more-section">
        <h3>MORE</h3>

        <div className="more-list">
          <button type="button" className="more-item">
            <span className="more-icon group" aria-hidden="true">◔</span>
            <span className="more-label">VinFast Community</span>
            <ArrowIcon />
          </button>

          <button type="button" className="more-item">
            <span className="more-icon info" aria-hidden="true">i</span>
            <span className="more-label">More about our app</span>
            <ArrowIcon />
          </button>

          <button type="button" className="more-item">
            <span className="more-icon drive" aria-hidden="true">↯</span>
            <span className="more-label">Drive with VinFast</span>
            <ArrowIcon />
          </button>
        </div>
      </section>

      <BottomTabBar activeTab={activeTab} onChangeTab={onChangeTab} />
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState(TAB_HOME);
  const [email, setEmail] = useState("dohieunt1102@gmail.com");
  const [password, setPassword] = useState("");

  return (
    <main className="app-page">
      <div className="phone-frame">
        {isLoggedIn ? (
          activeTab === TAB_COMPASS ? (
            <CompassScreen
              StatusBar={StatusBar}
              VinFastMark={VinFastMark}
              BellIcon={BellIcon}
              BottomTabBar={BottomTabBar}
              activeTab={activeTab}
              onChangeTab={setActiveTab}
            />
          ) : (
            <HomeScreen activeTab={activeTab} onChangeTab={setActiveTab} />
          )
        ) : (
          <LoginScreen
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
            onLogin={() => {
              setIsLoggedIn(true);
              setActiveTab(TAB_HOME);
            }}
          />
        )}
      </div>
    </main>
  );
}
