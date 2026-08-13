import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { MapPin, Plus, CreditCard, Truck, Check, Copy, Wallet, Smartphone } from 'lucide-react';

const Checkout = () => {
    const {
        cart,
        getCartTotal,
        getDeliveryCharge,
        clearCart,
        API_URL,
        isAuthenticated,
        settings,
        authLoading
    } = useApp();
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [deliveryInstructions, setDeliveryInstructions] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingAddresses, setFetchingAddresses] = useState(true);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [upiCopied, setUpiCopied] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: 'Home',
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        landmark: ''
    });

    const cartTotal = getCartTotal();
    const deliveryCharge = getDeliveryCharge();
    const finalTotal = cartTotal + deliveryCharge;

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            navigate('/login?redirect=/checkout');
            return;
        }
        if (cart.length === 0) {
            navigate('/cart');
            return;
        }
        fetchAddresses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, isAuthenticated, cart.length]);

    const fetchAddresses = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/user/addresses`);
            if (response.data.success) {
                setAddresses(response.data.data);
                const defaultAddr = response.data.data.find(a => a.isDefault);
                if (defaultAddr) {
                    setSelectedAddress(defaultAddr._id);
                } else if (response.data.data.length > 0) {
                    setSelectedAddress(response.data.data[0]._id);
                }
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setFetchingAddresses(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/user/addresses`, newAddress);
            if (response.data.success) {
                toast.success('Address added successfully');
                setAddresses(response.data.data);
                setSelectedAddress(response.data.data[response.data.data.length - 1]._id);
                setShowAddAddress(false);
                setNewAddress({
                    label: 'Home',
                    fullName: '',
                    phone: '',
                    addressLine1: '',
                    addressLine2: '',
                    city: '',
                    state: '',
                    pincode: '',
                    landmark: ''
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add address');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error('Please select a delivery address');
            return;
        }

        const address = addresses.find(a => a._id === selectedAddress);
        if (!address) {
            toast.error('Selected address not found');
            return;
        }

        try {
            setLoading(true);
            const orderData = {
                items: cart.map(item => ({
                    mealId: item._id,
                    quantity: item.quantity
                })),
                deliveryAddress: {
                    fullName: address.fullName,
                    phone: address.phone,
                    addressLine1: address.addressLine1,
                    addressLine2: address.addressLine2,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode,
                    landmark: address.landmark
                },
                paymentMethod,
                deliveryInstructions
            };

            const response = await axios.post(`${API_URL}/api/orders`, orderData);
            if (response.data.success) {
                clearCart();
                toast.success('Order placed successfully!');
                navigate(`/orders/${response.data.data._id}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingAddresses) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Delivery Address */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-orange-500" />
                                    Delivery Address
                                </h2>
                                <button
                                    onClick={() => setShowAddAddress(true)}
                                    className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add New
                                </button>
                            </div>

                            {addresses.length === 0 ? (
                                <p className="text-gray-500">No addresses saved. Please add a delivery address.</p>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.map(addr => (
                                        <label
                                            key={addr._id}
                                            className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                                                selectedAddress === addr._id
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-200 hover:border-orange-300'
                                            }`}
                                        >
                                            <div className="flex items-start">
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    checked={selectedAddress === addr._id}
                                                    onChange={() => setSelectedAddress(addr._id)}
                                                    className="mt-1 mr-3"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium">{addr.fullName}</span>
                                                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                                                            {addr.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {addr.addressLine1}
                                                        {addr.addressLine2 && `, ${addr.addressLine2}`}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {addr.city}, {addr.state} - {addr.pincode}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">Phone: {addr.phone}</p>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* Add Address Form */}
                            {showAddAddress && (
                                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                                    <h3 className="font-medium mb-4">Add New Address</h3>
                                    <form onSubmit={handleAddAddress} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                value={newAddress.fullName}
                                                onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})}
                                                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                                required
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Phone Number"
                                                value={newAddress.phone}
                                                onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                                                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                                required
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Address Line 1"
                                            value={newAddress.addressLine1}
                                            onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Address Line 2 (Optional)"
                                            value={newAddress.addressLine2}
                                            onChange={(e) => setNewAddress({...newAddress, addressLine2: e.target.value})}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                        />
                                        <div className="grid grid-cols-3 gap-4">
                                            <input
                                                type="text"
                                                placeholder="City"
                                                value={newAddress.city}
                                                onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                                                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                                required
                                            />
                                            <input
                                                type="text"
                                                placeholder="State"
                                                value={newAddress.state}
                                                onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                                                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                                required
                                            />
                                            <input
                                                type="text"
                                                placeholder="Pincode"
                                                value={newAddress.pincode}
                                                onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                                                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                                required
                                            />
                                        </div>
                                        <div className="flex space-x-4">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                                            >
                                                {loading ? 'Saving...' : 'Save Address'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddAddress(false)}
                                                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold flex items-center mb-4">
                                <CreditCard className="w-5 h-5 mr-2 text-orange-500" />
                                Payment Method
                            </h2>

                            <div className="space-y-3">
                                <label className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                                    paymentMethod === 'cod'
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-orange-300'
                                }`}>
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cod"
                                            checked={paymentMethod === 'cod'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="mr-3"
                                        />
                                        <div className="flex-1">
                                            <span className="font-medium">Cash on Delivery</span>
                                            <p className="text-sm text-gray-500">Pay when your order arrives</p>
                                        </div>
                                        <Truck className="w-6 h-6 text-gray-400" />
                                    </div>
                                </label>

                                <label className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                                    paymentMethod === 'upi'
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-orange-300'
                                }`}>
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="upi"
                                            checked={paymentMethod === 'upi'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="mr-3"
                                        />
                                        <div className="flex-1">
                                            <span className="font-medium">UPI Payment</span>
                                            <p className="text-sm text-gray-500">Pay using GPay, PhonePe, Paytm etc.</p>
                                        </div>
                                        <Wallet className="w-6 h-6 text-purple-500" />
                                    </div>
                                </label>

                                {/* UPI Payment Details */}
                                {paymentMethod === 'upi' && settings.upiId && (
                                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Smartphone className="w-5 h-5 text-purple-600" />
                                            <span className="font-semibold text-gray-900">Pay via UPI</span>
                                        </div>
                                        
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <p className="text-sm text-gray-500 mb-1">Pay to</p>
                                            <p className="font-semibold text-gray-900">{settings.upiName || 'Meal Express'}</p>
                                            
                                            <div className="flex items-center justify-between mt-3 p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="text-xs text-gray-500">UPI ID</p>
                                                    <p className="font-mono font-medium text-gray-900">{settings.upiId}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(settings.upiId);
                                                        setUpiCopied(true);
                                                        toast.success('UPI ID copied!');
                                                        setTimeout(() => setUpiCopied(false), 3000);
                                                    }}
                                                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                        upiCopied 
                                                            ? 'bg-green-500 text-white' 
                                                            : 'bg-purple-500 text-white hover:bg-purple-600'
                                                    }`}
                                                >
                                                    {upiCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    <span>{upiCopied ? 'Copied!' : 'Copy'}</span>
                                                </button>
                                            </div>

                                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                                <p className="text-xs text-yellow-800">
                                                    <strong>Steps:</strong> Copy the UPI ID → Open your UPI app → Pay ₹{finalTotal} → Place order
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'upi' && !settings.upiId && (
                                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                                        <p className="text-sm text-red-600">
                                            UPI payment is not available at the moment. Please select Cash on Delivery.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Delivery Instructions */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Delivery Instructions (Optional)</h2>
                            <textarea
                                value={deliveryInstructions}
                                onChange={(e) => setDeliveryInstructions(e.target.value)}
                                placeholder="Any special instructions for delivery..."
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-300 resize-none"
                                rows={3}
                                maxLength={200}
                            />
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                            <div className="space-y-3 mb-4">
                                {cart.map(item => (
                                    <div key={item._id} className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {item.name} x {item.quantity}
                                        </span>
                                        <span>₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <hr className="my-4" />

                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Charge</span>
                                    <span className={deliveryCharge === 0 ? 'text-green-600' : ''}>
                                        {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                                    </span>
                                </div>
                                <hr />
                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Total</span>
                                    <span className="text-orange-600">₹{finalTotal}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading || !selectedAddress}
                                className={`w-full mt-6 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                                    !loading && selectedAddress
                                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {loading ? (
                                    <LoadingSpinner size="small" />
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        <span>Place Order</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
