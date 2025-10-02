/**
 * Gemini 2.5 Flash Prompt Templates
 * Based on the comprehensive Facebook Ad Image Generation Guide
 */

export const TEMPLATE_CATEGORIES = {
  PHONE_SERVICES: 'phone_services',
  B2B_SOFTWARE: 'b2b_software',
  AI_SOFTWARE: 'ai_software',
  AUTOMATION_TOOLS: 'automation_tools',
  CALL_AUTOMATION: 'call_automation',
  COMMUNICATION_PLATFORM: 'communication_platform',
  BUSINESS_TOOLS: 'business_tools',
  SERVICE_BUSINESS: 'service_business',
  ECOMMERCE_PRODUCTS: 'ecommerce_products',
  PROFESSIONAL_SERVICES: 'professional_services',
  LOCAL_SERVICES: 'local_services',
  DIGITAL_PRODUCTS: 'digital_products',
  PHYSICAL_PRODUCTS: 'physical_products',
  COURSES_EDUCATION: 'courses_education',
  MEMBERSHIP_SUBSCRIPTION: 'membership_subscription',
  LEAD_GENERATION: 'lead_generation',
};

export const STYLE_TYPES = {
  PROFESSIONAL: 'professional',
  UGC_AUTHENTIC: 'ugc_authentic',
  BOLD_PRODUCT: 'bold_product',
  CUSTOMER_SUCCESS: 'customer_success',
};

export const ASPECT_RATIOS = {
  SQUARE: 'Square format (1:1)',
  PORTRAIT: 'Vertical format (9:16)',
};

// Industry-specific color palettes
export const COLOR_PALETTES = {
  tech_saas: 'vibrant blues, purples, and teals with white space',
  ai_automation: 'electric blues, neon purples, cyan, and futuristic gradients',
  business_services: 'professional navy, teal, orange accents with modern flair',
  phone_services_general: 'magenta, navy, and gold tones',
  call_center: 'vibrant teal, orange, purple with energetic professional tones',
  virtual_assistant: 'soft blues, greens, warm coral for friendly tech aesthetic',
  finance: 'navy, dark blue, green, and gold accents',
  healthcare: 'teal, soft blue, white, and peach accents',
  dental: 'clean whites, soft blues, mint greens with professional warmth',
  legal: 'navy, gold, burgundy, and professional tones',
  accounting: 'trustworthy greens, blues, professional grays with gold touches',
  creative: 'bold multi-color palette with pink, orange, and yellow',
  home_services: 'orange, purple, and energetic warm tones',
  ecommerce: 'bold vibrant colors - coral, teal, yellow with white space',
  real_estate: 'sophisticated blues, grays, gold, and white',
  property_management: 'modern grays, blues, green accents for professional trust',
  education: 'bright blues, greens, orange, and yellow for energy',
  fitness: 'energetic neon greens, electric blues, and bold oranges',
  food_beverage: 'appetizing warm tones - reds, oranges, yellows, browns',
  restaurants: 'warm appetizing colors - deep reds, golds, natural browns',
  consulting: 'professional navy, teal, gray with gold accents',
  marketing: 'bold gradient colors - purple, pink, orange, blue',
  construction: 'strong oranges, grays, yellows with industrial tones',
  hvac: 'cooling blues, warm oranges for heating, professional grays',
  beauty: 'soft pastels - rose gold, blush pink, cream, lavender',
  salon_spa: 'calming lavender, spa blue, rose gold, cream tones',
  travel: 'vibrant tropical colors - turquoise, coral, sunset tones',
  automotive: 'sleek metallics - silver, blue, black with red accents',
  insurance: 'trustworthy blues, greens with warm accent colors',
  nonprofit: 'compassionate warm tones - earth tones, greens, soft blues',
  general: 'balanced professional blues, greens, orange for versatility',
};

/**
 * Phone Services Templates
 */
export const phoneServiceTemplates = {
  professionalReceptionist: (details) => `
A photorealistic close-up portrait of a friendly ${details.age || '30'}-year-old receptionist with warm smile and natural expression, wearing casual professional attire (cardigan over blouse), speaking naturally on phone headset while looking at computer screen showing colorful call management dashboard. Set in modern bright office workspace with plants and natural wood accents visible in soft blur. The scene is illuminated by soft diffused window light from the left creating gentle shadows, mixed with warm desk lamp glow, creating an approachable and professional atmosphere. Background shows tasteful office environment with branded elements subtly visible. Captured with an 85mm portrait lens at f/2.2, emphasizing natural skin texture with visible pores and genuine expression, slight flyaway hairs, relaxed authentic posture. Shallow depth of field with creamy background bokeh. The image has ${details.colorPalette || 'vibrant yet professional color palette with pops of teal and coral against neutral office tones'}. Natural imperfections include: coffee mug on desk, papers casually organized, authentic workspace clutter. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  businessOwnerFreedom: (details) => `
A candid lifestyle photo of a relaxed ${details.age || '40'}-something small business owner, ${details.gender || 'male'} with ${details.appearance || 'salt-and-pepper beard'}, genuine smile, wearing casual button-up shirt, sitting at outdoor cafe table with laptop closed, smartphone showing missed call notification screen with professional branding visible, holding coffee cup in natural pose. The scene conveys relief and freedom - work-life balance achieved. Set in sun-dappled cafe patio during golden hour with bistro furniture and greenery softly blurred in background. The scene is illuminated by warm late afternoon sunlight creating soft golden glow, natural shadows, and relaxed atmosphere. Captured with iPhone 14 Pro in portrait mode at arm's length selfie angle, creating authentic user-generated content aesthetic. Natural skin texture, slight forehead shine, real environmental details visible. Slightly off-center composition for organic UGC feel. The image has warm, inviting color palette with golden hour tones, pops of vibrant green from plants, professional but authentic mood. Background includes real cafe elements - other patrons blurred, menu board visible. ${details.aspectRatio || ASPECT_RATIOS.PORTRAIT} optimized for mobile.
`.trim(),

  callCenterTechnology: (details) => `
A high-quality product-style photo showing hands typing on laptop keyboard with vibrant phone system dashboard interface displayed on screen, featuring colorful call routing flowchart, real-time analytics with bold numbers (showing call volume, response time metrics), and modern UI design with gradients of ${details.colorPalette || 'blue, purple, and teal'}. Modern minimalist desk setup with smartphone displaying same branded interface, wireless earbuds, and succulent plant. Set in contemporary home office with natural light and professional yet comfortable atmosphere. The scene is illuminated by soft window light from right side mixed with warm LED desk lamp and screen glow on hands, creating realistic multi-source lighting. Captured with 50mm lens at f/2.0, shot from slightly elevated 45-degree angle showing workspace context. Sharp focus on screen and hands in natural typing position, background softly blurred showing bookshelf and home office details. Natural imperfections: cable visible, coffee ring stain on desk pad, sticky note on monitor edge, everyday workspace authenticity. The image has bold, saturated colors from UI (vibrant blues and purples) contrasting with warm neutral workspace tones. Professional quality with authentic home office feel. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  firstImpression: (details) => `
A documentary-style candid photo of a satisfied business customer, ${details.gender || 'female'} in her ${details.age || '50s'} with natural ${details.appearance || 'gray-streaked hair'}, genuine relieved smile while looking at smartphone screen showing incoming call with professional branded caller ID display. Wearing business casual attire in her retail shop environment with product displays blurred in background. The moment captures authentic reaction to professional call handling. Set in well-lit modern small business interior during daytime with natural retail environment visible. The scene is illuminated by bright even overhead retail lighting mixed with natural storefront window light, creating professional yet authentic atmosphere. Captured with 35mm lens at f/2.8 from slightly below eye level (empowering angle), documentary photography approach. Natural moment with realistic skin texture, laugh lines visible, authentic expression of relief and satisfaction. Environmental portrait style showing business context. Background elements include: point-of-sale system, product shelves, real business environment details. The image has vibrant but professional color palette - bright retail lighting, colorful product displays in soft blur, warm human tones. Conveys trust, reliability, professionalism through genuine human moment. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  multiChannelCommunication: (details) => `
A clean modern flat-lay photograph shot from directly overhead showing desktop workspace with multiple communication channels visible: laptop displaying colorful unified communications dashboard with chat windows, video call interface, and phone system integration; smartphone showing text message conversation with customer; tablet showing email interface; all devices synchronized and showing same brand identity with ${details.colorPalette || 'bold blues, purples, or chosen brand palette'}. Modern desk surface (light wood or white) with minimal professional clutter: wireless headphones, coffee cup, notepad with handwritten notes, potted succulent plant. Set in well-lit modern office with even, professional lighting. The scene is illuminated by soft diffused overhead lighting creating minimal shadows, clean and bright atmosphere ideal for product photography. Captured from bird's eye view (directly overhead) with consistent focus across all elements, showcasing connectivity and seamless integration. All screens show cohesive brand colors with high contrast for visibility. The image conveys modern, integrated, efficient communication with bold colorful UI elements against clean neutral workspace. Professional product photography aesthetic but with authentic workspace touches (handwriting on notepad, slightly casual arrangement). ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),
};

