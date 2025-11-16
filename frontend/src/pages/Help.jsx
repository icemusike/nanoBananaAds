import { Mail, BookOpen, Video, Zap, HelpCircle, ExternalLink } from 'lucide-react';

export default function Help() {
  const videos = [
    {
      title: 'Mastering Ads Creation',
      description: 'Learn how to create stunning Facebook ads with AI-powered tools',
      embedCode: '<iframe src="https://share.descript.com/embed/LTOiJ0I7kTY" width="640" height="360" frameborder="0" allowfullscreen></iframe>',
      link: 'https://share.descript.com/view/LTOiJ0I7kTY'
    },
    {
      title: '10x Your Ads Creation Process',
      description: 'Master the power of Brands, Angles, and Prompts to supercharge your workflow',
      embedCode: '<iframe src="https://share.descript.com/embed/mbDLlcnn3Z6" width="640" height="360" frameborder="0" allowfullscreen></iframe>',
      link: 'https://share.descript.com/view/mbDLlcnn3Z6'
    },
    {
      title: 'Settings Walkthrough',
      description: 'Configure AdGenius AI to match your preferences and workflow',
      embedCode: '<iframe src="https://share.descript.com/embed/MujVR3zc1o1" width="640" height="360" frameborder="0" allowfullscreen></iframe>',
      link: 'https://share.descript.com/view/MujVR3zc1o1'
    }
  ];

  const quickLinks = [
    {
      icon: Zap,
      title: 'Quick Start Guide',
      description: 'Get up and running in 5 minutes',
      steps: [
        'Set up your API keys in Settings',
        'Create your first brand profile',
        'Generate creative prompts or angles',
        'Create your first ad with AI'
      ]
    },
    {
      icon: BookOpen,
      title: 'Feature Overview',
      description: 'Explore what AdGenius AI can do',
      features: [
        'AI-powered ad image generation (Gemini 2.5 Flash & DALL-E 3)',
        'GPT-4 ad copywriting with multiple frameworks',
        'Creative Prompts library for optimized descriptions',
        'Angles generator for strategic approaches',
        'Brand management for consistent messaging',
        'Ad library to save and organize your creations'
      ]
    }
  ];

  const faqs = [
    {
      q: 'How do I get started with AdGenius AI?',
      a: 'Start by adding your API keys in Settings (Google Gemini and OpenAI). Then create a brand profile, and you\'re ready to generate your first ad!'
    },
    {
      q: 'What AI models does AdGenius AI use?',
      a: 'We use Google Gemini 2.5 Flash and DALL-E 3 for image generation, and GPT-4 for ad copywriting. You can switch between models based on your preferences.'
    },
    {
      q: 'Can I use my own images as reference?',
      a: 'Yes! You can upload reference images when creating ads. The AI will use them as inspiration while generating new, unique ad creatives.'
    },
    {
      q: 'How do Brands, Prompts, and Angles work together?',
      a: 'Brands store your product/company info. Prompts help generate optimized image descriptions. Angles provide strategic messaging approaches. Combine them to create highly targeted ads quickly.'
    },
    {
      q: 'Is there a limit on ad generation?',
      a: 'Limits depend on your license tier. Check your current plan and usage in Settings > Account.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            How Can We Help You?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to master AdGenius AI and create stunning Facebook ads
          </p>
        </div>

        {/* Support Section */}
        <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 rounded-2xl p-8 mb-12 border border-primary/20">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Need Direct Support?
              </h2>
              <p className="text-muted-foreground mb-4">
                Our support team is here to help you succeed. Get expert assistance with any questions or issues.
              </p>
              <a
                href="mailto:support@adgeniusai.io"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
              >
                <Mail className="w-4 h-4" />
                support@adgeniusai.io
              </a>
            </div>
          </div>
        </div>

        {/* Video Tutorials Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
              <Video className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              Video Walkthroughs
            </h2>
          </div>
          <p className="text-muted-foreground mb-8">
            Watch these step-by-step video guides to master AdGenius AI
          </p>

          <div className="grid gap-8">
            {videos.map((video, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div className="grid md:grid-cols-5 gap-6">
                  {/* Video Embed */}
                  <div className="md:col-span-3 bg-muted">
                    <div
                      className="aspect-video w-full"
                      dangerouslySetInnerHTML={{ __html: video.embedCode }}
                    />
                  </div>

                  {/* Video Info */}
                  <div className="md:col-span-2 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-primary font-bold">{index + 1}</span>
                      </div>
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        Tutorial {index + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      {video.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {video.description}
                    </p>
                    <a
                      href={video.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Watch in new window
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {quickLinks.map((section, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {section.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>

              {section.steps && (
                <ol className="space-y-2 ml-14">
                  {section.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-semibold">
                        {idx + 1}
                      </span>
                      <span className="text-muted-foreground pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              )}

              {section.features && (
                <ul className="space-y-2 ml-14">
                  {section.features.map((feature, idx) => (
                    <li key={idx} className="flex gap-3 text-muted-foreground">
                      <span className="text-primary mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="bg-card border border-border rounded-lg overflow-hidden group"
              >
                <summary className="px-6 py-4 cursor-pointer font-semibold text-foreground hover:bg-muted transition-colors flex justify-between items-center">
                  <span>{faq.q}</span>
                  <span className="text-primary transform group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 py-4 bg-muted/50 text-muted-foreground border-t border-border">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-card border border-border rounded-xl p-8">
          <h3 className="text-2xl font-bold text-foreground mb-3">
            Still Have Questions?
          </h3>
          <p className="text-muted-foreground mb-6">
            Don't hesitate to reach out - we're here to help you succeed!
          </p>
          <a
            href="mailto:support@adgeniusai.io"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
          >
            <Mail className="w-5 h-5" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
