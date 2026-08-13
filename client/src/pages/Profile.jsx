import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Mail, Phone, MapPin, Plus, Edit2, Trash2, Check, X, Shield } from 'lucide-react';

const Profile = () => {
    const { API_URL, isAuthenticated, checkAuth, authLoading } = useApp();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', phone: '' });
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [newAddress, setNewAddress] = useState({
        label: 'Home',
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        isDefault: false
    });

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            navigate('/login?redirect=/profile');
            return;
        }
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, isAuthenticated]);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/user/profile`);
            if (response.data.success) {
                setProfile(response.data.data);
                setEditData({
                    name: response.data.data.name || '',
                    phone: response.data.data.phone || ''
                });
                setAddresses(response.data.data.addresses || []);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`${API_URL}/api/user/profile`, editData);
            if (response.data.success) {
                toast.success('Profile updated successfully');
                setProfile(response.data.data);
                setEditing(false);
                checkAuth(); // Update global user state
            }
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/api/user/addresses`, newAddress);
            if (response.data.success) {
                toast.success('Address added successfully');
                setAddresses(response.data.data);
                setShowAddAddress(false);
                resetAddressForm();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add address');
        }
    };

    const handleUpdateAddress = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`${API_URL}/api/user/addresses/${editingAddressId}`, newAddress);
            if (response.data.success) {
                toast.success('Address updated successfully');
                setAddresses(response.data.data);
                setEditingAddressId(null);
                resetAddressForm();
            }
        } catch (error) {
            toast.error('Failed to update address');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        try {
            const response = await axios.delete(`${API_URL}/api/user/addresses/${addressId}`);
            if (response.data.success) {
                toast.success('Address deleted successfully');
                setAddresses(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to delete address');
        }
    };

    const startEditAddress = (address) => {
        setEditingAddressId(address._id);
        setNewAddress({
            label: address.label,
            fullName: address.fullName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || '',
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            landmark: address.landmark || '',
            isDefault: address.isDefault
        });
        setShowAddAddress(false);
    };

    const resetAddressForm = () => {
        setNewAddress({
            label: 'Home',
            fullName: '',
            phone: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            pincode: '',
            landmark: '',
            isDefault: false
        });
    };

    const cancelAddressEdit = () => {
        setEditingAddressId(null);
        setShowAddAddress(false);
        resetAddressForm();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

                {/* Profile Info */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">Personal Information</h2>
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center"
                            >
                                <Edit2 className="w-4 h-4 mr-1" />
                                Edit
                            </button>
                        )}
                    </div>

                    {editing ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={editData.phone}
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center"
                                >
                                    <Check className="w-4 h-4 mr-1" />
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditing(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 flex items-center"
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <User className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{profile?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{profile?.email}</p>
                                    {profile?.isAccountVerified && (
                                        <span className="inline-flex items-center text-xs text-green-600">
                                            <Shield className="w-3 h-3 mr-1" />
                                            Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium">{profile?.phone || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Addresses */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-orange-500" />
                            Saved Addresses
                        </h2>
                        {!showAddAddress && !editingAddressId && (
                            <button
                                onClick={() => setShowAddAddress(true)}
                                className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add New
                            </button>
                        )}
                    </div>

                    {/* Add/Edit Address Form */}
                    {(showAddAddress || editingAddressId) && (
                        <form 
                            onSubmit={editingAddressId ? handleUpdateAddress : handleAddAddress}
                            className="mb-6 p-4 border rounded-lg bg-gray-50"
                        >
                            <h3 className="font-medium mb-4">
                                {editingAddressId ? 'Edit Address' : 'Add New Address'}
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        value={newAddress.label}
                                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                    >
                                        <option value="Home">Home</option>
                                        <option value="Work">Work</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isDefault"
                                            checked={newAddress.isDefault}
                                            onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <label htmlFor="isDefault" className="text-sm">Set as default</label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={newAddress.fullName}
                                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                        required
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={newAddress.phone}
                                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                        required
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Address Line 1"
                                    value={newAddress.addressLine1}
                                    onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Address Line 2 (Optional)"
                                    value={newAddress.addressLine2}
                                    onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                />
                                <div className="grid grid-cols-3 gap-4">
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="State"
                                        value={newAddress.state}
                                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Pincode"
                                        value={newAddress.pincode}
                                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                        required
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Landmark (Optional)"
                                    value={newAddress.landmark}
                                    onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                />
                                <div className="flex space-x-4">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                                    >
                                        {editingAddressId ? 'Update Address' : 'Save Address'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelAddressEdit}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Address List */}
                    {addresses.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No saved addresses</p>
                    ) : (
                        <div className="space-y-4">
                            {addresses.map(addr => (
                                <div
                                    key={addr._id}
                                    className={`p-4 border rounded-lg ${addr.isDefault ? 'border-orange-300 bg-orange-50' : ''}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-medium">{addr.fullName}</span>
                                                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{addr.label}</span>
                                                {addr.isDefault && (
                                                    <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">Default</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {addr.addressLine1}
                                                {addr.addressLine2 && `, ${addr.addressLine2}`}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {addr.city}, {addr.state} - {addr.pincode}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">Phone: {addr.phone}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => startEditAddress(addr)}
                                                className="p-2 text-gray-400 hover:text-orange-600"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAddress(addr._id)}
                                                className="p-2 text-gray-400 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