/**
 * B2B Software/SaaS Templates
 */
export const b2bSoftwareTemplates = {
  dashboardShowcase: (details) => `
A professional environmental portrait showing a ${details.age || '32'}-year-old ${details.role || 'project manager'}, ${details.gender || 'female'}, wearing modern casual business attire (blazer over t-shirt), working intently on MacBook Pro with large vibrant software dashboard prominently displayed on screen showing ${details.softwareType || 'project management boards with colorful task cards'} with bold colorful UI elements (blues, purples, greens), clean data visualizations, and intuitive interface design. Set in contemporary co-working space with industrial-chic aesthetics - exposed brick, plants, natural wood furniture visible in soft background blur. The scene is illuminated by natural window light from left creating soft directional lighting mixed with warm ambient office lighting, professional yet approachable atmosphere. Captured with Canon EOS R5, 35mm lens at f/2.8, shot from slight side angle showing both face profile and clear screen view. Shallow depth of field with subject and screen in sharp focus, background beautifully blurred. Natural authentic details: slight concentration furrow in brow, hands naturally positioned on keyboard, visible skin texture with realistic complexion, casual ponytail with few loose strands. Desktop includes: coffee mug, smartphone, notepad with pen, authentic workspace elements. The image has vibrant professional color palette - saturated UI colors on screen (${details.colorPalette || 'blues and purples'}) contrasting with warm natural office tones. Conveys modern, efficient, professional software in real-world use. ${details.aspectRatio || ASPECT_RATIOS.SQUARE} for maximum mobile feed presence.
`.trim(),

  teamCollaboration: (details) => `
A candid documentary-style photo of diverse team of 3 professionals collaborating around laptop in modern office, mixed ages (late 20s to 40s) and ethnicities, casual professional attire, genuine expressions of engagement and focus - one pointing at screen, others leaning in naturally, authentic body language of productive collaboration. Laptop screen shows colorful collaborative software interface with ${details.softwareType || 'multiple user avatars and real-time updates visible'}. Set in bright modern office with large windows, contemporary furniture, plants visible, professional but comfortable environment. The scene is illuminated by abundant natural daylight from large windows creating soft even lighting, supplemented by warm office ambiance, energetic yet professional atmosphere. Captured with 50mm lens at f/2.0, slight motion blur on pointing hand to convey dynamic interaction, shot at eye level from team perspective. Focus on laptop screen and foreground person, others in slight blur for depth. Authentic environmental details: coffee cups on table, notebooks, phones, real meeting clutter. Natural skin textures, realistic expressions not posed, genuine moment of teamwork. The image has warm professional color palette with pops of vibrant color from software UI (${details.colorPalette || 'blues, greens, purples'}), natural wood tones, greenery from plants, inviting collaborative mood. Conveys real software usage in authentic business setting. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  resultsROI: (details) => `
A compelling product-focused photo showing laptop screen displaying bold analytics dashboard with impressive metrics highlighted: large colorful numbers showing growth (${details.metrics || 'percentage increases, revenue graphs trending upward, conversion rate improvements'}), vibrant data visualizations with gradients of success-oriented colors (greens, blues, golds). Happy business user visible in soft background blur - ${details.age || '38'}-year-old ${details.gender || 'male'} professional with genuine satisfied smile, leaning back in chair with relaxed confident posture. Set in modern office environment during afternoon with natural light. The scene is illuminated by screen glow creating dramatic lighting on data visualizations, mixed with soft window light, creating compelling focus on results. Captured with 50mm lens at f/1.8, tight focus on screen metrics with beautiful bokeh effect on background, professional product photography approach with human element. Screen shows: specific impressive numbers in large bold typography, upward trending graphs, success indicators, clean professional dashboard design in ${details.colorPalette || 'green, blue, and gold tones'}. The image has bold vibrant color palette emphasizing positive results - greens for growth, blues for trust, gold for success, high contrast for maximum impact. Conveys clear value proposition and measurable business outcomes. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  mobileRemoteWork: (details) => `
A authentic lifestyle photo of ${details.age || '35'}-year-old remote worker, ${details.gender || 'male'}, casual comfortable attire (hoodie), working from cozy home office corner, looking at smartphone in one hand showing your mobile app interface with bold colorful UI, other hand holding coffee mug, genuine focused expression with slight smile. Laptop open on small desk showing synchronized desktop version of same app. Set in warm inviting home environment with bookshelf, plants, string lights, window showing daylight, comfortable lived-in space not sterile or staged. The scene is illuminated by natural window light creating soft shadows and warm atmosphere, mixed with cozy warm lamp light, authentic home working environment. Captured with iPhone 14 Pro portrait mode creating smartphone photography aesthetic, slightly off-center casual composition, shot at comfortable arm's length. Natural authenticity: wrinkled comfortable clothes, messy hair, real home environment with books, personal items, authentic clutter. Shallow mobile depth of field with background softly blurred. The image has warm inviting color palette with vibrant mobile UI colors (${details.colorPalette || 'blues and purples'}) popping against cozy neutral home tones. Conveys flexibility, modern work style, accessible technology. ${details.aspectRatio || ASPECT_RATIOS.PORTRAIT} optimized for mobile viewing.
`.trim(),

  customerTestimonialUGC: (details) => `
A genuine selfie-style photo of happy customer, ${details.age || '42'}-year-old small business owner, ${details.gender || 'female'} with natural appearance (minimal makeup, casual hairstyle), authentic broad smile, holding smartphone at typical selfie angle showing your app/software on screen in background blur. Wearing casual business clothing in her actual business environment (${details.businessType || 'bakery/shop/office'} visible behind her with real business elements - products, equipment, signage in soft blur). Natural moment of satisfaction and success. Set in her real business location during business hours with natural activity happening. The scene is illuminated by mixed natural and business interior lighting - slightly imperfect lighting creating authentic smartphone photo aesthetic, maybe slight overexposure from window, realistic lighting variations. Captured as if taken on iPhone in selfie mode, slightly elevated angle, imperfect framing (slightly off-center), authentic smartphone photo quality with slight grain, natural color grading with warm tones. Genuine imperfections: natural skin texture with visible pores, slight shine, laugh lines, realistic appearance not retouched. Background shows authentic business environment with minor clutter, real-world setting. The image has warm authentic color palette, smartphone photo characteristics, real-user-generated-content feel. Conveys genuine customer satisfaction and real-world usage. ${details.aspectRatio || ASPECT_RATIOS.PORTRAIT} for mobile-native UGC aesthetic.
`.trim(),
};

