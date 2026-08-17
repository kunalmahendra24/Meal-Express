// A `kitchen` reference arrives populated from the API, but carts saved before
// multi-kitchen support (and lean socket payloads) may hold a bare id or nothing.
export const getKitchenId = (item) => {
    if (!item?.kitchen) return null;
    return typeof item.kitchen === 'object' ? item.kitchen._id : item.kitchen;
};

export const getKitchenName = (item) => {
    if (!item?.kitchen || typeof item.kitchen !== 'object') return null;
    return item.kitchen.name || null;
};
