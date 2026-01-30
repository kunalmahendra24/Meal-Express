import { useApp } from '../context/AppContext';
import { Phone } from 'lucide-react';

const CallOwnerButton = ({ variant = 'default', className = '' }) => {
    const { settings, callOwner } = useApp();

    if (!settings.callOwnerEnabled) return null;

    const variants = {
        default: 'bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg',
        outline: 'border-2 border-green-500 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg',
        floating: 'fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg z-40',
        large: 'bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-lg'
    };

    return (
        <button
            onClick={callOwner}
            className={`flex items-center justify-center space-x-2 font-medium transition-all ${variants[variant]} ${className}`}
        >
            <Phone className={variant === 'floating' ? 'w-6 h-6' : 'w-5 h-5'} />
            {variant !== 'floating' && <span>Call Owner</span>}
        </button>
    );
};

export default CallOwnerButton;
