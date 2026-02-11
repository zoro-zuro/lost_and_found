import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const Register = () => {
  const [activeTab, setActiveTab] = useState('STUDENT'); 
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    registerNumber: '',
    block: '',
    department: '',
    staffId: '',
    staffSecret: '',
    phone: '',
    altPhone: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const amcEmailRegex = /^[a-z0-9]+@americancollege\.edu\.in$/i;
    return amcEmailRegex.test(email) ? '' : 'Please use your AMC institutional email.';
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setFormData({ ...formData, role: tab, registerNumber: '', block: '', staffId: '', staffSecret: '' });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Required';
    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;
    if (formData.password.length < 6) newErrors.password = 'Min 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (activeTab === 'STUDENT') {
      if (!formData.registerNumber) newErrors.registerNumber = 'Required';
      if (!formData.block) newErrors.block = 'Required';
    } else {
      if (!formData.staffId) newErrors.staffId = 'Required';
      if (!formData.staffSecret) newErrors.staffSecret = 'Required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const res = await API.post('/api/auth/register', formData);
      
      // Auto-login after successful registration
      if (res.data.data.token && res.data.data.user) {
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        
        setSuccessMessage('Registration successful! Redirecting to your dashboard...');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        // Fallback if token is not returned (unlikely but safe)
        setSuccessMessage('Registration successful! Please sign in.');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mesh-bg-full font-sans text-slate-900 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Main Container */}
        <div className="relative border-white border bg-white/20 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] overflow-hidden">
          
          <div className="flex flex-col lg:flex-row">
            {/* Form Section - Left Side */}
            <div className="w-full lg:w-1/2 p-8 lg:p-8 bg-white/50">
              <div className="max-w-md mx-auto">
                {/* Glass Panel for Form */}
              
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl lg:text-3xl font-display font-black tracking-tight text-slate-900 uppercase">
                      New Identity
                    </h2>
                    <p className="text-slate-700 font-medium mt-2 text-sm lg:text-base">
                      Register for the AMC Institutional Portal
                    </p>
                  </div>

                  {/* Tab Switcher */}
                  <div className="flex bg-white/50 p-1 rounded-2xl mb-6 border border-white">
                    <button
                      onClick={() => switchTab('STUDENT')}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                        activeTab === 'STUDENT' 
                          ? 'bg-white shadow-sm text-slate-900' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      STUDENT
                    </button>
                    <button
                      onClick={() => switchTab('STAFF')}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                        activeTab === 'STAFF' 
                          ? 'bg-white shadow-sm text-slate-900' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      STAFF
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">
                          Full Name *
                        </label>
                        <input 
                          className="w-full bg-white/60 border border-white/40 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-slate-400 text-sm" 
                          name="name"
                          placeholder="John Doe" 
                          value={formData.name}
                          onChange={onChange}
                          required 
                          type="text"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">
                          Institutional Email *
                        </label>
                        <input 
                          className="w-full bg-white/60 border border-white/40 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-slate-400 text-sm" 
                          name="email"
                          placeholder="thahir@gmail.com" 
                          value={formData.email}
                          onChange={onChange}
                          required 
                          type="email"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                      </div>

                      {/* Conditional fields based on tab */}
                      {activeTab === 'STUDENT' ? (
                        <>
                          {/* Register Number */}
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">
                              Register Number *
                            </label>
                            <input 
                              className="w-full bg-white/60 border border-white/40 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-slate-400 text-sm" 
                              name="registerNumber"
                              placeholder="23BIT15" 
                              value={formData.registerNumber}
                              onChange={onChange}
                              required 
                              type="text"
                            />
                            {errors.registerNumber && <p className="text-red-500 text-xs mt-1 ml-1">{errors.registerNumber}</p>}
                          </div>

                          {/* Block */}
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">
                              Block / Hall *
                            </label>
                            <input 
                              className="w-full bg-white/60 border border-white/40 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-slate-400 text-sm" 
                              name="block"
                              placeholder="Washburn Hall" 
                              value={formData.block}
                              onChange={onChange}
                              required 
                              type="text"
                            />
                            {errors.block && <p className="text-red-500 text-xs mt-1 ml-1">{errors.block}</p>}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Staff ID */}
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">
                              Staff ID *
                            </label>
                            <input 
                              className="w-full bg-white/60 border border-white/40 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-slate-400 text-sm" 
                              name="staffId"
                              placeholder="STAFF001" 
                              value={formData.staffId}
                              onChange={onChange}
                              required 
                              type="text"
                            />
                            {errors.staffId && <p className="text-red-500 text-xs mt-1 ml-1">{errors.staffId}</p>}
                          </div>

                          {/* Staff Secret */}
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">
                              Staff Secret *
                            </label>
                            <input 
                              className="w-full bg-white/60 border border-white/40 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-slate-400 text-sm" 
                              name="staffSecret"
                              placeholder="Secret Code" 
                              value={formData.staffSecret}
                              onChange={onChange}
                              required 
                              type="password"
                            />
                            {errors.staffSecret && <p className="text-red-500 text-xs mt-1 ml-1">{errors.staffSecret}</p>}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Password */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">
                          Setup Password *
                        </label>
                        <div className="relative">
                          <input 
                            className="w-full bg-white/60 border border-white/40 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-slate-400 text-sm" 
                            name="password"
                            placeholder="••••••••••" 
                            value={formData.password}
                            onChange={onChange}
                            required 
                            type={showPassword ? "text" : "password"}
                          />
                          <span 
                            className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-lg cursor-pointer hover:text-primary"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? 'visibility' : 'visibility_off'}
                          </span>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <input 
                            className="w-full bg-white/60 border border-white/40 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-slate-400 text-sm" 
                            name="confirmPassword"
                            placeholder="••••••••••" 
                            value={formData.confirmPassword}
                            onChange={onChange}
                            required 
                            type={showPassword ? "text" : "password"}
                          />
                          <span 
                            className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-lg cursor-pointer hover:text-primary"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? 'visibility' : 'visibility_off'}
                          </span>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
                      </div>
                    </div>

                    {/* Error Message */}
                    {errors.submit && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium text-center">
                        {errors.submit}
                      </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm font-medium text-center">
                        {successMessage}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-royal-blue hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] mt-6 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Finalizing Registration...' : 'Finalize Registration'}
                    </button>

                    {/* Login Link */}
                    <div className="pt-4 border-t border-slate-200 text-center mt-6">
                      <p className="text-slate-700 font-medium text-sm">
                        Already a member?{' '}
                        <Link to="/login" className="text-primary font-bold ml-1 hover:underline underline-offset-4 uppercase tracking-wide">
                          Sign In
                        </Link>
                      </p>
                    </div>
                  </form>
                
              </div>
            </div>

            {/* Design Overlay - Right Side */}
            <div className="hidden lg:flex w-full lg:w-1/2 relative overflow-hidden">
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
              
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-12 w-full">
                {/* Main Illustration */}
                <div className="relative w-[350px] h-[320px] flex items-center justify-center mb-8">
                  <svg className="w-64 h-64 drop-shadow-2xl hover:scale-105 transition-transform duration-500" fill="none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path d="M45,70 C45,50 60,40 100,40 C140,40 155,50 155,70 L155,160 C155,175 140,185 100,185 C60,185 45,175 45,160 Z" fill="#D1F2EB" stroke="#1E293B" strokeLinejoin="round" strokeWidth="3"></path>
                    <path d="M60,40 C60,25 75,20 100,20 C125,20 140,25 140,40" stroke="#1E293B" strokeLinecap="round" strokeWidth="3"></path>
                    <path d="M45,90 H155" stroke="#1E293B" strokeDasharray="4 4" strokeWidth="2"></path>
                    <rect fill="#FFD8B1" height="40" rx="8" stroke="#1E293B" strokeWidth="2.5" width="50" x="75" y="110"></rect>
                    <path d="M90,130 H110" stroke="#1E293B" strokeLinecap="round" strokeWidth="3"></path>
                  </svg>
                  
                  {/* Animated Elements */}
                  <div className="absolute top-8 left-8 transform -rotate-12 animate-bounce-subtle" style={{animationDelay: '0.5s'}}>
                    <svg fill="none" height="36" viewBox="0 0 40 40" width="36">
                      <circle cx="15" cy="15" fill="#E8D5F2" r="8" stroke="#1E293B" strokeWidth="2"></circle>
                      <path d="M22,22 L35,35 M30,30 L35,25 M25,35 L30,30" stroke="#1E293B" strokeLinecap="round" strokeWidth="2"></path>
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
                <div>
                  <h1 className="text-4xl font-sans font-bold text-navy tracking-tight text-shadow-sm">
                    College Lost &amp; Found
                  </h1>
                  <p className="mt-4 text-lg text-slate-700 font-medium leading-relaxed max-w-md mx-auto">
                    A creative hub to reconnect with your essentials and keep our campus community whole.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;