import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useApp } from '../../context/AppContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Phone, PhoneOff, Save, Settings, IndianRupee, Truck, Clock, Wallet, Copy, Check } from 'lucide-react';
import { toast } from 'react-toastify';

const SettingsManagement = () => {
    const { settings, fetchSettings, updateSetting, updateOwnerPhone, toggleCallOwner, loading } = useAdmin();
    const { fetchPublicSettings } = useApp();
    
    const [formData, setFormData] = useState({
        owner_phone: '',
        business_name: '',
        business_email: '',
        delivery_charge: '',
        free_delivery_above: '',
        minimum_order_amount: '',
        upi_id: '',
        upi_name: ''
    });
    const [saving, setSaving] = useState(false);
    const [upiCopied, setUpiCopied] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    useEffect(() => {
        if (settings && settings.length > 0) {
            const settingsMap = {};
            settings.forEach(s => {
                settingsMap[s.key] = s.value;
            });
            setFormData({
                owner_phone: settingsMap.owner_phone || '',
                business_name: settingsMap.business_name || 'Meal Express',
                business_email: settingsMap.business_email || '',
                delivery_charge: settingsMap.delivery_charge || 30,
                free_delivery_above: settingsMap.free_delivery_above || 500,
                minimum_order_amount: settingsMap.minimum_order_amount || 100,
                upi_id: settingsMap.upi_id || '',
                upi_name: settingsMap.upi_name || 'Meal Express'
            });
        }
    }, [settings]);

    const getSetting = (key) => {
        const setting = settings.find(s => s.key === key);
        return setting?.value;
    };

    const handleToggleCallOwner = async () => {
        await toggleCallOwner();
        await fetchPublicSettings();
    };

    const handlePhoneUpdate = async () => {
        if (!formData.owner_phone) {
            toast.error('Please enter a phone number');
            return;
        }
        setSaving(true);
        const result = await updateOwnerPhone(formData.owner_phone);
        if (result.success) {
            await fetchPublicSettings();
        }
        setSaving(false);
    };

    if (loading && !settings.length) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    const callOwnerEnabled = getSetting('call_owner_enabled');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 text-sm mt-1">Manage application settings</p>
            </div>

            {/* Call Owner Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-orange-500" />
                    Call Owner Feature
                </h2>

                <div className="space-y-4">
                    {/* Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900">Enable Call Owner Button</p>
                            <p className="text-sm text-gray-500">Allow customers to call you directly</p>
                        </div>
                        <button
                            onClick={handleToggleCallOwner}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                callOwnerEnabled ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    callOwnerEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Owner Phone Number
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="tel"
                                value={formData.owner_phone}
                                onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
                                placeholder="+91 9876543210"
                                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                            />
                            <button
                                onClick={handlePhoneUpdate}
                                disabled={saving}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center"
                            >
                                <Save className="w-4 h-4 mr-1" />
                                Save
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            This number will be shown on the "Call Owner" button
                        </p>
                    </div>
                </div>
            </div>

            {/* Business Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-orange-500" />
                    Business Settings
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Business Name
                        </label>
                        <input
                            type="text"
                            value={formData.business_name}
                            onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Business Email
                        </label>
                        <input
                            type="email"
                            value={formData.business_email}
                            onChange={(e) => setFormData({ ...formData, business_email: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                        />
                    </div>
                </div>

                <button
                    onClick={async () => {
                        setSaving(true);
                        await updateSetting('business_name', formData.business_name);
                        await updateSetting('business_email', formData.business_email);
                        await fetchPublicSettings();
                        setSaving(false);
                    }}
                    disabled={saving}
                    className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center"
                >
                    <Save className="w-4 h-4 mr-1" />
                    Save Business Info
                </button>
            </div>

            {/* UPI Payment Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Wallet className="w-5 h-5 mr-2 text-orange-500" />
                    UPI Payment Settings
                </h2>

                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                            <strong>How it works:</strong> When customers select UPI payment, they'll see your UPI ID. 
                            They can copy it and pay through their UPI app (GPay, PhonePe, Paytm, etc.).
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                UPI ID
                            </label>
                            <input
                                type="text"
                                value={formData.upi_id}
                                onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                                placeholder="yourname@upi"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                            />
                            <p className="text-xs text-gray-500 mt-1">e.g., 9876543210@paytm, name@oksbi</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name for UPI
                            </label>
                            <input
                                type="text"
                                value={formData.upi_name}
                                onChange={(e) => setFormData({ ...formData, upi_name: e.target.value })}
                                placeholder="Business Name"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                            />
                            <p className="text-xs text-gray-500 mt-1">This name will be shown to customers</p>
                        </div>
                    </div>

                    {formData.upi_id && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">Preview:</p>
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                <div>
                                    <p className="font-medium text-gray-900">{formData.upi_name || 'Meal Express'}</p>
                                    <p className="text-sm text-gray-600">{formData.upi_id}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(formData.upi_id);
                                        setUpiCopied(true);
                                        setTimeout(() => setUpiCopied(false), 2000);
                                    }}
                                    className="flex items-center space-x-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm"
                                >
                                    {upiCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    <span>{upiCopied ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={async () => {
                            if (!formData.upi_id) {
                                toast.error('Please enter a UPI ID');
                                return;
                            }
                            setSaving(true);
                            await updateSetting('upi_id', formData.upi_id, 'UPI ID for receiving payments');
                            await updateSetting('upi_name', formData.upi_name, 'Name displayed for UPI payment');
                            await fetchPublicSettings();
                            toast.success('UPI settings saved!');
                            setSaving(false);
                        }}
                        disabled={saving}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center"
                    >
                        <Save className="w-4 h-4 mr-1" />
                        Save UPI Settings
                    </button>
                </div>
            </div>

            {/* Delivery & Pricing Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Truck className="w-5 h-5 mr-2 text-orange-500" />
                    Delivery & Pricing
                </h2>

                <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <IndianRupee className="w-4 h-4 inline" /> Minimum Order
                        </label>
                        <input
                            type="number"
                            value={formData.minimum_order_amount}
                            onChange={(e) => setFormData({ ...formData, minimum_order_amount: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                            min="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Truck className="w-4 h-4 inline" /> Delivery Charge
                        </label>
                        <input
                            type="number"
                            value={formData.delivery_charge}
                            onChange={(e) => setFormData({ ...formData, delivery_charge: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                            min="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Free Delivery Above
                        </label>
                        <input
                            type="number"
                            value={formData.free_delivery_above}
                            onChange={(e) => setFormData({ ...formData, free_delivery_above: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                            min="0"
                        />
                    </div>
                </div>

                <button
                    onClick={async () => {
                        setSaving(true);
                        await updateSetting('minimum_order_amount', parseInt(formData.minimum_order_amount));
                        await updateSetting('delivery_charge', parseInt(formData.delivery_charge));
                        await updateSetting('free_delivery_above', parseInt(formData.free_delivery_above));
                        await fetchPublicSettings();
                        setSaving(false);
                    }}
                    disabled={saving}
                    className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center"
                >
                    <Save className="w-4 h-4 mr-1" />
                    Save Delivery Settings
                </button>
            </div>

            {/* All Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">All Settings</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-500 text-sm border-b">
                                <th className="pb-3 font-medium">Key</th>
                                <th className="pb-3 font-medium">Value</th>
                                <th className="pb-3 font-medium">Description</th>
                                <th className="pb-3 font-medium">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {settings.map(setting => (
                                <tr key={setting._id} className="border-b last:border-0">
                                    <td className="py-3 font-mono text-sm">{setting.key}</td>
                                    <td className="py-3">
                                        {typeof setting.value === 'boolean' 
                                            ? (setting.value ? 'Yes' : 'No')
                                            : typeof setting.value === 'object'
                                            ? JSON.stringify(setting.value)
                                            : String(setting.value)
                                        }
                                    </td>
                                    <td className="py-3 text-gray-500 text-sm">{setting.description}</td>
                                    <td className="py-3 text-gray-500 text-sm">
                                        {new Date(setting.updatedAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SettingsManagement;
