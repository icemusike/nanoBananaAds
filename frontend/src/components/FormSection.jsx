import { Info } from 'lucide-react';

const INDUSTRIES = [
  { value: 'tech_saas', label: 'Tech/SaaS' },
  { value: 'ai_automation', label: 'AI & Automation' },
  { value: 'business_services', label: 'Business Services (General)' },
  { value: 'phone_services_general', label: 'Phone & Communication Services' },
  { value: 'call_center', label: 'Call Center & Customer Support' },
  { value: 'virtual_assistant', label: 'Virtual Assistant Services' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'healthcare', label: 'Healthcare & Medical' },
  { value: 'dental', label: 'Dental Practices' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'accounting', label: 'Accounting & Bookkeeping' },
  { value: 'creative', label: 'Creative & Design' },
  { value: 'home_services', label: 'Home Services' },
  { value: 'ecommerce', label: 'E-commerce & Retail' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'property_management', label: 'Property Management' },
  { value: 'education', label: 'Education & E-learning' },
  { value: 'fitness', label: 'Fitness & Wellness' },
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'restaurants', label: 'Restaurants & Cafes' },
  { value: 'consulting', label: 'Consulting & Professional Services' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'construction', label: 'Construction & Contractors' },
  { value: 'hvac', label: 'HVAC & Plumbing' },
  { value: 'beauty', label: 'Beauty & Cosmetics' },
  { value: 'salon_spa', label: 'Salons & Spas' },
  { value: 'travel', label: 'Travel & Hospitality' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'nonprofit', label: 'Non-profit & Charity' },
  { value: 'general', label: 'General Business' },
];

const CATEGORIES = [
  { value: 'b2b_software', label: 'B2B Software/SaaS' },
  { value: 'ai_software', label: 'AI-Powered Software' },
  { value: 'automation_tools', label: 'Automation Tools' },
  { value: 'phone_services', label: 'Phone/Answering Services' },
  { value: 'call_automation', label: 'Call Automation & AI Phone Systems' },
  { value: 'communication_platform', label: 'Communication Platform' },
  { value: 'business_tools', label: 'Business Tools & Productivity' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'local_services', label: 'Local Services' },
  { value: 'service_business', label: 'Service-Based Business (General)' },
  { value: 'ecommerce_products', label: 'E-commerce Products' },
  { value: 'digital_products', label: 'Digital Products' },
  { value: 'physical_products', label: 'Physical Products' },
  { value: 'courses_education', label: 'Courses & Education' },
  { value: 'membership_subscription', label: 'Membership/Subscription' },
  { value: 'lead_generation', label: 'Lead Generation Service' },
];

const ASPECT_RATIOS = [
  { value: 'square', label: 'Square (1:1) - Best for Feed' },
  { value: 'portrait', label: 'Portrait (9:16) - Best for Mobile' },
];

const TONES = [
  { value: 'professional yet approachable', label: 'Professional Yet Approachable' },
  { value: 'friendly and casual', label: 'Friendly & Casual' },
  { value: 'bold and innovative', label: 'Bold & Innovative' },
  { value: 'trustworthy and authoritative', label: 'Trustworthy & Authoritative' },
  { value: 'warm and empathetic', label: 'Warm & Empathetic' },
  { value: 'urgent and action-driven', label: 'Urgent & Action-Driven' },
  { value: 'luxury and premium', label: 'Luxury & Premium' },
  { value: 'playful and fun', label: 'Playful & Fun' },
  { value: 'inspirational and motivational', label: 'Inspirational & Motivational' },
  { value: 'educational and informative', label: 'Educational & Informative' },
  { value: 'direct and no-nonsense', label: 'Direct & No-Nonsense' },
  { value: 'conversational and relatable', label: 'Conversational & Relatable' },
  { value: 'exclusive and elite', label: 'Exclusive & Elite' },
];

const COPYWRITING_STYLES = [
  { value: 'default', label: 'AI Optimized (Default)' },
  { value: 'alex_hormozi', label: 'Alex Hormozi - Value-Stacking & Direct ROI' },
  { value: 'dan_kennedy', label: 'Dan Kennedy - No-BS Direct Response' },
  { value: 'gary_halbert', label: 'Gary Halbert - Empathy & Story-Driven' },
  { value: 'eugene_schwartz', label: 'Eugene Schwartz - Desire & Sophistication' },
  { value: 'david_ogilvy', label: 'David Ogilvy - Research-Based Persuasion' },
  { value: 'joe_sugarman', label: 'Joe Sugarman - Psychological Triggers' },
  { value: 'russell_brunson', label: 'Russell Brunson - Funnel & Story Selling' },
  { value: 'frank_kern', label: 'Frank Kern - Casual Authority & Results' },
  { value: 'todd_brown', label: 'Todd Brown - Unique Mechanism & Big Ideas' },
  { value: 'john_carlton', label: 'John Carlton - Aggressive & Bold Claims' },
  { value: 'clayton_makepeace', label: 'Clayton Makepeace - Fear & Urgency Master' },
];

