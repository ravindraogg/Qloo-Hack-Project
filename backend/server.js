import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import https from "https";
import crypto from "crypto";
import rateLimit from "express-rate-limit"; 
import Redis from "ioredis"; 
import sanitize from "mongo-sanitize"; 

dotenv.config({ quiet: true });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const QLOO_API_KEY = process.env.QLOO_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGOD_URI;
const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"; 
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

if (
  !GEMINI_API_KEY ||
  !QLOO_API_KEY ||
  !JWT_SECRET ||
  !MONGODB_URI ||
  !UNSPLASH_API_KEY ||
  !SPOTIFY_CLIENT_ID ||
  !SPOTIFY_CLIENT_SECRET ||
  !REDIS_URL
) {
  console.error(
    "[CONFIG] Missing required environment variables at",
    new Date().toISOString()
  );
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
console.log(
  "[INIT] Google Generative AI client initialized at",
  new Date().toISOString()
);

const redis = new Redis(REDIS_URL); 
console.log(
  "[INIT] Redis client initialized at",
  new Date().toISOString()
);

const app = express();

// Rate limiting for authentication routes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiting for other API endpoints
const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for general API calls
  message: {
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRateLimiter); // Apply rate limiting to auth routes
app.use("/api/vibe", generalRateLimiter); // Apply rate limiting to vibe routes
console.log(
  "[MIDDLEWARE] CORS, JSON parsing, and rate limiting middleware applied at",
  new Date().toISOString()
);

mongoose
  .connect(MONGODB_URI)
  .then(() =>
    console.log("[DB] Connected to MongoDB at", new Date().toISOString())
  )
  .catch((err) => {
    console.error(
      "[DB] MongoDB connection error:",
      err.message,
      "at",
      new Date().toISOString()
    );
    process.exit(1);
  });

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
console.log("[MODEL] User model defined at", new Date().toISOString());

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [
    {
      role: String,
      content: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
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
    spotifyTracks: [{ id: String, name: String, preview_url: String }],
    icons: {
      music: String,
      food: String,
      fashion: String,
      travel: String,
      decor: String,
    },
    isSaved: { type: Boolean, default: false },
  },
  shareId: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", chatSchema);
console.log("[MODEL] Chat model defined at", new Date().toISOString());

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vibe: {
    title: String,
  },
  createdAt: { type: Date, default: Date.now },
});

const Activity = mongoose.model("Activity", activitySchema);
console.log("[MODEL] Activity model defined at", new Date().toISOString());

// Authentication Middleware with Token Revocation Check
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    console.error(
      "[AUTH] No token provided in request headers at",
      new Date().toISOString()
    );
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    // Check if token is blacklisted
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      console.error(
        "[AUTH] Blacklisted token attempted at",
        new Date().toISOString()
      );
      return res.status(403).json({ message: "Token has been revoked" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.userId || !decoded.email) {
      console.error(
        "[AUTH] Invalid token payload:",
        decoded,
        "at",
        new Date().toISOString()
      );
      return res.status(403).json({ message: "Invalid token payload" });
    }
    req.user = decoded;
    console.log(
      "[AUTH] Token verified for user:",
      decoded.email,
      "at",
      new Date().toISOString()
    );
    next();
  } catch (error) {
    console.error(
      "[AUTH] Invalid token:",
      error.message,
      "Token: [REDACTED]",
      "at",
      new Date().toISOString()
    );
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

const getSpotifyToken = async () => {
  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error(
      "[SPOTIFY] Error fetching token:",
      error.message,
      "at",
      new Date().toISOString()
    );
    throw new Error("Failed to fetch Spotify token");
  }
};

// Generic Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(
    "[ERROR] Unhandled error:",
    err.message,
    "at",
    new Date().toISOString()
  );
  res.status(500).json({ 
    message: "An unexpected error occurred. Please try again later." 
  });
});

