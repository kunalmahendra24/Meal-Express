const LoadingSpinner = ({ size = 'default', className = '' }) => {
    const sizes = {
        small: 'w-4 h-4 border-2',
        default: 'w-8 h-8 border-3',
        large: 'w-12 h-12 border-4'
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div 
                className={`${sizes[size]} border-orange-200 border-t-orange-500 rounded-full animate-spin`}
            />
        </div>
    );
};

export const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-500">Loading...</p>
        </div>
    </div>
);

export default LoadingSpinner;
