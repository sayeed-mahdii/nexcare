import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2,
  Building2,
  Users,
  X,
  Search,
  UserCheck
} from 'lucide-react';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ 
    name: '', 
    branchId: '',
    description: '',
    headDoctorId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptsRes, branchesRes, doctorsRes] = await Promise.all([
        api.get('/departments'),
        api.get('/branches'),
        api.get('/doctors'),
      ]);
      setDepartments(deptsRes.data.data);
      setBranches(branchesRes.data.data);
      setDoctors(doctorsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (dept = null) => {
    setEditingDept(dept);
    setFormData(dept ? { 
      name: dept.name, 
      branchId: dept.branchId,
      description: dept.description || '',
      headDoctorId: dept.headDoctorId || ''
    } : { 
      name: '', 
      branchId: '',
      description: '',
      headDoctorId: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        branchId: formData.branchId,
        description: formData.description || null,
        headDoctorId: formData.headDoctorId || null,
      };

      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, payload);
        toast.success('Department updated successfully');
      } else {
        await api.post('/departments', payload);
        toast.success('Department created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    
    try {
      await api.delete(`/departments/${id}`);
      toast.success('Department deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete department');
    }
  };

  // Filter departments by search
  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(search.toLowerCase()) ||
    dept.branch?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Get doctors for head doctor dropdown (only doctors from selected branch)
  const availableDoctors = formData.branchId 
    ? doctors.filter(doc => doc.department?.branchId === formData.branchId && doc.isApproved)
    : doctors.filter(doc => doc.isApproved);

  // Get head doctor name for display
  const getHeadDoctorName = (dept) => {
    if (!dept.headDoctorId) return 'Not Assigned';
    const doctor = doctors.find(d => d.id === dept.headDoctorId);
    if (!doctor) return 'Not Assigned';
    return `Dr. ${doctor.user?.firstName} ${doctor.user?.lastName}`;
  };

  return (
    <DashboardLayout title="Manage Departments">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments..."
            className="input pl-12 w-full"
          />
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2" /> Add Department
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 rounded-none shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100">Total Departments</p>
              <p className="text-3xl font-bold">{departments.length}</p>
            </div>
            <Building2 className="w-12 h-12 text-primary-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-none shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Doctors</p>
              <p className="text-3xl font-bold">{doctors.length}</p>
            </div>
            <Users className="w-12 h-12 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-none shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Active Branches</p>
              <p className="text-3xl font-bold">{branches.length}</p>
            </div>
            <Building2 className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-gray-100 border border-gray-300 rounded-none shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Departments</h3>
            <p className="text-gray-600">Create your first department to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Description</th>
                  <th>Branch</th>
                  <th>Head Doctor</th>
                  <th>Doctors</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-none flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary-600" />
                        </div>
                        <span className="font-medium text-gray-900">{dept.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-gray-600 text-sm">
                        {dept.description || <span className="text-gray-400 italic">No description</span>}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-primary rounded-none">{dept.branch?.name}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-gray-400" />
                        <span className={dept.headDoctorId ? 'text-gray-900' : 'text-gray-400 italic'}>
                          {getHeadDoctorName(dept)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="font-semibold text-gray-900">{dept._count?.doctors || 0}</span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(dept)}
                          className="p-2 rounded-none text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id)}
                          className="p-2 rounded-none text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingDept ? 'Edit Department' : 'Add Department'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Department Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Cardiology"
                  required
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Brief description of the department..."
                />
              </div>
              <div>
                <label className="label">Branch *</label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value, headDoctorId: '' })}
                  className="input"
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Head Doctor</label>
                <select
                  value={formData.headDoctorId}
                  onChange={(e) => setFormData({ ...formData, headDoctorId: e.target.value })}
                  className="input"
                >
                  <option value="">Not Assigned</option>
                  {availableDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.user?.firstName} {doctor.user?.lastName} - {doctor.department?.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.branchId ? `Showing doctors from selected branch` : 'Select a branch to filter doctors'}
                </p>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDept ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageDepartments;
