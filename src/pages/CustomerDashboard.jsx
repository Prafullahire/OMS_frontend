import { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { LogOut, ShoppingCart, Package, Plus, Trash2, Box, Home, User } from 'lucide-react';
import clsx from 'clsx';

const CustomerDashboard = () => {
    const { logout, user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [cart, setCart] = useState({});

    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await API.get('/products');
            setProducts(data);
        };
        const fetchOrders = async () => {
            try {
                const { data } = await API.get('/orders/myorders');
                setOrders(data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchProducts();
        fetchOrders();
    }, []);

    const addToCart = (product) => {
        setCart(prev => ({
            ...prev,
            [product._id]: {
                ...product,
                qty: (prev[product._id]?.qty || 0) + 1
            }
        }));
        toast.success(`Added ${product.name} to cart`);
    };

    const removeFromCart = (productId) => {
        setCart(prev => {
            const newCart = { ...prev };
            delete newCart[productId];
            return newCart;
        });
    };

    const updateCartQty = (productId, newQty) => {
        if (newQty < 1) return;
        setCart(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                qty: newQty
            }
        }));
    };

    const placeOrder = async () => {
        const orderItems = Object.values(cart).map(item => ({
            product: item._id,
            name: item.name,
            qty: item.qty,
            price: item.price
        }));

        if (orderItems.length === 0) return;

        const totalPrice = orderItems.reduce((acc, item) => acc + item.qty * item.price, 0);

        try {
            await API.post('/orders', { orderItems, totalPrice });
            toast.success('Order placed successfully!');
            setCart({});
            const { data } = await API.get('/orders/myorders');
            setOrders(data);
            setActiveTab('orders');
        } catch (error) {
            toast.error('Failed to place order');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Processing': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:5000${path}`;
    };

    const NavItem = ({ id, icon: Icon, label, count }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={clsx(
                "flex items-center px-4 py-2 rounded-full transition-all text-sm font-medium",
                activeTab === id
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
            )}
        >
            <Icon className="w-4 h-4 mr-2" />
            {label}
            {count !== undefined && count > 0 && (
                <span className={clsx("ml-2 text-xs py-0.5 px-1.5 rounded-full", activeTab === id ? "bg-white text-orange-600" : "bg-orange-100 text-orange-600")}>
                    {count}
                </span>
            )}
        </button>
    );

    return (
        <div className="min-h-screen bg-orange-50/30 font-sans flex flex-col">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-orange-100 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex justify-between items-center">

                    {/* Left: Logo */}
                    <div className="flex items-center space-x-2">
                        <Box className="w-8 h-8 text-orange-600" />
                        <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent hidden sm:block">OMS</span>
                    </div>

                    {/* Center: Navigation Links */}
                    <div className="flex items-center space-x-1 md:space-x-2 bg-white p-1 rounded-full border border-gray-100 shadow-sm mx-4">
                        <NavItem id="products" icon={Home} label="Products" />
                        <NavItem id="cart" icon={ShoppingCart} label="Cart" count={Object.values(cart).reduce((acc, item) => acc + item.qty, 0)} />
                        <NavItem id="orders" icon={Package} label="Orders" count={orders.length} />
                    </div>

                    {/* Right: Profile & Logout */}
                    <div className="flex items-center space-x-4 pl-4 border-l border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-gray-800 leading-none">{user?.name}</p>
                                <p className="text-xs text-gray-500 font-medium capitalize">{user?.role}</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold border-2 border-white shadow-sm overflow-hidden">
                                {user?.profileImage ? (
                                    <img src={getImageUrl(user.profileImage)} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0) || <User className="w-5 h-5" />
                                )}
                            </div>
                        </div>
                        <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50" title="Logout">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto p-6 flex-1">

                {/* Available Products View */}
                {activeTab === 'products' && (
                    <div className="animate-fadeIn">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Box className="w-6 h-6 mr-2 text-orange-600" />
                            All Available Products
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map(product => {
                                const isOutOfStock = product.countInStock === 0;
                                return (
                                    <div key={product._id} className="card group hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 flex flex-col h-full overflow-hidden border-orange-100/50">
                                        <div className="aspect-video bg-gray-50 relative overflow-hidden flex items-center justify-center">
                                            {product.imageUrl ? (
                                                <img src={getImageUrl(product.imageUrl)} alt={product.name} className={clsx("w-full h-full object-cover group-hover:scale-105 transition-transform duration-500", isOutOfStock && "opacity-50 grayscale")} />
                                            ) : (
                                                <Box className="w-12 h-12 text-gray-300" />
                                            )}
                                            <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
                                                <span className="px-2 py-1 bg-white/90 backdrop-blur text-gray-800 text-xs font-bold rounded-lg shadow-sm border border-orange-100">
                                                    ${product.price}
                                                </span>
                                                {isOutOfStock && (
                                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg shadow-sm border border-red-200">
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-orange-600 transition-colors">{product.name}</h3>
                                            <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{product.description}</p>
                                            <button
                                                onClick={() => addToCart(product)}
                                                disabled={isOutOfStock}
                                                className={clsx(
                                                    "w-full py-2 font-medium rounded-lg transition-all duration-200 flex justify-center items-center group/btn",
                                                    isOutOfStock
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "bg-orange-50 text-orange-700 hover:bg-orange-500 hover:text-white"
                                                )}
                                            >
                                                {isOutOfStock ? (
                                                    "Out of Stock"
                                                ) : (
                                                    <>
                                                        <Plus className="w-4 h-4 mr-2 group-hover/btn:rotate-90 transition-transform" /> Add to Cart
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'cart' && (
                    <div className="max-w-4xl mx-auto animate-fadeIn">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <ShoppingCart className="w-6 h-6 mr-2 text-orange-600" />
                            Your Shopping Cart
                        </h2>
                        <div className="card p-0 overflow-hidden">
                            {Object.keys(cart).length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShoppingCart className="w-10 h-10 text-orange-200" />
                                    </div>
                                    <p className="text-gray-500 text-lg">Your cart is currently empty</p>
                                    <button onClick={() => setActiveTab('products')} className="mt-4 text-orange-600 font-medium hover:underline">
                                        Browse Products
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="divide-y divide-gray-100">
                                        {Object.values(cart).map((item) => (
                                            <div key={item._id} className="p-6 flex items-center justify-between hover:bg-orange-50/30 transition-colors">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                        {item.imageUrl ? <img src={getImageUrl(item.imageUrl)} className="w-full h-full object-cover" /> : <Box className="text-gray-300" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-800">{item.name}</h3>
                                                        <p className="text-sm text-gray-500">${item.price} per unit</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-6">
                                                    <div className="bg-gray-50 px-2 py-1 rounded-lg border border-gray-200 flex items-center">
                                                        <label className="text-xs text-gray-500 mr-2 font-medium">Qty:</label>
                                                        <select
                                                            value={item.qty}
                                                            onChange={(e) => updateCartQty(item._id, Number(e.target.value))}
                                                            className="bg-transparent border-none text-sm font-bold text-gray-800 focus:ring-0 p-0 cursor-pointer"
                                                        >
                                                            {[...Array(20).keys()].map(i => (
                                                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <span className="font-bold text-lg text-gray-800 w-24 text-right">${item.price * item.qty}</span>
                                                    <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-500">Total Amount</p>
                                            <p className="text-3xl font-bold text-gray-800">${Object.values(cart).reduce((acc, item) => acc + item.qty * item.price, 0)}</p>
                                        </div>
                                        <button onClick={placeOrder} className="btn-primary px-8 py-3 text-lg shadow-lg shadow-orange-500/20">
                                            Place Order Now
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="max-w-4xl mx-auto animate-fadeIn">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Package className="w-6 h-6 mr-2 text-orange-600" />
                            My Order History
                        </h2>
                        <div className="space-y-4">
                            {orders.length === 0 && (
                                <div className="text-center py-16 card">
                                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Package className="w-10 h-10 text-blue-200" />
                                    </div>
                                    <p className="text-gray-500">You haven't placed any orders yet.</p>
                                </div>
                            )}
                            {orders.map(order => (
                                <div key={order._id} className="card p-6 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 pb-4 border-b border-gray-100">
                                        <div className="mb-2 md:mb-0">
                                            <div className="flex items-center space-x-3">
                                                <span className="font-mono text-lg font-bold text-gray-700">#{order._id.substring(0, 8)}</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Total Amount</p>
                                            <p className="text-2xl font-bold text-gray-900">${order.totalPrice}</p>
                                        </div>
                                    </div>

                                    {/* Order Items Preview */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Items</p>
                                        <div className="space-y-2">
                                            {order.orderItems.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-700">{item.name} <span className="text-gray-400">x{item.qty}</span></span>
                                                    <span className="font-medium text-gray-900">${item.price * item.qty}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default CustomerDashboard;
