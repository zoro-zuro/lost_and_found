import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FormSelect from '../components/FormSelect';
import API from '../services/api';
import { isUserVerified } from '../utils/verification';
import VerificationPrompt from '../components/VerificationPrompt';

const ReportItem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [linkedLostItemId, setLinkedLostItemId] = useState(null);
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  
  // Check if we're coming from a lost item details page
  useEffect(() => {
    if (location.state?.linkedLostItemId) {
      setLinkedLostItemId(location.state.linkedLostItemId);
      setFormData(prev => ({
        ...prev,
        itemType: 'found' // Force to found when coming from lost item
      }));
    }
  }, [location.state]);
  const [formData, setFormData] = useState({
    // Step 1: Item Details (Both Lost & Found)
    itemName: '',
    category: '',
    description: '',
    color: '',
    brand: '',
    uniqueMark: '', // Only for Lost items
    itemType: 'lost', // lost or found
    
    // Step 2: Location (Different field names for Lost vs Found)
    location: '', // Generic for display
    dateFound: '', // Generic for display
    timeFound: '', // Generic for display
    
    // Backend-specific fields (will be mapped in handleSubmit)
    dateLost: '', // For Lost items
    locationLost: '', // For Lost items
    dateFoundBackend: '', // For Found items  
    locationFound: '', // For Found items
    
    // Step 3: Contact (Both Lost & Found)
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    
    // Step 4: Privacy (Both Lost & Found)
    visibility: 'PUBLIC',
    notifyRequested: false
  });
  
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Determine if it's lost or found from URL
  useEffect(() => {
    const path = location.pathname;
    const isLost = path.includes('lost') || path === '/report-lost';
    setFormData(prev => ({ ...prev, itemType: isLost ? 'lost' : 'found' }));
  }, [location.pathname]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Check if user is verified
      if (!isUserVerified(parsedUser)) {
        setShowVerificationPrompt(true);
        return;
      }
      
      // Pre-fill contact info only if verified
      setFormData(prev => ({
        ...prev,
        contactName: parsedUser.name || '',
        contactEmail: parsedUser.email || '',
        contactPhone: parsedUser.phone || ''
      }));
    }
  }, []);

  const categories = [
    'ID Card', 'Phone', 'Wallet', 'Bag', 'Keys', 'Book', 
    'Electronics', 'Jewelry', 'Clothing', 'Watch', 'Other'
  ];

  const categoryOptions = categories.map(cat => ({ value: cat, label: cat }));

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Sync backend-specific fields when generic fields change
      if (name === 'dateFound') {
        if (updated.itemType === 'lost') {
          updated.dateLost = value; // For Lost items
        } else {
          updated.dateFoundBackend = value; // For Found items
        }
      }
      
      if (name === 'location') {
        if (updated.itemType === 'lost') {
          updated.locationLost = value; // For Lost items
        } else {
          updated.locationFound = value; // For Found items
        }
      }
      
      return updated;
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.itemName.trim()) newErrors.itemName = 'Item name is required';
      if (!formData.category) newErrors.category = 'Category is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      
      // Unique mark is only required for lost items
      if (formData.itemType === 'lost' && !formData.uniqueMark.trim()) {
        newErrors.uniqueMark = 'Unique mark is required for lost items';
      }
    } else if (step === 2) {
      if (!formData.location) newErrors.location = 'Location is required';
      if (!formData.dateFound) newErrors.dateFound = 'Date is required';
    } else if (step === 3) {
      if (!formData.contactName.trim()) newErrors.contactName = 'Name is required';
      if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Phone is required';
      if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Email is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get current user data from localStorage to ensure we have the latest
    const currentUserData = JSON.parse(localStorage.getItem('user'));
    
    // Check if user is verified before submitting
    if (!currentUserData || !isUserVerified(currentUserData)) {
      setShowVerificationPrompt(true);
      return;
    }
    
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    try {
      console.log('Submitting form with user:', currentUserData);
      console.log('Form data:', formData);
      
      const submitData = new FormData();
      
      // Map fields based on item type
      if (formData.itemType === 'lost') {
        // Lost item fields
        submitData.append('itemName', formData.itemName);
        submitData.append('category', formData.category);
        submitData.append('description', formData.description);
        submitData.append('color', formData.color);
        submitData.append('brand', formData.brand);
        submitData.append('uniqueMark', formData.uniqueMark);
        submitData.append('dateLost', formData.dateLost); // Backend expects dateLost
        submitData.append('locationLost', formData.locationLost); // Backend expects locationLost
        submitData.append('contactPhone', formData.contactPhone);
        submitData.append('visibility', formData.visibility);
        submitData.append('notifyRequested', formData.notifyRequested);
      } else {
        // Found item fields
        submitData.append('itemName', formData.itemName);
        submitData.append('category', formData.category);
        submitData.append('description', formData.description);
        submitData.append('color', formData.color);
        submitData.append('brand', formData.brand);
        submitData.append('dateFound', formData.dateFoundBackend); // Backend expects dateFound
        submitData.append('locationFound', formData.locationFound); // Backend expects locationFound
        submitData.append('visibility', formData.visibility);
      }
      
      // Add linkedLostItemId if present
      if (linkedLostItemId) {
        submitData.append('linkedLostItemId', linkedLostItemId);
      }
      
      if (selectedImage) {
        submitData.append('image', selectedImage);
      }
      
      const endpoint = formData.itemType === 'lost' 
        ? '/api/lost' 
        : '/api/found';
        
      console.log('Submitting to endpoint:', endpoint);
      await API.post(endpoint, submitData);
      
      // Navigate to appropriate page
      navigate(formData.itemType === 'lost' ? '/found' : '/found');
    } catch (error) {
      console.error('Submit error:', error);
      
      // Handle specific validation errors
      if (error.response?.data?.missingFields) {
        const missingFields = error.response.data.missingFields;
        const fieldGuidance = {
          'Item Name': 'Step 1: Enter the name of the item',
          'Category': 'Step 1: Select a category from the dropdown',
          'Date Lost': 'Step 2: Select the date when item was lost',
          'Location Lost': 'Step 2: Select the location where item was lost',
          'Description': 'Step 1: Provide a detailed description (min 10 characters)',
          'Contact Phone': 'Step 3: Enter your phone number',
          'Visibility': 'Step 4: Choose Admin Only or Public visibility'
        };
        
        const guidance = missingFields.map(field => fieldGuidance[field] || field).join('\n');
        setErrors({ 
          submit: `Please complete these required fields:\n${guidance}`,
          missingFields: missingFields
        });
      } else if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Failed to submit report. Please check all fields and try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await API.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Item Details';
      case 2: return 'Location';
      case 3: return 'Contact';
      case 4: return 'Privacy';
      default: return '';
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 1: return 'featured_seasonal_and_gifts';
      case 2: return 'location_on';
      case 3: return 'contact_phone';
      case 4: return 'privacy_tip';
      default: return '';
    }
  };

  return (
    <>

      {/* Main Container - Same pattern as dashboard */}
      <div className="w-full max-w-[1140px] mx-auto glass-panel rounded-t-4xl flex flex-col overflow-hidden relative mt-5 border-white/20 shadow-sm">
        {/* Header Section */}
        <div className="px-4 md:px-8 pt-6 md:pt-8 pb-4 md:pb-6">
          <div className="text-center mb-6 md:mb-8">
            {linkedLostItemId && (
              <div className="mb-4 inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                <span className="material-symbols-rounded text-sm">check_circle</span>
                Matching Lost Item Found
              </div>
            )}
            <h1 className="text-xl md:text-2xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-1 md:mb-2">
              {linkedLostItemId ? 'Report Found Item (Match)' : `Report ${formData.itemType === 'lost' ? 'Lost' : 'Found'} Item`}
            </h1>
            <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl mx-auto">
              {linkedLostItemId 
                ? 'Help return this item to its owner by providing details about what you found.'
                : `Help reconnect ${formData.itemType === 'lost' ? 'lost' : 'found'} belongings with their ${formData.itemType === 'lost' ? 'owners' : 'finders'}.`
              }
            </p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm ${
                      step <= currentStep 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-gray-200 text-slate-700'
                    }`}>
                      {step}
                    </div>
                    <span className={`text-xs md:text-sm font-medium ${
                      step <= currentStep 
                        ? 'text-slate-800' 
                        : 'text-gray-500'
                    }`}>
                      {step === 1 && 'Item Info'}
                      {step === 2 && 'Location'}
                      {step === 3 && 'Contact'}
                      {step === 4 && 'Privacy'}
                    </span>
                  </div>
                  {step < 4 && (
                    <div className="h-1 flex-1 bg-gray-200 mx-2 md:mx-4 rounded-full relative overflow-hidden">
                      <div 
                        className={`absolute inset-0 bg-indigo-500 transition-all duration-300 ${
                          step < currentStep ? 'w-full' : 'w-0'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-4 md:px-8 pb-26 md:pb-8">
          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
            {/* Step 1: Item Details */}
            {currentStep === 1 && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <span className="material-symbols-rounded text-indigo-500 text-2xl md:text-3xl">featured_seasonal_and_gifts</span>
                  <h2 className="text-slate-800 text-xl md:text-2xl font-bold">Step 1: Item Details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-slate-700 text-sm md:text-base font-semibold">
                      Item Name<span className="text-orange-500 ml-1">*</span>
                    </label>
                    <div className="flex items-center rounded-xl md:rounded-2xl border border-gray-300 bg-white px-4 md:px-5 h-14 focus-within:border-indigo-500 transition-colors w-full">
                      <input
                        type="text"
                        name="itemName"
                        value={formData.itemName}
                        onChange={handleInputChange}
                        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm md:text-base"
                        placeholder="Enter item name"
                      />
                    </div>
                    {errors.itemName && <p className="text-red-500 text-xs md:text-sm">{errors.itemName}</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <FormSelect
                      label="Category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      options={categoryOptions}
                      placeholder="Select category"
                      required
                      error={errors.category}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-slate-700 text-sm md:text-base font-semibold">Color</label>
                    <div className="flex items-center rounded-xl md:rounded-2xl border border-gray-300 bg-white px-4 md:px-5 h-14 focus-within:border-indigo-500 transition-colors w-full">
                      <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm md:text-base"
                        placeholder="e.g., Black, Red, Blue"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-slate-700 text-sm md:text-base font-semibold">Brand</label>
                    <div className="flex items-center rounded-xl md:rounded-2xl border border-gray-300 bg-white px-4 md:px-5 h-14 focus-within:border-indigo-500 transition-colors w-full">
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm md:text-base"
                        placeholder="e.g., Apple, Samsung, Nike"
                      />
                    </div>
                  </div>

                  {formData.itemType === 'lost' && (
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-slate-700 text-sm md:text-base font-semibold">
                        Unique Markings{formData.itemType === 'lost' && <span className="text-orange-500 ml-1">*</span>}
                      </label>
                      <div className="flex items-center rounded-xl md:rounded-2xl border border-gray-300 bg-white px-4 md:px-5 h-14 focus-within:border-indigo-500 transition-colors w-full">
                        <input
                          type="text"
                          name="uniqueMark"
                          value={formData.uniqueMark}
                          onChange={handleInputChange}
                          className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm md:text-base"
                          placeholder="Scratches, stickers, engravings, etc."
                        />
                      </div>
                      {errors.uniqueMark && <p className="text-red-500 text-sm">{errors.uniqueMark}</p>}
                    </div>
                  )}

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-slate-700 text-sm md:text-base font-semibold">Description<span className="text-orange-500 ml-1">*</span></label>
                    <div className="flex items-start rounded-xl md:rounded-2xl border border-gray-300 bg-white px-4 md:px-5 py-3 md:py-4 focus-within:border-indigo-500 transition-colors">
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 resize-none text-sm md:text-base"
                        placeholder="Provide a detailed description of the item..."
                      />
                    </div>
                    {errors.description && <p className="text-red-500 text-xs md:text-sm">{errors.description}</p>}
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-slate-700 text-sm md:text-base font-semibold">Upload Image (Optional)</label>
                    {!imagePreview ? (
                      <div 
                        className="flex items-center justify-center w-full h-24 md:h-32 border-2 border-dashed border-gray-300 rounded-xl md:rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('image-upload').click()}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                          <span className="material-symbols-rounded text-gray-400 text-2xl md:text-3xl">cloud_upload</span>
                          <span className="text-gray-500 text-xs md:text-sm">Click to upload image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 relative">
                        <img src={imagePreview} alt="Preview" className="w-full h-48 md:h-64 object-cover rounded-xl md:rounded-2xl shadow-lg" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setSelectedImage(null);
                          }}
                          className="absolute top-2 right-2 w-6 h-6 md:w-8 md:h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-xs md:text-sm hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-rounded text-indigo-500 text-3xl">location_on</span>
                  <h2 className="text-navy-dark text-2xl font-bold">Step 2: Location</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <FormSelect
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      options={locations}
                      placeholder="Select location"
                      required
                      error={errors.location}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-navy-dark text-base font-semibold">Date {formData.itemType === 'lost' ? 'Lost' : 'Found'}<span className="text-orange-500 ml-1">*</span></label>
                    <div className="flex items-center rounded-2xl border border-gray-300 bg-white px-5 h-14 focus-within:border-indigo-500 transition-colors w-full">
                      <input
                        type="date"
                        name="dateFound"
                        value={formData.dateFound}
                        onChange={handleInputChange}
                        className="flex-1 bg-transparent outline-none text-gray-700 text-sm md:text-base"
                      />
                    </div>
                    {errors.dateFound && <p className="text-red-500 text-sm">{errors.dateFound}</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-navy-dark text-base font-semibold">Time {formData.itemType === 'lost' ? 'Lost' : 'Found'}</label>
                    <div className="flex items-center rounded-2xl border border-gray-300 bg-white px-5 h-14 focus-within:border-indigo-500 transition-colors w-full">
                      <input
                        type="time"
                        name="timeFound"
                        value={formData.timeFound}
                        onChange={handleInputChange}
                        className="flex-1 bg-transparent outline-none text-gray-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact */}
            {currentStep === 3 && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-rounded text-indigo-500 text-3xl">contact_phone</span>
                  <h2 className="text-navy-dark text-2xl font-bold">Step 3: Contact</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-navy-dark text-base font-semibold">Your Name<span className="text-orange-500 ml-1">*</span></label>
                    <div className="flex items-center rounded-2xl border border-gray-300 bg-white px-5 h-14 focus-within:border-indigo-500 transition-colors w-full">
                      <input
                        type="text"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                        placeholder="Enter your name"
                      />
                    </div>
                    {errors.contactName && <p className="text-red-500 text-sm">{errors.contactName}</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-navy-dark text-base font-semibold">Phone Number<span className="text-orange-500 ml-1">*</span></label>
                    <div className="flex items-center rounded-2xl border border-gray-300 bg-white px-5 h-14 focus-within:border-indigo-500 transition-colors w-full">
                      <input
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                        placeholder="Enter phone number"
                      />
                    </div>
                    {errors.contactPhone && <p className="text-red-500 text-sm">{errors.contactPhone}</p>}
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-navy-dark text-base font-semibold">
                      Email Address{formData.itemType === 'lost' && <span className="text-orange-500 ml-1">*</span>}
                    </label>
                    <div className="flex items-center rounded-2xl border border-gray-300 bg-white px-5 h-14 focus-within:border-indigo-500 transition-colors w-full">
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                        placeholder="Enter email address"
                      />
                    </div>
                    {errors.contactEmail && <p className="text-red-500 text-sm">{errors.contactEmail}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Privacy */}
            {currentStep === 4 && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-rounded text-indigo-500 text-3xl">privacy_tip</span>
                  <h2 className="text-navy-dark text-2xl font-bold">Step 4: Privacy</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex flex-col gap-3">
                    <label className="text-navy-dark text-base font-semibold">Visibility</label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="visibility"
                          value="ADMIN_ONLY"
                          checked={formData.visibility === 'ADMIN_ONLY'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-indigo-500 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-gray-700">Admin Only - Visible only to administrators</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="visibility"
                          value="PUBLIC"
                          checked={formData.visibility === 'PUBLIC'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-indigo-500 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-gray-700">Public - Visible to everyone</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="notifyRequested"
                      checked={formData.notifyRequested}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-indigo-500 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifyRequested" className="text-gray-700 cursor-pointer">
                      Notify me when someone {formData.itemType === 'lost' ? 'finds' : 'claims'} this item
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 md:pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-semibold text-xs md:text-sm transition-all ${
                  currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-semibold text-xs md:text-sm transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-semibold text-xs md:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : `Submit ${formData.itemType === 'lost' ? 'Lost' : 'Found'} Report`}
                </button>
              )}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl md:rounded-2xl text-sm md:text-base">
                <div className="font-semibold text-red-800 mb-2">⚠️ Form Incomplete</div>
                <div className="whitespace-pre-line">{errors.submit}</div>
                {errors.missingFields && (
                  <div className="mt-3 text-red-600 text-xs md:text-sm">
                    💡 Tip: Navigate through all steps (1-4) to ensure all required fields are completed
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
      
      {/* Verification Prompt */}
      {showVerificationPrompt && (
        <VerificationPrompt
          message="Please verify your email address to report lost or found items."
          onClose={() => setShowVerificationPrompt(false)}
        />
      )}
    </>
  );
};

export default ReportItem;
