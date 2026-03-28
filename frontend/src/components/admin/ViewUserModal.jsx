import { X, Mail, Phone, MapPin, Stethoscope, Award, Calendar, Briefcase, Building2, User } from 'lucide-react';

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const ViewUserModal = ({ user, role, onClose }) => {
  if (!user) return null;

  const getRoleSpecificInfo = () => {
    switch (role) {
      case 'Doctor':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-blue-50 p-4 rounded-xl">
              <h4 className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-3 uppercase tracking-wider">
                <Briefcase className="w-4 h-4" /> Professional Info
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-blue-100 pb-2">
                  <span className="text-gray-600 text-sm">Qualification</span>
                  <span className="font-medium text-gray-900">{user.qualification || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-blue-100 pb-2">
                  <span className="text-gray-600 text-sm">Experience</span>
                  <span className="font-medium text-gray-900">{user.experienceYears ? `${user.experienceYears} Years` : 'N/A'}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-600 text-sm">Department</span>
                  <span className="font-medium text-gray-900">{user.department?.name || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-xl">
              <h4 className="flex items-center gap-2 text-sm font-bold text-green-800 mb-3 uppercase tracking-wider">
                <Building2 className="w-4 h-4" /> Branch Info
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-green-100 pb-2">
                  <span className="text-gray-600 text-sm">Branch</span>
                  <span className="font-medium text-gray-900">{user.department?.branch?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-600 text-sm">Location</span>
                  <span className="font-medium text-gray-900">{user.department?.branch?.location?.city || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Pathologist':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-pink-50 p-4 rounded-xl">
              <h4 className="flex items-center gap-2 text-sm font-bold text-pink-800 mb-3 uppercase tracking-wider">
                <Briefcase className="w-4 h-4" /> Professional Info
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-pink-100 pb-2">
                  <span className="text-gray-600 text-sm">Qualification</span>
                  <span className="font-medium text-gray-900">{user.pathologist?.qualification || 'N/A'}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-600 text-sm">Specialization</span>
                  <span className="font-medium text-gray-900">{user.pathologist?.specialization || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl">
              <h4 className="flex items-center gap-2 text-sm font-bold text-purple-800 mb-3 uppercase tracking-wider">
                <Building2 className="w-4 h-4" /> Work Activity
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between pt-1">
                  <span className="text-gray-600 text-sm">Total Reports</span>
                  <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    {user.pathologist?.labReports?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const userData = role === 'Doctor' ? user.user : user; // Normalize data structure difference

  return (
    <div className="modal-overlay z-50 fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="modal-content bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 opacity-100" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-full border-4 border-white/20 overflow-hidden shadow-lg bg-white/10 flex items-center justify-center">
                  {userData?.profileImage ? (
                    <img src={userData.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-white/50" />
                  )}
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-white mb-1">
                   {userData?.firstName} {userData?.lastName}
                 </h2>
                 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${role === 'Doctor' ? 'bg-primary-500/20 text-primary-200 border-primary-500/30' : 'bg-pink-500/20 text-pink-200 border-pink-500/30'}`}>
                    {role === 'Doctor' && <Stethoscope className="w-3 h-3" />}
                    {role === 'Pathologist' && <Award className="w-3 h-3" />}
                    {role} Profile
                 </span>
               </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
               <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400">
                 <Mail className="w-4 h-4" />
               </div>
               <div>
                 <p className="text-xs text-gray-500 font-medium uppercase">Email Address</p>
                 <p className="text-sm font-medium text-gray-900 break-all">{userData?.email || 'N/A'}</p>
               </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
               <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400">
                 <Phone className="w-4 h-4" />
               </div>
               <div>
                 <p className="text-xs text-gray-500 font-medium uppercase">Phone Number</p>
                 <p className="text-sm font-medium text-gray-900">{userData?.phone || 'N/A'}</p>
               </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
               <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400">
                 <User className="w-4 h-4" />
               </div>
               <div>
                 <p className="text-xs text-gray-500 font-medium uppercase">Gender</p>
                 <p className="text-sm font-medium text-gray-900">{userData?.gender || 'N/A'}</p>
               </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
               <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400">
                 <Calendar className="w-4 h-4" />
               </div>
               <div>
                 <p className="text-xs text-gray-500 font-medium uppercase">Joined On</p>
                 <p className="text-sm font-medium text-gray-900">{userData?.createdAt ? formatDate(userData.createdAt) : 'N/A'}</p>
               </div>
            </div>
          </div>

          {/* Role Specific Info */}
          {getRoleSpecificInfo()}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button onClick={onClose} className="btn btn-outline">Close Details</button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;
