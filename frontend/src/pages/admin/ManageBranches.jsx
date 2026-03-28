import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2,
  Building2,
  MapPin,
  Phone,
  X
} from 'lucide-react';

const ManageBranches = () => {
  const [branches, setBranches] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', locationId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [branchesRes, locationsRes] = await Promise.all([
        api.get('/branches'),
        api.get('/locations'),
      ]);
      setBranches(branchesRes.data.data);
      setLocations(locationsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (branch = null) => {
    setEditingBranch(branch);
    setFormData(branch ? 
      { name: branch.name, phone: branch.phone || '', locationId: branch.locationId } : 
      { name: '', phone: '', locationId: '' }
    );
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await api.put(`/branches/${editingBranch.id}`, formData);
        toast.success('Branch updated successfully');
      } else {
        await api.post('/branches', formData);
        toast.success('Branch created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;
    
    try {
      await api.delete(`/branches/${id}`);
      toast.success('Branch deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete branch');
    }
  };

  return (
    <DashboardLayout title="Manage Branches">
      <div className="flex justify-end mb-6">
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2" /> Add Branch
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : branches.length === 0 ? (
          <div className="col-span-full text-center py-20 card">
            <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Branches</h3>
            <p className="text-gray-600">Create your first branch to get started</p>
          </div>
        ) : (
          branches.map((branch) => (
            <div key={branch.id} className="card hover:shadow-elevated transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-secondary-100 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-secondary-600" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(branch)}
                    className="p-2 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(branch.id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{branch.name}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{branch.location?.city}, {branch.location?.state}</span>
                </div>
                {branch.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{branch.phone}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t flex gap-4 text-sm">
                <span className="text-gray-500">
                  <strong className="text-gray-900">{branch._count?.departments || 0}</strong> Departments
                </span>
                <span className="text-gray-500">
                  <strong className="text-gray-900">{branch._count?.labs || 0}</strong> Labs
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingBranch ? 'Edit Branch' : 'Add Branch'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="label">Branch Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Main Hospital"
                  required
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                  placeholder="+880 31-XXX-XXXX"
                />
              </div>
              <div>
                <label className="label">Location</label>
                <select
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name} - {loc.city}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBranch ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageBranches;
