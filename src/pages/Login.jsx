import { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { ShoppingBag } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin');
            } else if (user.role === 'customer' || user.role === 'delivery_boy') {
                navigate('/dashboard');
            } else {
                console.warn("User logged in but role is unknown or missing:", user);
                // Optional: logout() if you want to force re-login
            }
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!email.trim()) {
            toast.error('Please enter your email address.', {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        if (!password.trim()) {
            toast.error('Please enter your password.', {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address.', {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        setLoading(true);
        try {
            const { data } = await API.post('/auth/login', { email, password });
            login(data.token);
            toast.success(`Welcome back, ${data.name}! Login successful.`, {
                position: "top-right",
                autoClose: 3000,
            });
            if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            // Handle specific error messages
            const errorMessage = error.response?.data?.message;

            if (errorMessage === 'Invalid credentials' || errorMessage === 'User not found') {
                toast.error('Invalid email or password. Please try again.', {
                    position: "top-right",
                    autoClose: 4000,
                });
            } else {
                toast.error(errorMessage || 'Login failed. Please check your credentials.', {
                    position: "top-right",
                    autoClose: 4000,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            const { data } = await API.post('/auth/google', { token: credentialResponse.credential });
            login(data.token);
            toast.success(`Welcome, ${data.name}! Google login successful.`, {
                position: "top-right",
                autoClose: 3000,
            });
            if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error('Google authorization failed. Please try again.', {
                position: "top-right",
                autoClose: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-orange-50">
            <div className="relative w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-orange-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-orange-100 rounded-full mb-3">
                        <ShoppingBag className="w-8 h-8 text-orange-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
                    <p className="text-gray-500">Sign in to manage your orders</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm font-medium text-orange-600 hover:text-orange-700">
                            Forgot Password?
                        </Link>
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
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                </div>

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                            toast.error('Google Login Failed');
                        }}
                    />
                </div>

                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>Don't have an account? <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-700 transition-colors">Create account</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
