import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight, Volume2, Palette, Music, MapPin, Coffee, Star, Shield, Zap, Heart } from 'lucide-react';

const VibeCraftAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const socialProviders = [
    { name: 'Google', icon: '🎵', color: 'from-red-500 to-orange-500' },
    { name: 'Spotify', icon: '🎧', color: 'from-green-500 to-emerald-500' },
    { name: 'Apple', icon: '🍎', color: 'from-gray-700 to-black' }
  ];

  const features = [
    { icon: Music, text: "Discover music that matches your soul" },
    { icon: MapPin, text: "Find destinations that speak to you" },
    { icon: Coffee, text: "Taste experiences crafted for your vibe" },
    { icon: Palette, text: "Visual aesthetics that resonate" }
  ];

  const FloatingElement = ({ children, delay = 0 }) => (
    <div 
      className="absolute opacity-20 animate-pulse"
      style={{
        animationDelay: `${delay}s`,
        animationDuration: '3s'
      }}
    >
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Navigation */}
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
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="hover:text-pink-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-pink-400 transition-colors">How It Works</a>
            <a href="#accessibility" className="hover:text-pink-400 transition-colors">Accessibility</a>
          </div>
          <button className="bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform">
            Try Now
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(120,119,198,0.3),transparent)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(167,139,250,0.3),transparent)] pointer-events-none"></div>
      
      {/* Floating Icons */}
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

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side - Branding & Features */}
        <div className="text-white space-y-8 hidden lg:block">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-violet-500 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 animate-spin" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                  VibeCraft
                </h1>
                <p className="text-gray-300 text-sm">Your Taste, Your Universe</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-100">
                {isLogin ? 'Welcome back to your vibe' : 'Start your taste journey'}
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                {isLogin 
                  ? 'Continue crafting lifestyle experiences that perfectly match your cultural DNA.'
                  : 'Join thousands who\'ve discovered their perfect lifestyle match through AI-powered taste analysis.'
                }
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-100 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-pink-400" />
              <span>What awaits you:</span>
            </h3>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 group">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500/20 to-violet-500/20 rounded-lg flex items-center justify-center group-hover:from-pink-500/30 group-hover:to-violet-500/30 transition-all duration-300">
                    <feature.icon className="w-5 h-5 text-pink-400" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <Volume2 className="w-6 h-6 text-pink-400" />
              <span className="font-semibold text-gray-100">Voice-First Design</span>
            </div>
            <p className="text-gray-300 text-sm">
              Fully accessible with voice-only mode. Experience VibeCraft through beautiful spoken interactions.
            </p>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            {/* Form Header */}
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
                {isLogin 
                  ? 'Continue your taste journey' 
                  : 'Start discovering your perfect vibe'
                }
              </p>
            </div>

            {/* Social Login */}
            <div className="space-y-3 mb-6">
              {socialProviders.map((provider, index) => (
                <button
                  key={index}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl p-3 flex items-center justify-center space-x-3 transition-all duration-300 group"
                >
                  <span className="text-lg">{provider.icon}</span>
                  <span className="text-white font-medium">Continue with {provider.name}</span>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            {/* Form */}
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
                    />
                    <span className="text-sm text-gray-300">Remember me</span>
                  </label>
                  <button type="button" className="text-sm text-pink-400 hover:text-pink-300 transition-colors">
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
                className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 group"
              >
                <span>{isLogin ? 'Sign in' : 'Create account'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Switch Form */}
            <div className="mt-8 text-center">
              <p className="text-gray-300">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-pink-400 hover:text-pink-300 font-medium transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            {/* Security Badge */}
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