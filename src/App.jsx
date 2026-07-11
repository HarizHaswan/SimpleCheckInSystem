import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { User, Phone, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

const COUNTDOWN_FROM = 5;
const CIRCUMFERENCE = 2 * Math.PI * 34; // radius = 34

function App() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);
  const timerRef = useRef(null);

  const validatePhone = (value) => {
    if (!value.trim()) return '';
    // Must start with + followed by at least one digit
    if (!/^\+\d/.test(value.trim())) {
      return 'Please include a country code (e.g. +60, +1, +66)';
    }
    return '';
  };

  useEffect(() => {
    if (status === 'success') {
      setCountdown(COUNTDOWN_FROM);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            clearInterval(timerRef.current);
            setTimeout(resetForm, 800); // show 0 briefly, then reset
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  const resetForm = () => {
    setName('');
    setPhone('');
    setPhoneError('');
    setStatus('idle');
    setCountdown(COUNTDOWN_FROM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validatePhone(phone);
    if (error) { setPhoneError(error); return; }
    if (!name.trim() || !phone.trim()) return;
    setStatus('loading');
    try {
      await addDoc(collection(db, 'checkins'), {
        name,
        phone,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error('Firebase error:', err);
    }
    setStatus('success');
  };

  const twoNames = name.split(' ').slice(0, 2).join(' ');

  // Ring progress: goes from full to empty over COUNTDOWN_FROM seconds
  const progress = countdown / COUNTDOWN_FROM;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const isFormValid = name.trim().length > 0 && phone.trim().length > 0 && !validatePhone(phone);

  return (
    <>
      {/* Background scene */}
      <div className="bg-scene">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      <div className="bg-grid" />

      {/* Main layout */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        {/* Brand header */}
        <div style={{ marginBottom: '32px', textAlign: 'center', animation: 'fadeSlideDown 0.5s ease both' }}>
          <div className="badge" style={{ marginBottom: '16px' }}>
            <span className="dot-live" />
            Live Event
          </div>
          <h1
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 'clamp(28px, 5vw, 42px)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.55) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Guest Check-In
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', marginTop: '6px' }}>
            Register your attendance below
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ width: '100%', maxWidth: '420px' }}>

          {/* ── IDLE: Form ── */}
          {status === 'idle' && (
            <div className="animate-fade-slide-up" style={{ padding: '40px 36px' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Name */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.4)',
                      marginBottom: '8px',
                    }}
                  >
                    Full Name
                  </label>
                  <div className="field-wrapper" style={{ position: 'relative' }}>
                    <User className="field-icon" size={16} />
                    <input
                      className="field-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sarah Johnson"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.4)',
                      marginBottom: '8px',
                    }}
                  >
                    Phone Number
                  </label>
                  <div className="field-wrapper" style={{ position: 'relative' }}>
                    <Phone className="field-icon" size={16} />
                    <input
                      className="field-input"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setPhoneError(validatePhone(e.target.value));
                      }}
                      onBlur={(e) => setPhoneError(validatePhone(e.target.value))}
                      placeholder="e.g. +60 12-345 6789"
                      required
                      style={phoneError ? { borderColor: 'rgba(239,68,68,0.7)', boxShadow: '0 0 0 3px rgba(239,68,68,0.15)' } : {}}
                    />
                  </div>
                  {phoneError && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '8px',
                      padding: '8px 12px',
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fca5a5',
                      fontWeight: 500,
                    }}>
                      <span style={{ fontSize: '14px' }}>⚠️</span>
                      {phoneError}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!isFormValid}
                  style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  Check In
                  <ArrowRight size={16} />
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.18)', marginTop: '24px' }}>
                Your data is stored securely
              </p>
            </div>
          )}

          {/* ── LOADING ── */}
          {status === 'loading' && (
            <div
              style={{
                padding: '64px 36px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                animation: 'zoomIn 0.3s ease both',
              }}
            >
              <Loader2 className="loader-spin" size={40} color="rgba(139,92,246,0.9)" />
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                Saving your details…
              </p>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {status === 'success' && (
            <div
              className="animate-zoom-in"
              style={{
                padding: '48px 36px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              {/* Check icon with glow */}
              <div
                className="animate-check-glow"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed22, #4f46e522)',
                  border: '1.5px solid rgba(139,92,246,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <CheckCircle2 size={34} color="#a78bfa" strokeWidth={1.8} />
              </div>

              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#a78bfa',
                  marginBottom: '10px',
                }}
              >
                Checked In ✓
              </div>

              <h2
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: '28px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  color: '#fff',
                  marginBottom: '8px',
                }}
              >
                Welcome, {twoNames}!
              </h2>

              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', marginBottom: '36px' }}>
                You're all set. Enjoy the event 🎉
              </p>

              {/* Countdown ring */}
              <div className="ring-container" style={{ margin: '0 auto' }}>
                <svg className="ring-svg" viewBox="0 0 80 80">
                  <defs>
                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                  <circle className="ring-track" cx="40" cy="40" r="34" />
                  <circle
                    className="ring-progress"
                    cx="40"
                    cy="40"
                    r="34"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                  />
                </svg>
                <div className="ring-number" style={{ color: '#a78bfa' }}>
                  {countdown}
                </div>
              </div>

              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '12px', letterSpacing: '0.04em' }}>
                Next guest in {countdown}s
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p style={{ marginTop: '28px', fontSize: '12px', color: 'rgba(255,255,255,0.15)' }}>
          Build with Firebase &amp; React by Muhammad Hariz &amp; Powered by Google Antigravity.
        </p>
      </div>
    </>
  );
}

export default App;
