import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Input from '../components/Input';
import TextArea from '../components/TextArea';
import Select from '../components/Select';
import PageHeader from '../components/PageHeader';
import Toast from '../components/Toast';
import API from '../services/api';

const ReportLost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: '', category: '', dateLost: '', locationLost: [],
    otherLocation: '', description: '', color: '', brand: '',
    uniqueMark: '', contactPhone: '', visibility: 'CAMPUS',
    notifyRequested: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const categories = [
    { value: 'ID Card', label: 'ID Card' },
    { value: 'Phone', label: 'Phone' },
    { value: 'Wallet', label: 'Wallet' },
    { value: 'Bag', label: 'Bag' },
    { value: 'Keys', label: 'Keys' },
    { value: 'Book', label: 'Book' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Other', label: 'Other' }
  ];

  const locations = [
    { value: 'main-hall', label: 'Main Hall (Offices, Assembly Hall)' },
    { value: 'james-hall', label: 'James Hall (Physics, Chemistry)' },
    { value: 'jivana-jyoti-block', label: 'Jivana Jyoti Block' },
    { value: 'binghamton-hall', label: 'Binghamton Hall (Bio)' },
    { value: 'flint-house', label: 'Flint House (English)' },
    { value: 'new-building', label: 'New Building (CS, Management)' },
    { value: 'paul-linder-love-hall', label: 'Paul Linder Love Hall (MCA, Data)' },
    { value: 'jones-hall', label: 'Jones Hall (Exam)' },
    { value: 'washburn-hall', label: 'Washburn Hall' },
    { value: 'dudley-hall', label: 'Dudley Hall' },
    { value: 'wallace-hall', label: 'Wallace Hall' },
    { value: 'ladies-hostel', label: 'Ladies Hostel' },
    { value: 'college-canteen', label: 'College Canteen' },
    { value: 'library', label: 'Library' },
    { value: 'main-gate', label: 'Main Gate' },
    { value: 'playground', label: 'Playground' },
    { value: 'other', label: 'Other (specify)' }
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setToast({
          message: 'Please select an image file',
          type: 'error'
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setToast({
          message: 'Image size should be less than 5MB',
          type: 'error'
        });
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.itemName.trim()) newErrors.itemName = 'Required';
    if (!formData.category) newErrors.category = 'Required';
    if (!formData.dateLost) newErrors.dateLost = 'Required';
    if (formData.locationLost.length === 0) newErrors.locationLost = 'Select at least one';
    if (formData.description.length < 10) newErrors.description = 'Provide more detail (min 10 chars)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const onLocationChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, locationLost: value }));
    if (errors.locationLost) setErrors(prev => ({ ...prev, locationLost: '' }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      // Create FormData for file upload
      const submitPayload = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'locationLost') {
          submitPayload.append(key, formData[key]);
        }
      });
      
      // Handle locationLost array
      const selectedLocs = formData.locationLost
        .filter(l => l !== 'other')
        .map(l => locations.find(i => i.value === l)?.label || l);
      if (formData.locationLost.includes('other')) {
        selectedLocs.push(`Other: ${formData.otherLocation}`);
      }
      submitPayload.append('locationLost', selectedLocs.join(', '));
      
      // Add image if selected
      if (selectedImage) {
        submitPayload.append('image', selectedImage);
      }

      const res = await API.post('/api/lost', submitPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setToast({ message: res.data.message || 'Reported successfully!', type: 'success' });
      setTimeout(() => navigate('/reports'), 2000);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Submission failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader 
          title="Report Lost Item"
          subtitle="Provide details about your missing item so the community can help you find it."
        />

        <form onSubmit={onSubmit} className="space-y-8 animate-fade-in pb-20">
          <Card className="p-6 space-y-6 !rounded-[24px]">
            <h3 className="text-h2 text-text border-b border-border pb-3 font-bold">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Item Name" name="itemName" value={formData.itemName} onChange={onChange} placeholder="e.g. Blue Backpack" required error={errors.itemName} />
              <Select label="Category" name="category" value={formData.category} onChange={onChange} options={categories} required error={errors.category} />
              <Input label="Date Lost" name="dateLost" type="date" value={formData.dateLost} onChange={onChange} required error={errors.dateLost} max={new Date().toISOString().split('T')[0]} />
              
              <div className="flex flex-col gap-2">
                <Select
                  label="Last Seen At"
                  name="locationLost"
                  isMulti
                  required
                  options={locations}
                  value={formData.locationLost}
                  onChange={onLocationChange}
                  placeholder="Select location(s)"
                  error={errors.locationLost}
                />
                {formData.locationLost.includes('other') && (
                  <div className="mt-1 animate-fade-in">
                    <Input name="otherLocation" value={formData.otherLocation} onChange={onChange} placeholder="Specify location..." required error={errors.otherLocation} />
                  </div>
                )}
              </div>
            </div>

            <TextArea label="Description" name="description" value={formData.description} onChange={onChange} placeholder="Brand, model, color, or any distinguishing marks..." required error={errors.description} rows={4} />
          </Card>

          <Card className="p-6 space-y-6 !rounded-[24px]">
            <h3 className="text-h2 text-text border-b border-border pb-3 font-bold">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Color (Optional)" name="color" value={formData.color} onChange={onChange} placeholder="e.g. Matte Black" />
              <Input label="Brand (Optional)" name="brand" value={formData.brand} onChange={onChange} placeholder="e.g. Apple" />
              <Input label="Contact Phone (Optional)" name="contactPhone" value={formData.contactPhone} onChange={onChange} placeholder="For internal matching" />
            </div>
            
            {/* Image Upload Section */}
            <div className="mb-6">
              <label className="text-label text-text block mb-2">Item Image (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Item preview"
                      className="mx-auto h-48 w-auto object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="text-primary-600 hover:text-primary-700 font-medium">
                          Click to upload
                        </span>
                        <span className="text-gray-600"> or drag and drop</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <TextArea label="Unique Markings (Optional)" name="uniqueMark" value={formData.uniqueMark} onChange={onChange} placeholder="Stickers, scratches, or engravings..." rows={2} />
          </Card>

          <Card className="p-6 space-y-6 !rounded-[24px] bg-primary/5 border-primary/10">
            <h3 className="text-h2 text-text">Privacy & Notifications</h3>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <label className="text-label text-text block">Who can see this report?</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="visibility" value="CAMPUS" checked={formData.visibility === 'CAMPUS'} onChange={onChange} className="w-5 h-5 text-primary border-border focus:ring-primary/20" />
                    <div className="flex flex-col">
                      <span className="text-label font-bold text-text group-hover:text-primary">Campus Wide</span>
                      <span className="text-[12px] text-muted-text">Everyone can help you find it</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="visibility" value="ADMIN_ONLY" checked={formData.visibility === 'ADMIN_ONLY'} onChange={onChange} className="w-5 h-5 text-primary border-border focus:ring-primary/20" />
                    <div className="flex flex-col">
                      <span className="text-label font-bold text-text group-hover:text-primary">Admin Only</span>
                      <span className="text-[12px] text-muted-text">Only officers can see this</span>
                    </div>
                  </label>
                </div>
              </div>
              <div className="flex-1 items-center">
                 <label className="flex items-center justify-evenly gap-2 p-3  bg-surface rounded-[12px] border border-border cursor-pointer hover:bg-gray-50 transition-colors group">
                    <input type="checkbox" name="notifyRequested" checked={formData.notifyRequested} onChange={(e) => setFormData({ ...formData, notifyRequested: e.target.checked })} className="mt-1 w-5 h-5 text-primary border-border rounded-[6px]" />
                    <div>
                       <span className="text-label font-bold text-text">Email Notifications</span><br/>
                       <span className="text-[12px] text-muted-text">Alert me immediately when a potential match is found.</span>
                    </div>
                 </label>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
             <button type="button" onClick={() => navigate(-1)} className="btn-secondary btn-lg px-10">Cancel</button>
             <button type="submit" disabled={loading} className="btn-primary btn-lg flex-1">
                {loading ? 'Submitting Report...' : 'Publish Lost Report'}
             </button>
          </div>
        </form>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppLayout>
  );
};

export default ReportLost;
