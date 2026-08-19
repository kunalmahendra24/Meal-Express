import { toast } from 'react-toastify';

// An expired session fails every in-flight request at once. AppContext announces that once,
// globally, so individual callers must stay quiet instead of stacking a toast per request.
export const notifyRequestError = (error, fallbackMessage) => {
    if (error?.sessionExpired) return;
    toast.error(error?.response?.data?.message || fallbackMessage);
};

export default notifyRequestError;