/**
 * E-commerce Product Templates
 */
export const ecommerceProductTemplates = {
  productShowcase: (details) => `
A professional high-quality product photography shot of ${details.productType || 'featured product'} positioned prominently in center frame against clean ${details.backgroundColor || 'white or soft pastel'} background with subtle gradient. Product is well-lit with multiple light sources showing texture and details clearly. Lifestyle context elements arranged around product: ${details.lifestyleElements || 'complementary props, fresh flowers, natural textures like marble or wood'}. The scene is illuminated by soft diffused studio lighting from multiple angles creating subtle shadows that add depth without harsh contrasts, professional e-commerce photography quality. Captured with Canon EOS R5, 50mm macro lens at f/4 for sharp product focus with slight background blur, overhead or 45-degree angle depending on product type. The image has ${details.colorPalette || 'bold vibrant brand colors'} with product colors popping against clean background, high contrast for maximum visibility in feed. Professional color grading with saturated tones. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  lifestyleInUse: (details) => `
An authentic lifestyle photo showing ${details.age || '28'}-year-old ${details.gender || 'person'} using or wearing the product in natural everyday environment, genuine smile and relaxed body language showing satisfaction and enjoyment. Product is clearly visible and identifiable but feels naturally integrated into the scene. Set in ${details.environment || 'modern home, urban outdoor setting, or lifestyle location'} with natural elements, good lighting, and aspirational yet achievable aesthetic. The scene is illuminated by natural golden hour sunlight creating warm glowing atmosphere, or bright indoor natural light for fresh clean look. Captured with smartphone camera aesthetic (iPhone portrait mode) for authentic UGC feel, shot from eye level or slightly above. Natural imperfections: real environment, authentic moment, genuine expression. Background shows relatable lifestyle setting. The image has warm inviting color palette with ${details.colorPalette || 'vibrant product colors'} standing out naturally. Conveys authentic customer satisfaction and real-world usage. ${details.aspectRatio || ASPECT_RATIOS.PORTRAIT}.
`.trim(),

  beforeAfter: (details) => `
A compelling split-screen or side-by-side composition showing clear before and after transformation. Left side shows the problem state: ${details.beforeState || 'unstyled, disorganized, or unflattering lighting'} with muted colors and less appealing presentation. Right side shows after state with product: dramatically improved, vibrant, organized, and visually appealing with ${details.afterState || 'transformation clearly visible'}. Text overlay areas left clear for "BEFORE" and "AFTER" labels. Set in same environment both sides for clear comparison. The scene is illuminated by contrasting lighting - before side slightly underlit or flat, after side with bright professional lighting showing improvement. Captured with consistent angle both sides, same camera settings for fair comparison, split composition with clear dividing line. The image has contrasting color grading - before side desaturated or cool toned, after side vibrant with ${details.colorPalette || 'bold saturated colors'}. Conveys clear product value and dramatic results. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  unboxingMoment: (details) => `
An authentic top-down flat lay photo of product unboxing experience showing brand packaging opened to reveal product inside, arranged aesthetically with all components visible: product, packaging materials, any included accessories, branded elements. Hands ${details.includeHands ? 'naturally positioned holding or reaching for product' : 'subtly visible at edges'} showing human interaction. Set on clean modern surface (${details.surface || 'white marble, light wood, or soft fabric background'}). The scene is illuminated by bright even overhead lighting creating minimal shadows, clean e-commerce aesthetic. Captured from directly overhead (bird's eye view), everything in focus showing complete unboxing spread, shot with smartphone or DSLR at f/5.6. The image has clean fresh color palette with ${details.colorPalette || 'brand colors'} from packaging popping against neutral background, professional product photography feel with UGC authenticity. Conveys premium unboxing experience and product quality. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  socialProof: (details) => `
A creative collage-style composition showing multiple customer photos using or enjoying the product in various real-life settings, authentic UGC aesthetic with 3-5 different photos arranged dynamically. Each photo shows different ${details.demographics || 'age, gender, and ethnicity'} creating inclusive representation. Photos have authentic smartphone quality, genuine expressions, real environments not staged. Center features the product prominently. The scene is illuminated by mixed natural lighting from various customer photos creating authentic varied atmosphere. Captured in Instagram post style or Pinterest grid layout, multiple aspect ratios combined artistically. The image has diverse but cohesive color palette unified by ${details.colorPalette || 'brand accent colors'} or subtle overlay. Conveys social proof, popularity, and real customer satisfaction. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),
};