// Routes
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    console.error(
      "[AUTH] Invalid input data at",
      new Date().toISOString()
    );
    return res.status(400).json({ message: "Valid email and password are required" });
  }
  
  // Sanitize inputs
  const sanitizedEmail = sanitize(email);
  const sanitizedName = name ? sanitize(name) : undefined;

  try {
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      console.error(
        "[AUTH] Email already exists:",
        sanitizedEmail,
        "at",
        new Date().toISOString()
      );
      return res.status(400).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds
    const user = new User({ name: sanitizedName, email: sanitizedEmail, password: hashedPassword });
    await user.save();
    console.log(
      "[AUTH] User registered:",
      sanitizedEmail,
      "at",
      new Date().toISOString()
    );
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(
      "[AUTH] Registration error:",
      error.message,
      "at",
      new Date().toISOString()
    );
    res.status(500).json({ message: "An error occurred during registration" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    console.error(
      "[AUTH] Invalid input data at",
      new Date().toISOString()
    );
    return res.status(400).json({ message: "Valid email and password are required" });
  }

  // Sanitize input
  const sanitizedEmail = sanitize(email);

  try {
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      console.error(
        "[AUTH] User not found:",
        sanitizedEmail,
        "at",
        new Date().toISOString()
      );
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error(
        "[AUTH] Incorrect password for:",
        sanitizedEmail,
        "at",
        new Date().toISOString()
      );
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "15m" } // Reduced expiration time
    );
    console.log(
      "[AUTH] User logged in:",
      sanitizedEmail,
      "at",
      new Date().toISOString()
    );
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error(
      "[AUTH] Login error:",
      error.message,
      "at",
      new Date().toISOString()
    );
    res.status(500).json({ message: "An error occurred during login" });
  }
});

// New Logout Endpoint for Token Revocation
app.post("/api/auth/logout", authenticateToken, async (req, res) => {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    // Add token to blacklist with expiration (matching JWT expiration)
    await redis.set(`blacklist:${token}`, "true", "EX", 15 * 60); // 15 minutes
    console.log(
      "[AUTH] Token revoked for user:",
      req.user.email,
      "at",
      new Date().toISOString()
    );
    res.json({ message: "Successfully logged out" });
  } catch (error) {
    console.error(
      "[AUTH] Logout error:",
      error.message,
      "at",
      new Date().toISOString()
    );
    res.status(500).json({ message: "An error occurred during logout" });
  }
});

app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("name email");
    if (!user) {
      console.error(
        "[PROFILE] User not found:",
        req.user.userId,
        "at",
        new Date().toISOString()
      );
      return res.status(404).json({ message: "User not found" });
    }
    console.log(
      "[PROFILE] Profile fetched for:",
      req.user.email,
      "at",
      new Date().toISOString()
    );
    res.json({ user });
  } catch (error) {
    console.error(
      "[PROFILE] Error fetching profile:",
      error.message,
      "at",
      new Date().toISOString()
    );
    res.status(500).json({ message: "An error occurred while fetching profile" });
  }
});

