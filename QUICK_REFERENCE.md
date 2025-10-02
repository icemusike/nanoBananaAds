# Quick Reference: Image Description Feature

## For Developers

### New API Parameters (POST /api/generate)

```javascript
{
  // Existing parameters
  description: string,
  targetAudience: string,
  industry: string,
  category: string,
  template: string,
  colorPalette: string,
  aspectRatio: 'square' | 'portrait',
  tone: string,
  valueProposition: string,
  callToAction: string,

  // NEW PARAMETERS
  imageDescription: string,     // REQUIRED, min 20 chars
  moodKeywords: string,         // Optional
  visualEmphasis: string,       // Optional
  avoidInImage: string          // Optional
}
```

### Frontend Form State

```javascript
const [formData, setFormData] = useState({
  // ... existing fields
  imageDescription: '',    // REQUIRED field
  moodKeywords: '',       // Optional
  visualEmphasis: '',     // Optional
  avoidInImage: '',       // Optional
});
```

### Key Functions Modified

1. **`generateGeminiPrompt(inputs)`** - `backend/prompts/templates.js`
   - Now accepts imageDescription and enhancement fields
   - Calls `buildEnhancedPrompt()` if imageDescription provided
   - Falls back to template-based generation if not

2. **`buildAdCopyPrompt(params)`** - `backend/services/openai.js`
   - Uses imageDescription as primary visual context
   - Instructs GPT-4 to reference image elements in copy

3. **`extractTechnicalElements(templatePrompt)`** - `backend/prompts/templates.js`
   - Extracts lighting, camera, quality, style specs from templates
   - Returns object with technical enhancements

4. **`buildEnhancedPrompt(params)`** - `backend/prompts/templates.js`
   - Merges user vision with technical quality
   - Structures prompt for optimal Gemini/DALL-E results

### Validation Rules

```javascript
// Frontend validation
if (!formData.imageDescription || formData.imageDescription.trim().length < 20) {
  setError('Please provide a more detailed Image Description (at least 20 characters)');
  return;
}

// Backend validation
if (!imageDescription || imageDescription.trim().length < 20) {
  return res.status(400).json({
    error: 'Image description is required and must be at least 20 characters'
  });
}
```

---

## For Users

### How to Write Effective Image Descriptions

**Template:**
```
[Who] doing [what] in [where], showing [key elements],
with [lighting/mood], feeling [emotion]
```

**Good Examples:**

1. **B2B Software:**
   ```
   "Three professionals aged 30-40, diverse team, collaborating around a
   laptop showing colorful analytics dashboard with upward trending graphs,
   in modern office with plants and natural light, genuine smiles showing
   excitement about results, warm professional atmosphere"
   ```

2. **E-commerce:**
   ```
   "28-year-old woman with natural smile holding product in both hands,
   wearing casual clothes, in bright minimalist home setting with white walls
   and greenery, natural window light from left, authentic lifestyle feel
   not staged, product clearly visible and in focus"
   ```

3. **Phone Services:**
   ```
   "Friendly 35-year-old receptionist with headset speaking naturally while
   looking at computer screen showing call dashboard interface, in modern
   bright office, relaxed professional attire, coffee mug on desk, plants
   visible in background, warm approachable feeling"
   ```

### Pro Tips:

1. **Be Specific About People:**
   - Age range: "30-year-old" not "young person"
   - Appearance: "with natural smile" not "happy"
   - Action: "typing on laptop" not "working"

2. **Describe the Setting:**
   - Location: "modern co-working space" not "office"
   - Details: "plants, natural wood furniture" not "decorated"
   - Lighting: "natural window light" not "bright"

3. **Mention Key Elements:**
   - Products: "colorful dashboard visible on screen"
   - Branding: "company logo subtly visible"
   - Mood: "celebrating success" or "focused concentration"

4. **Include Authenticity Markers:**
   - "natural imperfections", "casual workspace clutter"
   - "genuine expression", "authentic moment"
   - "real home environment" vs "staged studio"

5. **Use the Optional Fields:**
   - **Mood Keywords:** "energetic, professional, warm"
   - **Visual Emphasis:** "focus on dashboard, highlight teamwork"
   - **Avoid in Image:** "no stock photo feel, avoid formal suits"

