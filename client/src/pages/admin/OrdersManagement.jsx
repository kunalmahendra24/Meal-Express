import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useApp } from '../../context/AppContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Search, Filter, Eye, Package, Clock, CheckCircle, Truck, XCircle, AlertCircle } from 'lucide-react';

const OrdersManagement = () => {
    const { orders, fetchOrders, updateOrderStatus, pagination, loading } = useAdmin();
    const { API_URL } = useApp();
    
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchOrders({ status: statusFilter !== 'all' ? statusFilter : undefined });
    }, [fetchOrders, statusFilter]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4" />;
            case 'confirmed':
            case 'preparing':
                return <AlertCircle className="w-4 h-4" />;
            case 'out_for_delivery':
                return <Truck className="w-4 h-4" />;
            case 'delivered':
                return <CheckCircle className="w-4 h-4" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Package className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
            preparing: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            out_for_delivery: 'bg-purple-100 text-purple-700 border-purple-200',
            delivered: 'bg-green-100 text-green-700 border-green-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const formatStatus = (status) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

    const handleStatusUpdate = async (orderId, newStatus) => {
        await updateOrderStatus(orderId, newStatus);
        if (selectedOrder && selectedOrder._id === orderId) {
            setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
    };

    const viewOrderDetails = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const statusOptions = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    const filterOptions = ['all', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage and track all orders</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex flex-wrap gap-2">
                    {filterOptions.map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                statusFilter === status
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {status === 'all' ? 'All' : formatStatus(status)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="large" />
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders found</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orders.map(order => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <span className="font-medium text-gray-900">
                                                #{order._id.slice(-8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{order.user?.name || 'N/A'}</p>
                                                <p className="text-sm text-gray-500">{order.user?.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-gray-600">{order.items?.length || 0} items</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="font-semibold text-gray-900">₹{order.totalAmount}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(order.status)}`}
                                            >
                                                {statusOptions.map(status => (
                                                    <option key={status} value={status}>
                                                        {formatStatus(status)}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-500">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => viewOrderDetails(order)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
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
                                Page {pagination.page} of {pagination.pages} ({pagination.total} orders)
                            </p>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => fetchOrders({ page: pagination.page - 1, status: statusFilter !== 'all' ? statusFilter : undefined })}
                                    disabled={pagination.page === 1}
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => fetchOrders({ page: pagination.page + 1, status: statusFilter !== 'all' ? statusFilter : undefined })}
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

            {/* Order Details Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b sticky top-0 bg-white flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Order #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                ✕
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                                    {getStatusIcon(selectedOrder.status)}
                                    <span>{formatStatus(selectedOrder.status)}</span>
                                </span>
                                <select
                                    value={selectedOrder.status}
                                    onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                                    className="px-3 py-2 border rounded-lg"
                                >
                                    {statusOptions.map(status => (
                                        <option key={status} value={status}>{formatStatus(status)}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900 mb-2">Customer Details</h3>
                                <p className="text-gray-600">{selectedOrder.user?.name}</p>
                                <p className="text-gray-600">{selectedOrder.user?.email}</p>
                                <p className="text-gray-600">{selectedOrder.user?.phone}</p>
                            </div>

                            {/* Delivery Address */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900 mb-2">Delivery Address</h3>
                                <p className="text-gray-600">{selectedOrder.deliveryAddress?.fullName}</p>
                                <p className="text-gray-600">{selectedOrder.deliveryAddress?.addressLine1}</p>
                                <p className="text-gray-600">
                                    {selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.state} - {selectedOrder.deliveryAddress?.pincode}
                                </p>
                                <p className="text-gray-600">Phone: {selectedOrder.deliveryAddress?.phone}</p>
                            </div>

                            {/* Items */}
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">Order Items</h3>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between py-2 border-b">
                                            <div className="flex items-center space-x-3">
                                                {item.image && (
                                                    <img
                                                        src={item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`}
                                                        alt={item.name}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium">{item.name}</p>
                                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-medium">₹{item.price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-4 pt-4 border-t font-semibold text-lg">
                                    <span>Total</span>
                                    <span className="text-orange-600">₹{selectedOrder.totalAmount}</span>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900 mb-2">Payment</h3>
                                <p className="text-gray-600">Method: {selectedOrder.paymentMethod?.toUpperCase()}</p>
                                <p className="text-gray-600">Status: {selectedOrder.paymentStatus}</p>
                            </div>

                            {/* Order Timeline */}
                            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">Order Timeline</h3>
                                    <div className="space-y-2">
                                        {selectedOrder.statusHistory.map((history, index) => (
                                            <div key={index} className="flex items-center space-x-3 text-sm">
                                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                                <span className="capitalize">{formatStatus(history.status)}</span>
                                                <span className="text-gray-400">{formatDate(history.timestamp)}</span>
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

export default OrdersManagement;
