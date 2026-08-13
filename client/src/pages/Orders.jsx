import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { useSocket } from '../context/SocketContext';
import { resolveImageUrl } from '../utils/imageUrl';
import LoadingSpinner from '../components/LoadingSpinner';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, AlertCircle } from 'lucide-react';

const Orders = () => {
    const { API_URL, isAuthenticated, authLoading } = useApp();
    const socket = useSocket();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            navigate('/login?redirect=/orders');
            return;
        }
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, isAuthenticated, filter]);

    useEffect(() => {
        if (!socket) return;

        const onStatusUpdated = (payload) => {
            setOrders(prev => prev.map(order => {
                if (order._id !== payload.orderId && order._id?.toString() !== payload.orderId) {
                    return order;
                }
                return {
                    ...order,
                    status: payload.status,
                    statusHistory: payload.statusHistory || order.statusHistory
                };
            }));
        };

        const onReconnect = () => {
            fetchOrders(pagination.page);
        };

        socket.on('order:statusUpdated', onStatusUpdated);
        socket.io.on('reconnect', onReconnect);

        return () => {
            socket.off('order:statusUpdated', onStatusUpdated);
            socket.io.off('reconnect', onReconnect);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, filter]);

    const fetchOrders = async (page = 1) => {
        try {
            setLoading(true);
            const params = { page, limit: 10 };
            if (filter !== 'all') params.status = filter;

            const response = await axios.get(`${API_URL}/api/orders/my-orders`, { params });
            if (response.data.success) {
                setOrders(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'confirmed':
            case 'preparing':
                return <AlertCircle className="w-5 h-5 text-blue-500" />;
            case 'out_for_delivery':
                return <Truck className="w-5 h-5 text-purple-500" />;
            case 'delivered':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'cancelled':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Package className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'confirmed':
            case 'preparing':
                return 'bg-blue-100 text-blue-700';
            case 'out_for_delivery':
                return 'bg-purple-100 text-purple-700';
            case 'delivered':
                return 'bg-green-100 text-green-700';
            case 'cancelled':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
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

    const filters = [
        { value: 'all', label: 'All Orders' },
        { value: 'pending', label: 'Pending' },
        { value: 'preparing', label: 'Preparing' },
        { value: 'out_for_delivery', label: 'Out for Delivery' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">My Orders</h1>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
                    {filters.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                filter === f.value
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-white text-gray-600 hover:bg-orange-50 border'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="large" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-10 h-10 text-orange-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
                        <p className="text-gray-500 mb-4">
                            {filter === 'all' 
                                ? "You haven't placed any orders yet." 
                                : `No ${formatStatus(filter).toLowerCase()} orders found.`}
                        </p>
                        <Link
                            to="/menu"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
                        >
                            Browse Menu
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <Link
                                key={order._id}
                                to={`/orders/${order._id}`}
                                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="p-4 sm:p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Order #{order._id.slice(-8).toUpperCase()}</p>
                                            <p className="text-xs text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
                                        </div>
                                        <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            <span>{formatStatus(order.status)}</span>
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex -space-x-2">
                                                {order.items.slice(0, 3).map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-100"
                                                    >
                                                        {item.image ? (
                                                            <img
                                                                src={resolveImageUrl(item.image, API_URL)}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <Package className="w-6 h-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                                                        <span className="text-xs text-gray-500">+{order.items.length - 3}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {order.items.map(i => i.name).join(', ').substring(0, 40)}...
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <p className="text-lg font-semibold text-orange-600">₹{order.totalAmount}</p>
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center items-center space-x-2 mt-8">
                                <button
                                    onClick={() => fetchOrders(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <span className="text-gray-600">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => fetchOrders(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
