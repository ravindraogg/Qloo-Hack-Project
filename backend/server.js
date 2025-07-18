import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createCanvas, loadImage } from 'canvas';
import axios from 'axios';
dotenv.config({ quiet: true });
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const QLOO_API_KEY = process.env.QLOO_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;
const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;
const PORT = process.env.PORT || 5000;

if (!GEMINI_API_KEY || !QLOO_API_KEY || !JWT_SECRET || !MONGODB_URI || !UNSPLASH_API_KEY) {
    console.error('[CONFIG] Missing required environment variables at', new Date().toISOString());
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
console.log('[INIT] Google Generative AI client initialized at', new Date().toISOString());

const app = express();

app.use(cors());
app.use(express.json());
console.log('[MIDDLEWARE] CORS and JSON parsing middleware applied at', new Date().toISOString());

mongoose.connect(MONGODB_URI)
    .then(() => console.log('[DB] Connected to MongoDB at', new Date().toISOString()))
    .catch((err) => {
        console.error('[DB] MongoDB connection error:', err.message, 'at', new Date().toISOString());
        process.exit(1);
    });

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
console.log('[MODEL] User model defined at', new Date().toISOString());

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [{
        role: String,
        content: String,
        timestamp: { type: Date, default: Date.now }
    }],
    vibe: {
        title: String,
        mood: String,
        description: String,
        music: [String],
        food: [String],
        fashion: [String],
        travel: [String],
        decor: [String],
        colors: [String],
        imageUrls: [String], 
        categories: [String],
        icons: {
            music: String,
            food: String,
            fashion: String,
            travel: String,
            decor: String
        },
        timestamp: { type: Date, default: Date.now }
    },
    isSaved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }
});