// Generate Vibe with Enhanced Input Validation
app.post("/api/vibe/generate", authenticateToken, async (req, res) => {
  const { input } = req.body;
  
  // Enhanced input validation
  if (!input || typeof input !== "string" || input.trim().length === 0 || input.length > 500) {
    console.error("[VIBE] Invalid input:", input, "at", new Date().toISOString());
    return res.status(400).json({ message: "Input must be a non-empty string (max 500 characters)" });
  }

  // Sanitize input
  const sanitizedInput = sanitize(input.trim());

  try {
    console.log("[VIBE] Processing input:", sanitizedInput, "at", new Date().toISOString());

    const qlooAuthHeader = {
      "X-Api-Key": QLOO_API_KEY,
      accept: "application/json",
    };

    let contextualEntities = {
      places: [],
      brands: [],
      entertainment: [],
      food: []
    };

    try {
      const searchResponse = await axios.get("https://hackathon.api.qloo.com/search", {
        headers: qlooAuthHeader,
        params: {
          query: sanitizedInput,
          limit: 10,
        },
        timeout: 15000,
      });

      if (searchResponse.data?.results) {
        console.log("[QLOO] Found", searchResponse.data.results.length, "entities for:", sanitizedInput, "at", new Date().toISOString());
        
        searchResponse.data.results.forEach(item => {
          const entityType = item.types ? item.types[0] : "";
          const name = item.name || "";
          const id = item.entity_id || item.id;
          
          const irrelevantKeywords = ['school', 'training', 'course', 'education', 'academy', 'institute'];
          const isIrrelevant = irrelevantKeywords.some(keyword => 
            name.toLowerCase().includes(keyword)
          );
          
          if (isIrrelevant) {
            console.log("[FILTER] Skipping irrelevant entity:", name, "at", new Date().toISOString());
            return;
          }

          if (entityType.includes("place") || entityType.includes("location")) {
            contextualEntities.places.push({ id, name, type: entityType });
          } else if (entityType.includes("brand") || entityType.includes("business")) {
            contextualEntities.brands.push({ id, name, type: entityType });
          } else if (entityType.includes("movie") || entityType.includes("tv") || entityType.includes("music")) {
            contextualEntities.entertainment.push({ id, name, type: entityType });
          } else if (entityType.includes("restaurant") || entityType.includes("food")) {
            contextualEntities.food.push({ id, name, type: entityType });
          }
        });
        
        console.log("[CATEGORIZATION] Places:", contextualEntities.places.length, 
                   "Brands:", contextualEntities.brands.length,
                   "Entertainment:", contextualEntities.entertainment.length,
                   "Food:", contextualEntities.food.length, "at", new Date().toISOString());
      }
    } catch (error) {
      console.error("[QLOO] Search failed:", error.message, "at", new Date().toISOString());
    }

    let relevantRecommendations = [];
    const inputLower = sanitizedInput.toLowerCase();
    let primaryIntent = "general";
    
    if (inputLower.includes("travel") || inputLower.includes("vacation") || inputLower.includes("trip")) {
      primaryIntent = "travel";
    } else if (inputLower.includes("food") || inputLower.includes("restaurant") || inputLower.includes("eat")) {
      primaryIntent = "food";
    } else if (inputLower.includes("music") || inputLower.includes("concert") || inputLower.includes("song")) {
      primaryIntent = "entertainment";
    } else if (inputLower.includes("shop") || inputLower.includes("buy") || inputLower.includes("brand")) {
      primaryIntent = "shopping";
    }

    console.log("[INTENT] Detected primary intent:", primaryIntent, "for input:", sanitizedInput, "at", new Date().toISOString());

    try {
      const filterTypeMap = {
        travel: "urn:entity:place",
        food: "urn:entity:restaurant", 
        entertainment: "urn:entity:movie",
        shopping: "urn:entity:brand",
        general: "urn:entity:place"
      };

      const filterType = filterTypeMap[primaryIntent];
      
      if (contextualEntities.places.length > 0 || contextualEntities.brands.length > 0) {
        const signalEntities = [
          ...contextualEntities.places.slice(0, 3),
          ...contextualEntities.brands.slice(0, 2)
        ].map(e => e.id).join(",");

        if (signalEntities) {
          console.log("[QLOO] Getting recommendations with entities:", signalEntities.substring(0, 100), "at", new Date().toISOString());
          
          const insightsResponse = await axios.post(
            "https://hackathon.api.qloo.com/v2/insights", 
            {
              "filter.type": filterType,
              "signal.interests.entities": signalEntities,
              limit: 8
            }, 
            {
              headers: {
                ...qlooAuthHeader,
                "Content-Type": "application/json"
              },
              timeout: 20000,
            }
          );

          if (insightsResponse.data?.success && insightsResponse.data.results?.entities) {
            relevantRecommendations = insightsResponse.data.results.entities;
            console.log("[QLOO] Got", relevantRecommendations.length, "targeted recommendations", "at", new Date().toISOString());
          }
        }
      }
    } catch (error) {
      console.error("[QLOO] Targeted recommendations failed:", error.message, "at", new Date().toISOString());
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    let vibePrompt;
    
    if (relevantRecommendations.length > 0) {
      const filteredRecommendations = relevantRecommendations
        .filter(rec => {
          const name = rec.name || "";
          const irrelevantKeywords = ['school', 'training', 'course', 'education', 'academy', 'institute', 'hospital', 'diagnostic', 'clinic'];
          return !irrelevantKeywords.some(keyword => name.toLowerCase().includes(keyword));
        })
        .slice(0, 5);

      const formattedRecommendations = filteredRecommendations.map((rec, index) => {
        const name = rec.name || "Unknown";
        const type = rec.subtype || rec.type || "Unknown";
        const description = rec.properties?.description || "";
        
        return `${index + 1}. ${name} (${type})${description ? ` - ${description}` : ""}`;
      }).join("\n");

      vibePrompt = `Create a compelling lifestyle vibe based on the user's request: "${sanitizedInput}"

Here are some relevant places/brands for inspiration (use selectively, don't force all):
${formattedRecommendations}

INSTRUCTIONS:
- Create a cohesive lifestyle experience that genuinely matches "${sanitizedInput}"
- Only include travel destinations that make sense for the vibe (no schools, training centers, hospitals)
- Focus on creating an aspirational but authentic experience
- Use the provided recommendations as inspiration, not mandatory inclusions
- If the input is about a mood/feeling, create recommendations that enhance that mood
- Make the description engaging and experiential

Return ONLY valid JSON in this exact format:
{
  "title": "A [descriptive] [input-based] Experience",
  "mood": "[mood that captures the essence of the input]",
  "description": "[engaging 2-3 sentence description of the experience]",
  "music": ["genre or artist that fits the vibe", "another music recommendation", "third recommendation"],
  "food": ["food that fits the experience", "another food recommendation", "third food recommendation"],
  "fashion": ["fashion style that matches", "another fashion element", "third fashion element"],
  "travel": ["meaningful travel destination 1", "meaningful travel destination 2", "meaningful travel destination 3"],
  "decor": ["decor style 1", "decor style 2", "decor style 3"],
  "colors": ["#hexcolor1", "#hexcolor2", "#hexcolor3"],
  "imageUrls": ["placeholder1", "placeholder2", "placeholder3"],
  "categories": ["category1", "category2"],
  "icons": {"music": "Music", "food": "Utensils", "fashion": "Shirt", "travel": "MapPin", "decor": "Home"}
}`;
    } else {
      vibePrompt = `Create an authentic lifestyle vibe based on: "${sanitizedInput}"

Focus on creating a genuine experience that someone would actually want to have. Think about:
- What mood does "${sanitizedInput}" evoke?
- What activities, places, music, food would enhance this mood?
- What would make this experience memorable and shareable?

Return ONLY valid JSON in this exact format:
{
  "title": "A [descriptive] ${sanitizedInput} Experience", 
  "mood": "[authentic mood based on input]",
  "description": "[compelling 2-3 sentence description]",
  "music": ["music genre/artist 1", "music genre/artist 2", "music genre/artist 3"],
  "food": ["food recommendation 1", "food recommendation 2", "food recommendation 3"],
  "fashion": ["fashion element 1", "fashion element 2", "fashion element 3"],
  "travel": ["travel destination 1", "travel destination 2", "travel destination 3"],
  "decor": ["decor style 1", "decor style 2", "decor style 3"], 
  "colors": ["#hexcolor1", "#hexcolor2", "#hexcolor3"],
  "imageUrls": ["placeholder1", "placeholder2", "placeholder3"],
  "categories": ["relevant category 1", "relevant category 2"],
  "icons": {"music": "Music", "food": "Utensils", "fashion": "Shirt", "travel": "MapPin", "decor": "Home"}
}`;
    }

    console.log("[GEMINI] Sending enhanced prompt for:", sanitizedInput, "at", new Date().toISOString());

    const result = await model.generateContent(vibePrompt);
    let rawResponse = result.response.text();

    rawResponse = rawResponse.replace(/```json\n|```/g, "").trim();
    console.log("[GEMINI] Raw response length:", rawResponse.length, "at", new Date().toISOString());
    
    let vibeData;
    try {
      vibeData = JSON.parse(rawResponse);
      
      vibeData.title = vibeData.title || `A ${sanitizedInput} Experience`;
      vibeData.mood = vibeData.mood || "Inspired";
      vibeData.description = vibeData.description || `An experience centered around ${sanitizedInput}.`;
      
      ['music', 'food', 'fashion', 'travel', 'decor'].forEach(category => {
        if (!Array.isArray(vibeData[category]) || vibeData[category].length < 3) {
          vibeData[category] = vibeData[category] || [];
          while (vibeData[category].length < 3) {
            vibeData[category].push(`${category} recommendation ${vibeData[category].length + 1}`);
          }
        }
      });
      
    } catch (parseError) {
      console.error("[GEMINI] JSON parsing failed:", parseError.message, "at", new Date().toISOString());
      return res.status(500).json({ message: "Failed to process AI response" });
    }

    let imageUrls = [];
    const defaultImageUrls = [
      "https://images.unsplash.com/photo-1497515114629-f71d767d0461",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", 
      "https://images.unsplash.com/photo-1519985176271-adb1088fa94c",
    ];

    try {
      const imageSearchQuery = `${vibeData.mood} ${sanitizedInput}`.trim();
      const unsplashResponse = await axios.get("https://api.unsplash.com/search/photos", {
        headers: { Authorization: `Client-ID ${UNSPLASH_API_KEY}` },
        params: { 
          query: imageSearchQuery, 
          per_page: 3, 
          orientation: "landscape",
          content_filter: "high"
        },
        timeout: 10000
      });
      
      if (unsplashResponse.data.results.length > 0) {
        imageUrls = unsplashResponse.data.results.map((result) => result.urls.regular);
        console.log("[UNSPLASH] Found", imageUrls.length, "images for:", imageSearchQuery, "at", new Date().toISOString());
      }
      
      while (imageUrls.length < 3) {
        imageUrls.push(defaultImageUrls[imageUrls.length % defaultImageUrls.length]);
      }
    } catch (error) {
      console.error("[UNSPLASH] Image fetch failed:", error.message, "at", new Date().toISOString());
      imageUrls = defaultImageUrls;
    }

    let spotifyTracks = [];
    try {
      const spotifyToken = await getSpotifyToken();
      const musicQuery = vibeData.music[0] || vibeData.mood || sanitizedInput;
      const spotifyResponse = await axios.get("https://api.spotify.com/v1/search", {
        headers: { Authorization: `Bearer ${spotifyToken}` },
        params: { q: musicQuery, type: "track", limit: 3, market: "US" },
        timeout: 10000
      });
      
      if (spotifyResponse.data.tracks.items.length > 0) {
        spotifyTracks = spotifyResponse.data.tracks.items.map((track) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0]?.name || "Unknown Artist",
          preview_url: track.preview_url || null,
        }));
        console.log("[SPOTIFY] Found", spotifyTracks.length, "tracks for:", musicQuery, "at", new Date().toISOString());
      }
    } catch (error) {
      console.error("[SPOTIFY] Track fetch failed:", error.message, "at", new Date().toISOString());
    }

    const colors = Array.isArray(vibeData.colors) && vibeData.colors.length >= 3
      ? vibeData.colors.slice(0, 3).map((color) => 
          /^#[0-9A-Fa-f]{6}$/.test(color) ? color : "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'))
      : ["#FF6B6B", "#4ECDC4", "#45B7D1"];

    const categories = vibeData.categories && vibeData.categories.length > 0 
      ? vibeData.categories 
      : [primaryIntent === "general" ? "lifestyle" : primaryIntent];

    const newChat = new Chat({
      userId: req.user.userId,
      messages: [{ role: "user", content: sanitizedInput }],
      vibe: {
        title: vibeData.title,
        mood: vibeData.mood,
        description: vibeData.description,
        music: vibeData.music,
        food: vibeData.food,
        fashion: vibeData.fashion,
        travel: viberavel,
        decor: vibeData.decor,
        colors,
        imageUrls,
        categories,
        spotifyTracks,
        icons: vibeData.icons || {
          music: "Music", 
          food: "Utensils", 
          fashion: "Shirt", 
          travel: "MapPin", 
          decor: "Home"
        },
      },
    });

    await newChat.save();
    await new Activity({ 
      userId: req.user.userId, 
      vibe: { title: vibeData.title } 
    }).save();
    
    console.log("[SUCCESS] Vibe generated successfully for:", sanitizedInput, "chatId:", newChat._id, "at", new Date().toISOString());
    
    res.json({ ...newChat.vibe, chatId: newChat._id });
    
  } catch (error) {
    console.error("[ERROR] Vibe generation failed:", error.message, "Input:", sanitizedInput, "at", new Date().toISOString());
    res.status(500).json({ 
      message: "Failed to generate vibe"
    });
  }
});