/**
 * Professional Services Templates
 */
export const professionalServicesTemplates = {
  expertConsultation: (details) => `
A professional environmental portrait of ${details.age || '45'}-year-old ${details.profession || 'consultant'}, ${details.gender || 'professional'} in sharp business attire, confident posture, genuine warm smile that conveys approachability and expertise. Set in modern professional office with floor-to-ceiling windows showing city view, sleek furniture, professional library or credentials visible in soft background blur. The scene is illuminated by natural window light mixed with warm office lighting creating professional yet welcoming atmosphere. Captured with 85mm portrait lens at f/2.0, shallow depth of field focusing on professional's face and upper body, background beautifully blurred. Professional retouching maintaining natural appearance. The image has ${details.colorPalette || 'sophisticated professional colors - navy, gray, gold accents'}. Conveys trust, expertise, and approachability. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  clientSuccess: (details) => `
A candid documentary-style photo showing professional and satisfied client in consultation or working session, genuine moment of connection and successful outcome. Client showing expression of relief, understanding, or satisfaction. Professional visible but focus on client's positive reaction. Set in comfortable professional environment: modern office, consultation room, or appropriate setting for service type. The scene is illuminated by natural soft lighting creating comfortable atmosphere not harsh or sterile. Captured with 35mm lens at f/2.8, photojournalistic style capturing authentic moment, slight motion blur acceptable for authenticity. Natural environmental details visible. The image has warm professional color palette with ${details.colorPalette || 'trustworthy blues and greens'}. Conveys successful outcomes and client satisfaction. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  processVisualization: (details) => `
A clean infographic-style photo showing professional service process as visual journey: 3-4 steps clearly represented through either physical objects, workspace setups, or visual metaphors arranged left to right or in circular flow. Each step has clear visual representation. Professional hands visible interacting with elements showing guidance through process. Set against clean background or in professional environment. The scene is illuminated by bright even lighting ensuring all process steps are clearly visible, professional photography quality. Captured from optimal angle showing full process flow, everything in sharp focus, shot with wide lens at f/8. The image has clear color coding for each step using ${details.colorPalette || 'professional brand colors'}, high contrast for visibility. Conveys clear process, professionalism, and systematic approach. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),
};

/**
 * Local Services Templates
 */
export const localServicesTemplates = {
  atWorkAction: (details) => `
A dynamic action photo showing ${details.profession || 'service professional'} actively working on-site: ${details.action || 'plumber fixing pipes, electrician working on panel, cleaner transforming space'}, wearing professional uniform or work attire with company branding visible, focused concentration and professional demeanor. Work in progress clearly visible showing competence and care. Set in real customer location: home, business, or appropriate environment for service. The scene is illuminated by practical on-site lighting: natural light through windows, work lights, realistic service call environment. Captured with wide angle lens showing context of work environment and professional at work, shot at f/4, slight motion blur on hands showing active work. Authentic work environment with real tools and equipment visible. The image has authentic working environment colors with ${details.colorPalette || 'bold company brand colors'} from uniform standing out. Conveys professionalism, expertise in action, and real service delivery. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  satisfiedCustomer: (details) => `
A heartwarming photo showing happy homeowner/business owner expressing genuine satisfaction with completed work, authentic smile and relieved/pleased expression, gesturing toward or standing near the completed service work visible in background. Service professional partially visible or standing beside customer. Set in customer's real location showing before/after context of service. The scene is illuminated by natural lighting creating warm welcoming atmosphere showing completed work in best light. Captured at eye level, documentary style showing authentic customer reaction, shot with 35mm lens at f/2.8. Natural environment and genuine expressions. The image has warm inviting color palette with ${details.colorPalette || 'service brand colors'} subtly visible. Conveys customer satisfaction, trust, and successful service completion. ${details.aspectRatio || ASPECT_RATIOS.PORTRAIT}.
`.trim(),

  teamAndVehicle: (details) => `
A professional group photo showing service team of 2-4 professionals in branded uniforms standing proudly in front of company vehicle with clear branding and logo visible. Team members with confident friendly expressions, professional posture, tools or equipment visible. Vehicle clean and well-maintained showing professionalism. Set in typical service area: residential neighborhood, commercial area, or outside customer location with clean background. The scene is illuminated by bright daylight creating clear visibility of branding and team, professional photography quality. Captured from slight low angle giving team authoritative yet approachable presence, shot with 35mm lens at f/5.6 keeping team and vehicle in focus. The image has bold colors with ${details.colorPalette || 'company brand colors'} prominent on uniforms and vehicle. Conveys established business, professional team, and local service presence. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),
};

/**
 * Digital Products Templates
 */
export const digitalProductTemplates = {
  screenShowcase: (details) => `
A sleek modern product mockup showing ${details.productType || 'digital product'} displayed across multiple devices: laptop, tablet, and smartphone showing interface in synchronized state. Devices arranged in dynamic composition showing different screens/features of product on each device. Set against clean gradient background (${details.backgroundColor || 'modern gradient of brand colors'}) or floating with subtle shadows. The scene is illuminated by soft dramatic lighting with screen glow effects highlighting UI, professional product photography style. Captured with 50mm lens at f/4, all devices in sharp focus, perfect alignment, shot from 30-degree angle. Clean professional rendering with vibrant UI colors on screens. The image has bold modern color palette with ${details.colorPalette || 'vibrant UI colors'} from screens against complementary background. Conveys modern technology, cross-platform compatibility, professional software. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  creatorAtWork: (details) => `
An authentic lifestyle photo showing ${details.age || '32'}-year-old digital creator/entrepreneur working with your digital product, genuine focused expression mixed with satisfied smile, clearly engaged and productive. Product interface clearly visible on screen showing key features. Set in aspirational but achievable workspace: modern home office, coffee shop, or co-working space with plants, natural light, aesthetic workspace setup. The scene is illuminated by warm natural window light mixed with cozy ambient lighting creating inspiring creative atmosphere. Captured with 35mm lens at f/2.0, shot from slightly behind shoulder showing both person and screen, shallow depth of field. Authentic workspace details: coffee, notebook, natural clutter. The image has warm inspiring color palette with ${details.colorPalette || 'vibrant product UI colors'} popping from screen. Conveys productivity, creative freedom, digital lifestyle. ${details.aspectRatio || ASPECT_RATIOS.PORTRAIT}.
`.trim(),

  resultsMetrics: (details) => `
A compelling data visualization photo showing laptop or tablet displaying impressive metrics dashboard from using digital product: bold numbers showing growth, revenue increase, time saved, or other success metrics with ${details.metrics || 'upward trending graphs, green positive indicators, impressive percentages'}. Happy user partially visible in soft background blur showing satisfaction. Set in professional environment during daytime. The scene is illuminated by screen glow creating dramatic effect on data visualizations, mixed with ambient lighting. Captured with 50mm lens at f/1.8, tight focus on impressive metrics on screen, beautiful bokeh background. The image has bold success-oriented color palette: greens for growth, blues for trust, gold for achievement, using ${details.colorPalette || 'brand colors'}. Conveys measurable results, ROI, proven success. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),
};

