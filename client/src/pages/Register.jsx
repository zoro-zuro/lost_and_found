import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import Card from '../components/Card';
import API from '../services/api';

const Register = () => {
  const [activeTab, setActiveTab] = useState('STUDENT'); 
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'STUDENT',
    registerNumber: '', block: '', department: '',
    staffId: '', staffSecret: '', phone: '', altPhone: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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
    
    if (activeTab === 'STUDENT') {
      if (!formData.registerNumber) newErrors.registerNumber = 'Required';
      if (!formData.block) newErrors.block = 'Required';
      if (!formData.department) newErrors.department = 'Required';
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
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      setSuccessMessage('Welcome to the AMC community!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="w-full max-w-[680px] animate-fade-in py-12 relative z-10">
        <Card className="p-10 !rounded-[40px] border-border/10 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-[20px] mb-4 border border-primary/5">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
               </svg>
            </div>
            <h1 className="text-display text-text uppercase tracking-widest">New Identity</h1>
            <p className="text-label text-muted-text font-medium opacity-70">Register for the AMC Institutional Portal</p>
          </div>

          <div className="flex bg-bg p-1.5 rounded-[16px] border border-border h-[52px] mb-10">
            <button onClick={() => switchTab('STUDENT')} className={`flex-1 rounded-[12px] text-label font-bold transition-all ${activeTab === 'STUDENT' ? 'bg-surface text-primary shadow-sm' : 'text-muted-text hover:text-text'}`}>STUDENT</button>
            <button onClick={() => switchTab('STAFF')} className={`flex-1 rounded-[12px] text-label font-bold transition-all ${activeTab === 'STAFF' ? 'bg-surface text-primary shadow-sm' : 'text-muted-text hover:text-text'}`}>STAFF</button>
          </div>

          <form onSubmit={onSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input label="Full Name" name="name" value={formData.name} onChange={onChange} placeholder="John Doe" required error={errors.name} />
              <Input label="Institutional Email" name="email" type="email" value={formData.email} onChange={onChange} placeholder="e.g. name@amaericancollege..." required error={errors.email} />
            </div>

            {activeTab === 'STUDENT' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                <Input label="Register Number" name="registerNumber" value={formData.registerNumber} onChange={onChange} placeholder="23BIT15" required error={errors.registerNumber} />
                <Input label="Block / Hall" name="block" value={formData.block} onChange={onChange} placeholder="Washburn Hall" required error={errors.block} />
                <div className="md:col-span-2">
                  <Input label="Department" name="department" value={formData.department} onChange={onChange} placeholder="Computer Science" required error={errors.department} />
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input label="Staff/Emp ID" name="staffId" value={formData.staffId} onChange={onChange} placeholder="EMP001" required error={errors.staffId} />
                  <Input label="Department" name="department" value={formData.department} onChange={onChange} placeholder="Administration" />
                </div>
                <div className="p-6 bg-primary/5 border border-primary/10 rounded-[24px]">
                   <Input label="Registration Secret" name="staffSecret" type="password" value={formData.staffSecret} onChange={onChange} placeholder="Required for staff/admin" required error={errors.staffSecret} />
                </div>
              </div>
            )}

            <Input label="Setup Password" name="password" type="password" value={formData.password} onChange={onChange} placeholder="••••••••" required error={errors.password} />

            {errors.submit && <div className="p-4 bg-danger/5 border border-danger/20 rounded-[16px] text-danger text-small font-bold text-center uppercase">{errors.submit}</div>}
            {successMessage && <div className="p-4 bg-success/5 border border-success/20 rounded-[16px] text-success text-small font-bold text-center uppercase">{successMessage}</div>}

            <button type="submit" disabled={loading} className="btn-primary btn-xl w-full">
              {loading ? 'Generating account...' : 'Finalize Registration'}
            </button>
          </form>

          <div className="mt-10 text-center pt-8 border-t border-border">
            <p className="text-small text-muted-text font-medium">
              Already a member?{' '}
              <Link to="/login" className="font-bold text-primary hover:underline transition-colors ml-1 uppercase text-[11px] tracking-widest">Sign In</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
