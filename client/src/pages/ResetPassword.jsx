import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useApp } from '../context/AppContext';
import { Mail, Lock, Eye, EyeOff, UtensilsCrossed, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
    const { API_URL } = useApp();
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const inputRefs = useRef([]);

    // Handler to move focus to the next input
    const handleInput = (e, index) => {
        if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Handler to move focus back on backspace
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    // Handler to paste the entire OTP string
    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text');
        const pasteArray = paste.split('');
        pasteArray.forEach((char, index) => {
            if (inputRefs.current[index]) {
                inputRefs.current[index].value = char;
            }
        });
    };

    // Step 1: Send Email OTP
    const onSubmitEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/send-reset-otp`, { email });
            if (data.success) {
                toast.success(data.message || 'OTP sent to your email');
                setIsEmailSent(true);
            } else {
                toast.error(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const onSubmitOtp = async (e) => {
        e.preventDefault();
        const otpArray = inputRefs.current.map(input => input?.value || '');
        const otpValue = otpArray.join('');
        
        if (otpValue.length !== 6) {
            toast.error('Please enter complete 6-digit OTP');
            return;
        }
        
        setOtp(otpValue);
        setIsOtpSubmitted(true);
    };

    // Step 3: Reset Password
    const onSubmitNewPassword = async (e) => {
        e.preventDefault();
        
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        
        setLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/reset-password`, { 
                email, 
                newPassword, 
                otp 
            });
            if (data.success) {
                toast.success(data.message || 'Password reset successful');
                navigate('/login');
            } else {
                toast.error(data.message || 'Failed to reset password');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-2">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                            <UtensilsCrossed className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">Meal Express</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    
                    {/* Step 1: Email Input */}
                    {!isEmailSent && (
                        <>
                            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Reset Password</h1>
                            <p className="text-gray-500 text-center mb-6">Enter your registered email address</p>

                            <form onSubmit={onSubmitEmail} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-500 transition-all"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 2: OTP Verification */}
                    {isEmailSent && !isOtpSubmitted && (
                        <>
                            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Verify OTP</h1>
                            <p className="text-gray-500 text-center mb-6">
                                Enter the 6-digit code sent to<br />
                                <span className="font-medium text-gray-700">{email}</span>
                            </p>

                            <form onSubmit={onSubmitOtp} className="space-y-5">
                                <div className="flex justify-between gap-2" onPaste={handlePaste}>
                                    {Array(6).fill(0).map((_, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            maxLength="1"
                                            required
                                            ref={(e) => inputRefs.current[index] = e}
                                            onInput={(e) => handleInput(e, index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            className="w-12 h-12 border-2 border-gray-300 rounded-lg text-center text-xl font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-300 transition-all"
                                        />
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
                                >
                                    Verify OTP
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsEmailSent(false)}
                                    className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm"
                                >
                                    ← Change email address
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 3: New Password */}
                    {isEmailSent && isOtpSubmitted && (
                        <>
                            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">New Password</h1>
                            <p className="text-gray-500 text-center mb-6">Create a new password for your account</p>

                            <form onSubmit={onSubmitNewPassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-500 transition-all"
                                            placeholder="Enter new password"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-500 transition-all"
                                            placeholder="Confirm new password"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    )}

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-orange-600 hover:text-orange-700 font-medium flex items-center justify-center">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
