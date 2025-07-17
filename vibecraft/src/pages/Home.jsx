import React, { useState, useEffect } from 'react';
import { ChevronRight, Sparkles, Palette, Music, MapPin, ShoppingBag, Coffee, Home, Volume2, Eye, ArrowRight, Play, Star, Zap, Heart, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const VibeCraftLanding = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  const features = [
    { icon: Music, title: "Music Playlists", desc: "Curated soundtracks for your vibe" },
    { icon: MapPin, title: "Travel Destinations", desc: "Perfect places that match your energy" },
    { icon: ShoppingBag, title: "Fashion Styles", desc: "Clothing that speaks your language" },
    { icon: Coffee, title: "Culinary Experiences", desc: "Meals and drinks for your mood" },
    { icon: Home, title: "Room Aesthetics", desc: "Spaces that reflect your personality" },
    { icon: Palette, title: "Visual Mood Boards", desc: "Beautiful collages of your vibe" }
  ];

  const testimonials = [
    { name: "Sarah Chen", role: "Creative Director", quote: "VibeCraft transformed how I discover new experiences. It's like having a personal taste curator!" },
    { name: "Marcus Johnson", role: "Music Producer", quote: "The AI understands my vibe better than I do. Found my new favorite artists through this." },
    { name: "Priya Patel", role: "Travel Blogger", quote: "The voice-only mode is incredibly inclusive. My visually impaired friend loves using it." }
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
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[id]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
          <Link to="/auth">
          <button className="bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform">
            Try Now
          </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
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
            Give us 2-3 things you love. We'll craft a complete lifestyle experience around your unique vibe using AI that understands your cultural DNA.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="group bg-gradient-to-r from-pink-500 to-violet-500 px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Start Creating</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
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
              { icon: Users, label: "Cultural" }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                <item.icon className="w-8 h-8 text-pink-400" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              One Input, Infinite Possibilities
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From a single spark of inspiration, we generate a complete lifestyle ecosystem tailored to your unique taste profile.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-pink-400/50 transition-all duration-500 hover:scale-105 ${
                  currentFeature === index ? 'ring-2 ring-pink-400/50 bg-white/10' : ''
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

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              Three Steps to Your Perfect Vibe
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Share Your Taste",
                desc: "Tell us 2-3 things you love - a movie, artist, book, or even just a mood",
                icon: Heart
              },
              {
                step: "02",
                title: "AI Analysis",
                desc: "Qloo Taste AI analyzes your cultural preferences and Google Gemini crafts your lifestyle",
                icon: Zap
              },
              {
                step: "03",
                title: "Get Your Kit",
                desc: "Receive a complete lifestyle package with music, travel, fashion, food, and decor",
                icon: Sparkles
              }
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-12 h-12" />
                </div>
                <div className="text-6xl font-bold text-pink-400/20 mb-4">{step.step}</div>
                <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-300 text-lg">{step.desc}</p>
                {index < 2 && (
                  <ArrowRight className="w-8 h-8 text-pink-400 mx-auto mt-8 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Section */}
      <section id="accessibility" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                Designed for Everyone
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                VibeCraft works beautifully in voice-only mode. Visually impaired users can speak their preferences and receive spoken descriptions of their complete lifestyle kit.
              </p>
              <div className="space-y-4">
                {[
                  "Voice-first interaction design",
                  "Spoken mood board descriptions",
                  "Audio-guided lifestyle recommendations",
                  "Inclusive cultural understanding"
                ].map((feature, index) => (
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
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              Loved by Creators
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
            Ready to Discover Your Vibe?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of creators who've found their perfect lifestyle match through VibeCraft.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group bg-gradient-to-r from-pink-500 to-violet-500 px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>Start Your Journey</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border-2 border-white/30 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
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
            <p>&copy; 2025 VibeCraft. Powered by Qloo Taste AI & Google Gemini.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VibeCraftLanding;