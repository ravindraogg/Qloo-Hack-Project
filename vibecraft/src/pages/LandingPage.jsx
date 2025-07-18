import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Sparkles,
  Palette,
  Music,
  MapPin,
  ShoppingBag,
  Coffee,
  Home,
  Volume2,
  Eye,
  ArrowRight,
  Play,
  Star,
  Zap,
  Heart,
  Users,
  Award,
  Send,
  X,
} from "lucide-react";
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [chatExpanded, setChatExpanded] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [generatedVibe, setGeneratedVibe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const features = [
    { icon: Music, title: "Music Playlists", desc: "Curated soundtracks for your vibe" },
    { icon: MapPin, title: "Travel Destinations", desc: "Perfect places that match your energy" },
    { icon: ShoppingBag, title: "Fashion Styles", desc: "Clothing that speaks your language" },
    { icon: Coffee, title: "Culinary Experiences", desc: "Meals and drinks for your mood" },
    { icon: Home, title: "Room Aesthetics", desc: "Spaces that reflect your personality" },
    { icon: Palette, title: "Visual Mood Boards", desc: "Beautiful collages of your vibe" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[id]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/vibe/generate', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-landing-page': 'true'
          },
          body: JSON.stringify({ input: chatMessage }),
        });

        if (!response.ok) throw new Error('Failed to generate vibe');
        const data = await response.json();
        const defaultColors = ['#FF6B6B', '#4ECDC4', '#45B7D1'];
        const vibeColors = Array.isArray(data.colors) && data.colors.length >= 3
          ? data.colors.slice(0, 3).map(color => /^#[0-9A-Fa-f]{6}$/.test(color) ? color : defaultColors[data.colors.indexOf(color) % 3] || '#FFFFFF')
          : defaultColors;

        const newVibe = {
          title: data.title || `Generated Vibe ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
          mood: data.mood || "Personalized",
          description: data.description || `A personalized lifestyle experience.`,
          categories: data.categories || ['mood'],
          colors: vibeColors,
          music: Array.isArray(data.music) ? data.music : [],
          food: Array.isArray(data.food) ? data.food : [],
          fashion: Array.isArray(data.fashion) ? data.fashion : [],
          travel: Array.isArray(data.travel) ? data.travel : [],
          decor: Array.isArray(data.decor) ? data.decor : [],
          imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : ["https://images.unsplash.com/photo-1497515114629-f71d767d0461?w=800&h=600&fit=crop"],
          icons: data.icons || {
            music: 'Music',
            food: 'Coffee',
            fashion: 'ShoppingBag',
            travel: 'MapPin',
            decor: 'Home'
          },
        };

        setGeneratedVibe(newVibe);
      } catch (error) {
        console.error('Generation error:', error);
      } finally {
        setIsLoading(false);
        setChatMessage("");
      }
    }
  };

  const VibeCard = ({ vibe }) => {
    const getThemeBrightness = (colors) => {
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
      };
      const getLuminance = (r, g, b) => {
        const [rs, gs, bs] = [r, g, b].map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      };
      const avgLuminance = colors.reduce((sum, color) => sum + getLuminance(hexToRgb(color).r, hexToRgb(color).g, hexToRgb(color).b), 0) / colors.length;
      return avgLuminance > 0.4 ? 'light' : 'dark';
    };

    const themeBrightness = getThemeBrightness(vibe.colors);
    const textColorClass = themeBrightness === 'dark' ? 'text-white' : 'text-black';
    const IconMap = { Music, Coffee, ShoppingBag, MapPin, Home };

    return (
      <div className={`bg-black/30 backdrop-blur-lg border rounded-2xl overflow-hidden shadow-2xl hover:-translate-y-1 transition-transform duration-300 w-full max-w-2xl mx-auto ${themeBrightness === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
        <div className="relative w-full h-48 overflow-hidden">
          {vibe.imageUrls && vibe.imageUrls.length > 0 && (
            <img
              src={vibe.imageUrls[0]}
              alt={`${vibe.title}`}
              className="w-full h-48 object-cover"
              onError={(e) => e.target.src = "https://images.unsplash.com/photo-1497515114629-f71d767d0461?w=800&h=600&fit=crop"}
            />
          )}
        </div>
        <div className="p-6">
          <h3 className={`text-xl font-bold ${themeBrightness === 'dark' ? 'text-white' : 'text-gray-900'}`}>{vibe.title}</h3>
          <p className={`text-xs ${themeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Generated Now</p>
          <p className={`mb-4 text-sm ${themeBrightness === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{vibe.description}</p>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <div className="flex flex-wrap gap-2">
                {vibe.colors.map(color => <div key={color} className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: color }} title={color} />)}
              </div>
            </div>
            {[
              { icon: vibe.icons.music, label: 'Music', items: vibe.music },
              { icon: vibe.icons.food, label: 'Food', items: vibe.food },
              { icon: vibe.icons.fashion, label: 'Fashion', items: vibe.fashion },
              { icon: vibe.icons.travel, label: 'Travel', items: vibe.travel },
              { icon: vibe.icons.decor, label: 'Decor', items: vibe.decor }
            ].map(({ icon, label, items }) => {
              const Icon = IconMap[icon] || Palette;
              return items?.length > 0 && (
                <div key={label} className="flex items-start space-x-2">
                  <Icon className="w-4 h-4 mt-1" />
                  <div>
                    <span className={`text-sm font-semibold ${themeBrightness === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{label}:</span>
                    <span className={`text-sm ${themeBrightness === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}> {items.join(', ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
{chatExpanded && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setChatExpanded(false)}>
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-md"
      onClick={() => {
        setChatExpanded(false);
        setGeneratedVibe(null);
      }}
    ></div>
    <div className="relative z-10 w-full max-w-2xl mx-4">
      <div className="bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 backdrop-blur-xl rounded-3xl p-8 border-4 border-transparent bg-clip-padding animate-fade-in" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="absolute inset-0 rounded-3xl p-1 bg-gradient-to-r from-pink-500 via-violet-500 to-blue-500 animate-gradient-x">
          <div className="w-full h-full rounded-3xl bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              Tell us what you love
            </h3>
            <button
              onClick={() => {
                setChatExpanded(false);
                setGeneratedVibe(null);
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleChatSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Tell me about 2-3 things you love... movies, music, or just a mood you're feeling"
                className="w-full h-32 bg-white/10 border border-white/20 rounded-2xl p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 transition-all"
                autoFocus
                disabled={isLoading}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                  <div className="w-8 h-8 border-4 border-t-4 border-pink-400 border-solid rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"
                  disabled={isLoading}
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm">Voice Mode</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={!chatMessage.trim() || isLoading}
                className="group bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 rounded-full font-semibold hover:scale-105 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span>Create My Vibe</span>
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          {generatedVibe && (
            <div className="mt-6 animate-slide-in-up">
              <VibeCard vibe={generatedVibe} />
              <div className="mt-6 flex justify-between items-center">
                <Link to="/auth">
                  <button className="bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform">
                    Create Account for Unlocked Features
                  </button>
                </Link>
                <button
                  onClick={() => {
                    setGeneratedVibe(null);
                    setChatExpanded(false);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    <style jsx>{`
      body {
        overflow: ${chatExpanded ? 'hidden' : 'auto'};
      }
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .animate-fade-in {
        animation: fade-in 0.3s ease-out;
      }
      @keyframes slide-in-up {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-slide-in-up {
        animation: slide-in-up 0.5s ease-out;
      }
      @keyframes gradient-x {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      .animate-gradient-x {
        background-size: 200% 200%;
        animation: gradient-x 3s ease infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .animate-spin {
        animation: spin 1s linear infinite;
      }
    `}</style>
  </div>
)}

      <nav className="fixed top-0 w-full z-40 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
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
          <Link to="/auth">
            <button className="bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform">
              Try Now
            </button>
          </Link>
        </div>
      </nav>

      <section className="min-h-screen flex items-center justify-center relative pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(167,139,250,0.3),transparent)] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="animate-pulse mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <Sparkles className="w-12 h-12 animate-spin" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-violet-400 bg-clip-text text-transparent leading-tight">
            Your Taste, Your Universe
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Give us 2-3 things you love. We'll craft a complete lifestyle
            experience around your unique vibe using AI that understands your
            cultural DNA.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <div
              onClick={() => setChatExpanded(true)}
              className="group relative cursor-pointer"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-violet-500 to-pink-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-x"></div>
              <div className="relative bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 backdrop-blur-xl rounded-full border-4 border-transparent bg-clip-padding px-8 py-4">
                <div className="flex items-center space-x-3">
                  <Play className="w-5 h-5 text-pink-400" />
                  <span className="text-lg font-semibold text-gray-300 group-hover:text-white transition-colors">
                    Tell me what you love...
                  </span>
                  <ChevronRight className="w-5 h-5 text-pink-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            <button className="border-2 border-white/30 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300 flex items-center space-x-2">
              <Volume2 className="w-5 h-5" />
              <span>Voice Mode</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { icon: Heart, label: "Personalized" },
              { icon: Zap, label: "Instant" },
              { icon: Eye, label: "Inclusive" },
              { icon: Users, label: "Cultural" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center space-y-2 opacity-80 hover:opacity-100 transition-opacity"
              >
                <item.icon className="w-8 h-8 text-pink-400" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              One Input, Infinite Possibilities
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From a single spark of inspiration, we generate a complete
              lifestyle ecosystem tailored to your unique taste profile.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-pink-400/50 transition-all duration-500 hover:scale-105 ${
                  currentFeature === index
                    ? "ring-2 ring-pink-400/50 bg-white/10"
                    : ""
                }`}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              Three Steps to Your Perfect Vibe
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Share Your Taste", desc: "Tell us 2-3 things you love - a movie, artist, book, or even just a mood", icon: Heart },
              { step: "02", title: "AI Analysis", desc: "Qloo Taste AI analyzes your cultural preferences and Google Gemini crafts your lifestyle", icon: Zap },
              { step: "03", title: "Get Your Kit", desc: "Receive a complete lifestyle package with music, travel, fashion, food, and decor", icon: Sparkles },
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-12 h-12" />
                </div>
                <div className="text-6xl font-bold text-pink-400/20 mb-4">{step.step}</div>
                <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-300 text-lg">{step.desc}</p>
                {index < 2 && <ArrowRight className="w-8 h-8 text-pink-400 mx-auto mt-8 hidden md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="accessibility" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                Designed for Everyone
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                VibeCraft works beautifully in voice-only mode. Visually
                impaired users can speak their preferences and receive spoken
                descriptions of their complete lifestyle kit.
              </p>
              <div className="space-y-4">
                {["Voice-first interaction design", "Spoken mood board descriptions", "Audio-guided lifestyle recommendations", "Inclusive cultural understanding"].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-80 bg-gradient-to-r from-pink-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Volume2 className="w-16 h-16 mx-auto mb-4 text-pink-400" />
                  <p className="text-lg font-semibold">"Tell me about a cozy coffee shop vibe"</p>
                  <div className="mt-4 flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
            Ready to Discover Your Vibe?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of creators who've found their perfect lifestyle
            match through VibeCraft.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setChatExpanded(true)}
              className="group bg-gradient-to-r from-pink-500 to-violet-500 px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Start Your Journey</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border-2 border-white/30 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300">
              Learn More
            </button>
          </div>
          {generatedVibe && (
            <div className="mt-12 max-w-4xl mx-auto">
              <VibeCard vibe={generatedVibe} />
              <div className="mt-6 flex justify-between items-center">
                <Link to="/auth">
                  <button className="bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform">
                    Create Account for Unlocked Features
                  </button>
                </Link>
                <button
                  onClick={() => {
                    setGeneratedVibe(null);
                    setChatExpanded(false);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                VibeCraft
              </span>
            </div>
            <div className="flex space-x-6 text-gray-400">
              <a href="#" className="hover:text-pink-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-pink-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-pink-400 transition-colors">Support</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400">
            <p>© <span id="year"></span> VibeCraft. Developed by Ravindra Boss. Powered by Qloo Taste AI.</p>
            <script>document.getElementById("year").textContent = new Date().getFullYear();</script>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;