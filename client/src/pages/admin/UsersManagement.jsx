import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useApp } from '../../context/AppContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Search, Users, Shield, Eye, UserCheck, UserX } from 'lucide-react';

const UsersManagement = () => {
    const { users, fetchUsers, updateUserRole, toggleUserStatus, pagination, loading } = useAdmin();
    const { user: currentUser } = useApp();
    const canChangeRoles = currentUser?.role === 'super_admin';
    
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchUsers({ role: roleFilter !== 'all' ? roleFilter : undefined });
    }, [fetchUsers, roleFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers({ search, role: roleFilter !== 'all' ? roleFilter : undefined });
    };

    const handleRoleChange = async (userId, newRole) => {
        await updateUserRole(userId, newRole);
    };

    const handleToggleStatus = async (userId) => {
        await toggleUserStatus(userId);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'super_admin':
                return 'bg-purple-100 text-purple-700';
            case 'admin':
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage user accounts and roles</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, email, or phone..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                            />
                        </div>
                    </form>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                    >
                        <option value="all">All Roles</option>
                        <option value="user">Users</option>
                        <option value="admin">Admins</option>
                        <option value="super_admin">Super Admins</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="large" />
                </div>
            ) : users.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No users found</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                                    <span className="text-orange-600 font-semibold">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    {user.isAccountVerified && (
                                                        <span className="inline-flex items-center text-xs text-green-600">
                                                            <Shield className="w-3 h-3 mr-1" />
                                                            Verified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-gray-900">{user.email}</p>
                                            <p className="text-sm text-gray-500">{user.phone || 'No phone'}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            {user.role === 'super_admin' || !canChangeRoles ? (
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                                                    title={!canChangeRoles ? 'Super admin only' : undefined}
                                                >
                                                    {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'User'}
                                                </span>
                                            ) : (
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                    className={`px-3 py-1 rounded-lg text-sm font-medium border ${getRoleBadgeColor(user.role)}`}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                user.isActive 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-500">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowModal(true);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {user.role !== 'super_admin' && (
                                                    <button
                                                        onClick={() => handleToggleStatus(user._id)}
                                                        className={`p-2 rounded-lg ${
                                                            user.isActive 
                                                                ? 'text-red-600 hover:bg-red-50' 
                                                                : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                        title={user.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t">
                            <p className="text-sm text-gray-500">
                                Page {pagination.page} of {pagination.pages} ({pagination.total} users)
                            </p>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => fetchUsers({ page: pagination.page - 1, role: roleFilter !== 'all' ? roleFilter : undefined })}
                                    disabled={pagination.page === 1}
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => fetchUsers({ page: pagination.page + 1, role: roleFilter !== 'all' ? roleFilter : undefined })}
                                    disabled={pagination.page === pagination.pages}
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* User Details Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-semibold">User Details</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                ✕
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl text-orange-600 font-bold">
                                        {selectedUser.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedUser.role)}`}>
                                        {selectedUser.role.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Account Status</p>
                                    <p className={`font-medium ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email Verified</p>
                                    <p className={`font-medium ${selectedUser.isAccountVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {selectedUser.isAccountVerified ? 'Yes' : 'No'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Joined</p>
                                    <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                                </div>
                            </div>

                            {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">Saved Addresses ({selectedUser.addresses.length})</p>
                                    <div className="space-y-2">
                                        {selectedUser.addresses.slice(0, 2).map((addr, index) => (
                                            <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                                                <p className="font-medium">{addr.label}: {addr.fullName}</p>
                                                <p className="text-gray-600">{addr.city}, {addr.state}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersManagement;
