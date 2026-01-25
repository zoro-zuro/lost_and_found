import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import Card from '../components/Card';
import API from '../services/api';

const Login = () => {
  const [activeTab, setActiveTab] = useState('STUDENT'); 
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    setLoading(true);
    try {
      const res = await API.post('/api/auth/login', formData);
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      navigate('/dashboard');
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Login failed. Please check your credentials.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="w-full max-w-[440px] animate-fade-in relative z-10">
        <Card className="p-10 !rounded-[32px] border-border/10 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 text-primary rounded-[24px] mb-6 shadow-sm border border-primary/5">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-display text-text mb-2 uppercase tracking-wide">Portal Access</h1>
            <p className="text-label text-muted-text font-medium opacity-70">AMC Institutional Sign-in</p>
          </div>

          <div className="flex bg-bg p-1.5 rounded-[16px] border border-border h-[52px] mb-8">
            <button
              onClick={() => setActiveTab('STUDENT')}
              className={`flex-1 rounded-[12px] text-label font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'STUDENT' ? 'bg-surface text-primary shadow-sm' : 'text-muted-text hover:text-text'}`}
            >
              STUDENT
            </button>
            <button
              onClick={() => setActiveTab('STAFF')}
              className={`flex-1 rounded-[12px] text-label font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'STAFF' ? 'bg-surface text-primary shadow-sm' : 'text-muted-text hover:text-text'}`}
            >
              STAFF
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <Input
              label="Institutional Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={onChange}
              placeholder="e.g. 23bit15@americancollege.edu.in"
              required
              error={errors.email}
            />

            <Input
              label="Secure Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={onChange}
              placeholder="••••••••"
              required
              error={errors.password}
            />

            {errors.submit && (
              <div className="p-4 bg-danger/5 border border-danger/20 rounded-[16px] text-danger text-[13px] font-bold animate-shake text-center uppercase tracking-tight">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary btn-xl"
            >
              {loading ? 'Authenticating...' : 'Enter Portal'}
            </button>
          </form>

          <div className="mt-10 text-center pt-8 border-t border-border">
            <p className="text-small text-muted-text font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-primary hover:underline transition-colors ml-1 uppercase text-[11px] tracking-widest">
                Register Identity
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