app.get("/api/chats", authenticateToken, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    console.log(
      "[CHATS] Fetched chats for:",
      req.user.email || "unknown",
      "at",
      new Date().toISOString()
    );
    res.json(chats);
  } catch (error) {
    console.error(
      "[CHATS] Error fetching chats:",
      error.message,
      "at",
      new Date().toISOString()
    );
    res.status(500).json({ message: "Failed to fetch chats" });
  }
});

app.post("/api/vibe/save/:chatId", authenticateToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.user.userId,
    });
    if (!chat) {
      console.error(
        "[SAVE] Chat not found:",
        req.params.chatId,
        "at",
        new Date().toISOString()
      );
      return res.status(404).json({ message: "Chat not found" });
    }
    chat.vibe.isSaved = true;
    await chat.save();
    console.log(
      "[SAVE] Vibe saved for:",
      req.user.email || "unknown",
      "chatId:",
      req.params.chatId,
      "at",
      new Date().toISOString()
    );
    res.json({ message: "Vibe saved successfully" });
  } catch (error) {
    console.error(
      "[SAVE] Error saving vibe:",
      error.message,
      "at",
      new Date().toISOString()
    );
    res.status(500).json({ message: "Failed to save vibe" });
  }
});

app.post("/api/vibe/share/:chatId", authenticateToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.user.userId,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.vibe.isSaved) {
      return res.status(400).json({ message: "Only saved vibes can be shared" });
    }

    if (!chat.shareId) {
      chat.shareId = crypto.randomBytes(16).toString("hex");
      await chat.save();
    }

    const shareLink = `${FRONTEND_URL}/dashboard?shareId=${chat.shareId}`;
    res.json({ shareLink });
  } catch (error) {
    console.error("[SHARE] Error creating share link:", error.message, "at", new Date().toISOString());
    res.status(500).json({ message: "Failed to create share link" });
  }
});

