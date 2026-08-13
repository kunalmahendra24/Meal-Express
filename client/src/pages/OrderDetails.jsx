import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useApp } from '../context/AppContext';
import { useSocket } from '../context/SocketContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle, Truck, XCircle, AlertCircle } from 'lucide-react';

const formatStatus = (status = '') => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const OrderDetails = () => {
    const { id } = useParams();
    const { API_URL, isAuthenticated, authLoading } = useApp();
    const socket = useSocket();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    const fetchOrderDetails = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/orders/my-orders/${id}`);
            if (response.data.success) {
                setOrder(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            navigate('/login?redirect=/orders');
            return;
        }
        fetchOrderDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, authLoading, isAuthenticated]);

    useEffect(() => {
        if (!socket) return;

        const onStatusUpdated = (payload) => {
            if (payload.orderId !== id) return;
            setOrder(prev => prev ? {
                ...prev,
                status: payload.status,
                statusHistory: payload.statusHistory || prev.statusHistory,
                estimatedDeliveryTime: payload.estimatedDeliveryTime ?? prev.estimatedDeliveryTime,
                actualDeliveryTime: payload.actualDeliveryTime ?? prev.actualDeliveryTime
            } : prev);
            toast.info(`Your order is now ${formatStatus(payload.status)}`);
        };

        const onReconnect = () => {
            fetchOrderDetails();
        };

        socket.on('order:statusUpdated', onStatusUpdated);
        socket.io.on('reconnect', onReconnect);

        return () => {
            socket.off('order:statusUpdated', onStatusUpdated);
            socket.io.off('reconnect', onReconnect);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, id]);

    const handleCancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        try {
            setCancelling(true);
            const response = await axios.patch(`${API_URL}/api/orders/${id}/cancel`);
            if (response.data.success) {
                toast.success('Order cancelled successfully');
                setOrder(response.data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-6 h-6 text-yellow-500" />;
            case 'confirmed':
            case 'preparing':
                return <AlertCircle className="w-6 h-6 text-blue-500" />;
            case 'out_for_delivery':
                return <Truck className="w-6 h-6 text-purple-500" />;
            case 'delivered':
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            case 'cancelled':
                return <XCircle className="w-6 h-6 text-red-500" />;
            default:
                return <Package className="w-6 h-6 text-gray-500" />;
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const orderStages = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

    const getStageIndex = (status) => {
        if (status === 'cancelled') return -1;
        return orderStages.indexOf(status);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <p className="text-xl text-gray-500 mb-4">Order not found</p>
                <Link to="/orders" className="text-orange-600 hover:text-orange-700 font-medium">
                    Back to Orders
                </Link>
            </div>
        );
    }

    const currentStageIndex = getStageIndex(order.status);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    to="/orders"
                    className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Orders
                </Link>

                {/* Order Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                Order #{order._id.slice(-8).toUpperCase()}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            {getStatusIcon(order.status)}
                            <span className="text-lg font-semibold">{formatStatus(order.status)}</span>
                        </div>
                    </div>

                    {/* Order Progress */}
                    {order.status !== 'cancelled' && (
                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded">
                                    <div 
                                        className="h-full bg-orange-500 rounded transition-all duration-500"
                                        style={{ width: `${(currentStageIndex / (orderStages.length - 1)) * 100}%` }}
                                    />
                                </div>
                                <div className="relative flex justify-between">
                                    {orderStages.map((stage, index) => (
                                        <div key={stage} className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                index <= currentStageIndex
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-gray-200 text-gray-400'
                                            }`}>
                                                {index <= currentStageIndex ? (
                                                    <CheckCircle className="w-5 h-5" />
                                                ) : (
                                                    <span className="text-xs">{index + 1}</span>
                                                )}
                                            </div>
                                            <span className={`text-xs mt-2 text-center ${
                                                index <= currentStageIndex ? 'text-orange-600 font-medium' : 'text-gray-400'
                                            }`}>
                                                {formatStatus(stage)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Estimated Delivery */}
                    {order.status !== 'cancelled' && order.status !== 'delivered' && order.estimatedDeliveryTime && (
                        <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                            <p className="text-sm text-orange-800">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Estimated delivery by {formatDate(order.estimatedDeliveryTime)}
                            </p>
                        </div>
                    )}

                    {/* Cancel Button */}
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                        <button
                            onClick={handleCancelOrder}
                            disabled={cancelling}
                            className="mt-4 px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-50"
                        >
                            {cancelling ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                    )}
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                    <div className="space-y-4">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-4 pb-4 border-b last:border-0">
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    {item.image ? (
                                        <img
                                            src={item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Package className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold text-gray-900">₹{item.price * item.quantity}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{order.totalAmount}</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Total</span>
                            <span className="text-orange-600">₹{order.totalAmount}</span>
                        </div>
                    </div>
                </div>

                {/* Delivery & Payment Info */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Delivery Address */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-orange-500" />
                            Delivery Address
                        </h2>
                        <div className="text-gray-600">
                            <p className="font-medium text-gray-900">{order.deliveryAddress.fullName}</p>
                            <p className="mt-1">{order.deliveryAddress.addressLine1}</p>
                            {order.deliveryAddress.addressLine2 && (
                                <p>{order.deliveryAddress.addressLine2}</p>
                            )}
                            <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
                            <p className="mt-2">Phone: {order.deliveryAddress.phone}</p>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-orange-500" />
                            Payment Information
                        </h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Method</span>
                                <span className="font-medium capitalize">
                                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Status</span>
                                <span className={`font-medium capitalize ${
                                    order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                                }`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OrderDetails;
