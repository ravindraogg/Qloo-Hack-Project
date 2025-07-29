import React, { useState, useEffect } from "react";
import { useLottie } from "lottie-react";
import MainScene1 from "../components/MainScene.json";
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
  Mic,
  MessageCircle,
  Globe,
  Lightbulb,
  Compass,
  Headphones,
} from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const MainScene = MainScene1; 
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [chatExpanded, setChatExpanded] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [generatedVibe, setGeneratedVibe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);

  // Lottie animation setup for MainScene
  const mainSceneOptions = {
    animationData: MainScene,
    loop: true,
    autoplay: true,
  };
  const { View: MainSceneView } = useLottie(mainSceneOptions);
  useEffect(() => {
    const createFavicon = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 32;
      canvas.height = 32;

      const gradient = ctx.createLinearGradient(0, 0, 32, 32);
      gradient.addColorStop(0, "#ec4899"); // pink-500
      gradient.addColorStop(1, "#8b5cf6"); // violet-500

      ctx.fillStyle = gradient;
      ctx.roundRect(4, 4, 24, 24, 6);
      ctx.fill();

      // Draw sparkle icon (simplified)
      ctx.fillStyle = "white";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText("✨", 16, 22);

      // Update favicon
      const link =
        document.querySelector("link[rel*='icon']") ||
        document.createElement("link");
      link.type = "image/x-icon";
      link.rel = "shortcut icon";
      link.href = canvas.toDataURL();
      document.getElementsByTagName("head")[0].appendChild(link);
    };

    createFavicon();
  }, []);
  const features = [
    {
      icon: Music,
      title: "AI Music Suggestion",
      desc: "Personalized playlists that evolve with your taste",
      color: "from-purple-500 to-pink-500",
      bgGlow: "bg-purple-500/20",
    },
    {
      icon: MapPin,
      title: "Travel Discovery",
      desc: "Hidden gems and destinations that match your vibe",
      color: "from-blue-500 to-cyan-500",
      bgGlow: "bg-blue-500/20",
    },
    {
      icon: ShoppingBag,
      title: "Style Intelligence",
      desc: "Fashion recommendations that speak your language",
      color: "from-pink-500 to-rose-500",
      bgGlow: "bg-pink-500/20",
    },
    {
      icon: Coffee,
      title: "Culinary Adventures",
      desc: "Food experiences tailored to your palate",
      color: "from-amber-500 to-orange-500",
      bgGlow: "bg-amber-500/20",
    },
    {
      icon: Home,
      title: "Living Spaces",
      desc: "Interior design that reflects your personality",
      color: "from-emerald-500 to-teal-500",
      bgGlow: "bg-emerald-500/20",
    },
    {
      icon: Palette,
      title: "Visual Harmony",
      desc: "Aesthetic mood boards and color palettes",
      color: "from-violet-500 to-purple-500",
      bgGlow: "bg-violet-500/20",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
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
        // Simulated API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const mockData = {
          title: "Cozy Autumn Vibes",
          mood: "Warm & Contemplative",
          description:
            "A perfect blend of comfort and creativity, inspired by golden hour moments and artisanal coffee culture.",
          colors: ["#D2691E", "#8B4513", "#CD853F"],
          music: ["Lo-fi Hip Hop", "Indie Folk", "Jazz Café"],
          food: ["Pumpkin Spice Latte", "Artisan Pastries", "Warm Soup"],
          fashion: ["Cozy Sweaters", "Vintage Boots", "Layered Scarves"],
          travel: ["Mountain Cabins", "Historic Bookshops", "Local Cafés"],
          decor: ["Warm Lighting", "Vintage Books", "Wooden Textures"],
          imageUrls: [
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
          ],
          icons: {
            music: "Music",
            food: "Coffee",
            fashion: "ShoppingBag",
            travel: "MapPin",
            decor: "Home",
          },
        };

        setGeneratedVibe(mockData);
      } catch (error) {
        console.error("Generation error:", error);
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
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : { r: 0, g: 0, b: 0 };
      };
      const getLuminance = (r, g, b) => {
        const [rs, gs, bs] = [r, g, b].map((c) => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      };
      const avgLuminance =
        colors.reduce(
          (sum, color) =>
            sum +
            getLuminance(
              hexToRgb(color).r,
              hexToRgb(color).g,
              hexToRgb(color).b
            ),
          0
        ) / colors.length;
      return avgLuminance > 0.4 ? "light" : "dark";
    };

    const themeBrightness = getThemeBrightness(vibe.colors);
    const IconMap = { Music, Coffee, ShoppingBag, MapPin, Home };

    return (
      <div
        className={`relative group bg-black/40 backdrop-blur-2xl border rounded-3xl overflow-hidden shadow-2xl hover:-translate-y-2 transition-all duration-500 w-full max-w-2xl mx-auto ${
          themeBrightness === "dark" ? "border-white/20" : "border-black/20"
        } hover:shadow-pink-500/20 hover:shadow-2xl`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-violet-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="relative w-full h-56 overflow-hidden">
          {vibe.imageUrls && vibe.imageUrls.length > 0 && (
            <>
              <img
                src={vibe.imageUrls[0]}
                alt={`${vibe.title}`}
                className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) =>
                  (e.target.src =
                    "https://images.unsplash.com/photo-1497515114629-f71d767d0461?w=800&h=600&fit=crop")
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </>
          )}
          <div className="absolute/extreme top-4 right-4">
            <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm font-medium">Generated</span>
            </div>
          </div>
        </div>

        <div className="relative p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3
                className={`text-2xl font-bold ${
                  themeBrightness === "dark" ? "text-white" : "text-gray-900"
                } mb-1`}
              >
                {vibe.title}
              </h3>
              <p
                className={`text-sm ${
                  themeBrightness === "dark" ? "text-pink-400" : "text-pink-600"
                } font-medium`}
              >
                {vibe.mood}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`text-xs ${
                  themeBrightness === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Generated Now
              </p>
            </div>
          </div>

          <p
            className={`mb-6 text-base leading-relaxed ${
              themeBrightness === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {vibe.description}
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Palette className="w-5 h-5 text-pink-400" />
              <span
                className={`text-sm font-semibold ${
                  themeBrightness === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Color Palette:
              </span>
              <div className="flex gap-2">
                {vibe.colors.map((color, index) => (
                  <div
                    key={color}
                    className="w-8 h-8 rounded-full border-2 border-white/30 shadow-lg hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {[
              {
                icon: vibe.icons.music,
                label: "Music",
                items: vibe.music,
                color: "text-purple-400",
              },
              {
                icon: vibe.icons.food,
                label: "Food",
                items: vibe.food,
                color: "text-amber-400",
              },
              {
                icon: vibe.icons.fashion,
                label: "Fashion",
                items: vibe.fashion,
                color: "text-pink-400",
              },
              {
                icon: vibe.icons.travel,
                label: "Travel",
                items: vibe.travel,
                color: "text-blue-400",
              },
              {
                icon: vibe.icons.decor,
                label: "Decor",
                items: vibe.decor,
                color: "text-emerald-400",
              },
            ].map(({ icon, label, items, color }) => {
              const Icon = IconMap[icon] || Palette;
              return (
                items?.length > 0 && (
                  <div key={label} className="flex items-start space-x-3">
                    <Icon className={`w-5 h-5 mt-1 ${color}`} />
                    <div className="flex-1">
                      <span
                        className={`text-sm font-semibold ${
                          themeBrightness === "dark"
                            ? "text-gray-200"
                            : "text-gray-800"
                        }`}
                      >
                        {label}:
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {items.map((item, index) => (
                          <span
                            key={index}
                            className={`text-xs px-2 py-1 rounded-full bg-white/10 ${
                              themeBrightness === "dark"
                                ? "text-gray-300"
                                : "text-gray-700"
                            } border border-white/20`}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden relative">
      {/* Animated background elements */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)`,
        }}
      ></div>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          >
            <div className="w-1 h-1 bg-white/20 rounded-full"></div>
          </div>
        ))}
        {/* MainScene animation aligned to right side */}
        <div
          className="absolute pointer-events-none"
          style={{
            right: "20px",
            top: "100px",
            width: "500px",
            height: "500px",
            zIndex: 1000,
          }}
        >
          {MainSceneView}
        </div>
      </div>

      {chatExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            onClick={() => {
              setChatExpanded(false);
              setGeneratedVibe(null);
            }}
          ></div>
          <div className="relative z-10 w-full max-w-3xl mx-4">
            <div className="relative bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl animate-slide-in-up">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/10 via-violet-500/10 to-blue-500/10 animate-gradient-pulse"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent mb-2">
                      What's Your Vibe?
                    </h3>
                    <p className="text-gray-300">
                      Share 2-3 things you love and let AI craft your perfect
                      lifestyle
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setChatExpanded(false);
                      setGeneratedVibe(null);
                    }}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                  >
                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                  </button>
                </div>

                <form onSubmit={handleChatSubmit} className="space-y-6">
                  <div className="relative">
                    <textarea
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="I love indie films like 'Her', listening to Bon Iver on rainy days, and minimalist interior design..."
                      className="w-full h-40 bg-white/5 border border-white/20 rounded-2xl p-6 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 transition-all backdrop-blur-sm"
                      autoFocus
                      disabled={isLoading}
                    />
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl backdrop-blur-sm">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative">
                            <div className="w-12 h-12 border-4 border-pink-400/30 border-t-pink-400 rounded-full animate-spin"></div>
                            <Sparkles className="w-6 h-6 text-pink-400 absolute top-3 left-3 animate-pulse" />
                          </div>
                          <p className="text-pink-400 font-medium">
                            Crafting your perfect vibe...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        className="flex items-center space-x-2 px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-all group border border-white/10"
                        disabled={isLoading}
                      >
                        <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Voice Input</span>
                      </button>
                      <button
                        type="button"
                        className="flex items-center space-x-2 px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-all group border border-white/10"
                        disabled={isLoading}
                      >
                        <Lightbulb className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Get Ideas</span>
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={!chatMessage.trim() || isLoading}
                      className="group relative bg-gradient-to-r from-pink-500 to-violet-500 px-8 py-4 rounded-full font-semibold hover:scale-105 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-pink-500/25"
                    >
                      <span className="relative z-10">Create My Vibe</span>
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-violet-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                  </div>
                </form>

                {generatedVibe && (
                  <div className="mt-8 animate-slide-in-up">
                    <VibeCard vibe={generatedVibe} />
                    <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <Link to="/auth">
                        <button className="bg-gradient-to-r from-pink-500 to-violet-500 px-8 py-4 rounded-full font-semibold hover:scale-105 transition-transform shadow-lg flex items-center space-x-2">
                          <Star className="w-5 h-5" />
                          <span>Save & Create Account</span>
                        </button>
                      </Link>
                      <div className="flex items-center space-x-4">
                        <button className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                          <MessageCircle className="w-5 h-5" />
                          <span>Share</span>
                        </button>
                        <button
                          onClick={() => {
                            setGeneratedVibe(null);
                          }}
                          className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
                        >
                          <X className="w-5 h-5" />
                          <span>Close</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed top-0 w-full z-40 bg-black/10 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                VibeCraft
              </span>
              <p className="text-xs text-gray-400 -mt-1">
                AI Lifestyle Curator
              </p>
            </div>
          </div>

          <div className="hidden md:flex space-x-8">
            <a
              href="#features"
              className="hover:text-pink-400 transition-colors font-medium flex items-center space-x-1 group"
            >
              <span>Features</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#how-it-works"
              className="hover:text-pink-400 transition-colors font-medium"
            >
              How It Works
            </a>
            <a
              href="#accessibility"
              className="hover:text-pink-400 transition-colors font-medium"
            >
              Accessibility
            </a>
          </div>
          <Link to="/auth">
            <button className="bg-gradient-to-r from-pink-500 to-violet-500 px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform shadow-lg hover:shadow-pink-500/25">
              Try Now
            </button>
          </Link>
        </div>
      </nav>

      <section className="min-h-screen flex items-center justify-center relative pt-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(236,72,153,0.2),transparent)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.2),transparent)] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="animate-float mb-8">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full animate-pulse-glow"></div>
              <div className="relative w-32 h-32 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center shadow-2xl">
                <Sparkles className="w-16 h-16 animate-sparkle" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-pink-400 via-purple-400 to-violet-400 bg-clip-text text-transparent leading-tight animate-gradient-text">
            Your Taste,
            <br />
            Your Universe
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform 2-3 simple preferences into a complete lifestyle
            experience. Our AI understands your cultural DNA and crafts a
            personalized universe of music, travel, fashion, food, and design.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <div
              onClick={() => setChatExpanded(true)}
              className="group relative cursor-pointer"
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-violet-500 to-pink-500 rounded-full blur-lg opacity-60 group-hover:opacity-100 transition duration-500 animate-gradient-x"></div>
              <div className="relative bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 backdrop-blur-2xl rounded-full border border-white/20 px-10 py-5 shadow-2xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="text-xl font-bold text-white block">
                      Start Creating
                    </span>
                    <span className="text-sm text-gray-400">
                      Tell us what you love...
                    </span>
                  </div>
                  <ChevronRight className="w-6 h-6 text-pink-400 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>

            <button className="border-2 border-white/30 px-10 py-5 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300 flex items-center space-x-3 hover:border-pink-400/50 hover:scale-105">
              <Headphones className="w-6 h-6" />
              <span>Voice Mode</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { icon: Heart, label: "Personalized", desc: "Tailored to you" },
              { icon: Zap, label: "Instant", desc: "Results in seconds" },
              { icon: Eye, label: "Inclusive", desc: "All perspectives" },
              { icon: Globe, label: "Cultural", desc: "Globally aware" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center space-y-3 opacity-80 hover:opacity-100 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white/10 transition-all group-hover:scale-110">
                  <item.icon className="w-8 h-8 text-pink-400" />
                </div>
                <div className="text-center">
                  <span className="text-lg font-semibold block">
                    {item.label}
                  </span>
                  <span className="text-sm text-gray-400">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              One Input, Infinite Possibilities
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Transform a single spark of inspiration into a complete lifestyle
              ecosystem tailored to your unique taste profile and cultural
              preferences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-pink-400/30 transition-all duration-700 hover:scale-105 cursor-pointer ${
                  currentFeature === index
                    ? "ring-2 ring-pink-400/50 bg-white/10 shadow-2xl shadow-pink-500/10"
                    : ""
                }`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div
                    className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}
                  >
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-pink-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed group-hover:text-gray-200 transition-colors">
                    {feature.desc}
                  </p>

                  {hoveredCard === index && (
                    <div className="mt-6 animate-slide-in-up">
                      <button className="flex items-center space-x-2 text-pink-400 font-semibold group-hover:text-pink-300 transition-colors">
                        <span>Explore</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>

                <div
                  className={`absolute -inset-1 ${feature.bgGlow} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              Three Steps to Your Perfect Vibe
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our intelligent system transforms your preferences into a
              personalized lifestyle experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-24 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-pink-500 to-violet-500 opacity-30"></div>

            {[
              {
                step: "01",
                title: "Share Your Taste",
                desc: "Tell us about 2-3 things you love - whether it's a movie that moved you, music that speaks to your soul, or just a mood you're feeling right now",
                icon: Heart,
                color: "from-pink-500 to-rose-500",
                bgColor: "bg-pink-500/10",
              },
              {
                step: "02",
                title: "AI Analysis",
                desc: "Our advanced AI analyzes your cultural preferences using Qloo's taste intelligence and Google Gemini's creative engine to understand your unique vibe",
                icon: Zap,
                color: "from-violet-500 to-purple-500",
                bgColor: "bg-violet-500/10",
              },
              {
                step: "03",
                title: "Get Your Kit",
                desc: "Receive a complete lifestyle package including curated music playlists, travel destinations, fashion styles, culinary experiences, and interior design ideas",
                icon: Sparkles,
                color: "from-blue-500 to-cyan-500",
                bgColor: "bg-blue-500/10",
              },
            ].map((step, index) => (
              <div key={index} className="text-center relative group">
                <div
                  className={`w-32 h-32 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-500 shadow-2xl relative`}
                >
                  <step.icon className="w-16 h-16 text-white" />
                  <div
                    className={`absolute inset-0 ${step.bgColor} rounded-full blur-2xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  ></div>
                </div>

                <div className="relative">
                  <div className="text-8xl font-black text-pink-400/10 mb-6 select-none">
                    {step.step}
                  </div>
                  <h3 className="text-3xl font-bold mb-6 text-white group-hover:text-pink-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed max-w-sm mx-auto group-hover:text-gray-200 transition-colors">
                    {step.desc}
                  </p>
                </div>

                {index < 2 && (
                  <div className="hidden md:block absolute top-16 -right-6 z-10">
                    <ArrowRight className="w-12 h-12 text-pink-400/50 animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="accessibility" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                Designed for Everyone
              </h2>
              <p className="text-2xl text-gray-300 mb-10 leading-relaxed">
                VibeCraft works beautifully in voice-only mode. Our inclusive
                design ensures that visually impaired users can speak their
                preferences and receive detailed spoken descriptions of their
                complete lifestyle experience.
              </p>

              <div className="space-y-6">
                {[
                  {
                    feature: "Voice-first interaction design",
                    icon: Mic,
                    desc: "Complete hands-free operation with intelligent voice recognition",
                  },
                  {
                    feature: "Spoken mood board descriptions",
                    icon: MessageCircle,
                    desc: "Rich audio descriptions of visual elements and color palettes",
                  },
                  {
                    feature: "Audio-guided lifestyle recommendations",
                    icon: Headphones,
                    desc: "Immersive audio experiences for all recommendation categories",
                  },
                  {
                    feature: "Inclusive cultural understanding",
                    icon: Globe,
                    desc: "AI trained on diverse global perspectives and accessibility needs",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 group hover:bg-white/5 p-4 rounded-2xl transition-all"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-lg font-semibold text-white block mb-2">
                        {item.feature}
                      </span>
                      <span className="text-gray-400 leading-relaxed">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-pink-500/10 via-violet-500/10 to-blue-500/10 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/10 group hover:border-pink-400/30 transition-all duration-500">
                <div className="text-center relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-2xl">
                    <Volume2 className="w-12 h-12 text-white animate-pulse" />
                  </div>

                  <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-sm">
                    <p className="text-xl font-semibold mb-4 text-pink-300">
                      "Tell me about a cozy coffee shop vibe"
                    </p>

                    <div className="flex justify-center space-x-2 mb-4">
                      <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>

                    <p className="text-sm text-gray-300">
                      AI is crafting your personalized experience...
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 to-violet-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
            Ready to Discover Your Vibe?
          </h2>
          <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of creators who've found their perfect lifestyle
            match through VibeCraft's intelligent curation system.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button
              onClick={() => setChatExpanded(true)}
              className="group relative bg-gradient-to-r from-pink-500 to-violet-500 px-12 py-6 rounded-full font-bold text-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 shadow-2xl hover:shadow-pink-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-violet-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Sparkles className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform" />
              <span className="relative z-10">Start Your Journey</span>
              <ChevronRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" />
            </button>

            <button className="border-2 border-white/30 px-12 py-6 rounded-full font-bold text-xl hover:bg-white/10 transition-all duration-300 hover:border-pink-400/50 hover:scale-105 flex items-center justify-center space-x-3">
              <Compass className="w-6 h-6" />
              <span>Explore Features</span>
            </button>
          </div>

          {generatedVibe && (
            <div className="mt-16 max-w-4xl mx-auto">
              <VibeCard vibe={generatedVibe} />
              <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
                <button className="bg-gradient-to-r from-pink-500 to-violet-500 px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-lg flex items-center space-x-3">
                  <Star className="w-6 h-6" />
                  <span>Create Account for Unlocked Features</span>
                </button>
                <div className="flex items-center space-x-6">
                  <button className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Share Vibe</span>
                  </button>
                  <button
                    onClick={() => setGeneratedVibe(null)}
                    className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Close</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <footer className="py-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-[100px]">
            {/* Left: Branding */}
            <div className="flex items-center space-x-7">
              <div className="relative group">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Sparkles className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                  VibeCraft
                </span>
                <p className="text-sm text-gray-400">AI Lifestyle Curator</p>
              </div>
            </div>

            {/* Right: Text */}
            <div className="text-center md:text-left space-y-1">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} VibeCraft. Crafted by{" "}
                <span className="text-pink-400 font-semibold">Ravindra</span>.
                Powered by{" "}
                <span className="text-violet-400 font-semibold">
                  Qloo Taste AI
                </span>{" "}
                &{" "}
                <span className="text-blue-400 font-semibold">
                  Google Gemini
                </span>
                .
              </p>
              <p className="text-gray-500 text-xs">
                Transforming individual taste into personalized lifestyle
                experiences through intelligent curation.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }

        @keyframes gradient-pulse {
          0%,
          100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.2;
          }
        }
        .animate-gradient-pulse {
          animation: gradient-pulse 2s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%,
          100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(90deg) scale(1.1);
          }
          50% {
            transform: rotate(180deg) scale(1);
          }
          75% {
            transform: rotate(270deg) scale(1.1);
          }
        }
        .animate-sparkle {
          animation: sparkle 4s ease-in-out infinite;
        }

        @keyframes gradient-text {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-text {
          background-size: 200% 200%;
          animation: gradient-text 4s ease infinite;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.6s ease-out;
        }

        @keyframes bounce {
          0%,
          20%,
          53%,
          80%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          40%,
          43% {
            transform: translate3d(0, -15px, 0);
          }
          70% {
            transform: translate3d(0, -7px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }
        .animate-bounce {
          animation: bounce 1.5s ease infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ec4899, #8b5cf6);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #db2777, #7c3aed);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