app.get("/api/vibe/shared/:shareId", async (req, res) => {
  try {
    const chat = await Chat.findOne({ shareId: req.params.shareId });

    if (!chat || !chat.vibe.isSaved) {
      return res.status(404).json({ message: "Shared vibe not found or is no longer available" });
    }
    
    res.json(chat);

  } catch (error) {
    console.error("[SHARE] Error fetching shared vibe:", error.message, "at", new Date().toISOString());
    res.status(500).json({ message: "Failed to fetch shared vibe" });
  }
});

app.post("/api/vibe/tts/:chatId", authenticateToken, async (req, res) => {
  try {
    console.log(
      "[TTS] Generating TTS for chatId:",
      req.params.chatId,
      "at",
      new Date().toISOString()
    );
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.user.userId,
    });
    if (!chat) {
      console.error(
        "[TTS] Chat not found:",
        req.params.chatId,
        "at",
        new Date().toISOString()
      );
      return res.status(404).json({ message: "Chat not found" });
    }

    const vibe = chat.vibe;
    const ttsText =
      `${vibe.title}. Mood: ${vibe.mood}. ${vibe.description}. ` +
      `Music: ${vibe.music.join(", ")}. ` +
      `Food: ${vibe.food.join(", ")}. ` +
      `Fashion: ${vibe.fashion.join(", ")}. ` +
      `Travel: ${vibe.travel.join(", ")}. ` +
      `Decor: ${vibe.decor.join(", ")}.`;

    console.log(
      "[TTS] TTS text prepared:",
      ttsText.substring(0, 100) + "...",
      "at",
      new Date().toISOString()
    );

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const ttsPrompt = `Generate a base64-encoded MP3 audio for the following text: "${ttsText}". Return only the base64 string.`;
    const result = await model.generateContent(ttsPrompt);
    let audioBase64 = result.response.text().trim();

    if (!audioBase64 || !/^[A-Za-z0-9+/=]+$/.test(audioBase64)) {
      console.error(
        "[TTS] Invalid base64 audio format received at",
        new Date().toISOString()
      );
      audioBase64 = Buffer.from("Placeholder audio for TTS").toString("base64");
      console.warn(
        "[TTS] Using fallback audio base64 at",
        new Date().toISOString()
      );
    }

    console.log(
      "[TTS] TTS generated successfully for chatId:",
      req.params.chatId,
      "at",
      new Date().toISOString()
    );
    res.json({ audio: audioBase64 });
  } catch (error) {
    console.error(
      "[TTS] Error generating TTS:",
      error.message,
      "at",
      new Date().toISOString()
    );
    res.status(500).json({ message: "Failed to generate audio content" });
  }
});

app.get("/api/activity", authenticateToken, async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(10);
    console.log(
      "[ACTIVITY] Fetched activities for:",
      req.user.email || "unknown",
      "at",
      new Date().toISOString()
    );
    res.json(activities);
  } catch (error) {
    console.error(
      "[ACTIVITY] Error fetching activities:",
      error.message,
      "at",
      new Date().toISOString()
    );
    res.status(500).json({ message: "Failed to fetch activities" });
  }
});

app.listen(PORT, () => {
  console.log(
    `[SERVER] Server running on port ${PORT} at`,
    new Date().toISOString()
  );
});