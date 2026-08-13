const getOrderUserId = (order) => {
    if (!order?.user) return null;
    if (typeof order.user === 'object' && order.user._id) {
        return order.user._id.toString();
    }
    return order.user.toString();
};

const serializeUser = (user) => {
    if (!user) return user;
    if (typeof user === 'object' && user._id) {
        return {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone
        };
    }
    return user;
};

export const emitOrderNew = (io, order) => {
    if (!io || !order) return;

    io.to('admins').emit('order:new', {
        orderId: order._id.toString(),
        status: order.status,
        totalAmount: order.totalAmount,
        user: serializeUser(order.user),
        createdAt: order.createdAt
    });
};

export const emitOrderStatusUpdated = (io, order) => {
    if (!io || !order) return;

    const payload = {
        orderId: order._id.toString(),
        status: order.status,
        statusHistory: order.statusHistory,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        actualDeliveryTime: order.actualDeliveryTime,
        updatedAt: order.updatedAt
    };

    const userId = getOrderUserId(order);
    if (userId) {
        io.to(`user:${userId}`).emit('order:statusUpdated', payload);
    }
    io.to('admins').emit('order:statusUpdated', payload);
};