/**
 * AI Software Templates (AI-powered tools and platforms)
 */
export const aiSoftwareTemplates = {
  aiDashboard: (details) => `
A sleek futuristic photo showing laptop displaying AI-powered dashboard with glowing neural network visualizations, animated data streams, colorful AI model outputs, and intelligent insights highlighted. User ${details.age || '32'}-year-old professional with focused satisfied expression viewing impressive AI-generated results. Set in modern tech workspace with ambient lighting. The scene is illuminated by vibrant screen glow casting blue-purple light on face, mixed with soft ambient lighting creating cutting-edge tech atmosphere. Captured with 50mm lens at f/1.8, screen in sharp focus showing AI visualizations. The image has futuristic color palette - electric blues, neon purples, cyan with ${details.colorPalette || 'AI-themed gradients'}. Conveys advanced technology, intelligence, automation. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  aiAutomation: (details) => `
A compelling before/after style composition showing automated workflow: left side shows stressed person with cluttered manual process, right side shows same person relaxed with AI handling everything automatically - robotic arms or AI symbols processing work in background, clean organized automated dashboard visible. Set in modern office environment. The scene is illuminated by contrasting lighting - left dimmer and stressful, right bright and optimized. Captured at eye level showing clear transformation story. The image has contrasting color palette transforming from muted stressful tones to vibrant ${details.colorPalette || 'successful blues and greens'}. Conveys AI solving real problems. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  aiResults: (details) => `
A dramatic product shot showing multiple screens displaying AI-generated impressive results: content created, data analyzed, tasks completed - all with stunning speed metrics and quality indicators. Professional hands holding tablet showing AI dashboard with "complete" checkmarks and success metrics. Set against modern minimalist background. The scene is illuminated by dramatic screen glow with colorful AI outputs creating vibrant lighting. Captured with shallow depth of field focusing on results screens. The image has bold success-oriented palette - greens for completion, blues for intelligence, ${details.colorPalette || 'gold for achievement'}. Conveys AI efficiency and capability. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  conversationalAI: (details) => `
A modern photo showing person having natural conversation with AI assistant displayed on multiple devices - smartphone showing chat interface with intelligent responses, laptop displaying conversation history, tablet showing AI understanding context. User ${details.age || '35'}-year-old with amazed pleased expression. Set in comfortable modern workspace. The scene is illuminated by warm inviting lighting making AI feel approachable and helpful. Captured showing human-AI interaction naturally. The image has friendly tech palette mixing warm human tones with ${details.colorPalette || 'cool tech blues and purples'}. Conveys accessible AI interaction. ${details.aspectRatio || ASPECT_RATIOS.PORTRAIT}.
`.trim(),

  aiPoweredTeam: (details) => `
A dynamic photo showing diverse team collaborating with AI assistance visible on shared screen - AI providing recommendations, insights, and support in real-time. Team of 3 professionals engaged with AI-enhanced workflow showing productivity boost. Set in collaborative modern workspace. The scene is illuminated by bright energetic lighting with AI screen elements adding colorful glow. Captured from angle showing both team and AI interface clearly. The image has collaborative energy palette with ${details.colorPalette || 'vibrant blues, purples, energetic oranges'}. Conveys AI as team amplifier. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),
};

/**
 * Call Automation & AI Phone Systems Templates
 */
export const callAutomationTemplates = {
  aiReceptionist: (details) => `
A split-screen or layered composition showing AI voice assistant interface on one side with sound waves, voice recognition graphics, and friendly AI avatar, while other side shows satisfied business owner relaxing knowing AI handles all calls. Smartphone displaying incoming call with AI branding answering automatically. Set in modern business environment. The scene is illuminated by tech-forward lighting with AI interface glowing attractively. Captured showing seamless AI call handling. The image has modern tech palette - ${details.colorPalette || 'teal for communication, purple for AI, orange for energy'}. Conveys 24/7 AI call coverage. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  callFlowAutomation: (details) => `
A clean technical visualization showing phone call journey: incoming call icon flowing through AI routing system with branching paths, intelligent decision points highlighted, ending at perfect destination - all displayed on modern interface. Hands pointing at screen showing automated call flow working flawlessly. Set against professional gradient background. The scene is illuminated by screen glow emphasizing data flow and automation. Captured from optimal angle showing complete automated system. The image has flow-oriented palette with ${details.colorPalette || 'blues for calls, greens for success routing, oranges for highlights'}. Conveys intelligent automation. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  neverMissCall: (details) => `
A powerful before/after composition: left shows missed call notifications piling up on phone screen with stressed business owner, right shows AI system catching every call with green checkmarks and happy caller interactions visualized. Set in business environment showing transformation. The scene is illuminated by contrasting moods - stressed left, relieved confident right. Captured showing problem-solution narrative. The image has dramatic transformation palette from ${details.colorPalette || 'frustrated reds to successful greens'}. Conveys problem solved completely. ${details.aspectRatio || ASPECT_RATIOS.PORTRAIT}.
`.trim(),

  realTimeCallHandling: (details) => `
A dynamic action shot showing AI system actively handling multiple calls simultaneously - multiple call windows open on dashboard, AI responding to each in real-time, live transcriptions appearing, caller satisfaction indicators green. Impressed business owner watching AI work magic. Set in modern tech environment. The scene is illuminated by energetic multi-screen glow showing system activity. Captured showing AI multitasking capability. The image has active professional palette with ${details.colorPalette || 'multiple vibrant colors for different active calls'}. Conveys AI handling high volume effortlessly. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  smartCallAnalytics: (details) => `
A compelling product shot showing call analytics dashboard with impressive insights: call volume graphs trending up, customer satisfaction scores high, AI conversation quality metrics excellent, revenue impact highlighted. Professional viewing dashboard with satisfied expression. Set in executive office environment. The scene is illuminated by dashboard screen creating data-focused atmosphere. Captured showing ROI and value clearly. The image has success-driven palette - ${details.colorPalette || 'greens for growth, blues for trust, gold for achievement'}. Conveys measurable business impact. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),
};

/**
 * Automation Tools Templates
 */
