const getOrderUserId = (order) => {
    if (!order?.user) return null;
    if (typeof order.user === 'object' && order.user._id) {
        return order.user._id.toString();
    }
    return order.user.toString();
};

const getOrderKitchenId = (order) => {
    if (!order?.kitchen) return null;
    if (typeof order.kitchen === 'object' && order.kitchen._id) {
        return order.kitchen._id.toString();
    }
    return order.kitchen.toString();
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

// Rooms are joined once at connect time, so a revoked admin keeps their old privileges on an
// open socket until it drops. Closing it forces a reconnect that re-reads role and isActive.
export const disconnectUserSockets = (io, userId) => {
    if (!io || !userId) return;
    io.in(`user:${userId.toString()}`).disconnectSockets(true);
};

export const emitOrderNew = (io, order) => {
    if (!io || !order) return;

    const kitchenId = getOrderKitchenId(order);
    const payload = {
        orderId: order._id.toString(),
        kitchen: kitchenId,
        status: order.status,
        totalAmount: order.totalAmount,
        user: serializeUser(order.user),
        createdAt: order.createdAt
    };

    if (kitchenId) {
        io.to(`kitchen:${kitchenId}`).emit('order:new', payload);
    }
    // super_admins observe every kitchen from the global room
    io.to('admins').emit('order:new', payload);
};

export const emitOrderStatusUpdated = (io, order) => {
    if (!io || !order) return;

    const kitchenId = getOrderKitchenId(order);
    const payload = {
        orderId: order._id.toString(),
        kitchen: kitchenId,
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
    if (kitchenId) {
        io.to(`kitchen:${kitchenId}`).emit('order:statusUpdated', payload);
    }
    io.to('admins').emit('order:statusUpdated', payload);
};
