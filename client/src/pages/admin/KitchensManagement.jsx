import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useApp } from '../../context/AppContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ChefHat, Plus, Edit2, X, UserPlus, UserMinus, Phone, Wallet } from 'lucide-react';

const emptyForm = { name: '', phone: '', upiId: '', isActive: true };

const KitchensManagement = () => {
    const { kitchens, fetchKitchens, createKitchen, updateKitchen, setKitchenStaff, users, fetchUsers } = useAdmin();
    const { user } = useApp();

    const isSuperAdmin = user?.role === 'super_admin';
    // An admin fetches only their own kitchen, so an empty list means they have none yet
    const canCreateKitchen = isSuperAdmin || kitchens.length === 0;

    const [showModal, setShowModal] = useState(false);
    const [editingKitchen, setEditingKitchen] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [staffTarget, setStaffTarget] = useState(null);
    const [staffUserId, setStaffUserId] = useState('');
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const load = async () => {
            await fetchKitchens();
            if (isSuperAdmin) await fetchUsers({ limit: 100 });
            setLoaded(true);
        };
        load();
    }, [fetchKitchens, fetchUsers, isSuperAdmin]);

    const openModal = (kitchen = null) => {
        if (kitchen) {
            setEditingKitchen(kitchen);
            setFormData({
                name: kitchen.name || '',
                phone: kitchen.phone || '',
                upiId: kitchen.upiId || '',
                isActive: kitchen.isActive
            });
        } else {
            setEditingKitchen(null);
            setFormData(emptyForm);
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingKitchen(null);
        setFormData(emptyForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const result = editingKitchen
            ? await updateKitchen(editingKitchen._id, formData)
            : await createKitchen(formData);
        setSaving(false);
        if (result?.success) closeModal();
    };

    const handleAssign = async (kitchenId) => {
        if (!staffUserId) return;
        const result = await setKitchenStaff(kitchenId, staffUserId, 'add');
        if (result?.success) {
            setStaffTarget(null);
            setStaffUserId('');
        }
    };

    // Only users who are not already staffing this kitchen can be added
    const assignableUsers = (kitchen) => users.filter(
        u => u.role !== 'super_admin' && u.kitchen !== kitchen._id
    );

    if (!loaded) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kitchens</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {isSuperAdmin
                            ? 'Create kitchens and assign the admins who staff them'
                            : canCreateKitchen
                                ? 'Set up your own kitchen to start adding meals'
                                : 'Your kitchen details'}
                    </p>
                </div>
                {canCreateKitchen && (
                    <button
                        onClick={() => openModal()}
                        className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        <Plus className="w-5 h-5" />
                        <span>{isSuperAdmin ? 'Add Kitchen' : 'Create My Kitchen'}</span>
                    </button>
                )}
            </div>

            {kitchens.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                        {isSuperAdmin
                            ? 'No kitchens yet. Create the first one to start onboarding vendors.'
                            : 'You do not run a kitchen yet. Create yours to start adding meals.'}
                    </p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kitchens.map(kitchen => (
                        <div key={kitchen._id} className="bg-white rounded-xl shadow-sm p-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                        <ChefHat className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{kitchen.name}</h3>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                            kitchen.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {kitchen.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => openModal(kitchen)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    title="Edit kitchen"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="mt-4 space-y-1 text-sm text-gray-600">
                                <p className="flex items-center space-x-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span>{kitchen.phone || 'No phone'}</span>
                                </p>
                                <p className="flex items-center space-x-2">
                                    <Wallet className="w-4 h-4 text-gray-400" />
                                    <span>{kitchen.upiId || 'No UPI ID'}</span>
                                </p>
                                <p className="text-xs text-gray-400 pt-1">
                                    Owner: {kitchen.owner?.name || 'Unknown'}
                                </p>
                            </div>

                            <div className="mt-4 pt-4 border-t">
                                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Staff</p>
                                {kitchen.staff?.length > 0 ? (
                                    <ul className="space-y-1">
                                        {kitchen.staff.map(member => (
                                            <li key={member._id} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-700 truncate">{member.name}</span>
                                                {isSuperAdmin && (
                                                    <button
                                                        onClick={() => setKitchenStaff(kitchen._id, member._id, 'remove')}
                                                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                        title="Remove from kitchen"
                                                    >
                                                        <UserMinus className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-400">No admins assigned</p>
                                )}

                                {isSuperAdmin && (
                                    staffTarget === kitchen._id ? (
                                        <div className="mt-3 flex items-center gap-2">
                                            <select
                                                value={staffUserId}
                                                onChange={(e) => setStaffUserId(e.target.value)}
                                                className="flex-1 px-2 py-1.5 border rounded-lg text-sm"
                                            >
                                                <option value="">Select a user</option>
                                                {assignableUsers(kitchen).map(u => (
                                                    <option key={u._id} value={u._id}>
                                                        {u.name} ({u.email})
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => handleAssign(kitchen._id)}
                                                disabled={!staffUserId}
                                                className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm disabled:opacity-50"
                                            >
                                                Add
                                            </button>
                                            <button
                                                onClick={() => { setStaffTarget(null); setStaffUserId(''); }}
                                                className="p-1.5 text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setStaffTarget(kitchen._id)}
                                            className="mt-3 flex items-center space-x-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            <span>Assign admin</span>
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">
                                {editingKitchen ? 'Edit Kitchen' : 'Add Kitchen'}
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                                <input
                                    type="text"
                                    value={formData.upiId}
                                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                    placeholder="kitchen@upi"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="kitchenActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="mr-2 rounded text-orange-500"
                                />
                                <label htmlFor="kitchenActive" className="text-sm text-gray-700">
                                    Active (visible to customers)
                                </label>
                            </div>

                            <div className="flex space-x-4 pt-4 border-t">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : (editingKitchen ? 'Update Kitchen' : 'Create Kitchen')}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KitchensManagement;
