import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import API from '../services/api';

const LostFeed = ({ embedded = false, defaultScope = 'block' }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    scope: defaultScope,
    category: '',
    search: ''
  });

  useEffect(() => {
    fetchItems();
  }, [filters]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.scope) params.append('scope', filters.scope);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      
      const res = await API.get(`/api/lost/nearby?${params.toString()}`);
      setItems(res.data.data);
    } catch (err) {
      console.error('Error fetching lost feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

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

  const content = (
    <div className="space-y-10 animate-fade-in">
      <Card className="p-4 bg-surface/50 backdrop-blur-sm border-border/50">
        <div className="flex flex-col lg:flex-row gap-6 items-end">
           <div className="flex-shrink-0 w-full lg:w-auto">
             <span className="text-label text-muted-text mb-2 block uppercase tracking-widest text-[10px] font-bold">Scanning Range</span>
             <div className="flex bg-bg p-1 rounded-[14px] border border-border h-[44px] w-full lg:w-[280px]">
               <button
                 onClick={() => setFilters(prev => ({ ...prev, scope: 'block' }))}
                 className={`flex-1 rounded-[10px] text-[12px] font-bold transition-all uppercase tracking-tighter ${
                   filters.scope === 'block' ? 'bg-surface text-primary shadow-sm' : 'text-muted-text'
                 }`}
               >
                 Local Block
               </button>
               <button
                 onClick={() => setFilters(prev => ({ ...prev, scope: 'all' }))}
                 className={`flex-1 rounded-[10px] text-[12px] font-bold transition-all uppercase tracking-tighter ${
                   filters.scope === 'all' ? 'bg-surface text-primary shadow-sm' : 'text-muted-text'
                 }`}
               >
                 Institutional
               </button>
             </div>
           </div>

           <div className="flex-1 w-full">
             <Select
               label="Class Filter"
               name="category"
               value={filters.category}
               onChange={handleFilterChange}
               options={categories}
               placeholder="All Classes"
             />
           </div>
           
           <div className="flex-[1.5] w-full relative">
             <Input
               label="Asset Keyword"
               name="search"
               value={filters.search}
               onChange={handleFilterChange}
               placeholder="Search missing items..."
               className="!pl-10"
             />
             <div className="absolute bottom-[10px] left-3.5 flex items-center pointer-events-none">
               <svg className="h-5 w-5 text-muted-text/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
           </div>
        </div>
      </Card>

      {loading ? (
        <div className="py-24 flex justify-center"><LoadingSpinner text="Querying database..." /></div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Safe Harbor"
          description={filters.scope === 'block' ? "No reports found in your immediate block." : "The tracking systems show no active lost reports."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <Card key={item._id} hover className="flex flex-col group !rounded-[16px] overflow-hidden bg-surface border-border/10">
               {item.imageUrl && (
                 <Link to={`/lost/${item._id}`} className="h-40 overflow-hidden border-b border-border/50 block">
                   <img src={item.imageUrl} alt={item.itemName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 </Link>
               )}
               <div className="p-5 flex-1 space-y-3">
                  <div className="flex justify-between items-center">
                    <Badge variant={item.status === 'CLOSED' ? 'success' : 'danger'}>
                      {item.status === 'CLOSED' ? 'RESOLVED' : item.category}
                    </Badge>
                    <span className="text-[10px] text-muted-text font-bold uppercase tracking-tight opacity-50">
                      {new Date(item.dateLost).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div>
                    <Link to={`/lost/${item._id}`}>
                      <h3 className="text-h2 text-text mb-1 group-hover:text-primary transition-colors line-clamp-1 font-bold">
                        {item.itemName}
                      </h3>
                    </Link>
                    <p className="text-small text-muted-text line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center text-small text-muted-text pt-1 font-medium opacity-70">
                    <div className="w-6 h-6 rounded-[6px] bg-primary/5 flex items-center justify-center mr-2 border border-primary/5">
                      <svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                    </div>
                    <span className="truncate">{item.locationLost}</span>
                  </div>
               </div>
               
               <div className="p-5 pt-0 mt-auto flex gap-3">
                  <Link 
                    to={`/lost/${item._id}`}
                    className="flex-1 btn-secondary btn-md !h-9 text-[11px]"
                  >
                    View Details
                  </Link>
                  <Link 
                    to={`/found/report?lostId=${item._id}&category=${item.category}&location=${item.locationLost}`}
                    className="flex-1 btn-primary btn-md !h-9 text-[11px]"
                  >
                    I Found This
                  </Link>
               </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  if (embedded) return content;

  return (
    <AppLayout>
      <PageHeader 
        title="Community Lost Feed"
        subtitle="Recent items reported missing by fellow students and staff."
        action={
          <Link 
            to="/report-lost"
            className="btn-primary btn-md gap-2 !px-5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Report Lost Item
          </Link>
        }
      />
      {content}
    </AppLayout>
  );
};

export default LostFeed;
