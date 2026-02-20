import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('STUDENT');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    const amcEmailRegex = /^[a-z0-9]+@americancollege\.edu\.in$/i;
    if (!amcEmailRegex.test(email)) {
      return 'Please use your AMC institutional email.';
    }
    return '';
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Prevent rapid attempts (debounce - wait 2 seconds between attempts)
    const now = Date.now();
    if (now - lastAttemptTime < 2000) {
      setErrors({ submit: 'Please wait a moment before trying again.' });
      return;
    }
    setLastAttemptTime(now);
    
    setLoading(true);
    try {
      const res = await API.post('/api/auth/login', formData);
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      navigate('/dashboard');
    } catch (err) {
      // Handle different error types appropriately
      if (err.response?.status === 429) {
        setErrors({ submit: 'Too many login attempts. Please wait a moment and try again.' });
      } else if (err.response?.status === 401) {
        setErrors({ submit: 'Invalid email or password.' });
      } else {
        setErrors({ submit: err.response?.data?.message || 'Login failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mesh-bg-full font-sans text-slate-900 min-h-screen flex items-center justify-center p-4 md:px-6 md:py-4 lg:px-8 lg:py-6 transition-colors duration-300">
      <div className="w-full max-w-[1140px] mx-auto relative h-[85vh] max-h-[800px]">
        {/* Main Container */}
        <div className="relative h-full rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] overflow-hidden bg-white/20 border-white/40 border">
          
          {/* Form Section - 60% of space */}
          <div className="w-full lg:w-[50%] flex flex-col justify-start p-4 md:p-6 lg:px-8 lg:py-4 z-30 relative h-full overflow-y-auto scrollbar-hide bg-white/50">
            <div className="w-full max-w-md mx-auto pt-4 pb-1 pl-4">
            
                {/* Header */}
                <div className="flex flex-col items-center mb-4 md:mb-6 text-center">
                  <h2 className="text-xl md:text-xl lg:text-2xl font-display font-black tracking-tight text-slate-900 uppercase">Portal Access</h2>
                  <p className="text-slate-700 font-medium mt-1 text-sm md:text-sm lg:text-base">AMC Institutional Sign-in</p>
                </div>

                {/* Tab Switcher */}
                <div className="bg-white/20 px-1 py-0.5 rounded-2xl mb-4 md:mb-6 border border-white w-full max-w-xs mx-auto">
                  <div className="flex bg-white/30 px-1 py-1 rounded-xl border border-white/20">
                  <button
                    onClick={() => setActiveTab('STUDENT')}
                    className={`flex-1 py-2 px-3 md:px-6 rounded-lg text-xs md:text-sm font-bold transition-all ${
                      activeTab === 'STUDENT' 
                        ? 'bg-white shadow-sm text-slate-900' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    STUDENT
                  </button>
                  <button
                    onClick={() => setActiveTab('STAFF')}
                    className={`flex-1 py-2 px-3 md:px-6 rounded-lg text-xs md:text-sm font-bold transition-all ${
                      activeTab === 'STAFF' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    STAFF
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={onSubmit} className="space-y-3 md:space-y-5">
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 ml-1" htmlFor="email">
                    Institutional Email *
                  </label>
                  <div className="relative group">
                    <input
                      className="w-full bg-white/60 border border-white/40 rounded-xl px-3 py-2 text-slate-900 focus:border-royal-blue/50 transition-all outline-none placeholder:text-slate-500 text-sm"
                      id="email"
                      name="email"
                      type="email"
                      placeholder="student@college.edu"
                      value={formData.email}
                      onChange={onChange}
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-500 group-focus-within:text-primary transition-colors text-base">
                      alternate_email
                    </span>
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 ml-1" htmlFor="password">
                    Secure Password *
                  </label>
                  <div className="relative group">
                    <input
                      className="w-full bg-white/60 border border-white/40 rounded-xl px-3 py-2 text-slate-900 focus:border-royal-blue/50 transition-all outline-none placeholder:text-slate-500 text-sm"
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      value={formData.password}
                      onChange={onChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-500 hover:text-primary cursor-pointer transition-colors text-base"
                    >
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>
                  )}
                </div>

                {/* Error Message */}
                {errors.submit && (
                  <div className="p-2 md:p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs md:text-sm font-medium text-center">
                    {errors.submit}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-royal-blue hover:bg-blue-600 text-white font-bold py-3 md:py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] mt-2 flex items-center justify-center gap-2 md:gap-3 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed md:mt-8"
                >
                  {loading ? 'Authenticating...' : 'Enter Portal'}
                  <span className="material-symbols-rounded text-base">arrow_forward</span>
                </button>
              </form>

              {/* Register Link */}
              <div className="pt-3 md:pt-4 border-t border-slate-200 text-center">
                <p className="text-slate-700 font-medium text-xs md:text-sm">
                  New Member?{' '}
                  <Link to="/register" className="text-primary font-bold ml-1 hover:underline underline-offset-4 uppercase tracking-wide">
                    Register Identity
                  </Link>
                </p>
              </div>
              
            </div>
          </div>

          {/* Design Overlay - 40% of space */}
          <div className="hidden lg:flex absolute inset-0 lg:left-[50%] pointer-events-none">
            {/* Wavy Separator */}
            <svg className="absolute left-0 top-0 h-full w-[120px] animate-wave-flow origin-left z-20 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 1000">
              <path d="M100,0 C60,150 140,350 100,500 C60,650 140,850 100,1000 L0,1000 L0,0 Z" fill="rgba(255,255,255,0.5)"></path>
            </svg>
            
            {/* Animated Bubbles */}
            <div className="absolute top-16 right-16 w-24 h-24 rounded-full glass-bubble animate-bounce-subtle" style={{animationDuration: '6s', animationDelay: '1s'}}></div>
            <div className="absolute bottom-32 left-16 w-32 h-32 rounded-full glass-bubble animate-bounce-subtle" style={{animationDuration: '8s'}}></div>
            <div className="absolute top-1/2 right-8 w-16 h-16 rounded-full glass-bubble opacity-60 animate-bounce-subtle" style={{animationDuration: '5s', animationDelay: '2s'}}></div>
            
            {/* SVG Paths */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M-10,30 Q20,10 50,30 T110,30" fill="none" stroke="#4A6CF7" strokeWidth="0.2"></path>
              <path d="M-10,70 Q30,90 60,70 T110,70" fill="none" stroke="#E8D5F2" strokeWidth="0.3"></path>
            </svg>
            
            <div className="relative z-10 flex flex-col items-center text-center p-6 md:p-8 max-w-lg h-full justify-center">
              {/* Main Illustration */}
              <div className="relative w-[350px] h-[320px] flex items-center justify-center">
                <svg className="w-64 h-64 drop-shadow-2xl hover:scale-105 transition-transform duration-500" fill="none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path d="M45,70 C45,50 60,40 100,40 C140,40 155,50 155,70 L155,160 C155,175 140,185 100,185 C60,185 45,175 45,160 Z" fill="#D1F2EB" stroke="#1E293B" strokeLinejoin="round" strokeWidth="3"></path>
                  <path d="M60,40 C60,25 75,20 100,20 C125,20 140,25 140,40" stroke="#1E293B" strokeLinecap="round" strokeWidth="3"></path>
                  <path d="M45,90 H155" stroke="#1E293B" strokeDasharray="4 4" strokeWidth="2"></path>
                  <rect fill="#FFD8B1" height="40" rx="8" stroke="#1E293B" strokeWidth="2.5" width="50" x="75" y="110"></rect>
                  <path d="M90,130 H110" stroke="#1E293B" strokeLinecap="round" strokeWidth="3"></path>
                </svg>
                
                {/* Animated Elements */}
                <div 
  className="absolute top-2 left-8 transform rotate-12 animate-bounce-subtle"
  style={{ animationDelay: '1.5s' }}
>
  <svg fill="none" height="28" viewBox="0 0 80 40" width="70">
    
    {/* Key Head */}
    <circle
      cx="20"
      cy="20"
      r="10"
      fill="#D1F2EB"
      stroke="#1E293B"
      strokeWidth="2"
    />

    {/* Inner hole of key */}
    <circle
      cx="20"
      cy="20"
      r="4"
      stroke="#1E293B"
      strokeWidth="2"
    />

    {/* Key Shaft */}
    <rect
      x="30"
      y="18"
      width="28"
      height="4"
      fill="#D1F2EB"
      stroke="#1E293B"
      strokeWidth="2"
    />

    {/* Key Teeth */}
    <path
      d="M58 18 v6 h6 v-6"
      fill="#D1F2EB"
      stroke="#1E293B"
      strokeWidth="2"
    />
  </svg>
</div>

                <div className="absolute top-0 right-8 transform rotate-12 animate-bounce-subtle" style={{animationDelay: '1.5s'}}>
                  <svg fill="none" height="28" viewBox="0 0 60 30" width="56">
                    <circle cx="15" cy="15" fill="#D1F2EB" r="10" stroke="#1E293B" strokeWidth="2"></circle>
                    <circle cx="45" cy="15" fill="#D1F2EB" r="10" stroke="#1E293B" strokeWidth="2"></circle>
                    <path d="M25,15 C30,10 30,10 35,15" stroke="#1E293B" strokeWidth="2"></path>
                  </svg>
                </div>
                <div className="absolute bottom-8 right-0 transform rotate-45 animate-bounce-subtle" style={{animationDelay: '1s'}}>
                  <svg fill="none" height="44" viewBox="0 0 30 50" width="28">
                    <rect fill="#FFD8B1" height="46" rx="4" stroke="#1E293B" strokeWidth="2" width="26" x="2" y="2"></rect>
                    <rect fill="#1E293B" height="2" rx="1" width="6" x="12" y="42"></rect>
                  </svg>
                </div>
              </div>
              
              {/* Text Content */}
              <div className="mt-4">
                <h1 className="text-3xl md:text-4xl font-sans font-bold text-navy tracking-tight text-shadow-sm">
                  College Lost &amp; Found
                </h1>
                <p className="mt-4 text-base md:text-lg text-slate-700 font-medium leading-relaxed max-w-md mx-auto">
                  A creative hub to reconnect with your essentials and keep our campus community whole.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