export const automationToolsTemplates = {
  workflowAutomation: (details) => `
A visual representation of automated workflow showing connected nodes, data flowing automatically between applications, tasks completing themselves - all displayed on modern interface. Professional ${details.age || '34'}-year-old with amazed expression watching automation work. Set in clean modern workspace. The scene is illuminated by vibrant screen showing automation in action. Captured showing complete workflow visualization. The image has technical flow palette with ${details.colorPalette || 'blues for data, purples for automation, greens for completion'}. Conveys powerful automation. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  timeReclaimed: (details) => `
A lifestyle photo showing relaxed professional leaning back confidently with automation tools running in background on laptop screen - tasks completing automatically, notifications of finished work appearing. Clock or time visual element emphasizing hours saved. Set in comfortable modern office. The scene is illuminated by warm satisfying lighting showing work-life balance achieved. Captured showing freedom and relief. The image has liberating palette mixing ${details.colorPalette || 'warm human satisfaction with cool automated efficiency blues'}. Conveys time freedom. ${details.aspectRatio || ASPECT_RATIOS.PORTRAIT}.
`.trim(),

  zapierStyle: (details) => `
A clean flat-lay or interface shot showing multiple app logos connected by flowing animated lines representing automated data transfer - emails, spreadsheets, CRMs, calendars all syncing automatically. Central automation hub glowing. Set against modern gradient or clean background. The scene is illuminated by even professional lighting emphasizing connection clarity. Captured from overhead showing complete automation ecosystem. The image has connected tech palette with ${details.colorPalette || 'multiple brand colors unified by automation purple/blue'}. Conveys integration power. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  eliminateRepetitive: (details) => `
A before/after split showing same person: left side manually doing repetitive task looking exhausted with piles of work, right side same person with automation running showing completed work and relaxed satisfied expression. Automation interface visible on right. Set in office environment. The scene is illuminated by contrasting energy - tired dim left, energized bright right. Captured showing transformation story. The image has contrasting emotional palette from ${details.colorPalette || 'exhausted grays to energized vibrant colors'}. Conveys automation as solution. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  businessAccelerator: (details) => `
A dynamic photo showing automation dashboard with speed metrics, throughput increases, efficiency gains all trending dramatically upward. Professional viewing impressive growth numbers with excited expression. Rocket or speed visual metaphors subtly integrated. Set in modern tech workspace. The scene is illuminated by exciting screen glow with success metrics. Captured emphasizing upward momentum. The image has acceleration palette - ${details.colorPalette || 'vibrant oranges for speed, blues for growth, greens for success'}. Conveys business growth through automation. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),
};

/**
 * Courses & Education Templates
 */
