import { useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Box, Mail } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Please enter your email address.');
            return;
        }

        setLoading(true);
        try {
            await API.post('/auth/forgot-password', { email });
            toast.success('Email sent! Please check your inbox.');
            setEmail('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-orange-50/50 flex items-center justify-center p-4 font-sans">
            <div className="max-w-md w-full animate-fadeIn">

                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center space-x-3 mb-2">
                        <div className="bg-white p-3 rounded-xl shadow-md border border-orange-100">
                            <Box className="w-8 h-8 text-orange-600" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            OMS
                        </h1>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-orange-500/5 p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Forgot Password?</h2>
                    <p className="text-gray-500 text-center mb-8 text-sm">Enter your email and we'll send you a link to reset your password.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white focus:border-transparent transition-all outline-none"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full btn-primary py-2.5 text-lg shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
                            &larr; Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
