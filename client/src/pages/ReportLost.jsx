import React, { useState } from 'react';
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
    locationLost: '',
    description: '',
    color: '',
    brand: '',
    uniqueMark: '',
    contactPhone: ''
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
    { value: 'Library', label: 'Library' },
    { value: 'Cafeteria', label: 'Cafeteria' },
    { value: 'Classroom', label: 'Classroom' },
    { value: 'Parking Lot', label: 'Parking Lot' },
    { value: 'Gym', label: 'Gym' },
    { value: 'Lobby', label: 'Lobby' },
    { value: 'Other', label: 'Other (specify)' }
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

    if (!formData.locationLost.trim()) {
      newErrors.locationLost = 'Location lost is required';
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/lost', formData);
      
      setToast({
        message: 'Lost item reported successfully!',
        type: 'success'
      });

      // Fetch potential matches
      try {
        const matchesRes = await API.get(`/api/lost/${res.data.data._id}/matches`);
        setMatches(matchesRes.data.data);
        setShowMatches(true);
      } catch (err) {
        console.error('Error fetching matches:', err);
      }

      // Redirect to dashboard after showing matches
      setTimeout(() => {
        navigate('/dashboard');
      }, 5000);
      
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

              <Select
                label="Location Lost"
                name="locationLost"
                value={formData.locationLost}
                onChange={onChange}
                options={locations}
                required
                error={errors.locationLost}
                placeholder="Select location"
              />
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
