import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Input from '../components/Input';
import TextArea from '../components/TextArea';
import Select from '../components/Select';
import PageHeader from '../components/PageHeader';
import Toast from '../components/Toast';
import API from '../services/api';

const ReportFound = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const lostId = searchParams.get('lostId') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialLocation = searchParams.get('location') || '';

  const [formData, setFormData] = useState({
    itemName: '',
    category: initialCategory,
    dateFound: new Date().toISOString().split('T')[0],
    locationFound: initialLocation,
    description: '',
    lostId: lostId
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
    if (!formData.dateFound) newErrors.dateFound = 'Required';
    if (!formData.locationFound.trim()) newErrors.locationFound = 'Required';
    if (formData.description.length < 10) newErrors.description = 'Min 10 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create FormData for file upload
      const submitPayload = new FormData();
      Object.keys(formData).forEach(key => {
        submitPayload.append(key, formData[key]);
      });
      
      // Add image if selected
      if (selectedImage) {
        submitPayload.append('image', selectedImage);
      }

      await API.post('/api/found', submitPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setToast({ message: 'Found item registered successfully!', type: 'success' });
      setTimeout(() => navigate('/found'), 1500);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Report failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader 
          title="Report Found Item"
          subtitle="Help return the item to its rightful owner by providing accurate details."
        />

        <form onSubmit={onSubmit} className="space-y-8 animate-fade-in">
          <Card className="p-6 space-y-6 !rounded-[16px] border-border/10 shadow-sm bg-surface">
             <h3 className="text-h2 text-text border-b border-border pb-4 font-bold">Item Details</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Item Name"
                  name="itemName"
                  value={formData.itemName}
                  onChange={onChange}
                  placeholder="e.g. Silver Water Bottle"
                  required
                  error={errors.itemName}
                />
                <Select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={onChange}
                  options={categories}
                  required
                  error={errors.category}
                />
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Discovery Date"
                  name="dateFound"
                  type="date"
                  value={formData.dateFound}
                  onChange={onChange}
                  required
                  error={errors.dateFound}
                  max={new Date().toISOString().split('T')[0]}
                />
                <Input
                  label="Discovery Location"
                  name="locationFound"
                  value={formData.locationFound}
                  onChange={onChange}
                  placeholder="e.g. Near Main Hall"
                  required
                  error={errors.locationFound}
                />
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

             <TextArea
               label="Description"
               name="description"
               value={formData.description}
               onChange={onChange}
               placeholder="Provide details that can help identify the item."
               rows={4}
               required
               error={errors.description}
             />
          </Card>

          <div className="flex gap-4">
             <button type="button" onClick={() => navigate(-1)} className="btn-secondary btn-lg px-8">Back</button>
             <button
               type="submit"
               disabled={loading}
               className="btn-primary btn-lg flex-1"
             >
               {loading ? 'Submitting...' : 'Report Item'}
             </button>
          </div>
        </form>

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </AppLayout>
  );
};

export default ReportFound;