const Chat = mongoose.model('Chat', chatSchema);
console.log('[MODEL] Chat model defined at', new Date().toISOString());

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('[AUTH] Received token check for request at', new Date().toISOString(), 'Token:', token ? 'Present' : 'Absent');
    if (!token) {
        console.log('[AUTH] No token provided, sending 401 at', new Date().toISOString());
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        console.log('[AUTH] Token verified successfully for userId:', req.userId, 'at', new Date().toISOString());
        next();
    } catch (error) {
        console.error('[AUTH] Token verification error:', error.message, 'at', new Date().toISOString());
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Register Endpoint
app.post('/api/auth/register', async (req, res) => {
    console.log('[ROUTE] Received register request at', new Date().toISOString(), 'Body:', req.body);
    try {
        const { name, email, password, confirmPassword } = req.body;
        if (!email || !password || !confirmPassword) {
            console.log('[ROUTE] Missing fields in register request at', new Date().toISOString());
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (password !== confirmPassword) {
            console.log('[ROUTE] Passwords do not match at', new Date().toISOString());
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        if (password.length < 6) {
            console.log('[ROUTE] Password too short at', new Date().toISOString());
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('[ROUTE] Email already exists:', email, 'at', new Date().toISOString());
            return res.status(400).json({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        console.log('[DB] User saved successfully:', { email, id: user._id }, 'at', new Date().toISOString());

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        console.log('[AUTH] Generated token for userId:', user._id, 'at', new Date().toISOString());

        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error('[ROUTE] Registration error:', error.message, 'at', new Date().toISOString());
        res.status(500).json({ message: 'Server error' });
    }
});

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
    console.log('[ROUTE] Received login request at', new Date().toISOString(), 'Body:', req.body);
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            console.log('[ROUTE] Missing fields in login request at', new Date().toISOString());
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.log('[ROUTE] User not found for email:', email, 'at', new Date().toISOString());
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('[ROUTE] Password mismatch for email:', email, 'at', new Date().toISOString());
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        console.log('[AUTH] Generated token for userId:', user._id, 'at', new Date().toISOString());

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error('[ROUTE] Login error:', error.message, 'at', new Date().toISOString());
        res.status(500).json({ message: 'Server error' });
    }
});

// Profile Endpoint
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    console.log('[ROUTE] Received profile request for userId:', req.userId, 'at', new Date().toISOString());
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            console.log('[ROUTE] User not found for userId:', req.userId, 'at', new Date().toISOString());
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('[DB] Profile fetched successfully for userId:', req.userId, 'at', new Date().toISOString());
        res.json({
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error('[ROUTE] Profile error:', error.message, 'at', new Date().toISOString());
        res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint to get all saved chats for a user
app.get('/api/chats', authenticateToken, async (req, res) => {
    console.log('[ROUTE] Received request for saved chats for userId:', req.userId, 'at', new Date().toISOString());
    try {
        const chats = await Chat.find({ userId: req.userId, isSaved: true }).sort({ createdAt: -1 });
        console.log(`[DB] Found ${chats.length} saved chats for userId:`, req.userId);
        res.json(chats);
    } catch (error) {
        console.error('[ROUTE] Error fetching saved chats:', error.message, 'at', new Date().toISOString());
        res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint to get recent activity for a user
app.get('/api/activity', authenticateToken, async (req, res) => {
    console.log('[ROUTE] Received request for activity for userId:', req.userId, 'at', new Date().toISOString());
    try {
        const recentChats = await Chat.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(5);
        console.log(`[DB] Found ${recentChats.length} recent activities for userId:`, req.userId);
        res.json(recentChats);
    } catch (error) {
        console.error('[ROUTE] Error fetching activity:', error.message, 'at', new Date().toISOString());
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/vibe/generate', async (req, res) => {
    // Determine if this is a landing page request
    const isLandingPage = req.headers['x-landing-page'] === 'true';
    console.log('[ROUTE] Received vibe generation request for userId:', req.userId || 'anonymous', 'at', new Date().toISOString(), 'Input:', req.body.input, 'Is Landing Page:', isLandingPage);

    // Apply authentication only if not a landing page request
    if (!isLandingPage) {
        try {
            // Assuming authenticateToken is a middleware function that sets req.userId
            await new Promise((resolve, reject) => {
                authenticateToken(req, res, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (err) {
            console.log('[AUTH] Authentication failed at', new Date().toISOString(), err.message);
            return res.status(401).json({ message: 'Authentication required' });
        }
    }

    const { input } = req.body;

    if (!input || input.trim() === '') {
        console.log('[ROUTE] Empty input received at', new Date().toISOString());
        return res.status(400).json({ message: 'Input cannot be empty' });
    }
    if (input.length > 500) {
        console.log('[ROUTE] Input exceeds 500 characters at', new Date().toISOString());
        return res.status(400).json({ message: 'Input exceeds 500 characters' });
    }

    try {
        // Mood Classification
        const moodPrompt = `
Classify the mood of the following user input into one of these categories: happy, calm, energetic, nostalgic, or neutral. Return only the mood category as a string.

Input: "${input}"
`;
        const moodModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const moodResult = await moodModel.generateContent(moodPrompt);
        const moodText = await moodResult.response.text();
        const classifiedMood = moodText.trim() || 'neutral';
        console.log('[GEMINI] Classified mood:', classifiedMood, 'at', new Date().toISOString());

        // Fetch mood-relevant images from Unsplash
        const imageQuery = `${classifiedMood} aesthetic`;
        console.log('[UNSPLASH] Fetching images for query:', imageQuery, 'at', new Date().toISOString());
        const unsplashRes = await axios.get('https://api.unsplash.com/search/photos', {
            params: { query: imageQuery, per_page: 4, orientation: 'landscape' },
            headers: { Authorization: `Client-ID ${UNSPLASH_API_KEY}` }
        });

        if (!unsplashRes.data.results || unsplashRes.data.results.length === 0) {
            console.error('[UNSPLASH] No images found for query:', imageQuery, 'at', new Date().toISOString());
            throw new Error('No images found for query: ' + imageQuery);
        }

        const imageUrls = unsplashRes.data.results.map(result => result.urls.regular);
        console.log('[UNSPLASH] Fetched image URLs:', imageUrls, 'at', new Date().toISOString());

        // Fetch tags from Qloo API
        console.log('[QLOO] Fetching tags for input:', input, 'at', new Date().toISOString());
        const tagsRes = await fetch('https://hackathon.api.qloo.com/v2/tags', {
            method: 'POST',
            headers: {
                'x-api-key': QLOO_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filter: {
                    query: input.split(' ').filter(word => word.length > 0).join(' '),
                },
            }),
        });

        if (!tagsRes.ok) {
            const errorData = await tagsRes.json();
            console.error('[QLOO] Failed to fetch tags:', errorData.errors?.[0]?.message || 'Unknown error', 'at', new Date().toISOString());
            throw new Error('Failed to fetch tags: ' + (errorData.errors?.[0]?.message || 'Unknown error'));
        }

        const tagsData = await tagsRes.json();
        if (!tagsData.results || !Array.isArray(tagsData.results.tags)) {
            console.error('[QLOO] Invalid tags response structure:', JSON.stringify(tagsData), 'at', new Date().toISOString());
            throw new Error('Invalid tags response structure: ' + JSON.stringify(tagsData));
        }

        const tagIds = tagsData.results.tags.map(tag => tag.id).filter(id => id).slice(0, 2);
        console.log('[QLOO] Fetched tag IDs:', tagIds, 'at', new Date().toISOString());

        let finalTagIds = tagIds;
        if (tagIds.length === 0) {
            finalTagIds = ['urn:tag:genre:music:indie_music', 'urn:tag:genre:music:vinyl_records'];
            console.log('[QLOO] No tags found, using fallback tags:', finalTagIds, 'at', new Date().toISOString());
        }

        if (finalTagIds.length === 0) {
            console.error('[QLOO] No valid tags found for input:', input, 'at', new Date().toISOString());
            throw new Error('No valid tags found for input: ' + input);
        }

        const baseUrl = 'https://hackathon.api.qloo.com/v2/insights';
        const params = new URLSearchParams({
            'filter.type': 'urn:entity:artist',
            'signal.interests.tags': finalTagIds.join(','),
            'output': ['music', 'food', 'fashion', 'travel', 'decor'].join(','),
        }).toString();
        const url = `${baseUrl}?${params}`;
        console.log('[QLOO] Calling Insights API with URL:', url, 'at', new Date().toISOString());

        const qlooRes = await fetch(url, {
            method: 'GET',
            headers: { 'x-api-key': QLOO_API_KEY },
        });

        if (!qlooRes.ok) {
            const errorData = await qlooRes.json();
            console.error('[QLOO] Insights API failure:', errorData.error?.message || 'Unknown error', 'at', new Date().toISOString());
            throw new Error('Qloo API failure: ' + (errorData.error?.message || 'Unknown error'));
        }

        const qlooData = await qlooRes.json();
        if (!qlooData || Object.keys(qlooData).length === 0) {
            console.error('[QLOO] No results returned for input:', input, 'at', new Date().toISOString());
            throw new Error('Qloo returned no results for input: ' + input);
        }
        console.log('[QLOO] Insights data received successfully at', new Date().toISOString());

        const prompt = `
You are a highly creative lifestyle design assistant. Your task is to craft a personalized lifestyle vibe based on the user's input: "${input}". Use the provided Qloo AI data as a reference, but prioritize the user's input to ensure the response feels relevant and tailored. The classified mood is "${classifiedMood}". The tone should be engaging, modern, and reflective of the user's preferences, avoiding generic or unrelated suggestions.

Return a strict JSON object with this structure:
{
  "title": "string (a catchy, unique name for the vibe)",
  "mood": "string (e.g., 'Relaxed and Cozy', 'Energetic and Bold', descriptive and aligned with input)",
  "description": "string (a vivid, 1-2 sentence description that captures the vibe's essence)",
  "music": ["string", "string", "string"] (3 specific music genres or artists relevant to the input),
  "food": ["string", "string", "string"] (3 specific food items or cuisines that fit the vibe),
  "fashion": ["string", "string", "string"] (3 fashion styles or items that match the mood),
  "decor": ["string", "string", "string"] (3 decor elements or styles for the setting),
  "travel": ["string", "string", "string"] (3 travel destinations or experiences that complement the vibe),
  "colors": ["#HEXCODE", "#HEXCODE", "#HEXCODE"] (3 hex color codes that reflect the mood),
  "imageUrls": ["string", "string", "string", "string"] (4 URLs to placeholder images from Unsplash, matching the vibe),
  "icons": {
    "music": "string (lucide-react icon name, e.g., 'Music')",
    "food": "string (lucide-react icon name, e.g., 'Utensils')",
    "fashion": "string (lucide-react icon name, e.g., 'Shirt')",
    "travel": "string (lucide-react icon name, e.g., 'MapPin')",
    "decor": "string (lucide-react icon name, e.g., 'Sofa')"
  }
}

Guidelines:
- Ensure all fields are filled with creative, input-relevant content.
- Avoid generic placeholders (e.g., 'Curated Playlist'); make it specific.
- If Qloo data is sparse, invent plausible, input-inspired details.
- Use modern, appealing language and avoid outdated or irrelevant suggestions.
- Use the classified mood "${classifiedMood}" to guide the tone and selections.
- For imageUrls, use the provided Unsplash URLs: ${JSON.stringify(imageUrls)}.
- For icons, select appropriate lucide-react icons that match the categories.
- Wrap the output in \`\`\`json\`\`\` markers.

Example for input "I love indie films and vinyl records":
\`\`\`json
{
  "title": "Indie Vinyl Haven",
  "mood": "Relaxed and Nostalgic",
  "description": "A cozy retreat where the crackle of vinyl meets the charm of indie cinema.",
  "music": ["Indie Folk", "Lo-fi Hip Hop", "Vinyl Jazz"],
  "food": ["Artisan Flatbreads", "Craft Coffee", "Dark Chocolate Truffles"],
  "fashion": ["Oversized Cardigans", "High-Waisted Jeans", "Retro Sneakers"],
  "decor": ["Vintage Record Shelves", "Warm Edison Bulbs", "Plush Rugs"],
  "travel": ["Portland, Oregon", "Austin, Texas", "Montreal, Canada"],
  "colors": ["#8B4513", "#DAA520", "#F5F5DC"],
  "imageUrls": ["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop", "...", "...", "..."],
  "icons": {
    "music": "Music",
    "food": "Utensils",
    "fashion": "Shirt",
    "travel": "MapPin",
    "decor": "Sofa"
  }
}
\`\`\`

Based on this Qloo AI data:
${JSON.stringify(qlooData)}
`;
        console.log('[GEMINI] Sending prompt to Gemini API at', new Date().toISOString());

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log('[GEMINI] Received response from Gemini API at', new Date().toISOString(), 'Response:', text);

        const match = text.match(/```json([\s\S]*?)```/);
        if (!match) {
            console.error('[GEMINI] Invalid response format, no JSON block found at', new Date().toISOString(), 'Text:', text);
            throw new Error('Invalid Gemini response: No JSON block found');
        }

        const rawJson = match[1].trim();
        const vibe = JSON.parse(rawJson);
        console.log('[GEMINI] Parsed vibe data successfully:', vibe, 'at', new Date().toISOString());

        // Save chat only if authenticated and not from landing page
        if (!isLandingPage && req.userId) {
            const newChat = new Chat({
                userId: req.userId,
                messages: [{ role: 'user', content: input }, { role: 'assistant', content: 'Generated new vibe successfully!' }],
                vibe: { ...vibe, categories: vibe.music.length ? ['music'] : [], timestamp: new Date(), imageUrls },
                isSaved: false
            });
            await newChat.save();
            console.log('[DB] New chat saved with ID:', newChat._id, 'at', new Date().toISOString());
            res.json({ ...vibe, chatId: newChat._id, isSaved: newChat.isSaved });
        } else {
            console.log('[ROUTE] Returning vibe without saving for landing page or unauthenticated request at', new Date().toISOString());
            res.json(vibe);
        }
    } catch (error) {
        console.error('[ROUTE] Error in vibe generation:', error.message, 'at', new Date().toISOString());
        res.status(500).json({ message: error.message || 'Failed to generate vibe' });
    }
});

app.post('/api/vibe/save/:chatId', authenticateToken, async (req, res) => {
    console.log('[ROUTE] Received save request for chatId:', req.params.chatId, 'for userId:', req.userId, 'at', new Date().toISOString());
    try {
        const chat = await Chat.findOne({ _id: req.params.chatId, userId: req.userId });
        if (!chat) {
            console.log('[ROUTE] Chat not found for chatId:', req.params.chatId, 'userId:', req.userId, 'at', new Date().toISOString());
            return res.status(404).json({ message: 'Chat not found' });
        }

        chat.isSaved = true;
        await chat.save();
        console.log('[DB] Chat saved successfully with ID:', chat._id, 'for userId:', req.userId, 'at', new Date().toISOString());

        res.json({ message: 'Vibe saved successfully', chatId: chat._id });
    } catch (error) {
        console.error('[ROUTE] Error saving vibe:', error.message, 'at', new Date().toISOString());
        res.status(500).json({ message: 'Failed to save vibe' });
    }
});

// TTS Playback Endpoint
app.post('/api/vibe/tts/:chatId', authenticateToken, async (req, res) => {
    console.log('[ROUTE] Received TTS request for chatId:', req.params.chatId, 'for userId:', req.userId, 'at', new Date().toISOString());
    try {
        const chat = await Chat.findOne({ _id: req.params.chatId, userId: req.userId });
        if (!chat || !chat.vibe) {
            console.log('[ROUTE] Chat or vibe not found for chatId:', req.params.chatId, 'userId:', req.userId, 'at', new Date().toISOString());
            return res.status(404).json({ message: 'Vibe not found' });
        }

        const { title, mood, description, music, food, fashion, travel, decor } = chat.vibe;
        const ttsTextContent = `
${title}. Mood: ${mood}. ${description}.
Music: ${music?.join(', ') || 'None'}.
Food: ${food?.join(', ') || 'None'}.
Fashion: ${fashion?.join(', ') || 'None'}.
Travel: ${travel?.join(', ') || 'None'}.
Decor: ${decor?.join(', ') || 'None'}.
`;

        console.log('[TTS] Generating TTS for text:', ttsTextContent, 'at', new Date().toISOString());
        const ttsPrompt = `Generate a natural, engaging audio narration for the following text, suitable for a lifestyle vibe description. Return the audio data as a base64-encoded MP3 string: "${ttsTextContent}"`;

        const ttsModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const ttsResult = await ttsModel.generateContent(ttsPrompt);
        const ttsResponse = await ttsResult.response;
        const ttsText = ttsResponse.text();
        console.log('[TTS] Received TTS response at', new Date().toISOString());

        const match = ttsText.match(/data:audio\/mp3;base64,([\s\S]*)/);
        if (!match) {
            console.error('[TTS] Invalid TTS response format, no base64 audio found at', new Date().toISOString());
            throw new Error('Invalid TTS response: No base64 audio found');
        }

        const audioBase64 = match[1];
        res.json({ audio: audioBase64 });
    } catch (error) {
        console.error('[ROUTE] Error generating TTS:', error.message, 'at', new Date().toISOString());
        res.status(500).json({ message: 'Failed to generate TTS' });
    }
});

// Generate PNG Endpoint
app.get('/api/vibe/png/:chatId', authenticateToken, async (req, res) => {
    console.log('[ROUTE] Received PNG request for chatId:', req.params.chatId, 'for userId:', req.userId, 'at', new Date().toISOString());
    try {
        const chat = await Chat.findOne({ _id: req.params.chatId, userId: req.userId });
        if (!chat || !chat.vibe) {
            console.log('[ROUTE] Chat or vibe not found for chatId:', req.params.chatId, 'userId:', req.userId, 'at', new Date().toISOString());
            return res.status(404).json({ message: 'Vibe not found' });
        }

        const { title, mood, description, colors, music, food, fashion, travel, decor, imageUrls } = chat.vibe;
        const canvas = createCanvas(800, 600);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = colors[0] || '#FF6B6B';
        ctx.fillRect(0, 0, 800, 600);

        // Image Grid (2x2)
        const imageSize = 180;
        const padding = 20;
        for (let i = 0; i < Math.min(imageUrls.length, 4); i++) {
            const x = (i % 2) * (imageSize + padding) + padding;
            const y = Math.floor(i / 2) * (imageSize + padding) + padding;
            try {
                const img = await loadImage(imageUrls[i]);
                ctx.drawImage(img, x, y, imageSize, imageSize);
            } catch (error) {
                console.error('[CANVAS] Error loading image:', imageUrls[i], error.message, 'at', new Date().toISOString());
            }
        }

        // Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(title || 'Untitled Vibe', 20, 450);
        ctx.font = '16px Arial';
        ctx.fillText(`Mood: ${mood || 'Unknown'}`, 20, 480);
        ctx.fillText(description || 'No description', 20, 510);

        // Details
        ctx.font = '14px Arial';
        ctx.fillText(`Music: ${music?.join(', ') || 'None'}`, 20, 540);
        ctx.fillText(`Food: ${food?.join(', ') || 'None'}`, 20, 560);
        ctx.fillText(`Fashion: ${fashion?.join(', ') || 'None'}`, 20, 580);
        ctx.fillText(`Travel: ${travel?.join(', ') || 'None'}`, 400, 540);
        ctx.fillText(`Decor: ${decor?.join(', ') || 'None'}`, 400, 560);

        // Output PNG
        const stream = canvas.createPNGStream();
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/[^a-zA-Z0-9]/g, '_')}_vibe.png"`);
        stream.pipe(res);
    } catch (error) {
        console.error('[ROUTE] Error generating PNG:', error.message, 'at', new Date().toISOString());
        res.status(500).json({ message: 'Failed to generate PNG' });
    }
});

app.listen(PORT, () => console.log('[SERVER] Running on port', PORT, 'at', new Date().toISOString()));