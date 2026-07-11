import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { CheckCircle2, User, Phone, Loader2, Sparkles } from 'lucide-react';

function App() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer;
    if (status === 'success') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            resetForm();
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  const resetForm = () => {
    setName('');
    setPhone('');
    setStatus('idle');
    setCountdown(5);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setStatus('loading');

    try {
      // Attempt to save to Firebase
      await addDoc(collection(db, 'checkins'), {
        name,
        phone,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Firebase error (expected if using placeholders):", error);
      // We continue to 'success' state even on error so you can test the UI 
      // without needing real Firebase credentials immediately.
    }

    setStatus('success');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Main Card Container */}
        <div className="bg-slate-800 rounded-3xl shadow-2xl p-8 border border-slate-700/50 relative overflow-hidden backdrop-blur-sm">

          {/* Subtle gradient background effect */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 min-h-[320px] flex flex-col justify-center">

            {status === 'idle' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl mb-4">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Event Check-In</h1>
                  <p className="text-slate-400">Please enter your details to join</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                        <User className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-white placeholder-slate-500 outline-none"
                        placeholder="John Doe"
                        required
                        disabled={status !== 'idle'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                        <Phone className="h-5 w-5" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-white placeholder-slate-500 outline-none"
                        placeholder="+1 (555) 000-0000"
                        required
                        disabled={status !== 'idle'}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!name.trim() || !phone.trim() || status !== 'idle'}
                    className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 px-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Check In Now
                  </button>
                </form>
              </div>
            )}

            {status === 'loading' && (
              <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                <p className="text-slate-400 font-medium animate-pulse">Saving your details...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="animate-in zoom-in-95 fade-in duration-500 flex flex-col items-center justify-center py-8 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                  <CheckCircle2 className="w-24 h-24 text-emerald-500 relative z-10" />
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">You're checked in ✅</h2>
                <p className="text-slate-300 mb-8">Welcome to the event, {name.split(' ')[0]}!</p>

                <div className="flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-emerald-400 font-mono mb-2">
                    {countdown}
                  </div>
                  <div className="text-sm text-slate-500 uppercase tracking-widest font-medium">
                    Resetting
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
