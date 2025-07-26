import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Sparkles, Music, HelpCircle, MapPin, Palette, Coffee, Home, ShoppingBag, Volume2, VolumeX, Mic, MicOff, Share2, User, Settings, LogOut, Send, Eye, Heart, Star, Play, Pause, RefreshCw, Image, FileText, Loader2, X, ChevronRight, ZapOff, Calendar, Clock, Bookmark, Grid, List, Filter, Search, Save, Plus, ArrowRight, Headphones, Camera, Utensils, Shirt, Plane, Sofa, Wand2, Globe, Target, Zap, AlertCircle, CheckCircle, Info, Smile, ThumbsUp, ChevronLeft
} from 'lucide-react';
import debounce from 'lodash.debounce';
import DOMPurify from 'dompurify';
import FlyingBird from '../components/FlyingBird';


// --- Global Helper Functions & Components ---

const sanitizeInput = (input) => {
    if (!input || typeof input !== 'string') return '';
    return DOMPurify.sanitize(input.trim(), {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
};

const validateImageUrl = (url) => {
    try {
      const parsed = new URL(url);
      const pathname = parsed.pathname;
      const isImagePath = /\.(jpeg|jpg|png|gif)$/i.test(pathname);
      const isUnsplash = parsed.hostname.includes("unsplash.com");
      return isImagePath || isUnsplash;
    } catch {
      return false;
    }
};

const getThemeBrightness = (colors) => {
    if (!colors || !Array.isArray(colors) || colors.length === 0) return 'dark';
    try {
      const avgLuminance = colors.reduce((sum, color) => {
        const cleanColor = color.replace(/`/g, '').trim();
        const hex = cleanColor.replace('#', '');
        const rgb = parseInt(hex, 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return sum + luminance;
      }, 0) / colors.length;
      return avgLuminance > 140 ? 'light' : 'dark';
    } catch (e) {
      return 'dark';
    }
};

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      setHasError(true);
      setError(event.error || new Error('Unknown error'));
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold">Something Went Wrong</h2>
          <p className="mt-2">Error: {error?.message || 'Unknown error'}</p>
          <button
            onClick={() => {
              setHasError(false);
              setError(null);
            }}
            className="mt-4 px-4 py-2 bg-blue-500 rounded-full"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return children;
};

const SpotifyPlayer = React.memo(({ trackId, trackName }) => {
    if (!trackId) {
      return <div className="w-full h-20 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-400 text-sm">No track available</div>;
    }
  
    const sanitizedId = sanitizeInput(trackId);
    const sanitizedName = sanitizeInput(trackName);
  
    return (
        <iframe
        src={`https://open.spotify.com/embed/track/${sanitizedId}?utm_source=generator&theme=0`}
        width="100%"
        height="80"
        frameBorder="0"
        allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="flex-shrink-0 w-full rounded-lg"
        title={sanitizedName}
        />
    );
});
SpotifyPlayer.displayName = 'SpotifyPlayer';

const VibeCard = React.memo(
    React.forwardRef(({
        vibe,
        complementaryColors,
        overallThemeBrightness,
        defaultImage,
        currentPlayingAudio,
        onSaveVibe,
        onGenerateShareLink,
        onPlayTTS,
        onStopTTS
    }, ref) => {
      const [currentSlide, setCurrentSlide] = useState(0);
      const [isAutoScroll, setIsAutoScroll] = useState(true);
      const [isContentReady, setIsContentReady] = useState(false);
      
      const validImageUrls = useMemo(() => {
        return (vibe?.imageUrls || []).map(url => validateImageUrl(url) ? url : defaultImage);
      }, [vibe?.imageUrls, defaultImage]);

      const cardThemeBrightness = useMemo(() => getThemeBrightness(vibe?.colors || []), [vibe?.colors]);

      useEffect(() => {
        if (vibe?.id) {
          const timer = setTimeout(() => setIsContentReady(true), 200);
          return () => clearTimeout(timer);
        }
      }, [vibe?.id]);

      useEffect(() => {
        let interval;
        if (isAutoScroll && validImageUrls.length > 1 && isContentReady) {
          interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % validImageUrls.length);
          }, 5000);
        }
        return () => clearInterval(interval);
      }, [isAutoScroll, validImageUrls.length, isContentReady]);

      const handleInteractiveClick = useCallback((e, action) => {
        e.preventDefault();
        e.stopPropagation();
        action();
      }, []);

      const nextSlide = useCallback(() => setCurrentSlide(prev => (prev + 1) % validImageUrls.length), [validImageUrls.length]);
      const prevSlide = useCallback(() => setCurrentSlide(prev => (prev - 1 + validImageUrls.length) % validImageUrls.length), [validImageUrls.length]);

      const IconMap = { Music, Utensils, Shirt, MapPin, Sofa };
      const titleColorClass = cardThemeBrightness === 'dark' ? 'text-white' : 'text-black';
      const textColorClass = cardThemeBrightness === 'dark' ? 'text-gray-300' : 'text-gray-700';
      const mutedTextColorClass = cardThemeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-600';
      const semiBoldTextColorClass = cardThemeBrightness === 'dark' ? 'text-gray-200' : 'text-gray-800';

      const handleImageError = useCallback(
        (e) => {
          if (e.target.src !== defaultImage) e.target.src = defaultImage;
          e.target.onerror = null;
        },
        [defaultImage]
      );

      return (
        <div
          ref={ref}
          className={`bg-black/30 backdrop-blur-lg border rounded-2xl overflow-hidden shadow-2xl hover:-translate-y-1 transition-all duration-300 w-full min-h-[480px] flex flex-col ${overallThemeBrightness === 'dark' ? 'border-white/10' : 'border-black/10'}`}
          style={{ '--primary-color': complementaryColors.primary, '--secondary-color': complementaryColors.secondary }}
        >
          <style>
            {`
              @keyframes kenburns { 0% { transform: scale(1) translate(0, 0); } 100% { transform: scale(1.15) translate(-2%, 2%); } }
              .ken-burns-animation { animation: kenburns 10s ease-out forwards; }
            `}
          </style>
          <div className={`absolute inset-0 bg-gray-800/20 z-10 transition-opacity duration-500 ${isContentReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: complementaryColors.primary }} />
            </div>
          </div>
          <div className="relative w-full h-48 overflow-hidden group">
            {validImageUrls.length > 0 && (
              <div className="absolute inset-0 flex">
                {validImageUrls.map((url, index) => (
                  <div
                    key={`${vibe.id}-img-container-${index}`}
                    className="w-full h-full absolute top-0 left-0 transition-opacity duration-1000 ease-in-out flex-shrink-0"
                    style={{ opacity: currentSlide === index ? 1 : 0 }}
                  >
                    <img
                      src={url}
                      alt={`${sanitizeInput(vibe.title)} ${index + 1}`}
                      className={`w-full h-full object-cover ${currentSlide === index ? 'ken-burns-animation' : ''}`}
                      onError={handleImageError}
                      crossOrigin="anonymous"
                    />
                  </div>
                ))}
              </div>
            )}
            {validImageUrls.length > 1 && (
              <>
                <button
                  onClick={(e) => handleInteractiveClick(e, prevSlide)}
                  className="absolute top-1/2 left-2 -translate-y-1/2 z-20 p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
                  title="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => handleInteractiveClick(e, nextSlide)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 z-20 p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
                  title="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                  {validImageUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => handleInteractiveClick(e, () => setCurrentSlide(index))}
                      className={`w-2 h-2 rounded-full transition-all ${currentSlide === index ? 'bg-white scale-125' : 'bg-gray-400'}`}
                    />
                  ))}
                </div>
                <div className="absolute top-2 right-2 z-10">
                  <button
                    onClick={(e) => handleInteractiveClick(e, () => setIsAutoScroll(!isAutoScroll))}
                    className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                    title={isAutoScroll ? 'Pause Auto-Scroll' : 'Start Auto-Scroll'}
                  >
                    {isAutoScroll ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="p-6 flex-1 flex flex-col">
            {vibe.spotifyTracks && vibe.spotifyTracks.length > 0 && (
              <div className="mb-4">
                <h4 className={`text-sm font-semibold ${semiBoldTextColorClass} mb-2`}>Spotify Playlist</h4>
                 <SpotifyPlayer 
                    trackId={vibe.spotifyTracks[0].id} 
                    trackName={vibe.spotifyTracks[0].name} 
                  />
              </div>
            )}
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className={`text-xl font-bold ${titleColorClass}`}>{vibe?.title || 'Untitled Vibe'}</h3>
                <p className={`text-xs ${mutedTextColorClass}`}>{vibe?.timestamp || 'N/A'}</p>
              </div>
              <div className="flex space-x-2">
                {!vibe?.isSaved && vibe?.chatId && (
                  <button
                    onClick={(e) => handleInteractiveClick(e, () => onSaveVibe(vibe.chatId))}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"
                    title="Save"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                )}
                {vibe?.isSaved && vibe?.chatId && (
                  <button
                    onClick={(e) => handleInteractiveClick(e, () => onGenerateShareLink(vibe.chatId))}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"
                    title="Share Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
                {vibe?.chatId && (
                  <button
                    onClick={(e) => handleInteractiveClick(e, () => (currentPlayingAudio === vibe.chatId ? onStopTTS() : onPlayTTS(vibe.chatId)))}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"
                    title={currentPlayingAudio === vibe.chatId ? 'Stop TTS' : 'Play TTS'}
                  >
                    {currentPlayingAudio === vibe.chatId ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
            <p className={`mb-4 text-sm ${textColorClass}`}>{vibe?.description || 'No description available.'}</p>
            <div className="space-y-3 mt-auto">
              <div className="flex items-center space-x-2">
                <Palette className="w-4 h-4" style={{ color: complementaryColors.primary }} />
                <div className="flex flex-wrap gap-2">
                  {(vibe?.colors || []).map(color => (
                    <div key={color} className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: color }} title={color} />
                  ))}
                </div>
              </div>
              {[
                { icon: vibe?.icons?.music || 'Music', label: 'Music', items: vibe?.music || [] },
                { icon: vibe?.icons?.food || 'Utensils', label: 'Food', items: vibe?.food || [] },
                { icon: vibe?.icons?.fashion || 'Shirt', label: 'Fashion', items: vibe?.fashion || [] },
                { icon: vibe?.icons?.travel || 'MapPin', label: 'Travel', items: vibe?.travel || [] },
                { icon: vibe?.icons?.decor || 'Sofa', label: 'Decor', items: vibe?.decor || [] },
              ].map(({ icon, label, items }) => {
                const Icon = IconMap[icon] || Palette;
                return (
                  items.length > 0 && (
                    <div key={label} className="flex items-start space-x-2">
                      <Icon className="w-4 h-4 mt-1" style={{ color: complementaryColors.primary }} />
                      <div>
                        <span className={`text-sm font-semibold ${semiBoldTextColorClass}`}>{label}:</span>
                        <span className={`text-sm ${textColorClass}`}> {items.join(', ')}</span>
                      </div>
                    </div>
                  )
                );
              })}
            </div>
          </div>
        </div>
      );
    })
);
VibeCard.displayName = 'VibeCard';

const LazyVibeCard = React.memo((props) => {
    const cardRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            const timer = setTimeout(() => setIsLoaded(true), 100);
            return () => clearTimeout(timer);
          }
        },
        {
          threshold: 0.1,
          rootMargin: '50px',
        }
      );
      const currentRef = cardRef.current;
      if (currentRef) {
        observer.observe(currentRef);
      }
      return () => {
        if (currentRef) {
          observer.unobserve(currentRef);
        }
      };
    }, [isVisible]);

    const memoizedVibe = useMemo(() => props.vibe, [props.vibe.id, props.vibe.title, props.vibe.colors, props.vibe.imageUrls]);

    return (
      <div ref={cardRef} className="w-full">
        {isVisible && isLoaded ? (
          <VibeCard {...props} vibe={memoizedVibe} ref={cardRef} />
        ) : (
          <div className="h-[480px] w-full bg-gray-800/20 rounded-2xl animate-pulse flex flex-col">
            <div className="h-48 bg-gray-700/30 rounded-t-2xl" />
            <div className="p-6 flex-1 flex flex-col gap-4">
              <div className="h-6 bg-gray-700/30 rounded w-3/4" />
              <div className="h-4 bg-gray-700/30 rounded w-1/2" />
              <div className="h-20 bg-gray-700/30 rounded" />
              <div className="h-4 bg-gray-700/30 rounded w-full" />
            </div>
          </div>
        )}
      </div>
    );
});
LazyVibeCard.displayName = 'LazyVibeCard';

const NotificationIcon = ({ type }) => {
    const iconProps = { className: 'w-5 h-5' };
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} />;
      case 'error':
        return <AlertCircle {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
};


const Dashboard = () => {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [savedVibes, setSavedVibes] = useState([]);
  const [activeTab, setActiveTab] = useState('create');
  const [showProfile, setShowProfile] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isAudioDescriptionMode, setIsAudioDescriptionMode] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [userProfile, setUserProfile] = useState({ name: 'Loading...', email: '...' });
  const [conversation, setConversation] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [errors, setErrors] = useState({});
  const [currentChatId, setCurrentChatId] = useState(null);
  const [uiTheme, setUiTheme] = useState('neutral');
  const [comfortMessage, setComfortMessage] = useState('');
  const [dynamicColors, setDynamicColors] = useState(['#1A202C', '#4A3065', '#1A365D']);
  const [backgroundGradient, setBackgroundGradient] = useState('linear-gradient(to bottom right, #4A3065, #1A365D)');
  const [showGreeting, setShowGreeting] = useState(true);
  const [sharedVibe, setSharedVibe] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const audioRef = useRef(null);
  const textareaRef = useRef(null);
  const profileRef = useRef(null);
  const generatedVibeCardRef = useRef(null);
  
  const categories = [
    { id: 'music', name: 'Music', icon: Music, color: 'from-purple-500 to-pink-500' },
    { id: 'travel', name: 'Travel', icon: MapPin, color: 'from-blue-500 to-cyan-500' },
    { id: 'fashion', name: 'Fashion', icon: Shirt, color: 'from-pink-500 to-rose-500' },
    { id: 'food', name: 'Food', icon: Utensils, color: 'from-orange-500 to-amber-500' },
    { id: 'decor', name: 'Decor', icon: Sofa, color: 'from-green-500 to-emerald-500' },
    { id: 'mood', name: 'Mood Board', icon: Palette, color: 'from-violet-500 to-purple-500' }
  ];

  const quickPrompts = [
    "I love indie films and vinyl records",
    "Cozy rainy day vibes",
    "90s nostalgic feelings",
    "Minimalist and clean aesthetic",
    "Bohemian adventure spirit",
    "Dark academia mood"
  ];

  const defaultImage = "https://images.unsplash.com/photo-1511920183276-5942f28b870d?w=800&h=600&fit=crop";
  
  const validateHexColor = (color) => /^#[0-9A-Fa-f]{6}$/.test(color);
  
  const sanitizeVibeData = (vibe) => {
    if (!vibe || typeof vibe !== 'object') return null;
    const sanitizedVibe = {
      id: vibe.chatId || vibe.id || '',
      chatId: vibe.chatId || vibe.id || '',
      timestamp: new Date(vibe.createdAt || Date.now()).toLocaleString(),
      isSaved: vibe.isSaved === true,
      title: sanitizeInput(vibe.title) || 'Shared Vibe',
      mood: sanitizeInput(vibe.mood) || 'Personalized',
      description: sanitizeInput(vibe.description) || 'A shared lifestyle experience.',
      categories: Array.isArray(vibe.categories) ? vibe.categories.map(sanitizeInput).filter(c => c) : ['mood'],
      colors: Array.isArray(vibe.colors) && vibe.colors.length >= 3
        ? vibe.colors.slice(0, 3).map(color => validateHexColor(color) ? color : '#FFFFFF')
        : ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      music: Array.isArray(vibe.music) ? vibe.music.map(sanitizeInput).filter(m => m) : [],
      food: Array.isArray(vibe.food) ? vibe.food.map(sanitizeInput).filter(f => f) : [],
      fashion: Array.isArray(vibe.fashion) ? vibe.fashion.map(sanitizeInput).filter(f => f) : [],
      travel: Array.isArray(vibe.travel) ? vibe.travel.map(sanitizeInput).filter(t => t) : [],
      decor: Array.isArray(vibe.decor) ? vibe.decor.map(sanitizeInput).filter(d => d) : [],
      imageUrls: Array.isArray(vibe.imageUrls) && vibe.imageUrls.length > 0
        ? vibe.imageUrls.map(url => validateImageUrl(url) ? url : defaultImage)
        : [defaultImage],
      spotifyTracks: Array.isArray(vibe.spotifyTracks)
        ? vibe.spotifyTracks.map(track => ({
            id: sanitizeInput(track.id) || '',
            name: sanitizeInput(track.name) || 'Unknown Track',
            artist: sanitizeInput(track.artist) || 'Unknown Artist',
            preview_url: validateImageUrl(track.preview_url) ? track.preview_url : null,
          }))
        : [],
      icons: {
        music: sanitizeInput(vibe.icons?.music) || 'Music',
        food: sanitizeInput(vibe.icons?.food) || 'Utensils',
        fashion: sanitizeInput(vibe.icons?.fashion) || 'Shirt',
        travel: sanitizeInput(vibe.icons?.travel) || 'MapPin',
        decor: sanitizeInput(vibe.icons?.decor) || 'Sofa',
      },
    };
    return sanitizedVibe;
  };

  const getComplementaryColors = useCallback((colors) => {
    if (!colors || !Array.isArray(colors)) return {};
    const primaryColor = colors[0]?.replace(/`/g, '').trim() || '#6B46C1';
    const secondaryColor = colors[1]?.replace(/`/g, '').trim() || '#EC4899';
    return {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: colors[2]?.replace(/`/g, '').trim() || '#10B981',
    };
  }, []);

  const getMoodFromVibe = (vibe) => {
    const moodMap = {
      'Nostalgic and Upbeat': 'energetic',
      'happy': ['joy', 'fun', 'bright', 'excited'],
      'calm': ['relax', 'peace', 'cozy', 'quiet'],
      'energetic': ['active', 'adventure', 'dynamic', 'bold', 'upbeat'],
    };
    const lowerMood = vibe.mood.toLowerCase();
    return moodMap[lowerMood] || Object.entries(moodMap).find(([_, keywords]) => Array.isArray(keywords) && keywords.some(k => lowerMood.includes(k)))?.[0] || 'neutral';
  };

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const sanitizedMessage = sanitizeInput(message);
    if (!sanitizedMessage) return;
    const notification = { id: Date.now() + Math.random(), message: sanitizedMessage, type, timestamp: new Date() };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== notification.id)), duration);
  }, []);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      addNotification('Logged out successfully', 'success');
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
      addNotification('Error during logout', 'error');
    }
  }, [addNotification]);

  const speakText = useCallback((text) => {
    if (!speechSynthesisRef.current || !isAudioDescriptionMode) return;
    try {
      speechSynthesisRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(sanitizeInput(text));
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesisRef.current.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  }, [isAudioDescriptionMode]);

  const toggleVoiceRecognition = useCallback(() => {
    if (!recognitionRef.current) {
      addNotification('Voice recognition not supported', 'error');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      speakText('Voice recognition stopped.');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        speakText('Voice recognition started. Speak your preferences.');
      } catch (error) {
        console.error('Voice recognition error:', error);
        addNotification('Failed to start voice recognition', 'error');
      }
    }
  }, [isListening, addNotification, speakText]);

  const loadSavedChats = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/chats', {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch saved vibes: ${response.statusText}`);
      }
      const chats = await response.json();
      if (!Array.isArray(chats)) {
        throw new Error('Invalid response format: expected an array');
      }
      const formattedVibes = chats
        .filter(chat => chat.vibe?.isSaved)
        .map(chat => {
          const vibe = chat.vibe || {};
          return sanitizeVibeData({
            ...vibe,
            chatId: chat._id || chat.chatId,
            id: chat._id || chat.chatId,
            createdAt: chat.createdAt,
          });
        })
        .filter(vibe => vibe && vibe.chatId);

      setSavedVibes(formattedVibes);

      if (formattedVibes.length === 0) addNotification('No saved vibes found.', 'info');
    } catch (error) {
      console.error('Error loading chats:', error);
      addNotification(`Failed to load saved vibes: ${error.message}`, 'error');
      setSavedVibes([]);
    }
  }, [addNotification]);

  const loadRecentActivity = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/activity', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error('Failed to fetch recent activity');
      const activities = await response.json();
      setRecentActivity(activities.map(activity => ({
        type: 'generated',
        title: sanitizeInput(`Created "${activity.vibe.title}"`),
        time: new Date(activity.createdAt).toLocaleString(),
        chatId: activity._id,
      })));
    } catch (error) {
      console.error('Error loading activity:', error);
      addNotification('Failed to load recent activity', 'error');
    }
  }, [addNotification]);

  const debouncedSetInputText = useCallback(debounce((value) => setInputText(value), 150), []);

  const handleTextareaResize = useCallback((e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      debouncedSetInputText(sanitizeInput(value));
      handleTextareaResize(e);
    },
    [debouncedSetInputText, handleTextareaResize]
  );

  const debouncedSetSearchQuery = useCallback(debounce((value) => setSearchQuery(sanitizeInput(value)), 300), []);

  const handleGenerate = useCallback(async () => {
    const sanitizedInput = sanitizeInput(inputText);
    if (!sanitizedInput) {
      addNotification('Please enter preferences', 'error');
      speakText('Please enter your preferences.');
      return;
    }
    if (!isOnline) {
      addNotification('No internet connection', 'error');
      speakText('No internet connection.');
      return;
    }
    setIsGenerating(true);
    setGeneratedContent(null);
    setErrors({});
    setShowGreeting(false);

    const userMessage = { role: 'user', content: sanitizedInput };
    setConversation(prev => [...prev, userMessage]);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const token = localStorage.getItem('token');
      if (!token) {
        addNotification('No token found, please log in', 'error');
        speakText('Please log in.');
        handleLogout();
        return;
      }

      const response = await fetch('http://localhost:5000/api/vibe/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ input: sanitizedInput }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText || 'No details'}`);
      }

      const data = await response.json();
      if (!data || typeof data !== 'object' || !data.chatId) {
        throw new Error('Invalid or empty response from server');
      }

      const sanitizedVibe = sanitizeVibeData(data);
      if (!sanitizedVibe) {
        throw new Error('Invalid vibe data received');
      }

      setGeneratedContent(sanitizedVibe);
      setConversation(prev => [...prev, { role: 'assistant', content: `Welcome, ${userProfile.name}! Vibe generated.` }]);
      const mood = getMoodFromVibe(sanitizedVibe);
      setUiTheme(mood);
      setDynamicColors(sanitizedVibe.colors);
      const newBackgroundGradient = `linear-gradient(to bottom right, ${sanitizedVibe.colors[1]}, ${sanitizedVibe.colors[2]})`;
      setBackgroundGradient(newBackgroundGradient);
      speakText(`Welcome, ${userProfile.name}! Generated a ${mood} vibe called ${sanitizedVibe.title}.`);
      setRecentActivity(prev => [
        { type: 'generated', title: `Created "${sanitizedVibe.title}"`, time: 'Just now', chatId: data.chatId },
        ...prev.slice(0, 4),
      ]);
      setInputText('');
      setVoiceTranscript('');
      addNotification('Vibe generated', 'success');
      speakText('Vibe generated successfully.');
    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage =
        error.name === 'AbortError'
          ? 'Request timed out. Please check your internet connection and try again.'
          : error.name === 'TypeError'
          ? 'Failed to connect to the server. Ensure the backend is running.'
          : error.message.includes('token')
          ? 'Authentication failed. Please log in again.'
          : 'Failed to generate vibe. Try again later.';
      addNotification(errorMessage, 'error');
      speakText(errorMessage);
      setConversation(prev => [...prev, { role: 'error', content: errorMessage }]);
      setGeneratedContent(null);
    } finally {
      setIsGenerating(false);
    }
  }, [inputText, isOnline, addNotification, speakText, userProfile.name, handleLogout, getMoodFromVibe]);

  const saveVibe = useCallback(
    async (chatId) => {
      const token = localStorage.getItem('token');
      if (!token) {
        addNotification('Please log in to save.', 'error');
        speakText('Please log in to save.');
        handleLogout();
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/vibe/save/${chatId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setSavedVibes(prev => {
            const vibe = prev.find(v => v.chatId === chatId) || generatedContent;
            if (!vibe) return prev;
            const updatedVibe = { ...vibe, isSaved: true };
            return [updatedVibe, ...prev.filter(v => v.chatId !== chatId)];
          });
          setGeneratedContent(prev => (prev?.chatId === chatId ? { ...prev, isSaved: true } : prev));
          addNotification(data.message, 'success');
          speakText(data.message);
          setRecentActivity(prev => [
            { type: 'saved', title: 'Saved vibe', time: new Date().toLocaleString(), chatId },
            ...prev.slice(0, 4),
          ]);
        } else throw new Error(data.message || 'Save failed');
      } catch (error) {
        console.error('Save error:', error);
        addNotification('Failed to save', 'error');
        speakText('Failed to save vibe.');
      }
    },
    [addNotification, handleLogout, generatedContent, speakText]
  );

  const playTTS = useCallback(
    async (chatId) => {
      const token = localStorage.getItem('token');
      if (!token) {
        addNotification('Please log in', 'error');
        speakText('Please log in to use TTS.');
        handleLogout();
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/vibe/tts/${chatId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to generate TTS');
        }
        const { audio } = await response.json();
        if (audio && audioRef.current) {
          audioRef.current.src = `data:audio/mp3;base64,${audio}`;
          audioRef.current.play();
          setCurrentPlayingAudio(chatId);
          addNotification('Playing vibe description', 'success');
          speakText('Playing vibe description.');
        }
      } catch (error) {
        console.error('TTS error:', error);
        addNotification('Failed to play TTS', 'error');
        speakText('Failed to play TTS.');
      }
    },
    [addNotification, speakText, handleLogout]
  );

  const stopTTS = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentPlayingAudio(null);
      addNotification('TTS stopped', 'success');
      speakText('TTS stopped.');
    }
  }, [addNotification, speakText]);

  const generateShareLink = useCallback(
    async (chatId) => {
      const token = localStorage.getItem('token');
      if (!token) {
        addNotification('Please log in to share.', 'error');
        speakText('Please log in to share a vibe.');
        handleLogout();
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/vibe/share/${chatId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to generate share link');
        }
        const { shareLink } = await response.json();
        navigator.clipboard.writeText(shareLink);
        addNotification('Share link copied to clipboard!', 'success');
        speakText('Share link copied to clipboard.');
      } catch (error) {
        console.error('Share link error:', error);
        addNotification(`Failed to generate share link: ${error.message}`, 'error');
        speakText('Failed to generate share link.');
      }
    },
    [addNotification, speakText, handleLogout]
  );

  const handleButtonClick = useCallback(
    (action, event) => {
      event.preventDefault();
      event.stopPropagation();
      switch (action) {
        case 'generate':
          handleGenerate();
          break;
        case 'save':
          if (generatedContent?.chatId) {
            saveVibe(generatedContent.chatId);
          }
          break;
        default:
          break;
      }
    },
    [handleGenerate, saveVibe, generatedContent]
  );

  const filteredVibes = useMemo(
    () =>
      savedVibes.filter(vibe => {
        const matchesCategory = filterCategory === 'all' || vibe.categories?.includes(filterCategory);
        const matchesSearch =
          !searchQuery ||
          vibe.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vibe.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [savedVibes, filterCategory, searchQuery]
  );

  const useClickOutside = (ref, handler) => {
    useEffect(() => {
      const listener = (event) => ref.current && !ref.current.contains(event.target) && handler();
      document.addEventListener('mousedown', listener);
      return () => document.removeEventListener('mousedown', listener);
    }, [ref, handler]);
  };

  useClickOutside(profileRef, () => setShowProfile(false));

  const complementaryColors = useMemo(() => getComplementaryColors(dynamicColors), [dynamicColors, getComplementaryColors]);
  const overallThemeBrightness = useMemo(() => getThemeBrightness(dynamicColors), [dynamicColors]);

  const loadSharedVibe = useCallback(
    async (shareId) => {
      console.log('loadSharedVibe called with shareId:', shareId);
      if (!shareId) {
        console.log('No shareId provided');
        addNotification('Invalid share link', 'error');
        speakText('Invalid share link.');
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/vibe/shared/${sanitizeInput(shareId)}`, {
          signal: AbortSignal.timeout(10000),
        });
        console.log('loadSharedVibe response status:', response.status);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to load shared vibe: ${errorText || response.statusText}`);
        }
        const data = await response.json();
        console.log('loadSharedVibe response data:', data);
        if (!data || !data.chatId || !data.vibe) {
          throw new Error('Invalid shared vibe data received');
        }
        const sanitizedVibe = sanitizeVibeData(data);
        if (!sanitizedVibe) {
          throw new Error('Failed to sanitize shared vibe data');
        }

        setSharedVibe(sanitizedVibe);
        setDynamicColors(sanitizedVibe.colors);
        setBackgroundGradient(`linear-gradient(to bottom right, ${sanitizedVibe.colors[1]}, ${sanitizedVibe.colors[2]})`);
        setActiveTab('saved');
        addNotification(`Shared vibe "${sanitizedVibe.title}" loaded successfully!`, 'success');
        speakText(`Shared vibe "${sanitizedVibe.title}" loaded successfully.`);
      } catch (error) {
        console.error('Load shared vibe error:', error);
        addNotification(error.message || 'Failed to load the shared vibe.', 'error');
        speakText('Failed to load the shared vibe.');
      } finally {
        window.history.replaceState({}, document.title, '/dashboard');
      }
    },
    [addNotification, speakText]
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('shareId');

    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token && !shareId) {
        window.location.href = '/auth';
        return;
      }
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            const userName = sanitizeInput(data.user.name);
            setUserProfile({ name: userName, email: sanitizeInput(data.user.email) });
            if (isInitialLoad) {
                addNotification(`Welcome back, ${userName}!`, 'info');
                setIsInitialLoad(false);
            }
          } else {
            throw new Error('Profile fetch failed');
          }
        } catch (error) {
          console.error('Auth error:', error);
          addNotification('Authentication failed, please log in again.', 'error');
          handleLogout();
        }
      }
    };

    fetchProfile();
    if (shareId) {
      setSharedVibe(null);
      loadSharedVibe(shareId);
    } else {
      loadSavedChats();
      loadRecentActivity();
    }
  }, [addNotification, handleLogout, loadRecentActivity, loadSavedChats, loadSharedVibe, isInitialLoad]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(r => r[0].transcript)
          .join(' ');
        setVoiceTranscript(sanitizeInput(transcript));
        debouncedSetInputText(sanitizeInput(transcript));
      };
      recognitionRef.current.onerror = (event) => {
        console.error('Speech error:', event.error);
        setIsListening(false);
        addNotification('Voice error', 'error');
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }

    if ('speechSynthesis' in window) speechSynthesisRef.current = window.speechSynthesis;
    
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (recognitionRef.current) recognitionRef.current.stop();
      if (speechSynthesisRef.current) speechSynthesisRef.current.cancel();
    };
  }, [addNotification, debouncedSetInputText]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleGenerate();
      else if ((e.ctrlKey || e.metaKey) && e.key === 'k') document.querySelector('input[placeholder="Search vibes..."]')?.focus();
      else if (e.ctrlKey || e.metaKey)
        switch (e.key) {
          case '1':
            setActiveTab('create');
            break;
          case '2':
            setActiveTab('saved');
            break;
          case '3':
            setActiveTab('activity');
            break;
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate]);

  useEffect(() => {
    if (dynamicColors.length < 2) return;
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, dynamicColors[0]);
    gradient.addColorStop(1, dynamicColors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L10.05 7.8L5.25 9.75L10.05 11.7L12 16.5L13.95 11.7L18.75 9.75L13.95 7.8L12 3Z" /></svg>`;
    const svgUrl = 'data:image/svg+xml;base64,' + btoa(svg);
    const img = new window.Image();
    img.onload = () => {
      ctx.drawImage(img, 4, 4, 24, 24);
      const faviconUrl = canvas.toDataURL('image/png');
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = faviconUrl;
    };
    img.src = svgUrl;
  }, [dynamicColors]);

  const handleVoiceCommand = useCallback(
    (command) => {
      const lowerCommand = sanitizeInput(command.toLowerCase());
      if (lowerCommand.includes('switch to create')) setActiveTab('create');
      else if (lowerCommand.includes('switch to saved')) setActiveTab('saved');
      else if (lowerCommand.includes('switch to activity')) setActiveTab('activity');
      else if (lowerCommand.includes('generate')) handleGenerate();
      else if (lowerCommand.includes('save vibe') && generatedContent) saveVibe(generatedContent.chatId);
      else if (lowerCommand.includes('play tts') && generatedContent) playTTS(generatedContent.chatId);
      else if (lowerCommand.includes('stop tts')) stopTTS();
      else if (lowerCommand.includes('help')) setShowTutorial(true);
      else speakText('Command not recognized. Say "help" for options.');
    },
    [generatedContent, handleGenerate, saveVibe, playTTS, stopTTS, speakText]
  );
  
  const mainTextColorClass = overallThemeBrightness === 'dark' ? 'text-white' : 'text-black';
  const placeholderColorClass = overallThemeBrightness === 'dark' ? 'placeholder-gray-400' : 'placeholder-gray-500';

  const cardProps = {
    complementaryColors,
    overallThemeBrightness,
    defaultImage,
    currentPlayingAudio,
    onSaveVibe: saveVibe,
    onGenerateShareLink: generateShareLink,
    onPlayTTS: playTTS,
    onStopTTS: stopTTS,
  };
  
  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-black ${mainTextColorClass} font-sans`} style={{ background: backgroundGradient }}>
        <FlyingBird />

        <audio ref={audioRef} />
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-xl backdrop-blur-xl border shadow-lg flex items-start space-x-3 ${
                notification.type === 'success'
                  ? 'bg-green-500/20 border-green-500/30 text-green-200'
                  : notification.type === 'error'
                  ? 'bg-red-500/20 border-red-500/30 text-red-200'
                  : 'bg-blue-500/20 border-blue-500/30 text-blue-200'
              }`}
            >
              <NotificationIcon type={notification.type} />
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs opacity-75 mt-1">{notification.timestamp.toLocaleTimeString()}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                className="text-current opacity-50 hover:opacity-75"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {!isOnline && (
          <div className="fixed top-4 left-4 z-50 bg-red-500/20 border border-red-500/30 rounded-lg p-3 backdrop-blur-xl">
            <div className="flex items-center space-x-2 text-red-200">
              <ZapOff className="w-5 h-5" />
              <span className="text-sm">Offline Mode</span>
            </div>
          </div>
        )}

        {showTutorial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTutorial(false)}></div>
            <div className="relative z-10 w-full max-w-3xl bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent mb-6">Welcome to VibeCraft</h3>
              <p className="text-gray-300 mb-6">Your personal AI-powered lifestyle curator. Describe any mood, and VibeCraft will instantly generate a complete aesthetic for you.</p>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white">Create Your Vibe</h4>
                    <p className="text-gray-300 text-sm">Use text or voice to describe your ideal mood.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Dynamic Themes</h4>
                    <p className="text-gray-300 text-sm">The entire app theme changes to match your vibe's colors.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white">Voice Commands</h4>
                    <p className="text-gray-300 text-sm">Use commands like "generate" or "save vibe" for hands-free control.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Save & Share</h4>
                    <p className="text-gray-300 text-sm">Save your favorite vibes and share them with friends via a link.</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setShowTutorial(false);
                    localStorage.setItem('hasSeenTutorial', 'true');
                  }}
                  className="px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
                  style={{ background: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})` }}
                >
                  Let's Go!
                </button>
              </div>
            </div>
          </div>
        )}

        <nav className={`fixed top-0 w-full z-40 backdrop-blur-xl border-b ${overallThemeBrightness === 'dark' ? 'bg-black/20 border-white/10' : 'bg-white/20 border-black/10'}`}>
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})` }}>
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})` }}>
                    VibeCraft
                  </span>
                  <div className={`text-xs ${overallThemeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Lifestyle Curator</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsVoiceMode(!isVoiceMode)}
                  className={`p-2 rounded-full transition-colors ${isVoiceMode ? 'bg-green-500/20 text-green-400' : `${overallThemeBrightness === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'}`}`}
                  title="Toggle Voice Mode"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsAudioDescriptionMode(!isAudioDescriptionMode)}
                  className={`p-2 rounded-full transition-colors ${isAudioDescriptionMode ? 'bg-green-500/20 text-green-400' : `${overallThemeBrightness === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'}`}`}
                  title="Toggle Audio"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowTutorial(true)}
                  className={`p-2 rounded-full transition-colors ${overallThemeBrightness === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'}`}
                  title="Help"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                    style={{ background: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})` }}
                  >
                    <User className="w-5 h-5 text-white" />
                  </button>
                  {showProfile && (
                    <div
                      className={`absolute right-0 mt-2 w-64 backdrop-blur-xl border rounded-xl shadow-2xl p-4 ${overallThemeBrightness === 'dark' ? 'bg-gray-900/90 border-white/20 text-white' : 'bg-white/90 border-black/20 text-black'}`}
                    >
                      <div className="flex items-center space-x-3 pb-3 border-b" style={{ borderColor: dynamicColors[0] + '40' }}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})` }}>
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">{userProfile.name}</p>
                          <p className={`text-xs ${overallThemeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{userProfile.email}</p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <button
                          className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${overallThemeBrightness === 'dark' ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-black/10'}`}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
          <div className="flex justify-center mb-8">
            <div className={`p-1.5 rounded-full flex space-x-2 backdrop-blur-md ${overallThemeBrightness === 'dark' ? 'bg-black/20' : 'bg-white/20'}`}>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center space-x-2 ${activeTab === 'create' ? 'text-white shadow-lg' : `${overallThemeBrightness === 'dark' ? 'text-gray-300' : 'text-gray-800'} hover:bg-white/10`}`}
                style={activeTab === 'create' ? { background: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})` } : {}}
              >
                <Wand2 className="w-4 h-4" />
                <span>Create</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('saved');
                  loadSavedChats();
                }}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center space-x-2 ${activeTab === 'saved' ? 'text-white shadow-lg' : `${overallThemeBrightness === 'dark' ? 'text-gray-300' : 'text-gray-800'} hover:bg-white/10`}`}
                style={activeTab === 'saved' ? { background: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})` } : {}}
              >
                <Bookmark className="w-4 h-4" />
                <span>Saved ({savedVibes.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center space-x-2 ${activeTab === 'activity' ? 'text-white shadow-lg' : `${overallThemeBrightness === 'dark' ? 'text-gray-300' : 'text-gray-800'} hover:bg-white/10`}`}
                style={activeTab === 'activity' ? { background: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})` } : {}}
              >
                <Clock className="w-4 h-4" />
                <span>Activity</span>
              </button>
            </div>
          </div>

          {activeTab === 'create' && (
            <div>
              {showGreeting && !generatedContent && (
                <div className="max-w-3xl mx-auto mb-8 backdrop-blur-lg border rounded-2xl p-6 shadow-xl" style={{ background: `linear-gradient(to right, ${dynamicColors[0]}20, ${dynamicColors[1]}20)`, borderColor: dynamicColors[0] + '33' }}>
                  <div className="flex items-center space-x-4">
                    <Sparkles className="w-8 h-8" style={{ color: complementaryColors.primary }} />
                    <div>
                      <h2 className={`text-2xl font-bold ${mainTextColorClass}`}>Hey {userProfile.name}, Let's Craft Your Perfect Vibe!</h2>
                      <p className={`mt-2 text-sm ${overallThemeBrightness === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Dive into a world of inspiration. Describe your mood, and let VibeCraft bring it to life!</p>
                    </div>
                  </div>
                </div>
              )}
              <div className={`max-w-3xl mx-auto backdrop-blur-lg border rounded-2xl p-6 shadow-xl ${overallThemeBrightness === 'dark' ? 'bg-black/30 border-white/10' : 'bg-white/30 border-black/10'}`}>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={handleInputChange}
                    onInput={handleTextareaResize}
                    placeholder={isListening ? 'Listening...' : isVoiceMode ? 'Speak your vibe...' : 'Describe your ideal vibe, mood, or aesthetic...'}
                    className={`w-full bg-transparent text-lg resize-none focus:outline-none pr-40 pb-2 ${mainTextColorClass} ${placeholderColorClass}`}
                    rows="1"
                    disabled={isGenerating || isVoiceMode}
                    style={{ minHeight: '40px' }}
                  />
                  <div className="absolute top-0 right-0 flex items-center space-x-2">
                    <button
                      onClick={toggleVoiceRecognition}
                      className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500/30 text-red-300 animate-pulse' : `${overallThemeBrightness === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'}`}`}
                      disabled={isGenerating}
                      title={isListening ? 'Stop Listening' : 'Use Voice Input'}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={(e) => handleButtonClick('generate', e)}
                      disabled={isGenerating || !inputText.trim() || isVoiceMode}
                      className="px-4 py-2 rounded-full font-semibold flex items-center space-x-2 text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                      style={{ background: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})` }}
                      type="button"
                    >
                      {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      <span>{isGenerating ? 'Crafting...' : 'Generate'}</span>
                    </button>
                  </div>
                </div>
                {voiceTranscript && (
                  <p className={`text-sm mt-2 ${overallThemeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Heard: "{voiceTranscript}"</p>
                )}
              </div>
              {!generatedContent && !isGenerating && (
                <div className="max-w-4xl mx-auto mt-8">
                  <div className="text-center mb-4">
                    <h3 className={`text-lg font-semibold ${overallThemeBrightness === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Or try a quick prompt to get started!</h3>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {quickPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => setInputText(prompt)}
                        className={`px-4 py-2 border rounded-full text-sm transition-colors ${overallThemeBrightness === 'dark' ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-black/5 border-black/10 text-gray-700 hover:bg-black/10'}`}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-12 flex justify-center">
                {isGenerating && (
                  <div className="flex flex-col items-center justify-center text-center p-8">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: complementaryColors.primary }} />
                    <p className="text-xl font-semibold">Crafting your custom vibe...</p>
                    <p className={`${overallThemeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>The AI is getting creative, one moment!</p>
                  </div>
                )}
                {generatedContent && (
                  <div className="max-w-4xl w-full">
                    <VibeCard ref={generatedVibeCardRef} vibe={generatedContent} {...cardProps} />
                    <div className="mt-4 text-center text-lg font-semibold" style={{ color: complementaryColors.accent }}>
                      {comfortMessage}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="relative w-full md:max-w-xs">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${overallThemeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder="Search vibes..."
                    value={searchQuery}
                    onChange={(e) => debouncedSetSearchQuery(e.target.value)}
                    className={`w-full border rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 backdrop-blur-md transition-colors ${overallThemeBrightness === 'dark' ? 'bg-black/20 border-white/10 focus:ring-white' : 'bg-white/20 border-black/10 focus:ring-black'}`}
                    style={{ '--tw-ring-color': dynamicColors[0] }}
                  />
                </div>
                <div className={`flex items-center space-x-1 p-1 rounded-full backdrop-blur-md ${overallThemeBrightness === 'dark' ? 'bg-black/20' : 'bg-white/20'}`}>
                  {['all', ...categories.slice(0, 5).map(c => c.id)].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${filterCategory === cat ? 'bg-white/20' : 'hover:bg-white/10'}`}
                    >
                      {cat === 'all' ? 'All' : categories.find(c => c.id === cat).name}
                    </button>
                  ))}
                </div>
                <div className={`flex items-center space-x-1 p-1 rounded-full backdrop-blur-md ${overallThemeBrightness === 'dark' ? 'bg-black/20' : 'bg-white/20'}`}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                    title="Grid View"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-full transition-colors ${viewMode === 'list' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                    title="List View"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {sharedVibe || filteredVibes.length > 0 ? (
                <div className={`transition-all duration-500 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col items-center space-y-6'}`}>
                  {sharedVibe && (
                    <div className="w-full md:col-span-2 lg:col-span-3">
                      <h3 className="text-xl font-bold mb-4 text-center">Shared Vibe</h3>
                      <LazyVibeCard key={sharedVibe.id} vibe={sharedVibe} {...cardProps} />
                    </div>
                  )}
                  {filteredVibes
                    .filter(vibe => vibe.id !== sharedVibe?.id)
                    .map(vibe => (
                      <LazyVibeCard key={vibe.id} vibe={vibe} {...cardProps} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Search className={`w-12 h-12 mx-auto mb-4 ${overallThemeBrightness === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <h3 className="text-xl font-semibold">No Saved Vibes Found</h3>
                  <p className={`${overallThemeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Your saved vibes will appear here. Go create some!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="max-w-3xl mx-auto">
              <div className={`backdrop-blur-lg border rounded-2xl p-6 shadow-xl ${overallThemeBrightness === 'dark' ? 'bg-black/30 border-white/10' : 'bg-white/30 border-black/10'}`}>
                <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                {recentActivity.length > 0 ? (
                  <ul className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <li
                        key={index}
                        className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors ${overallThemeBrightness === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}
                        onClick={() => {
                          const vibe = savedVibes.find(v => v.chatId === activity.chatId) || generatedContent;
                          if (vibe) {
                            setDynamicColors(vibe.colors);
                            setBackgroundGradient(`linear-gradient(to bottom right, ${vibe.colors[1]}, ${vibe.colors[2]})`);
                            setActiveTab('saved');
                          }
                        }}
                      >
                        <Clock className="w-5 h-5" style={{ color: complementaryColors.primary }} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className={`text-xs ${overallThemeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{activity.time}</p>
                        </div>
                        <ArrowRight className="w-5 h-5" />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={`text-center ${overallThemeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>No recent activity yet. Start creating vibes!</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;