---

## Testing Checklist

### Before Deploying:

- [ ] Frontend shows new "Image Vision" section
- [ ] Real-time character counter works
- [ ] Validation prevents submission with < 20 chars
- [ ] Error messages are clear and helpful
- [ ] Backend accepts new parameters
- [ ] Backend validation works (400 error if invalid)
- [ ] Gemini prompt includes user vision
- [ ] Copy references image elements
- [ ] Database saves new fields (if applicable)

### Test Cases:

1. **Minimum Valid Input:**
   - imageDescription: "Twenty character test"
   - Should: Pass validation

2. **Optimal Input:**
   - imageDescription: 100+ character detailed description
   - moodKeywords: "warm, professional"
   - visualEmphasis: "focus on dashboard"
   - Should: Generate highly customized result

3. **Empty Image Description:**
   - imageDescription: ""
   - Should: Show error "Please provide a more detailed..."

4. **Too Short:**
   - imageDescription: "A person"
   - Should: Show error about minimum 20 characters

---

## Troubleshooting

### Issue: "Image doesn't match my description"

**Possible Causes:**
1. Description too vague - Add more specifics
2. Conflicting instructions - Check avoid list doesn't contradict vision
3. Template category mismatch - Ensure category fits the description

**Solution:**
- Add more details (people, setting, mood, actions)
- Be explicit about key elements
- Use visual emphasis field to prioritize

### Issue: "Copy doesn't reference the image"

**Possible Causes:**
1. imageDescription not passed to copy generation
2. Description too technical/abstract for GPT-4 to reference

**Solution:**
- Verify backend passes imageDescription to openaiService
- Include emotional/relatable elements in description
- Mention specific visual elements GPT-4 can reference

### Issue: "Validation error even with long description"

**Check:**
```javascript
// Frontend sends to backend?
console.log('Sending:', formData.imageDescription);

// Backend receives it?
console.log('Received:', imageDescription);

// Length check
console.log('Length:', imageDescription?.trim().length);
```

---

## Performance Considerations

### Prompt Length:
- User descriptions: Typically 50-200 chars
- Enhanced prompts: ~800-1200 chars total
- Well within Gemini (8k tokens) and GPT-4 (128k tokens) limits

### Generation Time:
- No significant impact on generation time
- Parallel processing maintains speed
- Better first-try success = fewer regenerations

### API Costs:
- Slightly longer prompts = minimal token increase (<5%)
- Better results = fewer regenerations = lower overall cost

---

## Code Snippets

### Adding More Enhancement Fields (Future):

```javascript
// frontend/src/pages/CreateAds.jsx
const [formData, setFormData] = useState({
  // ... existing
  brandElements: '',       // NEW: "logo, mascot, product"
  competitorDiff: '',      // NEW: "unlike competitors who..."
  urgencyFactor: ''        // NEW: "limited time, exclusive"
});

// backend/routes/generate.js
const {
  // ... existing
  brandElements,
  competitorDiff,
  urgencyFactor
} = req.body;

// Pass to prompt generation
const geminiPrompt = generateGeminiPrompt({
  // ... existing
  brandElements,
  competitorDiff,
  urgencyFactor
});
```

### Accessing Field Values in Templates:

```javascript
// backend/prompts/templates.js
function buildEnhancedPrompt(params) {
  const {
    userVision,
    moodKeywords,
    visualEmphasis,
    avoidInImage,
    // Access new fields here
    brandElements,
    competitorDiff
  } = params;

  // Use in prompt construction
  if (brandElements) {
    enhancedPrompt += `Include these brand elements: ${brandElements}\n`;
  }
}
```

---

## Quick Wins for Future

1. **Example Gallery:** Show 5-10 great image descriptions users can adapt
2. **Template Builder:** "I want to show [dropdown] doing [dropdown] in [dropdown]"
3. **AI Helper:** "Generate image description from my product description"
4. **Image Upload:** "Analyze this reference image and describe it"
5. **Save Favorites:** Let users save their best descriptions for reuse

---

**Last Updated:** 2025-10-01
**Version:** 1.0.0
**Status:** Production Ready
