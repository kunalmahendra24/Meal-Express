import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

const Cart = () => {
    const {
        cart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getDeliveryCharge,
        settings,
        isAuthenticated,
        API_URL
    } = useApp();
    const navigate = useNavigate();

    const cartTotal = getCartTotal();
    const deliveryCharge = getDeliveryCharge();
    const finalTotal = cartTotal + deliveryCharge;

    const handleCheckout = () => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/checkout');
        } else {
            navigate('/checkout');
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-12 h-12 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-6">Looks like you haven't added any meals yet.</p>
                    <Link
                        to="/menu"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Browse Menu
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shopping Cart</h1>
                    <button
                        onClick={clearCart}
                        className="text-red-500 hover:text-red-600 text-sm font-medium"
                    >
                        Clear Cart
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map(item => {
                            const imageUrl = item.images?.[0]
                                ? (item.images[0].startsWith('http') ? item.images[0] : `${API_URL}${item.images[0]}`)
                                : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200';

                            return (
                                <div
                                    key={item._id}
                                    className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-4"
                                >
                                    <Link to={`/meal/${item._id}`} className="flex-shrink-0">
                                        <img
                                            src={imageUrl}
                                            alt={item.name}
                                            className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-lg"
                                        />
                                    </Link>

                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <Link
                                                to={`/meal/${item._id}`}
                                                className="text-lg font-semibold text-gray-900 hover:text-orange-600"
                                            >
                                                {item.name}
                                            </Link>
                                            <button
                                                onClick={() => removeFromCart(item._id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <p className="text-gray-500 text-sm capitalize">{item.category}</p>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center border rounded-lg">
                                                <button
                                                    onClick={() => updateCartQuantity(item._id, item.quantity - 1)}
                                                    className="p-2 hover:bg-gray-100"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="px-4 font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                                                    className="p-2 hover:bg-gray-100"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <p className="text-lg font-semibold text-orange-600">
                                                ₹{item.price * item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <Link
                            to="/menu"
                            className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium mt-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Continue Shopping
                        </Link>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({cart.length} items)</span>
                                    <span>₹{cartTotal}</span>
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Charge</span>
                                    <span className={deliveryCharge === 0 ? 'text-green-600' : ''}>
                                        {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                                    </span>
                                </div>

                                {deliveryCharge > 0 && (
                                    <p className="text-sm text-gray-500">
                                        Add ₹{settings.freeDeliveryAbove - cartTotal} more for free delivery
                                    </p>
                                )}

                                <hr className="my-4" />

                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Total</span>
                                    <span className="text-orange-600">₹{finalTotal}</span>
                                </div>
                            </div>

                            {cartTotal < settings.minOrderAmount && (
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        Minimum order amount is ₹{settings.minOrderAmount}. 
                                        Add ₹{settings.minOrderAmount - cartTotal} more to proceed.
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleCheckout}
                                disabled={cartTotal < settings.minOrderAmount}
                                className={`w-full mt-6 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                                    cartTotal >= settings.minOrderAmount
                                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <span>Proceed to Checkout</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>

                            {!isAuthenticated && (
                                <p className="text-center text-sm text-gray-500 mt-3">
                                    You'll need to login to complete your order
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
