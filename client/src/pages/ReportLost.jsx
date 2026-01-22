import React, { useState } from 'react';
import ReactSelect from 'react-select';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Input from '../components/Input';
import TextArea from '../components/TextArea';
import Select from '../components/Select';
import Toast from '../components/Toast';
import API from '../services/api';

const ReportLost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    dateLost: '',
    locationLost: [],
    otherLocation: '',
    description: '',
    color: '',
    brand: '',
    uniqueMark: '',
    contactPhone: '',
    visibility: 'CAMPUS',
    notifyRequested: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [matches, setMatches] = useState([]);
  const [showMatches, setShowMatches] = useState(false);

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
  // Academic Buildings - Main Campus (Officially verified)
  { value: 'main-hall', label: 'Main Hall (Principal, VP, COE, Bursar, Dean Offices, Assembly Hall)' },
  { value: 'james-hall', label: 'James Hall (Physics, Chemistry, Documentation Centre, PG Physics, DAS)' },
  { value: 'jivana-jyoti-block', label: 'Jivana Jyoti Block (Computer Training for Physically Disabled)' },
  { value: 'binghamton-hall', label: 'Binghamton Hall (Zoology, Botany, Biochemistry)' },
  { value: 'flint-house', label: 'Flint House (English Department)' },
  { value: 'oberlin-shansi-building', label: 'Oberlin Shansi Building (Deans, Women Students Cell, International Exchange, Alumni)' },
  { value: 'new-building', label: 'New Building (Management, CS, Social Work, Commerce, SCILET, Seminar Hall)' },
  { value: 'paul-linder-love-hall', label: 'Paul Linder Love Hall (MCA, MSc Data Science, CS/IT/BCA, COE)' },
  { value: 'jones-hall', label: 'Jones Hall (Examination Hall)' },
  { value: 'edward-nolting-hall', label: 'Edward Nolting Hall (Event Venue, Cultural Fests)' },
  { value: 'stoffer-hall', label: 'Stoffer Hall' },
  { value: 'daniel-poor-memorial-humanities-hall', label: 'Daniel Poor Memorial Humanities Hall' },
  { value: 'centenary-block', label: 'Centenary Block' },
  { value: 'mathematics-hall', label: 'Mathematics Hall' },
  { value: 'tamil-department', label: 'Tamil Department' },
  { value: 'auditorium', label: 'Auditorium' },
  { value: 'saunders-hall', label: 'Saunders Hall (Psychology Department)' },
  
  // Hostels - Boys
  { value: 'washburn-hall', label: 'Washburn Hall (Boys Hostel - Freshers)' },
  { value: 'dudley-hall', label: 'Dudley Hall (Boys Hostel)' },
  { value: 'wallace-hall', label: 'Wallace Hall (PG Hostel)' },
  { value: 'zumbro-hall', label: 'Zumbro Hall (Boys Hostel)' },
  
  // Hostels - Girls
  { value: 'ladies-hostel', label: 'Ladies Hostel (Girls Hostel)' },
  { value: 'womens-hall', label: "Women's Hall (Girls Hostel)" },
  { value: 'noyes-garden', label: 'Noyes Garden (Girls Hostel)' },
  
  // Facilities & Amenities
  { value: 'college-canteen', label: 'College Canteen / RR Canteen' },
  { value: 'library', label: 'Library (60,000 volumes)' },
  { value: 'main-gate', label: 'Main Gate / Washburn Gate' },
  { value: 'back-gate', label: 'Back Gate' },
  { value: 'parking-lot', label: 'Parking Lot' },
  { value: 'gym', label: 'Gym' },
  { value: 'lobby', label: 'Lobby' },
  { value: 'playground', label: 'Playground (Football, Cricket, Hockey, Athletics)' },
  { value: 'tennis-court', label: 'Tennis Court' },
  { value: 'basketball-court', label: 'Basketball Court (Flood-lit)' },
  { value: 'volleyball-court', label: 'Volleyball Court' },
  { value: 'medical-centre', label: 'Medical Centre' },
  
  // Other
  { value: 'other', label: 'Other (specify)' }
];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.dateLost) {
      newErrors.dateLost = 'Date lost is required';
    }

    if (formData.locationLost.length === 0) {
      newErrors.locationLost = 'Location lost is required';
    }

    if (formData.locationLost.includes('other')) {
      if (formData.locationLost.length === 1) {
         newErrors.locationLost = 'Please select at least one nearest location along with Other';
      }
      if (!formData.otherLocation.trim()) {
        newErrors.otherLocation = 'Please specify the location';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onChange = (e) => {
    // Check if it's the custom select event (which passes value directly or array of values)
    if (Array.isArray(e) || (e && e.value && !e.target)) {
       // This is likely from ReactSelect for locationLost
       // But wait, ReactSelect passes (newValue, actionMeta).
       // I'll handle ReactSelect onChange separately in the component prop to avoid confusion.
       return; 
    }

    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const onLocationChange = (selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
    setFormData(prev => ({ ...prev, locationLost: values }));
    
    // Clear error
    if (errors.locationLost && values.length > 0) {
       // Also check the specific "Other" condition if needed to clear error immediately, 
       // but for now just clearing the main required error is enough.
       setErrors(prev => ({ ...prev, locationLost: '' }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {

      // Prepare data for submission
      const submitPayload = { ...formData };
      
      // Format location string
      const selectedLocs = submitPayload.locationLost
        .filter(l => l !== 'other')
        .map(l => {
          const loc = locations.find(i => i.value === l);
          return loc ? loc.label : l;
        });
      
      if (submitPayload.locationLost.includes('other')) {
        selectedLocs.push(`Other: ${submitPayload.otherLocation}`);
      }
      
      submitPayload.locationLost = selectedLocs.join(', ');
      delete submitPayload.otherLocation;

      const res = await API.post('/api/lost', submitPayload);
      
      setToast({
        message: res.data.message || 'Lost item reported successfully!',
        type: 'success'
      });

      // Redirect to My Reports after 2 seconds
      setTimeout(() => {
        navigate('/reports');
      }, 2000);
      
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to report lost item',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Report Lost Item</h1>
          <p className="text-gray-600">Fill in the details below to report your lost item</p>
        </div>

        <Card className="p-6 mb-8">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Item Name"
                name="itemName"
                value={formData.itemName}
                onChange={onChange}
                placeholder="e.g., iPhone 13, Black Wallet"
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
                label="Date Lost"
                name="dateLost"
                type="date"
                value={formData.dateLost}
                onChange={onChange}
                required
                error={errors.dateLost}
                max={new Date().toISOString().split('T')[0]}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Lost <span className="text-red-500">*</span>
                </label>
                <ReactSelect
                  isMulti
                  name="locationLost"
                  options={locations}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  value={locations.filter(option => formData.locationLost.includes(option.value))}
                  onChange={onLocationChange}
                  placeholder="Select locations..."
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: errors.locationLost ? '#ef4444' : base.borderColor,
                      '&:hover': {
                        borderColor: errors.locationLost ? '#ef4444' : base.borderColor
                      },
                      padding: '5px',
                      borderRadius: '8px',
                    })
                  }}
                />
                {errors.locationLost && (
                  <p className="mt-1 text-sm text-red-600">{errors.locationLost}</p>
                )}
                
                {formData.locationLost.includes('other') && (
                  <div className="mt-4">
                    <Input 
                      label="Specify Location"
                      name="otherLocation"
                      value={formData.otherLocation}
                      onChange={onChange}
                      placeholder="Please specify the nearest location"
                      required
                      error={errors.otherLocation}
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
              placeholder="Provide a detailed description of the lost item including any distinguishing features..."
              required
              error={errors.description}
              rows={4}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Color (Optional)"
                name="color"
                value={formData.color}
                onChange={onChange}
                placeholder="e.g., Black, Red, Blue"
              />

              <Input
                label="Brand (Optional)"
                name="brand"
                value={formData.brand}
                onChange={onChange}
                placeholder="e.g., Apple, Samsung, Nike"
              />

              <Input
                label="Contact Phone (Optional)"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={onChange}
                placeholder="Your contact number"
              />
            </div>

            <TextArea
              label="Unique Markings (Optional)"
              name="uniqueMark"
              value={formData.uniqueMark}
              onChange={onChange}
              placeholder="Any scratches, engravings, stickers, or other unique features..."
              rows={2}
            />

            {/* Visibility and Notification Settings */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900">Report Settings</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Who can see this report?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="CAMPUS"
                      checked={formData.visibility === 'CAMPUS'}
                      onChange={onChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      <span className="font-medium">Campus Wide</span>
                      <span className="block text-xs text-gray-500">Everyone on campus can see and help find</span>
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="ADMIN_ONLY"
                      checked={formData.visibility === 'ADMIN_ONLY'}
                      onChange={onChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      <span className="font-medium">Admin Only</span>
                      <span className="block text-xs text-gray-500">Only administrators can view</span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    name="notifyRequested"
                    checked={formData.notifyRequested}
                    onChange={(e) => setFormData({ ...formData, notifyRequested: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 mt-0.5"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Request email notification when found</span>
                    <p className="text-xs text-gray-600 mt-1">
                      By checking this box, you consent to receive email notifications if a matching item is found. 
                      Your contact information may be shared with the finder for verification purposes.
                    </p>
                  </div>
                </label>
              </div>
            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Reporting...
                </span>
              ) : (
                'Report Lost Item'
              )}
            </button>
          </form>
        </Card>

        {/* Tips Section */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for a Good Report</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              Be as specific as possible in your description
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              Include brand, model, and color information
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              Mention any unique markings or damage
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              Provide the exact date and location where it was lost
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              Include your contact information for easy communication
            </li>
          </ul>
        </Card>

        {/* Potential Matches Section */}
        {showMatches && matches.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Potential Matches</h3>
            <div className="space-y-4">
              {matches.map((match) => (
                <div key={match._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{match.itemName}</h4>
                      <p className="text-sm text-gray-600 mt-1">{match.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Category: {match.category}</span>
                        <span>Found: {new Date(match.dateFound).toLocaleDateString()}</span>
                        <span>Location: {match.locationFound}</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              You will be redirected to your dashboard in a few seconds...
            </p>
          </Card>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AppLayout>
  );
};

export default ReportLost;