export default function FormSection({ formData, onInputChange, templates, availableModels = [] }) {
  const availableTemplates = templates[formData.category] || [];

  return (
    <div className="space-y-6">
      {/* Essential Information */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          Essential Information
        </h2>

        <div className="space-y-4">
          <div>
            <label className="label">
              Product/Service Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              placeholder="E.g., AI-powered phone answering service for small businesses"
              className="input-field h-24 resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Brief description of what you're advertising
            </p>
          </div>

          <div>
            <label className="label">
              Target Audience *
            </label>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => onInputChange('targetAudience', e.target.value)}
              placeholder="E.g., Small business owners, dentists, lawyers"
              className="input-field"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Who is this ad for?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Industry</label>
              <select
                value={formData.industry}
                onChange={(e) => onInputChange('industry', e.target.value)}
                className="select-field"
              >
                {INDUSTRIES.map(industry => (
                  <option key={industry.value} value={industry.value}>
                    {industry.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => {
                  onInputChange('category', e.target.value);
                  // Reset template when category changes
                  const newTemplates = templates[e.target.value];
                  if (newTemplates && newTemplates.length > 0) {
                    onInputChange('template', newTemplates[0].id);
                  }
                }}
                className="select-field"
              >
                {CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Image Vision */}
      <div className="card border-2 border-primary-500/30 bg-primary-500/5">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Image Vision
          <span className="text-xs bg-primary-500/20 text-primary-300 px-2 py-1 rounded-full ml-2">
            NEW - Enhanced AI
          </span>
        </h2>

        {/* Simple Mode Toggle */}
        <div className="mb-6 p-4 bg-dark-800 border border-accent-purple/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onInputChange('simpleMode', !formData.simpleMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.simpleMode ? 'bg-accent-purple' : 'bg-dark-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.simpleMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <div>
                <span className="font-semibold text-white">Simple Mode</span>
                <span className="ml-2 text-xs bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded-full">
                  Direct Control
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            {formData.simpleMode
              ? '✓ Using ONLY your Image Description. Templates and industry styles are bypassed for direct control.'
              : 'Using Image Description + Visual Style templates for enhanced professional results.'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">
              Image Description *
              <span className="text-primary-400 ml-2 text-xs font-normal">(Critical for best results)</span>
            </label>
            <textarea
              value={formData.imageDescription}
              onChange={(e) => onInputChange('imageDescription', e.target.value)}
              placeholder="E.g., 'A diverse team of 3 professionals celebrating around a laptop displaying colorful analytics dashboard, in a modern bright office with plants, natural lighting, genuine smiles showing success and collaboration'"
              className="input-field h-32 resize-none"
              required
            />
            <div className="flex items-start gap-2 mt-2">
              <div className="flex-1">
                <p className="text-xs text-gray-400">
                  Describe the exact image you want to see. Include: people (age, appearance, actions), setting, mood, key visual elements.
                </p>
                <p className="text-xs text-primary-400 mt-1">
                  {formData.imageDescription.length < 20 && '⚠️ Add more details for better results (min 20 chars)'}
                  {formData.imageDescription.length >= 20 && formData.imageDescription.length < 50 && '⚡ Good start! Add more specifics for even better results'}
                  {formData.imageDescription.length >= 50 && formData.imageDescription.length < 100 && '✓ Great detail! Your image will be highly specific'}
                  {formData.imageDescription.length >= 100 && '🌟 Excellent! This will generate a highly customized image'}
                  <span className="ml-2 text-gray-500">({formData.imageDescription.length} chars)</span>
                </p>
              </div>
            </div>
            <div className="mt-2 p-3 bg-dark-800 rounded-lg border border-primary-500/20">
              <p className="text-xs text-gray-400 mb-2 font-semibold">💡 Pro Tips for Great Image Descriptions:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Include specific people: "30-year-old female entrepreneur with natural smile"</li>
                <li>• Describe the action: "typing on laptop" vs "looking at camera"</li>
                <li>• Set the scene: "modern co-working space" vs "home office with plants"</li>
                <li>• Add mood: "celebrating success" vs "focused concentration"</li>
                <li>• Mention key elements: "colorful dashboard visible on screen"</li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                Mood Keywords (Optional)
              </label>
              <input
                type="text"
                value={formData.moodKeywords}
                onChange={(e) => onInputChange('moodKeywords', e.target.value)}
                placeholder="E.g., energetic, professional, warm"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Emotional tone of the image
              </p>
            </div>

            <div>
              <label className="label">
                Visual Emphasis (Optional)
              </label>
              <input
                type="text"
                value={formData.visualEmphasis}
                onChange={(e) => onInputChange('visualEmphasis', e.target.value)}
                placeholder="E.g., focus on dashboard, highlight teamwork"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                What should stand out most
              </p>
            </div>
          </div>

          <div>
            <label className="label">
              Avoid in Image (Optional)
            </label>
            <input
              type="text"
              value={formData.avoidInImage}
              onChange={(e) => onInputChange('avoidInImage', e.target.value)}
              placeholder="E.g., no stock photo feel, avoid formal suits, no cluttered backgrounds"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Things to exclude from the image
            </p>
          </div>
        </div>
      </div>

      {/* Visual Style */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">🎨</span>
          Visual Style
        </h2>

        <div className="space-y-4">
          <div>
            <label className="label">Template</label>
            <select
              value={formData.template}
              onChange={(e) => onInputChange('template', e.target.value)}
              className="select-field"
            >
              {availableTemplates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            {availableTemplates.find(t => t.id === formData.template)?.description && (
              <p className="text-xs text-gray-500 mt-1">
                {availableTemplates.find(t => t.id === formData.template).description}
              </p>
            )}
          </div>

          {/* Custom Template Description */}
          {formData.template === 'custom' && (
            <div className="bg-primary-500/5 border border-primary-500/20 rounded-lg p-4">
              <label className="label">
                Custom Template Description *
                <span className="text-primary-400 ml-2 text-xs font-normal">Describe your vision</span>
              </label>
              <textarea
                value={formData.customTemplateDescription || ''}
                onChange={(e) => onInputChange('customTemplateDescription', e.target.value)}
                placeholder="Describe exactly what you want to see in the image. Example: A professional woman in her 30s with a warm smile, sitting at a modern desk with a laptop showing a colorful dashboard, in a bright office with plants in the background..."
                className="input-field h-32 resize-none"
                required
              />
              <p className="text-xs text-gray-400 mt-2">
                💡 Be specific: Include people (age, appearance, action), setting, mood, lighting, and key visual elements you want.
              </p>
            </div>
          )}

          <div>
            <label className="label">Aspect Ratio</label>
            <select
              value={formData.aspectRatio}
              onChange={(e) => onInputChange('aspectRatio', e.target.value)}
              className="select-field"
            >
              {ASPECT_RATIOS.map(ratio => (
                <option key={ratio.value} value={ratio.value}>
                  {ratio.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              Brand Colors (Optional)
            </label>
            <input
              type="text"
              value={formData.colorPalette}
              onChange={(e) => onInputChange('colorPalette', e.target.value)}
              placeholder="E.g., navy blue and gold, or leave blank for defaults"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Describe your brand colors or leave blank for industry defaults
            </p>
          </div>
        </div>
      </div>

      {/* Copy Settings */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">✍️</span>
          Copy Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="label">
              AI Model for Copy Generation
              <span className="text-accent-blue ml-2 text-xs font-normal">🤖 Choose Quality Level</span>
            </label>
            <select
              value={formData.model || 'gpt-4o-2024-08-06'}
              onChange={(e) => onInputChange('model', e.target.value)}
              className="select-field"
            >
              {availableModels.length > 0 ? (
                availableModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name === 'GPT-5' ? 'Premium' : model.name === 'GPT-4o' ? 'Standard' : model.name === 'GPT-4o Mini' ? 'Fast' : model.name} - {model.description}
                  </option>
                ))
              ) : (
                <>
                  <option value="gpt-5-2025-08-07">Premium - Best quality, highest intelligence</option>
                  <option value="gpt-4o-2024-08-06">Standard - Great balance (Recommended)</option>
                  <option value="gpt-4o-mini">Fast - Quick and affordable</option>
                </>
              )}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.model === 'gpt-5-2025-08-07' && '🔥 Maximum quality, highest cost'}
              {formData.model === 'gpt-4o-2024-08-06' && '⚡ Great balance of quality and cost'}
              {formData.model === 'gpt-4o-mini' && '💰 Most affordable, good for testing'}
            </p>
          </div>

          <div>
            <label className="label">
              Copywriting Style
              <span className="text-primary-400 ml-2 text-xs font-normal">✨ Expert Frameworks</span>
            </label>
            <select
              value={formData.copywritingStyle || 'default'}
              onChange={(e) => onInputChange('copywritingStyle', e.target.value)}
              className="select-field"
            >
              {COPYWRITING_STYLES.map(style => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose a legendary copywriter's style to emulate
            </p>
          </div>

          <div>
            <label className="label">Tone</label>
            <select
              value={formData.tone}
              onChange={(e) => onInputChange('tone', e.target.value)}
              className="select-field"
            >
              {TONES.map(tone => (
                <option key={tone.value} value={tone.value}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              Value Proposition (Optional)
            </label>
            <input
              type="text"
              value={formData.valueProposition}
              onChange={(e) => onInputChange('valueProposition', e.target.value)}
              placeholder="E.g., Never miss a call again, 24/7 availability"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your unique selling proposition - what makes you different
            </p>
          </div>

          <div>
            <label className="label">Call to Action</label>
            <input
              type="text"
              value={formData.callToAction}
              onChange={(e) => onInputChange('callToAction', e.target.value)}
              placeholder="E.g., Learn More, Get Started, Try Free"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              What action should readers take?
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-primary-500/5 border border-primary-500/20 rounded-lg p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-primary-300 font-medium mb-2">Pro Tips:</p>
            <ul className="text-gray-400 space-y-1">
              <li>• Be specific in your description for better results</li>
              <li>• UGC-style ads perform 73% better than traditional</li>
              <li>• Bold colors increase visibility in Facebook feeds</li>
              <li>• Use emojis strategically (increases CTR by 241%)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
