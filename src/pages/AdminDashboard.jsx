import { useEffect, useState, useContext, useRef } from "react";
import API from "../services/api";
import AuthContext from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  LogOut,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Trash2,
  PlusCircle,
  CheckCircle,
  Box,
  Edit,
  Upload,
  X,
  Users,
  Truck,
  Menu,
} from "lucide-react";
import clsx from "clsx";

const AdminDashboard = () => {
  const { logout, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar toggle

  // Loading States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  // Logistics Modal State
  const [showLogisticsModal, setShowLogisticsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [warehouse, setWarehouse] = useState("");
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    countInStock: "",
  });
  const [imageFile, setImageFile] = useState(null); // File object
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const pData = await API.get("/products");
      setProducts(pData.data);
      const oData = await API.get("/orders");
      setOrders(oData.data);
      const uData = await API.get("/users");
      setUsers(uData.data);
    } catch (error) {
      console.error("Error fetching data", error);
      toast.error("Failed to load data. Please refresh the page.", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset form when opening/closing
  useEffect(() => {
    if (!showProductForm) {
      setFormData({ name: "", price: "", description: "", countInStock: "" });
      setImageFile(null);
      setEditingProduct(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [showProductForm]);

  // Populate form for editing
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      countInStock: product.countInStock,
    });
    setImageFile(null); // Reset file input
    setShowProductForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("description", formData.description);
    data.append("countInStock", formData.countInStock);
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      if (editingProduct) {
        // Update
        await API.put(`/products/${editingProduct._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        // Create
        await API.post("/products", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product added successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
      setShowProductForm(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          (editingProduct
            ? "Failed to update product"
            : "Failed to create product"),
        {
          position: "top-right",
          autoClose: 4000,
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    setActionLoading((prev) => ({ ...prev, [`delete-${id}`]: true }));
    try {
      await API.delete(`/products/${id}`);
      toast.success("Product deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete product", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [`delete-${id}`]: false }));
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setActionLoading((prev) => ({ ...prev, [`status-${id}`]: true }));
    try {
      await API.put(`/orders/${id}/status`, { status });
      toast.success(`Order status updated to "${status}" successfully!`, {
        position: "top-right",
        autoClose: 3000,
      });
      fetchData();
    } catch (e) {
      toast.error(
        e.response?.data?.message || "Failed to update order status",
        {
          position: "top-right",
          autoClose: 4000,
        }
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [`status-${id}`]: false }));
    }
  };

  const handleAssignLogistics = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put(`/orders/${selectedOrder._id}/logistics`, {
        warehouse,
        deliveryBoyId: selectedDeliveryBoy,
      });
      toast.success("Pickup booked and delivery boy assigned successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setShowLogisticsModal(false);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to assign logistics", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openLogisticsModal = (order) => {
    setSelectedOrder(order);
    setWarehouse("");
    setSelectedDeliveryBoy("");
    setShowLogisticsModal(true);
  };

  const handleUserRoleUpdate = async (id, newRole) => {
    if (
      !window.confirm(`Are you sure you want to make this user a ${newRole}?`)
    )
      return;
    setActionLoading((prev) => ({ ...prev, [`role-${id}`]: true }));
    try {
      await API.put(`/users/${id}/role`, { role: newRole });
      toast.success(`User role updated to "${newRole}" successfully!`, {
        position: "top-right",
        autoClose: 3000,
      });
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update user role", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [`role-${id}`]: false }));
    }
  };

  const handleDeleteUser = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    )
      return;
    setActionLoading((prev) => ({ ...prev, [`delete-user-${id}`]: true }));
    try {
      await API.delete(`/users/${id}`);
      toast.success("User deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete user", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [`delete-user-${id}`]: false }));
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-700",
      Processing: "bg-blue-100 text-blue-700",
      ReadyForPickup: "bg-indigo-100 text-indigo-700",
      PickedUp: "bg-purple-100 text-purple-700",
      OutForDelivery: "bg-orange-100 text-orange-700",
      Delivered: "bg-green-100 text-green-700",
      Cancelled: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          colors[status] || "bg-gray-100"
        }`}
      >
        {status}
      </span>
    );
  };

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setSidebarOpen(false);
      }}
      className={clsx(
        "w-full flex items-center px-4 py-3 rounded-lg transition-colors font-medium mb-1",
        activeTab === id
          ? "bg-orange-50 text-orange-600 shadow-sm"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <Icon className="w-5 h-5 mr-3" />
      {label}
    </button>
  );

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path}`;
  };

  const deliveryBoys = users.filter((u) => u.role === "delivery_boy");

  if (
    loading &&
    products.length === 0 &&
    orders.length === 0 &&
    users.length === 0
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-orange-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full shadow-sm z-40 transition-transform duration-300",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Box className="w-6 h-6 text-orange-600" />
              <span className="text-xl font-bold text-gray-800">
                AdminPanel
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="space-y-1">
            <SidebarItem
              id="dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
            />
            <SidebarItem id="products" icon={Package} label="All Products" />
            <SidebarItem id="users" icon={Users} label="User Management" />
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm mr-3 overflow-hidden">
              {user?.profileImage ? (
                <img
                  src={getImageUrl(user.profileImage)}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.charAt(0)
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center py-2 px-4 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full pt-16 lg:pt-8">
        {/* Logistics Modal */}
        {showLogisticsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
              <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-orange-600" />
                  Book Pickup & Assign Delivery
                </h2>
                <button
                  onClick={() => setShowLogisticsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAssignLogistics} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Warehouse
                  </label>
                  <select
                    className="input-field"
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    required
                  >
                    <option value="">Select a Warehouse...</option>
                    <option value="Warehouse A (New York)">
                      Warehouse A (New York)
                    </option>
                    <option value="Warehouse B (California)">
                      Warehouse B (California)
                    </option>
                    <option value="Warehouse C (Texas)">
                      Warehouse C (Texas)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Delivery Boy
                  </label>
                  <select
                    className="input-field"
                    value={selectedDeliveryBoy}
                    onChange={(e) => setSelectedDeliveryBoy(e.target.value)}
                    required
                  >
                    <option value="">Select Delivery Partner...</option>
                    {deliveryBoys.length === 0 && (
                      <option disabled>No delivery boys found</option>
                    )}
                    {deliveryBoys.map((boy) => (
                      <option key={boy._id} value={boy._id}>
                        {boy.name}
                      </option>
                    ))}
                  </select>
                  {deliveryBoys.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Please create a user with Role 'delivery_boy' first.
                    </p>
                  )}
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full btn-primary py-2 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Confirming...
                      </>
                    ) : (
                      "Confirm Pickup"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View: Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            <header>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Overview
              </h1>
              <p className="text-gray-500 mt-1">
                Welcome back, here's what's happening today.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card p-6 flex items-center">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-full mr-4">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Total Products
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.length}
                  </p>
                </div>
              </div>
              <div className="card p-6 flex items-center">
                <div className="p-4 bg-orange-50 text-orange-600 rounded-full mr-4">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.length}
                  </p>
                </div>
              </div>
              <div className="card p-6 flex items-center">
                <div className="p-4 bg-green-50 text-green-600 rounded-full mr-4">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter((o) => o.status === "Delivered").length}
                  </p>
                </div>
              </div>
              <div className="card p-6 flex items-center">
                <div className="p-4 bg-purple-50 text-purple-600 rounded-full mr-4">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Recent Orders
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-xs uppercase text-gray-400 border-b border-gray-100 bg-gray-50/50">
                    <tr>
                      <th className="py-3 px-4 rounded-tl-lg">Order ID</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Logistics</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4 rounded-tr-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.slice(0, 10).map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-xs text-gray-500">
                          #{order._id.substring(0, 8)}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900 flex flex-col">
                          <span>{order.user?.name || "Unknown"}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {order.warehouse ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-700">
                                {order.warehouse}
                              </span>
                              <span className="text-gray-500">
                                DB:{" "}
                                {users.find((u) => u._id === order.deliveryBoy)
                                  ?.name || "Assigned"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">
                              Not Assigned
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-gray-900">
                          ${order.totalPrice}
                        </td>
                        <td className="py-3 px-4">
                          {order.status === "Pending" ||
                          order.status === "Processing" ? (
                            <button
                              onClick={() => openLogisticsModal(order)}
                              className="flex items-center px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded hover:bg-orange-200 transition-colors"
                            >
                              <Truck className="w-3 h-3 mr-1" />
                              Book Pickup
                            </button>
                          ) : (
                            <select
                              className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600 focus:outline-none focus:border-orange-500 cursor-pointer"
                              value={order.status}
                              onChange={(e) =>
                                handleStatusUpdate(order._id, e.target.value)
                              }
                            >
                              <option value="ReadyForPickup">
                                Ready For Pickup
                              </option>
                              <option value="PickedUp">Picked Up</option>
                              <option value="OutForDelivery">
                                Out For Delivery
                              </option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {orders.length === 0 && (
                <p className="text-center text-gray-400 py-8">No orders yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-6 animate-fadeIn">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  All Products
                </h1>
                <p className="text-gray-500 mt-1">
                  Manage your product inventory here.
                </p>
              </div>
              <button
                onClick={() => setShowProductForm(true)}
                className="btn-primary flex items-center shadow-lg shadow-orange-500/20"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add Product
              </button>
            </header>

            {showProductForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn">
                  <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                      {editingProduct ? (
                        <Edit className="w-5 h-5 mr-2 text-orange-600" />
                      ) : (
                        <PlusCircle className="w-5 h-5 mr-2 text-orange-600" />
                      )}
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </h2>
                    <button
                      onClick={() => setShowProductForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">
                          Product Name
                        </label>
                        <input
                          className="input-field mt-1"
                          placeholder="Product Name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">
                          Description
                        </label>
                        <textarea
                          className="input-field mt-1 min-h-[80px]"
                          placeholder="Product details..."
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">
                            Price ($)
                          </label>
                          <input
                            type="number"
                            className="input-field mt-1"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                price: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">
                            Stock
                          </label>
                          <input
                            type="number"
                            className="input-field mt-1"
                            placeholder="0"
                            value={formData.countInStock}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                countInStock: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">
                          Product Image
                        </label>
                        <div className="mt-1 flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-3 text-gray-400" />
                              <p className="text-sm text-gray-500">
                                <span className="font-semibold">
                                  {imageFile
                                    ? imageFile.name
                                    : "Click to upload"}
                                </span>
                              </p>
                              <p className="text-xs text-gray-500">
                                SVG, PNG, JPG or WEBP
                              </p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              ref={fileInputRef}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0])
                                  setImageFile(e.target.files[0]);
                              }}
                              accept="image/*"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setShowProductForm(false)}
                        className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary shadow-lg shadow-orange-500/20 flex items-center gap-2"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            {editingProduct ? "Updating..." : "Saving..."}
                          </>
                        ) : editingProduct ? (
                          "Update Product"
                        ) : (
                          "Save Product"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="card overflow-hidden">
              <table className="w-full text-left">
                <thead className="text-xs uppercase text-gray-400 border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Stock</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr
                      key={p._id}
                      className="hover:bg-orange-50/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden mr-3 relative">
                            {p.imageUrl || p.image ? (
                              <img
                                src={getImageUrl(p.imageUrl || p.image)}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <Box
                              className="w-full h-full p-2 text-gray-400"
                              style={{
                                display:
                                  p.imageUrl || p.image ? "none" : "flex",
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {p.name}
                            </p>
                            <p className="text-xs text-gray-500 max-w-xs truncate">
                              {p.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-900 font-medium">
                        ${p.price}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            p.countInStock > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {p.countInStock > 0
                            ? `${p.countInStock} in stock`
                            : "Out of stock"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-8 text-center text-gray-400"
                      >
                        No products found. Add one above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View: User Management */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-fadeIn">
            <header>
              <h1 className="text-3xl font-bold text-gray-900">
                User Management
              </h1>
              <p className="text-gray-500 mt-1">
                Manage user roles and permissions.
              </p>
            </header>
            <div className="card overflow-hidden">
              <table className="w-full text-left">
                <thead className="text-xs uppercase text-gray-400 border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-orange-50/30 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-gray-900 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs mr-3">
                          {u.name.charAt(0)}
                        </div>
                        {u.name}
                      </td>
                      <td className="py-4 px-6 text-gray-500">{u.email}</td>
                      <td className="py-4 px-6">
                        <span
                          className={clsx(
                            "px-2 py-1 rounded-full text-xs font-bold ring-1 ring-inset",
                            u.role === "admin"
                              ? "bg-purple-50 text-purple-700 ring-purple-600/20"
                              : u.role === "delivery_boy"
                              ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20"
                              : "bg-gray-50 text-gray-600 ring-gray-500/10"
                          )}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        {u.role !== "customer" && (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() =>
                                handleUserRoleUpdate(u._id, "admin")
                              }
                              className="px-2 py-1 rounded-md text-xs font-medium border border-gray-200 hover:bg-purple-50 hover:text-purple-600"
                              disabled={u.role === "admin"}
                            >
                              Make Admin
                            </button>

                            <button
                              onClick={() =>
                                handleUserRoleUpdate(u._id, "delivery_boy")
                              }
                              className="px-2 py-1 rounded-md text-xs font-medium border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600"
                              disabled={u.role === "delivery_boy"}
                            >
                              Make Delivery
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
