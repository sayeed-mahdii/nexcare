import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import { 
  Search, 
  FlaskConical,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MapPin,
  ArrowRight,
  Filter,
  X,
  CheckCircle,
  UserPlus,
  ClipboardList
} from 'lucide-react';
import toast from 'react-hot-toast';

const Diagnostics = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetchData();
    // Load cart from localStorage
    const savedCart = localStorage.getItem('diagnosticCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('diagnosticCart', JSON.stringify(cart));
  }, [cart]);

  const fetchData = async () => {
    try {
      const [testsRes, branchesRes, categoriesRes] = await Promise.all([
        api.get('/diagnostics/tests'),
        api.get('/branches'),
        api.get('/diagnostics/tests/categories'),
      ]);
      setTests(testsRes.data.data || []);
      setBranches(branchesRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load diagnostic tests');
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (test) => {
    const existing = cart.find(item => item.testId === test.id);
    if (existing) {
      setCart(cart.map(item => 
        item.testId === test.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        testId: test.id, 
        name: test.name, 
        price: test.price, 
        quantity: 1,
        category: test.category
      }]);
    }
    toast.success(`${test.name} added to cart`);
  };

  const updateQuantity = (testId, delta) => {
    setCart(cart.map(item => {
      if (item.testId === testId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (testId) => {
    setCart(cart.filter(item => item.testId !== testId));
    toast.success('Item removed from cart');
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const proceedToCheckout = () => {
    if (!selectedBranch) {
      toast.error('Please select a branch/area first');
      return;
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    // Store branch in localStorage and navigate
    localStorage.setItem('selectedBranch', selectedBranch);
    navigate('/diagnostics/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 border border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 border border-white rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
              <FlaskConical className="w-4 h-4" />
              Diagnostic Center
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Book a Test Online</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Search from 30+ diagnostic tests and book online. Get your reports delivered digitally.
            </p>
            
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 font-medium shadow-lg focus:ring-2 focus:ring-white/50 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select Nearest Branch/Area</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} - {branch.location?.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guest Login Link */}
              <div className="mt-8">
                <p className="text-white/80 mb-2">Already have a booking?</p>
                <Link 
                  to="/guest/login" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all font-medium"
                >
                  <ClipboardList className="w-5 h-5" />
                  Track Booking Status / Guest Login
                </Link>
              </div>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-6 bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-12 w-full"
                placeholder="Search and Book tests (e.g., CBC, Thyroid, Blood Sugar...)"
              />
            </div>
            <div className="w-full md:w-64 relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input pl-12 w-full appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative btn btn-primary whitespace-nowrap"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Tests Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="spinner"></div>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-20">
              <FlaskConical className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Tests Found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">{filteredTests.length} tests available</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map((test) => {
                  const inCart = cart.find(item => item.testId === test.id);
                  return (
                    <div 
                      key={test.id} 
                      className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border-2 ${
                        inCart ? 'border-primary-500' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                            {test.category}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900 mt-2">{test.name}</h3>
                        </div>
                        {inCart && (
                          <CheckCircle className="w-6 h-6 text-primary-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {test.description || 'Standard diagnostic test'}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">৳{test.price}</span>
                        </div>
                        
                        {inCart ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(test.id, -1)}
                              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">{inCart.quantity}</span>
                            <button
                              onClick={() => updateQuantity(test.id, 1)}
                              className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center hover:bg-primary-200"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(test)}
                            className="btn btn-outline py-2 px-4"
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-16 bg-gradient-to-r from-secondary-500 to-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <UserPlus className="w-16 h-16 mx-auto text-white/80 mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Be a Part of Our Journey</h2>
          <p className="text-xl text-white/80 mb-8">
            Register now to access your complete health records, track appointments, and manage prescriptions.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
            Register Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            {/* Cart Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.testId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        <p className="text-primary-600 font-bold mt-1">৳{item.price * item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.testId, -1)}
                          className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.testId, 1)}
                          className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.testId)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            <div className="border-t p-6 space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-medium text-gray-600">Total Amount</span>
                <span className="text-2xl font-bold text-gray-900">৳{getTotalAmount()}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowCart(false)}
                  className="btn btn-outline"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={proceedToCheckout}
                  disabled={cart.length === 0}
                  className="btn btn-primary disabled:opacity-50"
                >
                  Checkout <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnostics;
