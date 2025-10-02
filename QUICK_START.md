# 🚀 Quick Start Guide

Get Nano Banana Ad Creator running in 2 minutes!

## ✅ Prerequisites Check

- [ ] Node.js installed (v18+) - `node --version`
- [ ] Google Gemini API Key
- [ ] OpenAI API Key

## 🎯 3 Steps to Launch

### Step 1: Start Backend (Terminal 1)

**Windows:**
```bash
# Double-click start-backend.bat
# OR run in terminal:
cd backend
npm start
```

**Mac/Linux:**
```bash
cd backend
npm install  # First time only
npm start
```

✅ You should see: `🚀 Nano Banana Backend running on http://localhost:3001`

---

### Step 2: Start Frontend (Terminal 2)

**Windows:**
```bash
# Double-click start-frontend.bat
# OR run in terminal:
cd frontend
npm run dev
```

**Mac/Linux:**
```bash
cd frontend
npm install  # First time only
npm run dev
```

✅ You should see: `Local: http://localhost:3000/`

---

### Step 3: Open in Browser

Go to: **http://localhost:3000**

---

## 🎨 Create Your First Ad

1. **Fill in the form:**
   - Description: "AI-powered scheduling software for dentists"
   - Target Audience: "Dental practice owners and office managers"
   - Industry: "Healthcare"
   - Category: "B2B Software/SaaS"

2. **Click "Generate Ad Creative"**

3. **Wait 10-20 seconds** ⏳

4. **Download your results!** 🎉

---

## 🔧 Troubleshooting

### Backend won't start?
```bash
cd backend
# Check if .env file exists:
ls .env

# Verify API keys are set:
cat .env
```

### Frontend shows errors?
```bash
cd frontend
# Reinstall dependencies:
rm -rf node_modules
npm install
```

### "Failed to generate"?
- ✅ Check backend is running (http://localhost:3001/health)
- ✅ Verify API keys in `backend/.env`
- ✅ Check browser console (F12) for errors

---

## 📖 Full Documentation

See [README.md](README.md) for complete documentation.

---

## 🆘 Quick Commands

**Check Backend Health:**
```bash
curl http://localhost:3001/health
```

**View Backend Logs:**
- Check the terminal where backend is running

**Clear Cache:**
```bash
# Frontend
cd frontend
rm -rf node_modules .vite
npm install

# Backend
cd backend
rm -rf node_modules
npm install
```

---

## 🎯 Pro Tips

- Keep both terminals open while using the app
- First generation may take longer (API warm-up)
- Try different templates for different results
- Download both image and copy text file
- Test with different target audiences for variety

---

**Ready to create amazing ads? Let's go! 🍌**
