# 🍌 Nano Banana Ad Creator

> AI-powered Facebook Ad Creative Generator using Google Gemini 2.5 Flash and OpenAI GPT-4

Create high-converting Facebook ad creatives in seconds. Generate stunning images with Gemini and compelling copy with GPT-4, all from a beautiful dark-themed interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-MIT-purple)

## ✨ Features

- 🎨 **AI-Generated Images** - Gemini 2.5 Flash creates stunning, photorealistic ad images
- ✍️ **Compelling Ad Copy** - GPT-4 generates high-converting headlines, descriptions, and primary text
- 🎯 **Industry-Specific Templates** - Optimized for B2B Software, Phone Services, and more
- 📱 **Mobile-First Design** - Beautiful dark-themed interface optimized for all devices
- 📊 **Facebook Ad Best Practices** - Built using proven 2024-2025 advertising strategies
- 💾 **Easy Export** - Download images and copy text files instantly
- ⚡ **Fast & Local** - Run entirely on your machine with your own API keys

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling with custom dark theme
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client

### Backend
- **Node.js + Express** - Fast, minimalist web framework
- **Google Generative AI SDK** - Gemini 2.5 Flash integration
- **OpenAI SDK** - GPT-4 integration
- **dotenv** - Environment configuration

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Google Gemini API Key** - [Get it here](https://makersuite.google.com/app/apikey)
- **OpenAI API Key** - [Get it here](https://platform.openai.com/api-keys)

## 🚀 Quick Start

### 1. Clone or Navigate to Project

```bash
cd Nano-Banana-Ad-Creator
```

### 2. Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env
cp .env.example .env

# Edit .env and add your API keys:
# GEMINI_API_KEY=your_gemini_api_key_here
# OPENAI_API_KEY=your_openai_api_key_here
```

**Important**: Your API keys are already in `.env` - verify they are correct!

### 3. Set Up Frontend

```bash
cd ../frontend

# Install dependencies
npm install
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend will run on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:3000
```

### 5. Open in Browser

Navigate to **http://localhost:3000** and start creating amazing ad creatives!

## 📖 How to Use

### Step 1: Fill in Essential Information
- **Product/Service Description**: Describe what you're advertising
- **Target Audience**: Who is this ad for? (e.g., small business owners, dentists)
- **Industry**: Select your industry (Tech/SaaS, Finance, Healthcare, etc.)
- **Category**: Choose B2B Software or Phone Services

### Step 2: Choose Visual Style
- **Template**: Select from pre-built templates optimized for your category
  - Dashboard Showcase
  - Team Collaboration
  - Results & ROI
  - Mobile/Remote Work
  - Customer Testimonial UGC
  - And more!
- **Aspect Ratio**: Square (1:1) for feed or Portrait (9:16) for mobile
- **Brand Colors**: Optional - describe your colors or use industry defaults

### Step 3: Configure Copy Settings
- **Tone**: Professional, friendly, bold, trustworthy, or warm
- **Value Proposition**: Your key benefit (optional)
- **Call to Action**: "Learn More", "Get Started", etc.

### Step 4: Generate & Download
- Click **"Generate Ad Creative"**
- Wait 10-20 seconds for AI generation
- Download your image and copy
- Use in Facebook Ads Manager!

## 🎨 Available Templates

### B2B Software/SaaS
1. **Dashboard Showcase** - Professional using software in modern workspace
2. **Team Collaboration** - Team working together with your software
3. **Results & ROI** - Analytics showing impressive metrics
4. **Mobile/Remote Work** - Remote worker using mobile app
5. **Customer Testimonial UGC** - Authentic customer selfie

### Phone/Answering Services
1. **Professional Receptionist** - Receptionist with call dashboard
2. **Business Owner Freedom** - Owner relaxing thanks to service
3. **Call Center Technology** - Modern phone system showcase
4. **First Impression** - Customer satisfaction moment
5. **Multi-Channel Communication** - Omnichannel setup

## 📊 API Endpoints

### `POST /api/generate`
Generate complete ad creative (image + copy)

**Request Body:**
```json
{
  "description": "AI-powered phone answering service",
  "targetAudience": "Small business owners",
  "industry": "tech_saas",
  "category": "b2b_software",
  "template": "dashboardShowcase",
  "tone": "professional yet approachable",
  "callToAction": "Learn More"
}
```

### `POST /api/generate-image`
Generate only image (for regeneration)

### `POST /api/generate-copy`
Generate only ad copy (for regeneration)

### `GET /api/templates`
Get all available templates and categories

### `GET /api/health`
Health check endpoint

## 🎯 Best Practices (Built Into Templates)

Based on 2024-2025 Facebook advertising research:

- ✅ **Custom images perform 69% better** than stock photos
- ✅ **UGC-style ads get 73% higher engagement** than corporate
- ✅ **Emojis increase CTR by 241%** when used strategically
- ✅ **Bold colors** essential for feed visibility
- ✅ **Mobile-first** - 98.5% of users on mobile
- ✅ **Authenticity over perfection** builds trust

All templates follow these proven strategies!

## 🛠️ Project Structure

```
nano-banana-ad-creator/
├── backend/
│   ├── routes/
│   │   └── generate.js          # API routes
│   ├── services/
│   │   ├── gemini.js            # Gemini 2.5 Flash service
│   │   └── openai.js            # OpenAI GPT-4 service
│   ├── prompts/
│   │   └── templates.js         # Prompt templates
│   ├── server.js                # Express server
│   ├── .env                     # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── FormSection.jsx
│   │   │   └── ResultsSection.jsx
│   │   ├── App.jsx              # Main application
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🔧 Customization

### Adding New Templates

Edit `backend/prompts/templates.js`:

```javascript
export const b2bSoftwareTemplates = {
  yourNewTemplate: (details) => `
    A photorealistic [detailed description]...
    Set in [environment]...
    Illuminated by [lighting]...
    Captured with [camera specs]...
  `.trim(),
};
```

### Adding New Industries

Edit `frontend/src/components/FormSection.jsx`:

```javascript
const INDUSTRIES = [
  { value: 'your_industry', label: 'Your Industry' },
  // ... existing industries
];
```

Add color palette in `backend/prompts/templates.js`:

```javascript
export const COLOR_PALETTES = {
  your_industry: 'your color description',
  // ... existing palettes
};
```

## 🐛 Troubleshooting

### "Failed to generate ad creative"
- ✅ Check that your API keys are correctly set in `backend/.env`
- ✅ Verify backend is running on port 3001
- ✅ Check browser console for detailed errors

### "Image generation failed"
- ✅ Gemini 2.5 Flash image generation is experimental
- ✅ The system will still generate excellent ad copy
- ✅ Try regenerating or adjust your prompt

### Backend won't start
- ✅ Make sure you ran `npm install` in the backend folder
- ✅ Check that port 3001 is not in use
- ✅ Verify Node.js version is 18 or higher

### Frontend won't start
- ✅ Make sure you ran `npm install` in the frontend folder
- ✅ Check that port 3000 is not in use
- ✅ Clear browser cache if seeing old version

## 💰 API Costs

Estimated costs per generation:
- **Gemini 2.5 Flash**: ~$0.04 per image
- **OpenAI GPT-4**: ~$0.01-0.03 per copy generation
- **Total**: ~$0.05-0.07 per complete ad creative

Much cheaper than:
- Stock photo licenses ($10-50 each)
- Custom photography ($500-2000 per shoot)
- Copywriter ($50-200 per ad)

## 🌟 Future Enhancements

Potential features for v2:
- [ ] Image regeneration without regenerating copy
- [ ] A/B testing headline generator
- [ ] Campaign management dashboard
- [ ] Direct Facebook Ads Manager integration
- [ ] Analytics and performance tracking
- [ ] User authentication and saved projects
- [ ] Batch generation for multiple variants

## 📄 License

MIT License - feel free to use for personal or commercial projects!

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 🙏 Acknowledgments

- **Google Gemini Team** - For the amazing Gemini 2.5 Flash model
- **OpenAI** - For GPT-4's incredible language capabilities
- **Facebook Ads Research** - Best practices based on 2024-2025 data
- Built with ❤️ for marketers and small business owners

---

## 🚀 Ready to Create Stunning Ads?

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Open http://localhost:3000
4. Create your first ad! 🍌

**Questions or issues?** Check the troubleshooting section or review the code comments for detailed explanations.

---

Made with 🍌 by Nano Banana Ad Creator
