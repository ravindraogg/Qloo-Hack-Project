import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight, Palette, Music, MapPin, Coffee, Star, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const VibeCraftAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          agreeTerms: false,
        });
        navigate('/dashboard');
      } else {
        setError(data.message || 'An error occurred');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const socialProviders = [
    { name: 'Google', icon: '🎵', color: 'from-red-500 to-orange-500' },
    { name: 'Spotify', icon: '🎧', color: 'from-green-500 to-emerald-500' },
  ];

  const features = [
    { icon: Music, text: 'Discover music that matches your soul' },
    { icon: MapPin, text: 'Find destinations that speak to you' },
    { icon: Coffee, text: 'Taste experiences crafted for your vibe' },
    { icon: Palette, text: 'Visual aesthetics that resonate' },
  ];

  const FloatingElement = ({ children, delay = 0 }) => (
    <div
      className="absolute opacity-20 animate-pulse"
      style={{
        animationDelay: `${delay}s`,
        animationDuration: '3s',
      }}
    >
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              VibeCraft
            </span>
          </div>
          <Link to="/">
            <button className="bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform">
              Home
            </button>
          </Link>
        </div>
      </nav>

      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(120,119,198,0.3),transparent)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(167,139,250,0.3),transparent)] pointer-events-none"></div>

        <FloatingElement delay={0}>
          <Music className="w-8 h-8 text-pink-400" style={{ top: '10%', left: '10%' }} />
        </FloatingElement>
        <FloatingElement delay={1}>
          <Palette className="w-6 h-6 text-violet-400" style={{ top: '70%', left: '15%' }} />
        </FloatingElement>
        <FloatingElement delay={2}>
          <MapPin className="w-7 h-7 text-blue-400" style={{ top: '20%', right: '20%' }} />
        </FloatingElement>
        <FloatingElement delay={0.5}>
          <Coffee className="w-5 h-5 text-purple-400" style={{ bottom: '20%', right: '10%' }} />
        </FloatingElement>
        <FloatingElement delay={1.5}>
          <Star className="w-4 h-4 text-yellow-400" style={{ top: '60%', right: '25%' }} />
        </FloatingElement>

        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <div className="lg:hidden mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent mb-2">
                  VibeCraft
                </h1>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-gray-300">
                {isLogin ? 'Continue your taste journey' : 'Start discovering your perfect vibe'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-3 mb-6">
              {socialProviders.map((provider, index) => (
                <button
                  key={index}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl p-3 flex items-center justify-center space-x-3 transition-all duration-300 group"
                  disabled={loading}
                >
                  <span className="text-lg">{provider.icon}</span>
                  <span className="text-white font-medium">Continue with {provider.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            <div className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-pink-400 bg-white/5 border border-white/20 rounded focus:ring-pink-400 focus:ring-2"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-300">Remember me</span>
                  </label>
                  <button type="button" className="text-sm text-pink-400 hover:text-pink-300 transition-colors" disabled={loading}>
                    Forgot password?
                  </button>
                </div>
              )}

              {!isLogin && (
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-pink-400 bg-white/5 border border-white/20 rounded focus:ring-pink-400 focus:ring-2 mt-1"
                    required
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-300">
                    I agree to the{' '}
                    <a href="#" className="text-pink-400 hover:text-pink-300 transition-colors">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-pink-400 hover:text-pink-300 transition-colors">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || (!isLogin && !formData.agreeTerms)}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
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
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign in' : 'Create account'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-300">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-pink-400 hover:text-pink-300 font-medium transition-colors"
                  disabled={loading}
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center space-x-2 text-gray-400">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Secured by industry-standard encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VibeCraftAuth;