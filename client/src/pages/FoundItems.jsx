import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import API, { getImageUrl } from '../services/api';

const FoundItems = () => {
  const navigate = useNavigate();
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1, limit: 12, total: 0, pages: 0
  });
  const [filters, setFilters] = useState({
    search: '', category: '', location: ''
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'ID Card', label: 'ID Card' },
    { value: 'Phone', label: 'Phone' },
    { value: 'Wallet', label: 'Wallet' },
    { value: 'Bag', label: 'Bag' },
    { value: 'Keys', label: 'Keys' },
    { value: 'Book', label: 'Book' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Other', label: 'Other' }
  ];

  useEffect(() => {
    fetchFoundItems();
  }, [pagination.page, filters]);

  const fetchFoundItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      const res = await API.get(`/api/found?${params}`);
      setFoundItems(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching found items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Found Items Gallery"
        subtitle="Recent items turned in by community members."
        action={
          <button 
            onClick={() => navigate('/found/report')}
            className="btn-primary btn-md gap-2 !px-5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Found Item
          </button>
        }
      />

      <div className="space-y-10 animate-fade-in">
        {/* Filter Bar */}
        <Card className="p-4 bg-surface/50 backdrop-blur-sm border-border/50">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-[1.5] w-full relative">
              <Input
                label="Identifier Search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Asset keywords..."
                className="!pl-10"
              />
              <div className="absolute bottom-[10px] left-3.5 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-muted-text/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="flex-1 w-full">
              <Select
                label="Category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                options={categories}
                placeholder="All Categories"
              />
            </div>

            <div className="flex-1 w-full relative">
              <Input
                label="Discovery Site"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Filter by area..."
                className="!pl-10"
              />
              <div className="absolute bottom-[10px] left-3.5 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-muted-text/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        {/* Results Grid */}
        {loading ? (
          <div className="py-24 flex justify-center"><LoadingSpinner text="Scanning records..." /></div>
        ) : foundItems.length === 0 ? (
          <EmptyState
            title="No records found"
            description="Try broadening your search criteria or checking back later."
          />
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foundItems.map((item) => (
                <Card key={item._id} hover className="flex flex-col group !rounded-[24px] border-border/10 shadow-sm overflow-hidden bg-surface">
                  {item.imageUrl && (
                    <div className="h-40 overflow-hidden border-b border-border/50">
                      <img src={getImageUrl(item.imageUrl)} alt={item.itemName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6 space-y-4 flex-1">
                    <div className="flex justify-between items-start">
                      <Badge variant="primary">{item.category}</Badge>
                      <span className="text-small text-muted-text font-medium opacity-60">{formatDate(item.dateFound)}</span>
                    </div>
                    
                    <div>
                      <h3 className="text-h2 text-text mb-1 group-hover:text-primary transition-colors line-clamp-1 font-bold">{item.itemName}</h3>
                      <p className="text-small text-muted-text line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                    
                    <div className="flex items-center text-small text-muted-text/70 pt-1 font-medium">
                      <div className="w-7 h-7 rounded-[8px] bg-primary/5 flex items-center justify-center mr-2">
                        <svg className="h-3.5 w-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                      </div>
                      <span className="truncate">{item.locationFound}</span>
                    </div>
                  </div>
                  
                  <div className="p-6 pt-0 mt-auto">
                    <button
                      onClick={() => navigate(`/found/${item._id}`)}
                      className="btn-secondary btn-md w-full"
                    >
                      View Details
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-10 border-t border-border/50">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="w-12 h-12 flex items-center justify-center rounded-[16px] bg-surface border border-border text-muted-text hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                
                <div className="h-12 px-6 flex items-center justify-center rounded-[16px] bg-surface border border-border text-label font-bold text-muted-text">
                  PART {pagination.page} / {pagination.pages}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="w-12 h-12 flex items-center justify-center rounded-[16px] bg-surface border border-border text-muted-text hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default FoundItems;
