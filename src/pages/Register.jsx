import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer'); // Default role
    const [phoneNumber, setPhoneNumber] = useState('');
    const [location, setLocation] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!name.trim()) {
            toast.error('Please enter your name.', { position: "top-right", autoClose: 3000 });
            return;
        }
        if (!email.trim()) {
            toast.error('Please enter your email address.', { position: "top-right", autoClose: 3000 });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address.', { position: "top-right", autoClose: 3000 });
            return;
        }
        if (!password) {
            toast.error('Please enter a password.', { position: "top-right", autoClose: 3000 });
            return;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long.', { position: "top-right", autoClose: 3000 });
            return;
        }
        if (!phoneNumber.trim()) {
            toast.error('Please enter your phone number.', { position: "top-right", autoClose: 3000 });
            return;
        }
        if (!location.trim()) {
            toast.error('Please enter your location.', { position: "top-right", autoClose: 3000 });
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('role', role);
        formData.append('phoneNumber', phoneNumber);
        formData.append('location', location);
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }

        try {
            const { data } = await API.post('/auth/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            login(data.token);
            toast.success(`Welcome, ${data.name}! Registration successful.`, {
                position: "top-right",
                autoClose: 3000,
            });
            if (data.role === 'admin') navigate('/admin');
            else navigate('/dashboard');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';

            // Check for specific backend errors like "User already exists"
            if (errorMessage.includes('already exists')) {
                toast.error('User with this email already exists.', {
                    position: "top-right",
                    autoClose: 4000,
                });
            } else {
                toast.error(errorMessage, {
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
            toast.success(`Welcome, ${data.name}! Google registration successful.`, {
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
        <div className="flex items-center justify-center min-h-screen bg-orange-50 py-10">
            <div className="relative w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-orange-100">
                <div className="flex flex-col items-center mb-6">
                    <div className="p-3 bg-orange-100 rounded-full mb-3">
                        <UserPlus className="w-8 h-8 text-orange-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
                    <p className="text-gray-500">Join us to start ordering</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select
                                className="input-field"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="customer">Customer</option>
                                <option value="delivery_boy">Delivery Boy</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                className="input-field"
                                placeholder="+1 234 567 890"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location / Address</label>
                        <textarea
                            className="input-field min-h-[60px]"
                            placeholder="Your full address..."
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                        <input
                            type="file"
                            className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                            onChange={(e) => setProfileImage(e.target.files[0])}
                            accept="image/*"
                        />
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
                                Creating account...
                            </>
                        ) : (
                            'Register'
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
                    <p>Already have an account? <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700 transition-colors">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
