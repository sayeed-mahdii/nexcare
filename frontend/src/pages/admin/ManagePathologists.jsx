import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  X,
  Mail,
  Phone,
  Lock,
  Building2,
  Microscope,
  Download,
  Eye,
  EyeOff,
  Upload,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  FlaskConical
} from 'lucide-react';
import ViewUserModal from '../../components/admin/ViewUserModal';

const ManagePathologists = () => {
  const [pathologists, setPathologists] = useState([]);
  const [branches, setBranches] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingPathologist, setEditingPathologist] = useState(null);
  const [viewingPathologist, setViewingPathologist] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    gender: 'Male',
    qualification: '',
    specialization: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, branchesRes, labsRes] = await Promise.all([
        api.get('/users?role=Pathologist'),
        api.get('/branches'),
        api.get('/laboratories'),
      ]);
      
      // Get pathologists from users with role Pathologist
      const pathologistUsers = usersRes.data.data?.users || [];
      setPathologists(pathologistUsers);
      setBranches(branchesRes.data.data || []);
      setLaboratories(labsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter pathologists by branch (through their lab assignment if available)
  const filteredPathologists = useMemo(() => {
    if (selectedBranch === 'all') return pathologists;
    return pathologists.filter(p => p.pathologist?.labReports?.some(lr => lr.lab?.branchId === selectedBranch));
  }, [pathologists, selectedBranch]);

  // Get pathologist counts per branch
  const branchCounts = useMemo(() => {
    const counts = { all: pathologists.length };
    branches.forEach(branch => {
      counts[branch.id] = pathologists.filter(p => 
        p.pathologist?.labReports?.some(lr => lr.lab?.branchId === branch.id)
      ).length || 0;
    });
    return counts;
  }, [pathologists, branches]);

  // Table columns
  const columns = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="w-4 h-4 rounded border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="w-4 h-4 rounded border-gray-300"
        />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Pathologist',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-gray-500">{user?.pathologist?.qualification || 'N/A'}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'specialization',
      header: 'Specialization',
      cell: ({ row }) => (
        <span className="badge bg-pink-100 text-pink-700">{row.original.pathologist?.specialization || 'General'}</span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original?.phone || 'N/A',
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.original?.email || 'N/A',
    },
    {
      accessorKey: 'reports',
      header: 'Reports',
      cell: ({ row }) => {
        const count = row.original.pathologist?.labReports?.length || 0;
        return (
          <span className={`badge ${count > 0 ? 'badge-success' : 'bg-gray-100 text-gray-600'}`}>
            {count} reports
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => openModal(row.original)}
            className="p-2 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewingPathologist(row.original)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: filteredPathologists,
    columns,
    state: {
      globalFilter,
      rowSelection,
    },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      gender: 'Male',
      qualification: '',
      specialization: '',
    });
    setPhotoPreview(null);
    setPhotoFile(null);
  };

  const openModal = (pathologist = null) => {
    if (pathologist) {
      setEditingPathologist(pathologist);
      setFormData({
        firstName: pathologist?.firstName || '',
        lastName: pathologist?.lastName || '',
        email: pathologist?.email || '',
        password: '',
        phone: pathologist?.phone || '',
        gender: pathologist?.gender || 'Male',
        qualification: pathologist?.pathologist?.qualification || '',
        specialization: pathologist?.pathologist?.specialization || '',
      });
      setPhotoPreview(pathologist?.profileImage || null);
    } else {
      setEditingPathologist(null);
      resetForm();
    }
    setShowModal(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: 'Pathologist',
        gender: formData.gender,
        qualification: formData.qualification,
        specialization: formData.specialization,
      };

      if (!editingPathologist) {
        payload.password = formData.password;
      }

      if (editingPathologist) {
        await api.put(`/users/${editingPathologist.id}`, payload);
        toast.success('Pathologist updated successfully');
      } else {
        await api.post('/users', payload);
        toast.success('Pathologist created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save pathologist');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this pathologist?')) return;
    
    try {
      await api.delete(`/users/${id}`);
      toast.success('Pathologist deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete pathologist');
    }
  };

  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection).map(idx => filteredPathologists[parseInt(idx)]?.id).filter(Boolean);
    if (selectedIds.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} pathologists?`)) return;
    
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/users/${id}`)));
      toast.success(`${selectedIds.length} pathologists deleted successfully`);
      setRowSelection({});
      fetchData();
    } catch (error) {
      toast.error('Failed to delete some pathologists');
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Specialization', 'Qualification', 'Reports'];
    const rows = filteredPathologists.map(p => [
      `${p?.firstName} ${p?.lastName}`,
      p?.email || '',
      p?.phone || '',
      p?.pathologist?.specialization || '',
      p?.pathologist?.qualification || '',
      p?.pathologist?.labReports?.length || 0,
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pathologists-${selectedBranch === 'all' ? 'all-branches' : selectedBranch}.csv`;
    a.click();
  };

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <DashboardLayout title="Manage Pathologists">
      {/* Branch Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {/* All Branches Card */}
        <button
          onClick={() => setSelectedBranch('all')}
          className={`relative p-6 rounded-none border transition-all text-left ${
            selectedBranch === 'all'
              ? 'border-pink-600 bg-pink-50 shadow-md ring-1 ring-pink-600'
              : 'border-gray-300 bg-gray-100 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <Microscope className={`w-8 h-8 mb-2 ${selectedBranch === 'all' ? 'text-pink-700' : 'text-gray-500'}`} />
              <h3 className={`font-semibold text-lg ${selectedBranch === 'all' ? 'text-pink-800' : 'text-gray-900'}`}>
                All Pathologists
              </h3>
            </div>
            <div className="absolute top-3 right-3 bg-pink-600 text-white text-sm font-bold rounded-none w-8 h-8 flex items-center justify-center">
              {branchCounts.all}
            </div>
          </div>
        </button>

        {/* Branch Cards */}
        {branches.map(branch => (
          <button
            key={branch.id}
            onClick={() => setSelectedBranch(branch.id)}
            className={`relative p-6 rounded-none border transition-all text-left ${
              selectedBranch === branch.id
                ? 'border-pink-600 bg-pink-50 shadow-md ring-1 ring-pink-600'
                : 'border-gray-300 bg-gray-100 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <MapPin className={`w-8 h-8 mb-2 ${selectedBranch === branch.id ? 'text-pink-700' : 'text-gray-500'}`} />
                <h3 className={`font-semibold text-lg ${selectedBranch === branch.id ? 'text-pink-800' : 'text-gray-900'}`}>
                  {branch.name}
                </h3>
                <p className="text-sm text-gray-600">{branch.location?.city}</p>
              </div>
              <div className="absolute top-3 right-3 bg-pink-600 text-white text-sm font-bold rounded-none w-8 h-8 flex items-center justify-center">
                {branchCounts[branch.id] || 0}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Mobile Branch Tabs */}
      <div className="md:hidden mb-4 flex overflow-x-auto gap-2 pb-2">
        <button
          onClick={() => setSelectedBranch('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedBranch === 'all' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          All ({branchCounts.all})
        </button>
        {branches.map(branch => (
          <button
            key={branch.id}
            onClick={() => setSelectedBranch(branch.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedBranch === branch.id ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {branch.name} ({branchCounts[branch.id] || 0})
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search by name or specialization..."
            className="input pl-12 w-full"
          />
        </div>
        <div className="flex gap-2">
          {selectedCount > 0 && (
            <button
              onClick={handleBulkDelete}
              className="btn btn-danger"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedCount})
            </button>
          )}
          <button onClick={exportCSV} className="btn btn-outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button onClick={() => openModal()} className="btn btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Add Pathologist
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-100 border border-gray-300 rounded-none shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : filteredPathologists.length === 0 ? (
          <div className="text-center py-20">
            <Microscope className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Pathologists Found</h3>
            <p className="text-gray-600">
              {selectedBranch === 'all' ? 'Create your first pathologist to get started' : 'No pathologists assigned to this branch'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th key={header.id}>
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-600">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredPathologists.length)} of{' '}
                {filteredPathologists.length} pathologists
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="btn btn-ghost disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="btn btn-ghost disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingPathologist ? 'Edit Pathologist' : 'Add New Pathologist'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="label">Profile Photo</label>
                <div
                  onDrop={handlePhotoDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-pink-500 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('photo-upload').click()}
                >
                  {photoPreview ? (
                    <div className="flex flex-col items-center">
                      <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover mb-2" />
                      <span className="text-sm text-gray-500">Click or drag to change photo</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-10 h-10 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Drag & drop or click to upload</span>
                    </div>
                  )}
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input pl-12"
                    required
                    disabled={!!editingPathologist}
                  />
                </div>
              </div>

              {!editingPathologist && (
                <div>
                  <label className="label">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input pl-12 pr-12"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input pl-12"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Qualification *</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="input"
                    placeholder="e.g., MBBS, MD Pathology"
                    required
                  />
                </div>
                <div>
                  <label className="label">Specialization *</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="input"
                    placeholder="e.g., Clinical Pathology"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? (
                    <>
                      <div className="spinner w-4 h-4 mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingPathologist ? 'Update Pathologist' : 'Create Pathologist'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Pathologist Modal */}
      {viewingPathologist && (
        <ViewUserModal
          user={viewingPathologist}
          role="Pathologist"
          onClose={() => setViewingPathologist(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default ManagePathologists;