export const coursesEducationTemplates = {
  learnerSuccess: (details) => `
An inspiring photo showing ${details.age || '28'}-year-old student/learner having breakthrough moment while learning, genuine expression of understanding and excitement, sitting at desk with laptop showing course interface, maybe holding certificate or notebook with notes. Energized body language showing progress and achievement. Set in comfortable modern learning environment: bright home office, library, or coffee shop with natural light. The scene is illuminated by bright natural lighting creating energetic positive learning atmosphere. Captured with 35mm lens at f/2.8, shot at eye level showing connection with viewer, slight motion showing energy and excitement. Course interface on screen clearly visible. The image has bright energetic color palette with ${details.colorPalette || 'vibrant blues, greens, oranges'} creating motivated learning mood. Conveys transformation, skill development, achievable success. ${details.aspectRatio || ASPECT_RATIOS.PORTRAIT}.
`.trim(),

  instructorCredibility: (details) => `
A professional portrait of course instructor/educator, ${details.age || '40'}-year-old ${details.gender || 'expert'} with warm approachable smile and confident professional presence, dressed in smart casual attire. Credentials or achievements visible in background: degrees, awards, or indicators of expertise subtly displayed. Set in professional setting: modern office, studio, or library with quality production value. The scene is illuminated by professional three-point lighting setup creating polished look while maintaining warmth and approachability. Captured with 85mm portrait lens at f/2.0, shallow depth of field with instructor in sharp focus, background softly blurred showing context. Professional color grading. The image has professional trustworthy color palette using ${details.colorPalette || 'blues and warm tones'} conveying expertise and approachability. Conveys credibility, expertise, and mentorship. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),

  courseContentPreview: (details) => `
A clean organized flat lay showing course materials and learning journey: laptop or tablet displaying course dashboard with lesson modules visible, printed workbook or study materials, notebook with handwritten notes, highlighters, coffee cup, motivational quote card, progress tracker showing advancement. Everything arranged aesthetically on clean desk surface. The scene is illuminated by bright overhead lighting creating clean bright learning environment, minimal shadows. Captured from directly overhead (bird's eye view) with everything in focus, shot at f/8, showing complete learning ecosystem. The image has organized educational color palette with ${details.colorPalette || 'bright blues, greens, warm accents'} creating energetic learning mood. Conveys comprehensive curriculum, structured learning, tangible progress. ${details.aspectRatio || ASPECT_RATIOS.SQUARE}.
`.trim(),
};

/**
 * Generate a prompt based on template selection and user inputs
 */
export function generateGeminiPrompt(inputs) {
  const {
    category,
    template,
    style,
    description,
    targetAudience,
    industry,
    colorPalette,
    aspectRatio,
    customDetails = {},
    imageDescription,
    moodKeywords,
    visualEmphasis,
    avoidInImage
  } = inputs;

  // Build details object
  const details = {
    colorPalette: colorPalette || COLOR_PALETTES[industry] || 'vibrant professional colors',
    aspectRatio: aspectRatio || ASPECT_RATIOS.SQUARE,
    ...customDetails,
  };

  // Add user description context if provided
  let prompt = '';

  // Select template
  if (category === TEMPLATE_CATEGORIES.PHONE_SERVICES) {
    const templateFunc = phoneServiceTemplates[template];
    if (templateFunc) prompt = templateFunc(details);
  } else if (category === TEMPLATE_CATEGORIES.B2B_SOFTWARE || category === TEMPLATE_CATEGORIES.BUSINESS_TOOLS || category === TEMPLATE_CATEGORIES.SERVICE_BUSINESS) {
    const templateFunc = b2bSoftwareTemplates[template];
    if (templateFunc) prompt = templateFunc(details);
  } else if (category === TEMPLATE_CATEGORIES.AI_SOFTWARE) {
    const templateFunc = aiSoftwareTemplates[template];
    if (templateFunc) prompt = templateFunc(details);
  } else if (category === TEMPLATE_CATEGORIES.AUTOMATION_TOOLS) {
    const templateFunc = automationToolsTemplates[template];
    if (templateFunc) prompt = templateFunc(details);
  } else if (category === TEMPLATE_CATEGORIES.CALL_AUTOMATION || category === TEMPLATE_CATEGORIES.COMMUNICATION_PLATFORM) {
    const templateFunc = callAutomationTemplates[template];
    if (templateFunc) prompt = templateFunc(details);
  } else if (category === TEMPLATE_CATEGORIES.ECOMMERCE_PRODUCTS || category === TEMPLATE_CATEGORIES.PHYSICAL_PRODUCTS) {
    const templateFunc = ecommerceProductTemplates[template];
    if (templateFunc) prompt = templateFunc(details);
  } else if (category === TEMPLATE_CATEGORIES.PROFESSIONAL_SERVICES) {
    const templateFunc = professionalServicesTemplates[template];
    if (templateFunc) prompt = templateFunc(details);
  } else if (category === TEMPLATE_CATEGORIES.LOCAL_SERVICES) {
    const templateFunc = localServicesTemplates[template];
    if (templateFunc) prompt = templateFunc(details);
  } else if (category === TEMPLATE_CATEGORIES.DIGITAL_PRODUCTS || category === TEMPLATE_CATEGORIES.LEAD_GENERATION) {
    const templateFunc = digitalProductTemplates[template];
    if (templateFunc) prompt = templateFunc(details);
  } else if (category === TEMPLATE_CATEGORIES.COURSES_EDUCATION || category === TEMPLATE_CATEGORIES.MEMBERSHIP_SUBSCRIPTION) {
    const templateFunc = coursesEducationTemplates[template];
    if (templateFunc) prompt = templateFunc(details);
  }

  // ENHANCED: Intelligently merge user's image description with template
  if (imageDescription && imageDescription.trim().length > 0) {
    // Strategy: User's vision takes priority, but we enhance it with template's technical quality

    // Extract technical elements from template (lighting, camera, quality descriptors)
    const technicalEnhancements = extractTechnicalElements(prompt);

    // Build enhanced prompt with user's vision as core
    prompt = buildEnhancedPrompt({
      userVision: imageDescription,
      templateTechnical: technicalEnhancements,
      moodKeywords,
      visualEmphasis,
      avoidInImage,
      colorPalette: details.colorPalette,
      aspectRatio: details.aspectRatio,
      context: {
        description,
        targetAudience,
        industry
      }
    });
  } else {
    // Fallback: Use template as-is with context
    if (description) {
      prompt = `Context: Creating a Facebook ad image for ${description}. Target audience: ${targetAudience || 'B2B professionals'}.\n\n${prompt}`;
    }
  }

  return prompt;
}

/**
 * Extract technical quality elements from template prompt
 * @private
 */
function extractTechnicalElements(templatePrompt) {
  const elements = {
    lighting: '',
    camera: '',
    quality: '',
    style: ''
  };

  // Extract lighting descriptions
  const lightingMatch = templatePrompt.match(/illuminated by[^.]+\./i) ||
                       templatePrompt.match(/lighting[^.]+\./i);
  if (lightingMatch) {
    elements.lighting = lightingMatch[0];
  }

  // Extract camera specifications
  const cameraMatch = templatePrompt.match(/captured with[^.]+\./i) ||
                     templatePrompt.match(/\d+mm[^.]+\./i);
  if (cameraMatch) {
    elements.camera = cameraMatch[0];
  }

  // Extract quality descriptors
  const qualityTerms = ['photorealistic', 'professional', 'high-quality', 'detailed', 'sharp focus', 'natural', 'authentic'];
  qualityTerms.forEach(term => {
    if (templatePrompt.toLowerCase().includes(term)) {
      elements.quality += term + ', ';
    }
  });

  // Extract style descriptors
  const styleMatch = templatePrompt.match(/(professional|modern|contemporary|sleek|clean|vibrant)[^.]*aesthetic/i);
  if (styleMatch) {
    elements.style = styleMatch[0];
  }

  return elements;
}

/**
 * Build enhanced prompt merging user vision with technical quality
 * @private
 */
function buildEnhancedPrompt(params) {
  const {
    userVision,
    templateTechnical,
    moodKeywords,
    visualEmphasis,
    avoidInImage,
    colorPalette,
    aspectRatio,
    context
  } = params;

  // Start with business context
  let enhancedPrompt = `Context: Creating a high-converting Facebook ad image for ${context.description}. Target audience: ${context.targetAudience}.\n\n`;

  // User's core vision (PRIMARY - what they want to see)
  enhancedPrompt += `PRIMARY VISION: ${userVision}\n\n`;

  // Add mood if specified
  if (moodKeywords && moodKeywords.trim()) {
    enhancedPrompt += `MOOD & ATMOSPHERE: The image should convey a ${moodKeywords} feeling. `;
  }

  // Add visual emphasis if specified
  if (visualEmphasis && visualEmphasis.trim()) {
    enhancedPrompt += `VISUAL EMPHASIS: ${visualEmphasis}. `;
  }

  // Add technical quality enhancements from template
  enhancedPrompt += `\n\nTECHNICAL SPECIFICATIONS for professional ad quality:\n`;

  // Lighting
  if (templateTechnical.lighting) {
    enhancedPrompt += `- Lighting: ${templateTechnical.lighting}\n`;
  } else {
    enhancedPrompt += `- Lighting: Soft diffused natural lighting creating professional yet approachable atmosphere, avoiding harsh shadows.\n`;
  }

  // Camera/composition
  if (templateTechnical.camera) {
    enhancedPrompt += `- Camera: ${templateTechnical.camera}\n`;
  } else {
    enhancedPrompt += `- Camera: Professional photography with 50mm lens at f/2.8, shallow depth of field, sharp focus on main subject.\n`;
  }

  // Quality
  enhancedPrompt += `- Quality: Photorealistic, high-resolution, professional commercial photography quality. ${templateTechnical.quality}Natural authentic details with realistic textures, genuine expressions, and real-world imperfections that add authenticity.\n`;

  // Colors
  enhancedPrompt += `- Color Palette: ${colorPalette} with vibrant saturated tones optimized for social media visibility.\n`;

  // Aspect ratio
  enhancedPrompt += `- Format: ${aspectRatio} optimized for Facebook ads.\n`;

  // Style
  if (templateTechnical.style) {
    enhancedPrompt += `- Overall Style: ${templateTechnical.style}, balancing professionalism with authentic human connection.\n`;
  }

  // Add what to avoid (negative prompting)
  if (avoidInImage && avoidInImage.trim()) {
    enhancedPrompt += `\nNEGATIVE PROMPT (avoid these elements): ${avoidInImage}\n`;
  }

  // Always avoid these for Facebook ads
  enhancedPrompt += `\nAlways avoid: overly staged stock photo feel, artificial or plastic appearance, cluttered busy backgrounds that distract, poor lighting, blurry or low-resolution elements, text that's unreadable, faces that look AI-generated or uncanny.\n`;

  // Final quality note
  enhancedPrompt += `\nFINAL OUTPUT: Create an authentic, scroll-stopping Facebook ad image that immediately captures attention, builds trust through genuine human elements, and clearly communicates the value proposition visually. The image must look professional yet relatable, polished yet authentic.`;

  return enhancedPrompt;
}

/**
 * Get available templates for a category
 */
export function getTemplatesForCategory(category) {
  const templateMap = {
    [TEMPLATE_CATEGORIES.PHONE_SERVICES]: { templates: phoneServiceTemplates, type: 'phone' },
    [TEMPLATE_CATEGORIES.B2B_SOFTWARE]: { templates: b2bSoftwareTemplates, type: 'b2b' },
    [TEMPLATE_CATEGORIES.BUSINESS_TOOLS]: { templates: b2bSoftwareTemplates, type: 'b2b' },
    [TEMPLATE_CATEGORIES.SERVICE_BUSINESS]: { templates: b2bSoftwareTemplates, type: 'b2b' },
    [TEMPLATE_CATEGORIES.AI_SOFTWARE]: { templates: aiSoftwareTemplates, type: 'ai' },
    [TEMPLATE_CATEGORIES.AUTOMATION_TOOLS]: { templates: automationToolsTemplates, type: 'automation' },
    [TEMPLATE_CATEGORIES.CALL_AUTOMATION]: { templates: callAutomationTemplates, type: 'call_automation' },
    [TEMPLATE_CATEGORIES.COMMUNICATION_PLATFORM]: { templates: callAutomationTemplates, type: 'call_automation' },
    [TEMPLATE_CATEGORIES.ECOMMERCE_PRODUCTS]: { templates: ecommerceProductTemplates, type: 'ecommerce' },
    [TEMPLATE_CATEGORIES.PHYSICAL_PRODUCTS]: { templates: ecommerceProductTemplates, type: 'ecommerce' },
    [TEMPLATE_CATEGORIES.PROFESSIONAL_SERVICES]: { templates: professionalServicesTemplates, type: 'professional' },
    [TEMPLATE_CATEGORIES.LOCAL_SERVICES]: { templates: localServicesTemplates, type: 'local' },
    [TEMPLATE_CATEGORIES.DIGITAL_PRODUCTS]: { templates: digitalProductTemplates, type: 'digital' },
    [TEMPLATE_CATEGORIES.LEAD_GENERATION]: { templates: digitalProductTemplates, type: 'digital' },
    [TEMPLATE_CATEGORIES.COURSES_EDUCATION]: { templates: coursesEducationTemplates, type: 'courses' },
    [TEMPLATE_CATEGORIES.MEMBERSHIP_SUBSCRIPTION]: { templates: coursesEducationTemplates, type: 'courses' },
  };

  const config = templateMap[category];
  if (config) {
    return Object.keys(config.templates).map(key => ({
      id: key,
      name: formatTemplateName(key),
      description: getTemplateDescription(key, config.type)
    }));
  }

  // Fallback to B2B templates for any unmapped categories
  return Object.keys(b2bSoftwareTemplates).map(key => ({
    id: key,
    name: formatTemplateName(key),
    description: getTemplateDescription(key, 'b2b')
  }));
}

function formatTemplateName(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function getTemplateDescription(key, category) {
  const descriptions = {
    phone: {
      professionalReceptionist: 'Professional receptionist in modern office with call dashboard',
      businessOwnerFreedom: 'Business owner enjoying freedom thanks to answering service',
      callCenterTechnology: 'Modern phone system dashboard and technology showcase',
      firstImpression: 'Customer satisfaction moment showing professional call handling',
      multiChannelCommunication: 'Multi-device omnichannel communication setup',
    },
    b2b: {
      dashboardShowcase: 'Professional using your software dashboard in modern workspace',
      teamCollaboration: 'Team collaborating around laptop showing your software',
      resultsROI: 'Analytics dashboard showing impressive growth metrics',
      mobileRemoteWork: 'Remote worker using mobile app from home office',
      customerTestimonialUGC: 'Customer selfie testimonial in their business',
    },
    ai: {
      aiDashboard: 'Futuristic AI dashboard with neural network visualizations',
      aiAutomation: 'Before/after showing AI automating manual work',
      aiResults: 'Impressive AI-generated results and metrics displayed',
      conversationalAI: 'Natural conversation with AI assistant across devices',
      aiPoweredTeam: 'Team collaborating with AI assistance and recommendations',
    },
    automation: {
      workflowAutomation: 'Visual workflow showing automated task connections',
      timeReclaimed: 'Relaxed professional with automation running in background',
      zapierStyle: 'App logos connected by automated data flows',
      eliminateRepetitive: 'Before/after of manual vs automated repetitive work',
      businessAccelerator: 'Speed and efficiency metrics showing business growth',
    },
    call_automation: {
      aiReceptionist: 'AI voice assistant handling calls automatically',
      callFlowAutomation: 'Intelligent call routing system visualization',
      neverMissCall: 'Before/after showing zero missed calls with AI',
      realTimeCallHandling: 'AI handling multiple calls simultaneously',
      smartCallAnalytics: 'Call analytics dashboard showing business impact',
    },
    ecommerce: {
      productShowcase: 'Professional product photography with lifestyle elements',
      lifestyleInUse: 'Customer using product in authentic everyday setting',
      beforeAfter: 'Compelling transformation showing problem and solution',
      unboxingMoment: 'Aesthetic unboxing experience flat lay',
      socialProof: 'Collage of real customer photos with product',
    },
    professional: {
      expertConsultation: 'Professional portrait showing expertise and approachability',
      clientSuccess: 'Satisfied client in consultation showing successful outcome',
      processVisualization: 'Clear visual journey of service process steps',
    },
    local: {
      atWorkAction: 'Service professional actively working on-site',
      satisfiedCustomer: 'Happy customer with completed service work',
      teamAndVehicle: 'Professional team with branded service vehicle',
    },
    digital: {
      screenShowcase: 'Multi-device mockup showing digital product interface',
      creatorAtWork: 'Digital creator working with product in inspiring workspace',
      resultsMetrics: 'Impressive metrics dashboard showing product success',
    },
    courses: {
      learnerSuccess: 'Student having breakthrough moment while learning',
      instructorCredibility: 'Professional educator portrait showing expertise',
      courseContentPreview: 'Flat lay of course materials and learning journey',
    },
  };

  return descriptions[category]?.[key] || '';
}
