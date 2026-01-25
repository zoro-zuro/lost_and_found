import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Input from '../components/Input';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import API from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', altPhone: '', block: '',
    department: '', emailNotificationsEnabled: true, notifyScope: 'all'
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await API.get('/api/auth/me');
      const userData = res.data.data.user;
      setUser(userData);
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        altPhone: userData.altPhone || '',
        block: userData.block || '',
        department: userData.department || '',
        emailNotificationsEnabled: userData.emailNotificationsEnabled !== false,
        notifyScope: userData.notifyScope || 'all'
      });
    } catch (err) {
      setToast({ message: 'Failed to load profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Required';
    if (formData.phone && formData.phone.trim().length < 10) newErrors.phone = 'Min 10 digits';
    if (user?.role === 'STUDENT') {
      if (!formData.block?.trim()) newErrors.block = 'Required';
      if (!formData.department?.trim()) newErrors.department = 'Required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      const res = await API.put('/api/users/me', formData);
      const updatedUser = res.data.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AppLayout><div className="py-24 flex justify-center"><LoadingSpinner /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader 
          title="Account Profile"
          subtitle="Manage your personal details and notification preferences."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 !rounded-[16px] text-center border-border/10 shadow-sm bg-surface">
              <div className="w-20 h-20 rounded-[16px] bg-primary/10 text-primary flex items-center justify-center text-display font-bold border border-primary/5 mx-auto mb-4">
                {user?.name?.charAt(0)}
              </div>
              <h2 className="text-h2 text-text mb-1 font-bold">{user?.name}</h2>
              <Badge variant={user?.role === 'ADMIN' ? 'danger' : 'primary'} className="scale-90">{user?.role}</Badge>
              
              <div className="mt-6 pt-6 border-t border-border space-y-4 text-left">
                 <div>
                    <label className="text-[10px] font-bold text-muted-text uppercase tracking-widest block mb-0.5">Email</label>
                    <p className="text-small text-text font-semibold truncate">{user?.email}</p>
                 </div>
                 {user?.registerNumber && (
                   <div>
                      <label className="text-[10px] font-bold text-muted-text uppercase tracking-widest block mb-0.5">Register #</label>
                      <p className="text-small text-text font-semibold">{user.registerNumber}</p>
                   </div>
                 )}
                 {user?.staffId && (
                   <div>
                      <label className="text-[10px] font-bold text-muted-text uppercase tracking-widest block mb-0.5">Staff ID</label>
                      <p className="text-small text-text font-semibold">{user.staffId}</p>
                   </div>
                 )}
              </div>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/10 !rounded-[16px]">
               <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Privacy Policy</h3>
               <p className="text-[12px] text-muted-text leading-relaxed">Your data is safe. Only relevant details are shared with verified members to facilitate returns.</p>
            </Card>
          </div>

          <div className="lg:col-span-2 pb-20">
            <form onSubmit={onSubmit} className="space-y-6">
              <Card className="p-6 space-y-8 !rounded-[16px] border-border/10 shadow-sm bg-surface">
                 <h3 className="text-h2 text-text font-bold">Edit Information</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Name" name="name" value={formData.name} onChange={onChange} required error={errors.name} />
                    <Input label="Phone" name="phone" value={formData.phone} onChange={onChange} placeholder="+91..." error={errors.phone} />
                 </div>

                 {user?.role === 'STUDENT' ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Block" name="block" value={formData.block} onChange={onChange} required error={errors.block} />
                      <Input label="Department" name="department" value={formData.department} onChange={onChange} required error={errors.department} />
                   </div>
                 ) : (
                   <Input label="Department" name="department" value={formData.department} onChange={onChange} />
                 )}

                 <div className="pt-6 border-t border-border">
                    <h4 className="text-h2 text-text font-bold mb-4">Communications</h4>
                    <label className="flex items-start gap-3 p-4 bg-bg rounded-[12px] border border-border cursor-pointer hover:bg-gray-50 transition-colors group">
                       <input 
                         type="checkbox" 
                         name="emailNotificationsEnabled" 
                         checked={formData.emailNotificationsEnabled} 
                         onChange={onChange} 
                         className="mt-1 w-5 h-5 text-primary border-border rounded" 
                       />
                       <div>
                          <span className="text-small font-bold text-text block">Email Notifications</span>
                          <span className="text-[11px] text-muted-text">Notify me about matches and messages.</span>
                       </div>
                    </label>
                 </div>
              </Card>

              <div className="flex gap-4">
                 <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-8">Cancel</button>
                 <button type="submit" disabled={saving} className="btn-primary flex-1 !h-12 !rounded-[10px] uppercase text-small font-black tracking-widest">
                   {saving ? 'Synchronizing...' : 'Save Identity Changes'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppLayout>
  );
};

export default Profile;
