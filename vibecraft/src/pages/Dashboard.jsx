import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Sparkles, Music, HelpCircle, MapPin, Palette, Coffee, Home, ShoppingBag, Volume2, VolumeX, Mic, MicOff, Download, Share2, User, Settings, LogOut, Send, Eye, Heart, Star, Play, Pause, RefreshCw, Image, FileText, Loader2, X, ChevronRight, ZapOff, Calendar, Clock, Bookmark, Grid, List, Filter, Search, Save, Plus, ArrowRight, Headphones, Camera, Utensils, Shirt, Plane, Sofa, Wand2, Globe, Target, Zap, AlertCircle, CheckCircle, Info, Smile, ThumbsUp
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold">Something Went Wrong</h2>
          <p className="mt-2">Please refresh or try again later.</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 rounded-full">Reload</button>
        </div>
      </div>
    );
  }
  return children;
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
  const [showExportOptions, setShowExportOptions] = useState(false);
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

  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const audioRef = useRef(null);
  const textareaRef = useRef(null);
  const profileRef = useRef(null);
  const exportOptionsRef = useRef(null);
  const vibeCardRef = useRef(null);

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

  const sanitizeInput = (input) => (input && typeof input === 'string' ? input.trim().replace(/[<>]/g, '') : '');
  const validateHexColor = (color) => /^#[0-9A-Fa-f]{6}$/.test(color);

  const getThemeBrightness = useCallback((colors) => {
    if (!colors || !Array.isArray(colors) || colors.length === 0) return 'dark';
    try {
        const avgLuminance = colors.reduce((sum, color) => {
            const cleanColor = color.replace(/`/g, '').trim();
            const hex = cleanColor.replace('#', '');
            const rgb = parseInt(hex, 16);
            const r = (rgb >> 16) & 0xff;
            const g = (rgb >>  8) & 0xff;
            const b = (rgb >>  0) & 0xff;
            const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            return sum + luminance;
        }, 0) / colors.length;
        
        return avgLuminance > 140 ? 'light' : 'dark'; 
    } catch (e) {
        return 'dark';
    }
  }, []);

  const getComplementaryColors = useCallback((colors) => {
    if (!colors || !Array.isArray(colors)) return {};
    const primaryColor = colors[0]?.replace(/`/g, '').trim() || '#6B46C1';
    const secondaryColor = colors[1]?.replace(/`/g, '').trim() || '#EC4899';
    return {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: colors[2]?.replace(/`/g, '').trim() || '#10B981'
    };
  }, []);

  const getMoodFromVibe = (vibe) => {
    const moodMap = {
      'Nostalgic and Upbeat': 'energetic',
      'happy': ['joy', 'fun', 'bright', 'excited'],
      'calm': ['relax', 'peace', 'cozy', 'quiet'],
      'energetic': ['active', 'adventure', 'dynamic', 'bold', 'upbeat']
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
      utterance.rate = 0.8; utterance.pitch = 1; utterance.volume = 0.8;
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
    if (!token) {
      addNotification('Please log in', 'error');
      handleLogout();
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/chats', { 
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch saved vibes: ${response.statusText}`);
      }
      const chats = await response.json();
      if (!Array.isArray(chats)) {
        throw new Error('Invalid response format: expected an array');
      }
      const formattedVibes = chats.map(chat => {
        const vibe = chat.vibe || {};
        return {
          ...vibe,
          chatId: chat._id || chat.chatId, 
          id: chat._id || chat.chatId, 
          timestamp: new Date(chat.createdAt).toLocaleString(),
          isSaved: chat.isSaved || false,
          title: sanitizeInput(vibe.title) || `Untitled Vibe ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
          mood: sanitizeInput(vibe.mood) || "Personalized",
          description: sanitizeInput(vibe.description) || `A personalized lifestyle experience.`,
          categories: vibe.categories || ['mood'],           colors: Array.isArray(vibe.colors) && vibe.colors.length >= 3 ? vibe.colors.slice(0, 3).map(color => validateHexColor(color) ? color : '#FFFFFF') : ['#FF6B6B', '#4ECDC4', '#45B7D1'],
          music: Array.isArray(vibe.music) ? vibe.music : [],
          food: Array.isArray(vibe.food) ? vibe.food : [],
          fashion: Array.isArray(vibe.fashion) ? vibe.fashion : [],
          travel: Array.isArray(vibe.travel) ? vibe.travel : [],
          decor: Array.isArray(vibe.decor) ? vibe.decor : [],
          imageUrls: Array.isArray(vibe.imageUrls) && vibe.imageUrls.length > 0 ? vibe.imageUrls : ["https://images.unsplash.com/photo-1497515114629-f71d767d0461?w=800&h=600&fit=crop"],
          icons: {
            music: vibe.icons?.music || 'Music',
            food: vibe.icons?.food || 'Utensils',
            fashion: vibe.icons?.fashion || 'Shirt',
            travel: vibe.icons?.travel || 'MapPin',
            decor: vibe.icons?.decor || 'Sofa'
          } || {
            music: 'Music',
            food: 'Utensils',
            fashion: 'Shirt',
            travel: 'MapPin',
            decor: 'Sofa'
          },
          isSaved: chat.isSaved || false
        };
      }).filter(vibe => vibe.chatId); 
      setSavedVibes(formattedVibes);
      if (formattedVibes.length === 0) addNotification('No saved vibes', 'info');
    } catch (error) {
      console.error('Error loading chats:', error);
      addNotification(`Failed to load saved vibes: ${error.message}`, 'error');
      setSavedVibes([]); 
    }
  }, [addNotification, handleLogout]);

  const loadRecentActivity = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/activity', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error('Failed to fetch recent activity');
      const activities = await response.json();
      setRecentActivity(activities.map(activity => ({
        type: 'generated',
        title: `Created "${activity.vibe.title}"`,
        time: new Date(activity.createdAt).toLocaleString(),
        chatId: activity._id
      })));
    } catch (error) {
      console.error('Error loading activity:', error);
      addNotification('Failed to load recent activity', 'error');
    }
  }, [addNotification]);

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
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else {
        addNotification('No token found', 'error');
        speakText('Please log in.');
        handleLogout();
        return;
      }

      const response = await fetch('http://localhost:5000/api/vibe/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ input: sanitizedInput }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data || typeof data !== 'object') throw new Error('Invalid response format');

      const newVibeCategories = [];
      ['music', 'food', 'fashion', 'travel', 'decor'].forEach(cat => data[cat]?.length > 0 && newVibeCategories.push(cat));
      if (newVibeCategories.length === 0) newVibeCategories.push('mood');

      const defaultColors = ['#FF6B6B', '#4ECDC4', '#45B7D1'];
      const vibeColors = Array.isArray(data.colors) && data.colors.length >= 3
        ? data.colors.slice(0, 3).map(color => {
            const cleanColor = color.replace(/`/g, '').trim();
            return validateHexColor(cleanColor) ? cleanColor : defaultColors[data.colors.indexOf(color) % 3] || '#FFFFFF';
          })
        : defaultColors;

      const newVibe = {
        id: data.chatId,
        chatId: data.chatId,
        timestamp: new Date().toLocaleString(),
        title: sanitizeInput(data.title) || `Generated Vibe ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
        mood: sanitizeInput(data.mood) || "Personalized",
        description: sanitizeInput(data.description) || `A personalized lifestyle experience.`,
        categories: newVibeCategories,
        colors: vibeColors,
        music: Array.isArray(data.music) ? data.music : [],
        food: Array.isArray(data.food) ? data.food : [],
        fashion: Array.isArray(data.fashion) ? data.fashion : [],
        travel: Array.isArray(data.travel) ? data.travel : [],
        decor: Array.isArray(data.decor) ? data.decor : [],
        imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : ["https://images.unsplash.com/photo-1497515114629-f71d767d0461?w=800&h=600&fit=crop"],
        icons: data.icons || {
          music: 'Music',
          food: 'Utensils',
          fashion: 'Shirt',
          travel: 'MapPin',
          decor: 'Sofa'
        },
        isSaved: data.isSaved || false
      };

      setGeneratedContent(newVibe);
      setSavedVibes(prev => [newVibe, ...prev.filter(v => v.chatId !== newVibe.chatId)]);
      setConversation(prev => [...prev, { role: 'assistant', content: `Welcome, ${userProfile.name}! Vibe generated.` }]);

      const mood = getMoodFromVibe(newVibe);
      setUiTheme(mood);
      
      setDynamicColors(vibeColors);
      const newBackgroundGradient = `linear-gradient(to bottom right, ${vibeColors[1]}, ${vibeColors[2]})`;
      setBackgroundGradient(newBackgroundGradient);
      speakText(`Welcome, ${userProfile.name}! Generated a ${mood} vibe called ${newVibe.title}.`);
      setRecentActivity(prev => [{ type: 'generated', title: `Created "${newVibe.title}"`, time: 'Just now', chatId: data.chatId }, ...prev.slice(0, 4)]);
      setInputText(''); setVoiceTranscript('');
      addNotification('Vibe generated', 'success');
      speakText('Vibe generated successfully.');
    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage = error.name === 'AbortError' ? 'Request timed out. Try again.' : error.message.includes('token') ? 'Please log in.' : 'Failed to generate vibe.';
      addNotification(errorMessage, 'error');
      speakText(errorMessage);
      setConversation(prev => [...prev, { role: 'error', content: errorMessage }]);
    } finally {
      setIsGenerating(false);
    }
  }, [inputText, isOnline, addNotification, speakText, userProfile.name, handleLogout]);

  const saveVibe = useCallback(async (chatId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      addNotification('Please log in', 'error');
      speakText('Please log in to save.');
      handleLogout();
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/vibe/save/${chatId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      if (response.ok) {
        setSavedVibes(prev => prev.map(v => v.chatId === chatId ? { ...v, isSaved: true } : v));
        setGeneratedContent(prev => prev?.chatId === chatId ? { ...prev, isSaved: true } : prev);
        addNotification(data.message, 'success');
        speakText(data.message);
        setRecentActivity(prev => [{ type: 'saved', title: 'Saved vibe', time: new Date().toLocaleString(), chatId }, ...prev.slice(0, 4)]);
      } else throw new Error(data.message || 'Save failed');
    } catch (error) {
      console.error('Save error:', error);
      addNotification('Failed to save', 'error');
      speakText('Failed to save vibe.');
    }
  }, [addNotification, handleLogout]);

  const playTTS = useCallback(async (chatId) => {
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
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
  }, [addNotification, speakText, handleLogout]);

  const stopTTS = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentPlayingAudio(null);
      addNotification('TTS stopped', 'success');
      speakText('TTS stopped.');
    }
  }, [addNotification, speakText]);

  const exportVibe = useCallback((vibe, format) => {
    if (!vibe) return;
    try {
      const exportData = {
        title: sanitizeInput(vibe.title), mood: sanitizeInput(vibe.mood), categories: vibe.categories || [],
        details: { music: vibe.music || [], food: vibe.food || [], fashion: vibe.fashion || [], travel: vibe.travel || [], decor: vibe.decor || [] },
        colors: vibe.colors || [], description: sanitizeInput(vibe.description), timestamp: new Date().toISOString(), imageUrls: vibe.imageUrls
      };
      if (format === 'json') {
        const dataStr = JSON.stringify(exportData, null, 2);
        const link = document.createElement('a');
        link.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        link.download = `${vibe.title.replace(/[^a-zA-Z0-9]/g, '_')}_vibe.json`;
        link.click();
        addNotification('Exported as JSON', 'success');
        speakText('Exported as JSON.');
      } else if (format === 'png') {
        html2canvas(vibeCardRef.current).then(canvas => {
          const link = document.createElement('a');
          link.download = `${vibe.title.replace(/[^a-zA-Z0-9]/g, '_')}_vibe.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          addNotification('Exported as PNG', 'success');
          speakText('Exported as PNG.');
        });
      } else if (format === 'pdf') {
        const doc = new jsPDF();
        doc.text(vibe.title, 10, 10); doc.setFontSize(12);
        doc.text(`Mood: ${vibe.mood}`, 10, 20); doc.text(`Description: ${vibe.description}`, 10, 30);
        doc.text(`Categories: ${vibe.categories.join(', ')}`, 10, 40);
        doc.save(`${vibe.title.replace(/[^a-zA-Z0-9]/g, '_')}_vibe.pdf`);
        addNotification('Exported as PDF', 'success');
        speakText('Exported as PDF.');
      } else if (format === 'share') {
        const shareUrl = `${window.location.origin}/share/${vibe.chatId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
          addNotification('Share link copied', 'success');
          speakText('Share link copied.');
        }).catch(() => {
          addNotification('Failed to copy link', 'error');
          speakText('Failed to copy share link.');
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      addNotification('Export failed', 'error');
      speakText('Failed to export vibe.');
    }
    setShowExportOptions(false);
  }, [addNotification]);

  const handleTextareaResize = useCallback((e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }, []);

  const filteredVibes = useMemo(() => savedVibes.filter(vibe => {
    const matchesCategory = filterCategory === 'all' || vibe.categories?.includes(filterCategory);
    const matchesSearch = !searchQuery || vibe.title?.toLowerCase().includes(searchQuery.toLowerCase()) || vibe.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [savedVibes, filterCategory, searchQuery]);

  const useClickOutside = (ref, handler) => {
    useEffect(() => {
      const listener = (event) => ref.current && !ref.current.contains(event.target) && handler();
      document.addEventListener('mousedown', listener);
      return () => document.removeEventListener('mousedown', listener);
    }, [ref, handler]);
  };

  useClickOutside(profileRef, () => setShowProfile(false));
  useClickOutside(exportOptionsRef, () => setShowExportOptions(false));

  const complementaryColors = useMemo(() => getComplementaryColors(dynamicColors), [dynamicColors, getComplementaryColors]);
  const themeBrightness = useMemo(() => getThemeBrightness(dynamicColors), [dynamicColors, getThemeBrightness]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/auth';
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/api/auth/profile', { headers: { 'Authorization': `Bearer ${token}` } });
        if (response.ok) {
          const data = await response.json();
          setUserProfile({ name: data.user.name, email: data.user.email });
        } else throw new Error('Profile fetch failed');
      } catch (error) {
        console.error('Auth error:', error);
        handleLogout();
      }
    };
    fetchProfile();
    loadSavedChats();
    loadRecentActivity();
  }, [handleLogout, loadSavedChats, loadRecentActivity]);

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
        const transcript = Array.from(event.results).map(r => r[0].transcript).join(' ');
        setVoiceTranscript(sanitizeInput(transcript));
        setInputText(sanitizeInput(transcript));
        speakText(`You said: ${transcript}`);
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
    if (!hasSeenTutorial) setShowTutorial(true);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (recognitionRef.current) recognitionRef.current.stop();
      if (speechSynthesisRef.current) speechSynthesisRef.current.cancel();
    };
  }, [addNotification, speakText]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleGenerate();
      else if ((e.ctrlKey || e.metaKey) && e.key === 'k') document.querySelector('input[placeholder="Search vibes..."]')?.focus();
      else if (e.ctrlKey || e.metaKey) switch (e.key) {
        case '1': setActiveTab('create'); break;
        case '2': setActiveTab('saved'); break;
        case '3': setActiveTab('activity'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate]);

  useEffect(() => {
    const handleGesture = (e) => {
      if (e.type === 'swipeleft' && activeTab !== 'create') setActiveTab('create');
      else if (e.type === 'swiperight' && activeTab !== 'activity') setActiveTab('activity');
    };
    window.addEventListener('swipeleft', handleGesture);
    window.addEventListener('swiperight', handleGesture);
    return () => {
      window.removeEventListener('swipeleft', handleGesture);
      window.removeEventListener('swiperight', handleGesture);
    };
  }, [activeTab]);

  const LazyVibeCard = ({ vibe }) => {
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef(null);
    useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      }, { threshold: 0.1 });
      if (cardRef.current) {
        observer.observe(cardRef.current);
      }
      return () => observer.disconnect();
    }, []);
    return isVisible ? <VibeCard ref={cardRef} vibe={vibe} /> : <div ref={cardRef} className="h-48 bg-gray-800/20 rounded-2xl animate-pulse" />;
  };

  const NotificationIcon = ({ type }) => {
    const iconProps = { className: "w-5 h-5" };
    switch (type) {
      case 'success': return <CheckCircle {...iconProps} />;
      case 'error': return <AlertCircle {...iconProps} />;
      default: return <Info {...iconProps} />;
    }
  };

  const VibeCard = React.forwardRef(({ vibe }, ref) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoScroll, setIsAutoScroll] = useState(true);
    const slideshowRef = useRef(null);

    useEffect(() => {
      let interval;
      if (isAutoScroll && vibe?.imageUrls?.length > 1) {
        interval = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % (vibe.imageUrls.length || 1));
        }, 3000);
      }
      return () => clearInterval(interval);
    }, [isAutoScroll, vibe?.imageUrls]);

    const IconMap = {
      Music: Music,
      Utensils: Utensils,
      Shirt: Shirt,
      MapPin: MapPin,
      Sofa: Sofa
    };

    const cardThemeBrightness = getThemeBrightness(vibe?.colors || []);
    const titleColorClass = cardThemeBrightness === 'dark' ? 'text-white' : 'text-black';
    const textColorClass = cardThemeBrightness === 'dark' ? 'text-gray-300' : 'text-gray-700';
    const mutedTextColorClass = cardThemeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-600';
    const semiBoldTextColorClass = cardThemeBrightness === 'dark' ? 'text-gray-200' : 'text-gray-800';

    return (
      <div ref={ref || vibeCardRef} className={`bg-black/30 backdrop-blur-lg border rounded-2xl overflow-hidden shadow-2xl hover:-translate-y-1 transition-transform duration-300 w-full ${themeBrightness === 'dark' ? 'border-white/10' : 'border-black/10'}`} style={{'--primary-color': complementaryColors.primary, '--secondary-color': complementaryColors.secondary}}>
        <div ref={slideshowRef} className="relative w-full h-48 overflow-hidden">
          {vibe?.imageUrls && vibe.imageUrls.length > 0 && (
            <>
              <div className="absolute inset-0 flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {vibe.imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`${vibe.title} ${index + 1}`}
                    className="w-full h-48 object-cover flex-shrink-0"
                    onError={(e) => e.target.src = "https://images.unsplash.com/photo-1497515114629-f71d767d0461?w=800&h=600&fit=crop"}
                  />
                ))}
              </div>
              {vibe.imageUrls.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {vibe.imageUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-gray-400'}`}
                    />
                  ))}
                </div>
              )}
              {vibe.imageUrls.length > 1 && (
                <div className="absolute top-1/2 left-2 transform -translate-y-1/2">
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + (vibe.imageUrls.length || 1)) % (vibe.imageUrls.length || 1))}
                    className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <ChevronRight className="w-6 h-6 rotate-180" />
                  </button>
                </div>
              )}
              {vibe.imageUrls.length > 1 && (
                <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % (vibe.imageUrls.length || 1))}
                    className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => setIsAutoScroll(!isAutoScroll)}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                  title={isAutoScroll ? 'Pause Auto-Scroll' : 'Start Auto-Scroll'}
                >
                  {isAutoScroll ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
              </div>
            </>
          )}
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className={`text-xl font-bold ${titleColorClass}`}>{vibe?.title || 'Untitled Vibe'}</h3>
              <p className={`text-xs ${mutedTextColorClass}`}>{vibe?.timestamp || 'N/A'}</p>
            </div>
            <div className="flex space-x-2">
              {!vibe?.isSaved && vibe?.chatId && <button onClick={() => saveVibe(vibe.chatId)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white" title="Save"><Save className="w-4 h-4" /></button>}
              {vibe?.chatId && <button onClick={() => exportVibe(vibe, 'share')} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white" title="Share"><Share2 className="w-4 h-4" /></button>}
              {vibe?.chatId && <button onClick={() => currentPlayingAudio === vibe.chatId ? stopTTS() : playTTS(vibe.chatId)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white" title={currentPlayingAudio === vibe.chatId ? 'Stop TTS' : 'Play TTS'}>
                {currentPlayingAudio === vibe.chatId ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>}
            </div>
          </div>
          <p className={`mb-4 text-sm ${textColorClass}`}>{vibe?.description || 'No description available.'}</p>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4" style={{color: complementaryColors.primary}} />
              <div className="flex flex-wrap gap-2">
                {(vibe?.colors || []).map(color => <div key={color} className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: color }} title={color} />)}
              </div>
            </div>
            {[
              { icon: vibe?.icons?.music || 'Music', label: 'Music', items: vibe?.music || [] },
              { icon: vibe?.icons?.food || 'Utensils', label: 'Food', items: vibe?.food || [] },
              { icon: vibe?.icons?.fashion || 'Shirt', label: 'Fashion', items: vibe?.fashion || [] },
              { icon: vibe?.icons?.travel || 'MapPin', label: 'Travel', items: vibe?.travel || [] },
              { icon: vibe?.icons?.decor || 'Sofa', label: 'Decor', items: vibe?.decor || [] }
            ].map(({ icon, label, items }) => {
              const Icon = IconMap[icon] || Palette;
              return items.length > 0 && (
                <div key={label} className="flex items-start space-x-2">
                  <Icon className="w-4 h-4 mt-1" style={{color: complementaryColors.primary}} />
                  <div>
                    <span className={`text-sm font-semibold ${semiBoldTextColorClass}`}>{label}:</span>
                    <span className={`text-sm ${textColorClass}`}> {items.join(', ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  });

  const handleVoiceCommand = useCallback((command) => {
    const lowerCommand = command.toLowerCase();
    if (lowerCommand.includes('switch to create')) setActiveTab('create');
    else if (lowerCommand.includes('switch to saved')) setActiveTab('saved');
    else if (lowerCommand.includes('switch to activity')) setActiveTab('activity');
    else if (lowerCommand.includes('generate')) handleGenerate();
    else if (lowerCommand.includes('save vibe') && generatedContent) saveVibe(generatedContent.chatId);
    else if (lowerCommand.includes('export') && generatedContent) exportVibe(generatedContent, 'pdf');
    else if (lowerCommand.includes('play tts') && generatedContent) playTTS(generatedContent.chatId);
    else if (lowerCommand.includes('stop tts')) stopTTS();
    else if (lowerCommand.includes('help')) setShowTutorial(true);
    else speakText('Command not recognized. Say "help" for options.');
  }, [generatedContent, handleGenerate, saveVibe, exportVibe, playTTS, stopTTS, setActiveTab, setShowTutorial, speakText]);
  
  const overallThemeBrightness = getThemeBrightness(dynamicColors);
  const mainTextColorClass = overallThemeBrightness === 'dark' ? 'text-white' : 'text-black';
  const placeholderColorClass = overallThemeBrightness === 'dark' ? 'placeholder-gray-400' : 'placeholder-gray-500';

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-black ${mainTextColorClass} font-sans transition-all duration-500`} style={{ background: backgroundGradient }}>
        <audio ref={audioRef} />
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
          {notifications.map(notification => (
            <div key={notification.id} className={`p-4 rounded-xl backdrop-blur-xl border shadow-lg flex items-start space-x-3 animate-slide-in-right ${notification.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-200' : notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-200' : 'bg-blue-500/20 border-blue-500/30 text-blue-200'}`}>
              <NotificationIcon type={notification.type} />
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs opacity-75 mt-1">{notification.timestamp.toLocaleTimeString()}</p>
              </div>
              <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))} className="text-current opacity-50 hover:opacity-75"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>

        {!isOnline && (
          <div className="fixed top-4 left-4 z-50 bg-red-500/20 border border-red-500/30 rounded-lg p-3 backdrop-blur-xl">
            <div className="flex items-center space-x-2 text-red-200"><ZapOff className="w-5 h-5" /><span className="text-sm">Offline Mode</span></div>
          </div>
        )}

        {showTutorial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTutorial(false)}></div>
            <div className="relative z-10 w-full max-w-3xl bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent mb-6">Welcome to VibeCraft</h3>
              <p className="text-gray-300 mb-6">Your personal AI-powered lifestyle curator. Describe any mood, and VibeCraft will instantly generate a complete aesthetic for you.</p>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3"><div><h4 className="font-semibold text-white">Create Your Vibe</h4><p className="text-gray-300 text-sm">Use text or voice to describe your ideal mood.</p></div></div>
                  <div className="flex items-center space-x-3"><div><h4 className="font-semibold text-white">Dynamic Themes</h4><p className="text-gray-300 text-sm">The entire app theme changes to match your vibe's colors.</p></div></div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3"><div><h4 className="font-semibold text-white">Voice Commands</h4><p className="text-gray-300 text-sm">Use commands like "generate" or "save vibe" for hands-free control.</p></div></div>
                  <div className="flex items-center space-x-3"><div><h4 className="font-semibold text-white">Save & Share</h4><p className="text-gray-300 text-sm">Save your favorite vibes and share them with friends.</p></div></div>
                </div>
              </div>
              <div className="flex justify-center"><button onClick={() => { setShowTutorial(false); localStorage.setItem('hasSeenTutorial', 'true'); }} className="px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform" style={{background: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})`}}>Let's Go!</button></div>
            </div>
          </div>
        )}

        <nav className={`fixed top-0 w-full z-40 backdrop-blur-xl border-b transition-colors duration-300 ${overallThemeBrightness === 'dark' ? 'bg-black/20 border-white/10' : 'bg-white/20 border-black/10'}`}>
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})`}}><Sparkles className="w-6 h-6 text-white" /></div>
                <div><span className="text-xl font-bold bg-clip-text text-transparent" style={{backgroundImage: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})`}}>VibeCraft</span><div className={`text-xs ${overallThemeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Lifestyle Curator</div></div>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => { setIsVoiceMode(!isVoiceMode); speakText(`Voice mode ${isVoiceMode ? 'off' : 'on'}.`); }} className={`p-2 rounded-full transition-colors ${isVoiceMode ? 'bg-green-500/20 text-green-400' : `${overallThemeBrightness === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'}`}`} title="Toggle Voice Mode"><Mic className="w-5 h-5" /></button>
                <button onClick={() => setIsAudioDescriptionMode(!isAudioDescriptionMode)} className={`p-2 rounded-full transition-colors ${isAudioDescriptionMode ? 'bg-green-500/20 text-green-400' : `${overallThemeBrightness === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'}`}`} title="Toggle Audio"><Volume2 className="w-5 h-5" /></button>
                <button onClick={() => setShowTutorial(true)} className={`p-2 rounded-full transition-colors ${overallThemeBrightness === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'}`} title="Help"><HelpCircle className="w-5 h-5" /></button>
                <div ref={profileRef} className="relative">
                  <button onClick={() => setShowProfile(!showProfile)} className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform" style={{background: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})`}}><User className="w-5 h-5 text-white" /></button>
                  {showProfile && (
                    <div className={`absolute right-0 mt-2 w-64 backdrop-blur-xl border rounded-xl shadow-2xl p-4 ${overallThemeBrightness === 'dark' ? 'bg-gray-900/90 border-white/20 text-white' : 'bg-white/90 border-black/20 text-black'}`}>
                      <div className="flex items-center space-x-3 pb-3 border-b" style={{borderColor: dynamicColors[0] + '40'}}><div className="w-12 h-12 rounded-full flex items-center justify-center" style={{background: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})`}}><User className="w-6 h-6 text-white" /></div><div><p className="font-semibold">{userProfile.name}</p><p className={`text-xs ${overallThemeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{userProfile.email}</p></div></div>
                      <div className="mt-3 space-y-1"><button className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${overallThemeBrightness === 'dark' ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-black/10'}`}><Settings className="w-4 h-4" /><span>Settings</span></button><button onClick={handleLogout} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><LogOut className="w-4 h-4" /><span>Log Out</span></button></div>
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
              <button onClick={() => setActiveTab('create')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center space-x-2 ${activeTab === 'create' ? 'text-white shadow-lg' : `${overallThemeBrightness === 'dark' ? 'text-gray-300' : 'text-gray-800'} hover:bg-white/10`}`} style={activeTab === 'create' ? {background: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})`} : {}}><Wand2 className="w-4 h-4" /><span>Create</span></button>
              <button onClick={() => { setActiveTab('saved'); loadSavedChats(); }} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center space-x-2 ${activeTab === 'saved' ? 'text-white shadow-lg' : `${overallThemeBrightness === 'dark' ? 'text-gray-300' : 'text-gray-800'} hover:bg-white/10`}`} style={activeTab === 'saved' ? {background: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})`} : {}}><Bookmark className="w-4 h-4" /><span>Saved ({savedVibes.length})</span></button>
              <button onClick={() => setActiveTab('activity')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center space-x-2 ${activeTab === 'activity' ? 'text-white shadow-lg' : `${overallThemeBrightness === 'dark' ? 'text-gray-300' : 'text-gray-800'} hover:bg-white/10`}`} style={activeTab === 'activity' ? {background: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})`} : {}}><Clock className="w-4 h-4" /><span>Activity</span></button>
            </div>
          </div>

          {activeTab === 'create' && (
            <div className="animate-fade-in">
              {showGreeting && !generatedContent && (
                <div className="max-w-3xl mx-auto mb-8 backdrop-blur-lg border rounded-2xl p-6 shadow-xl transition-colors animate-slide-in-down" style={{ background: `linear-gradient(to right, ${dynamicColors[0]}20, ${dynamicColors[1]}20)`, borderColor: dynamicColors[0] + '33' }}>
                  <div className="flex items-center space-x-4">
                    <Sparkles className="w-8 h-8" style={{ color: complementaryColors.primary }} />
                    <div>
                      <h2 className={`text-2xl font-bold ${mainTextColorClass}`}>
                        Hey {userProfile.name}, Let's Craft Your Perfect Vibe!
                      </h2>
                      <p className={`mt-2 text-sm ${overallThemeBrightness === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Dive into a world of inspiration. Describe your mood, and let VibeCraft bring it to life!
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className={`max-w-3xl mx-auto backdrop-blur-lg border rounded-2xl p-6 shadow-xl transition-colors ${overallThemeBrightness === 'dark' ? 'bg-black/30 border-white/10' : 'bg-white/30 border-black/10'}`}>
                <div className="relative">
                  <textarea ref={textareaRef} value={inputText} onChange={(e) => { setInputText(e.target.value); handleTextareaResize(e); }} onInput={handleTextareaResize} placeholder={isListening ? 'Listening...' : isVoiceMode ? 'Speak your vibe...' : "Describe your ideal vibe, mood, or aesthetic..."} className={`w-full bg-transparent text-lg resize-none focus:outline-none pr-40 pb-2 ${mainTextColorClass} ${placeholderColorClass}`} rows="1" disabled={isGenerating || isVoiceMode} />
                  <div className="absolute top-0 right-0 flex items-center space-x-2">
                    <button onClick={toggleVoiceRecognition} className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500/30 text-red-300 animate-pulse' : `${overallThemeBrightness === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'}`}`} disabled={isGenerating} title={isListening ? 'Stop Listening' : 'Use Voice Input'}>{isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}</button>
                    <button onClick={handleGenerate} disabled={isGenerating || !inputText.trim() || isVoiceMode} className="px-4 py-2 rounded-full font-semibold flex items-center space-x-2 text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100" style={{background: `linear-gradient(to right, ${dynamicColors[0]}, ${dynamicColors[1]})`}}>{isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}<span>{isGenerating ? 'Crafting...' : 'Generate'}</span></button>
                  </div>
                </div>
                {voiceTranscript && <p className={`text-sm mt-2 ${overallThemeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Heard: "{voiceTranscript}"</p>}
              </div>
              {!generatedContent && !isGenerating && (
                <div className="max-w-4xl mx-auto mt-8"><div className="text-center mb-4"><h3 className={`text-lg font-semibold ${overallThemeBrightness === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Or try a quick prompt to get started!</h3></div><div className="flex flex-wrap justify-center gap-3">{quickPrompts.map((prompt, index) => <button key={index} onClick={() => setInputText(prompt)} className={`px-4 py-2 border rounded-full text-sm transition-colors ${overallThemeBrightness === 'dark' ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-black/5 border-black/10 text-gray-700 hover:bg-black/10'}`}>{prompt}</button>)}</div></div>
              )}
              <div className="mt-12 flex justify-center">
                {isGenerating && <div className="flex flex-col items-center justify-center text-center p-8"><Loader2 className="w-12 h-12 animate-spin mb-4" style={{color: complementaryColors.primary}} /><p className="text-xl font-semibold">Crafting your custom vibe...</p><p className={`${overallThemeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>The AI is getting creative, one moment!</p></div>}
                {generatedContent && <div className="max-w-4xl w-full animate-fade-in"><VibeCard vibe={generatedContent} /><div className="mt-4 text-center text-lg font-semibold animate-pulse" style={{color: complementaryColors.accent}}>{comfortMessage}</div></div>}
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="relative w-full md:max-w-xs">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${overallThemeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input type="text" placeholder="Search vibes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full border rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 backdrop-blur-md transition-colors ${overallThemeBrightness === 'dark' ? 'bg-black/20 border-white/10 focus:ring-white' : 'bg-white/20 border-black/10 focus:ring-black'}`} style={{'--tw-ring-color': dynamicColors[0]}} />
                </div>
                <div className={`flex items-center space-x-1 p-1 rounded-full backdrop-blur-md ${overallThemeBrightness === 'dark' ? 'bg-black/20' : 'bg-white/20'}`}>
                  {['all', ...categories.slice(0, 5).map(c => c.id)].map(cat => (
                    <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-3 py-1 text-sm rounded-full transition-colors ${filterCategory === cat ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                      {cat === 'all' ? 'All' : categories.find(c => c.id === cat).name}
                    </button>
                  ))}
                </div>
                <div className={`flex items-center space-x-1 p-1 rounded-full backdrop-blur-md ${overallThemeBrightness === 'dark' ? 'bg-black/20' : 'bg-white/20'}`}>
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-white/20' : 'hover:bg-white/10'}`} title="Grid View"><Grid className="w-5 h-5" /></button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-full transition-colors ${viewMode === 'list' ? 'bg-white/20' : 'hover:bg-white/10'}`} title="List View"><List className="w-5 h-5" /></button>
                </div>
              </div>
              {filteredVibes.length > 0 ? (
                <div className={`transition-all duration-500 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col items-center space-y-6'}`}>
                  {filteredVibes.map(vibe => (
                    <LazyVibeCard key={vibe.id} vibe={vibe} />
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
            <div className="animate-fade-in max-w-3xl mx-auto">
              <div className={`backdrop-blur-lg border rounded-2xl p-6 shadow-xl transition-colors ${overallThemeBrightness === 'dark' ? 'bg-black/30 border-white/10' : 'bg-white/30 border-black/10'}`}>
                <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                {recentActivity.length > 0 ? (
                  <ul className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <li key={index} className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors ${overallThemeBrightness === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`} onClick={() => { const vibe = savedVibes.find(v => v.chatId === activity.chatId); if(vibe) { setDynamicColors(vibe.colors); setBackgroundGradient(`linear-gradient(to bottom right, ${vibe.colors[1]}, ${vibe.colors[2]})`); setGeneratedContent(vibe); setActiveTab('create');} }}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'generated' ? 'bg-blue-500/20' : 'bg-green-500/20'}`}>
                          {activity.type === 'generated' ? <Wand2 className="w-4 h-4 text-blue-300" /> : <Bookmark className="w-4 h-4 text-green-300" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.title}</p>
                          <p className={`text-xs ${overallThemeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{activity.time}</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${overallThemeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <Clock className={`w-12 h-12 mx-auto mb-4 ${overallThemeBrightness === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                    <h3 className="text-xl font-semibold">No Recent Activity</h3>
                    <p className={`${overallThemeBrightness === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Your journey starts now. Generate a vibe to see it here!</p>
                  </div>
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