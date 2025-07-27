import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Sparkles, Music, MapPin, Palette, Utensils, Shirt, Sofa, Loader2, X, Play, Pause, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Info, ZapOff
} from 'lucide-react';
import DOMPurify from 'dompurify';
const base = import.meta.env.VITE_BACKEND_URL;

const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  return DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

const validateImageUrl = (url) => {
  try {
    const parsed = new URL(url);
    const isImagePath = /\.(jpeg|jpg|png|gif)$/i.test(parsed.pathname);
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
        const hex = color.replace('#', '');
        const rgb = parseInt(hex, 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        return sum + (0.2126 * r + 0.7152 * g + 0.0722 * b);
      }, 0) / colors.length;
      return avgLuminance > 140 ? 'light' : 'dark';
    } catch (e) {
      return 'dark';
    }
  };

// --- Independent, Memoized Components ---

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      setHasError(true);
      setError(event.error || new Error('An unknown error occurred.'));
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center bg-gray-800 p-8 rounded-2xl shadow-lg">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold">Something Went Wrong</h2>
          <p className="mt-2 text-gray-300">An unexpected error occurred. Please try refreshing the page.</p>
          <p className="mt-2 text-xs text-gray-500">Error: {error?.message || 'Unknown'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            Refresh Page
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
  React.forwardRef(({ vibe, complementaryColors, overallThemeBrightness, defaultImage }, ref) => {
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

    const handleImageError = useCallback((e) => {
      if (e.target.src !== defaultImage) e.target.src = defaultImage;
      e.target.onerror = null;
    }, [defaultImage]);

    return (
      <div
        ref={ref}
        className={`bg-black/30 backdrop-blur-lg border rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 w-full max-w-2xl min-h-[480px] flex flex-col ${overallThemeBrightness === 'dark' ? 'border-white/10' : 'border-black/10'}`}
        style={{ '--primary-color': complementaryColors.primary, '--secondary-color': complementaryColors.secondary }}
      >
        <style>{`.ken-burns-animation { animation: kenburns 10s ease-out forwards; } @keyframes kenburns { 0% { transform: scale(1) translate(0, 0); } 100% { transform: scale(1.15) translate(-2%, 2%); } }`}</style>
        <div className={`absolute inset-0 bg-gray-800/20 z-10 transition-opacity duration-500 ${isContentReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: complementaryColors.primary }} />
          </div>
        </div>
        <div className="relative w-full h-48 overflow-hidden group">
          {validImageUrls.length > 0 && (
            <div className="absolute inset-0 flex">
              {validImageUrls.map((url, index) => (
                <div key={`${vibe.id}-img-${index}`} className="w-full h-full absolute top-0 left-0 transition-opacity duration-1000 ease-in-out" style={{ opacity: currentSlide === index ? 1 : 0 }}>
                  <img src={url} alt={`${sanitizeInput(vibe.title)} ${index + 1}`} className={`w-full h-full object-cover ${currentSlide === index ? 'ken-burns-animation' : ''}`} onError={handleImageError} crossOrigin="anonymous" />
                </div>
              ))}
            </div>
          )}
          {validImageUrls.length > 1 && (
            <>
              <button onClick={(e) => handleInteractiveClick(e, prevSlide)} className="absolute top-1/2 left-2 -translate-y-1/2 z-20 p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100" title="Previous"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={(e) => handleInteractiveClick(e, nextSlide)} className="absolute top-1/2 right-2 -translate-y-1/2 z-20 p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100" title="Next"><ChevronRight className="w-5 h-5" /></button>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                {validImageUrls.map((_, index) => (<button key={index} onClick={(e) => handleInteractiveClick(e, () => setCurrentSlide(index))} className={`w-2 h-2 rounded-full transition-all ${currentSlide === index ? 'bg-white scale-125' : 'bg-gray-400'}`} />))}
              </div>
              <div className="absolute top-2 right-2 z-10">
                <button onClick={(e) => handleInteractiveClick(e, () => setIsAutoScroll(!isAutoScroll))} className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70" title={isAutoScroll ? 'Pause Auto-Scroll' : 'Start Auto-Scroll'}>{isAutoScroll ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}</button>
              </div>
            </>
          )}
        </div>
        <div className="p-6 flex-1 flex flex-col">
          {vibe.spotifyTracks && vibe.spotifyTracks.length > 0 && (
            <div className="mb-4">
              <h4 className={`text-sm font-semibold ${semiBoldTextColorClass} mb-2`}>Soundtrack</h4>
              <div className="relative w-full h-20 overflow-hidden">
                  <SpotifyPlayer 
                    trackId={vibe.spotifyTracks[0].id} 
                    trackName={vibe.spotifyTracks[0].name} 
                  />
              </div>
            </div>
          )}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className={`text-xl font-bold ${titleColorClass}`}>{vibe?.title || 'Untitled Vibe'}</h3>
              <p className={`text-xs ${mutedTextColorClass}`}>{vibe?.timestamp || 'N/A'}</p>
            </div>
          </div>
          <p className={`mb-4 text-sm ${textColorClass}`}>{vibe?.description || 'No description available.'}</p>
          <div className="space-y-3 mt-auto">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4" style={{ color: complementaryColors.primary }} />
              <div className="flex flex-wrap gap-2">
                {(vibe?.colors || []).map(color => (<div key={color} className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: color }} title={color} />))}
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
                    <Icon className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: complementaryColors.primary }} />
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


const Shared = () => {
  const { sharedId } = useParams();
  const [sharedVibe, setSharedVibe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [dynamicColors, setDynamicColors] = useState(['#1A202C', '#4A3065', '#1A365D']);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const defaultImage = "https://images.unsplash.com/photo-1511920183276-5942f28b870d?w=800&h=600&fit=crop";

  const validateHexColor = (color) => /^#[0-9A-Fa-f]{6}$/.test(color);

  const sanitizeVibeData = (chat) => {
    if (!chat || typeof chat !== 'object' || !chat.vibe) return null;
    const vibe = chat.vibe;
    return {
      id: chat._id || '',
      chatId: chat._id || '',
      timestamp: new Date(chat.createdAt || Date.now()).toLocaleString(),
      isSaved: vibe.isSaved === true,
      title: sanitizeInput(vibe.title) || 'Shared Vibe',
      mood: sanitizeInput(vibe.mood) || 'Personalized',
      description: sanitizeInput(vibe.description) || 'A shared lifestyle experience.',
      categories: Array.isArray(vibe.categories) ? vibe.categories.map(sanitizeInput).filter(Boolean) : ['mood'],
      colors: Array.isArray(vibe.colors) && vibe.colors.length >= 3
        ? vibe.colors.slice(0, 3).map(color => validateHexColor(color) ? color : '#FFFFFF')
        : ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      music: Array.isArray(vibe.music) ? vibe.music.map(sanitizeInput).filter(Boolean) : [],
      food: Array.isArray(vibe.food) ? vibe.food.map(sanitizeInput).filter(Boolean) : [],
      fashion: Array.isArray(vibe.fashion) ? vibe.fashion.map(sanitizeInput).filter(Boolean) : [],
      travel: Array.isArray(vibe.travel) ? vibe.travel.map(sanitizeInput).filter(Boolean) : [],
      decor: Array.isArray(vibe.decor) ? vibe.decor.map(sanitizeInput).filter(Boolean) : [],
      imageUrls: Array.isArray(vibe.imageUrls) && vibe.imageUrls.length > 0
        ? vibe.imageUrls.map(url => validateImageUrl(url) ? url : defaultImage)
        : [defaultImage],
      spotifyTracks: Array.isArray(vibe.spotifyTracks)
        ? vibe.spotifyTracks.map(track => ({
            id: sanitizeInput(track.id) || '',
            name: sanitizeInput(track.name) || 'Unknown Track',
            artist: sanitizeInput(track.artist) || 'Unknown Artist',
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
  };

  const getComplementaryColors = useCallback((colors) => {
    if (!colors || !Array.isArray(colors)) return {};
    return {
      primary: colors[0] || '#6B46C1',
      secondary: colors[1] || '#EC4899',
      accent: colors[2] || '#10B981',
    };
  }, []);

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const sanitizedMessage = sanitizeInput(message);
    if (!sanitizedMessage) return;
    const notification = { id: Date.now() + Math.random(), message: sanitizedMessage, type, timestamp: new Date() };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== notification.id)), duration);
  }, []);

  const loadSharedVibe = useCallback(async (id) => {
    if (!id) {
      setError('No share ID provided in the link.');
      addNotification('Invalid share link.', 'error');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${base}api/vibe/shared/${sanitizeInput(id)}`, {
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to load shared vibe. Status: ${response.status}`);
      }
      const data = await response.json();
      const sanitizedVibe = sanitizeVibeData(data);
      if (!sanitizedVibe) {
        throw new Error('Invalid shared vibe data received from the server.');
      }
      setSharedVibe(sanitizedVibe);
      setDynamicColors(sanitizedVibe.colors);
      addNotification(`Shared vibe "${sanitizedVibe.title}" loaded!`, 'success');
      setError(null);
    } catch (error) {
      console.error('Load shared vibe error:', error);
      setError(error.message || 'An unknown error occurred while fetching the vibe.');
      addNotification(error.message || 'Failed to load the shared vibe.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    if (sharedVibe && sharedVibe.title) {
      document.title = `VibeCraft - Shared: ${sharedVibe.title}`;
    } else {
      document.title = 'VibeCraft - Shared Vibe';
    }
    return () => { document.title = 'VibeCraft'; };
  }, [sharedVibe]);

  useEffect(() => {
    loadSharedVibe(sharedId);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadSharedVibe, sharedId]);

  const complementaryColors = useMemo(() => getComplementaryColors(dynamicColors), [dynamicColors, getComplementaryColors]);
  const overallThemeBrightness = useMemo(() => getThemeBrightness(dynamicColors), [dynamicColors, getThemeBrightness]);
  const mainTextColorClass = overallThemeBrightness === 'dark' ? 'text-white' : 'text-black';
  const backgroundGradient = useMemo(() => `linear-gradient(to bottom right, ${dynamicColors[1]}, ${dynamicColors[2]})`, [dynamicColors]);

  const NotificationIcon = ({ type }) => {
    const iconProps = { className: 'w-5 h-5' };
    switch (type) {
      case 'success': return <CheckCircle {...iconProps} />;
      case 'error': return <AlertCircle {...iconProps} />;
      default: return <Info {...iconProps} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-black ${mainTextColorClass} font-sans`} style={{ background: backgroundGradient }}>
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
          {notifications.map(notification => (
            <div key={notification.id} className={`p-4 rounded-xl backdrop-blur-xl border shadow-lg flex items-start space-x-3 ${notification.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-200' : notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-200' : 'bg-blue-500/20 border-blue-500/30 text-blue-200'}`}>
              <NotificationIcon type={notification.type} />
              <div className="flex-1"><p className="text-sm font-medium">{notification.message}</p></div>
              <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))} className="text-current opacity-50 hover:opacity-75"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>

        {!isOnline && (
          <div className="fixed top-4 left-4 z-50 bg-red-500/20 border border-red-500/30 rounded-lg p-3 backdrop-blur-xl">
            <div className="flex items-center space-x-2 text-red-200"><ZapOff className="w-5 h-5" /><span>Offline Mode</span></div>
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
                  <span className="text-xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})` }}>VibeCraft</span>
                  <div className={`text-xs ${overallThemeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Shared Vibe</div>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/auth'}
                className="px-5 py-2.5 rounded-full font-semibold text-white hover:scale-105 transition-transform shadow-lg"
                style={{ background: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})` }}
              >
                Try Now
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 pt-24 pb-12 flex items-center justify-center min-h-screen">
          {isLoading && (
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto" style={{ color: complementaryColors.primary }} />
              <p className="mt-4 text-lg font-semibold">Loading Shared Vibe...</p>
            </div>
          )}
          {error && !isLoading && (
            <div className="text-center bg-red-900/30 border border-red-500/50 p-8 rounded-2xl max-w-lg">
              <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
              <h2 className="text-2xl font-bold text-red-300">Could not load vibe</h2>
              <p className="mt-2 text-red-300/80">{error}</p>
            </div>
          )}
          {!isLoading && !error && sharedVibe && (
            <VibeCard 
              vibe={sharedVibe} 
              complementaryColors={complementaryColors}
              overallThemeBrightness={overallThemeBrightness}
              defaultImage={defaultImage}
            />
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default Shared;
