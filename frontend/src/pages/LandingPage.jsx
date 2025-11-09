import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-3xl">🧠</span>
              <h1 className="text-xl font-bold text-primary">
                AdGenius AI
              </h1>
            </Link>

            {/* Right side - Auth buttons and theme toggle */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-foreground hover:text-primary font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="btn-primary"
              >
                Get Started Free
              </Link>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <span className="text-6xl">🧠</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Stop Wasting $10,000/Month On <span className="text-primary">Bad Facebook Ads</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Your competitors are spending less and making more. Here's why: They stopped guessing and started using AI that actually understands what makes people buy.
          </p>

          <div className="bg-card border-2 border-primary p-8 rounded-lg mb-8 shadow-2xl">
            <p className="text-2xl font-bold mb-4">What You Get (Worth $5,000/month if you hired an agency):</p>
            <ul className="text-left text-lg space-y-3 max-w-2xl mx-auto">
              <li className="flex items-start">
                <span className="text-primary mr-3 text-2xl">✓</span>
                <span><strong>Unlimited AI-Generated Ads</strong> - Stop paying $500 per creative. Generate hundreds for free.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3 text-2xl">✓</span>
                <span><strong>Advanced AI Image Generation</strong> - Premium dual-model system delivers stunning professional visuals every time.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3 text-2xl">✓</span>
                <span><strong>Premium AI Copywriting</strong> - The same AI writing 7-figure ad copy, now writing yours.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3 text-2xl">✓</span>
                <span><strong>Strategic Angle Generator</strong> - Stop guessing what hooks work. Get proven angles instantly.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3 text-2xl">✓</span>
                <span><strong>Brand Library</strong> - Save your best performers and replicate winners in 60 seconds.</span>
              </li>
            </ul>
          </div>

          <Link
            to="/app"
            className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl px-12 py-6 rounded-lg shadow-xl transition-all hover:scale-105"
          >
            Start Creating Winning Ads (It's Free)
          </Link>

          <p className="text-sm text-muted-foreground mt-4">No credit card. No BS. Just results.</p>
        </div>
      </div>

      {/* The Problem Section */}
      <div className="bg-card border-t border-b border-border py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-center">Here's The Problem Nobody Talks About...</h2>

            <div className="space-y-6 text-lg">
              <p>
                You're spending $3,000, $5,000, maybe $10,000 per month on Facebook ads.
              </p>
              <p>
                But your ROAS is terrible. 1.5x if you're lucky. Some months you're barely breaking even.
              </p>
              <p className="font-bold text-xl text-destructive">
                And your ad agency keeps telling you "it takes time" or "the market is tough right now."
              </p>
              <p>
                Meanwhile, you see other brands in your space absolutely crushing it. Same products. Same market. Different results.
              </p>
              <p className="text-2xl font-bold text-primary">
                What's the difference?
              </p>
              <p>
                They're testing 50-100 ad variations per week. You're testing 5.</p>
              <p>
                They're running proven angles and hooks. You're running what "feels right."
              </p>
              <p className="font-bold">
                The winners aren't smarter. They're just testing faster.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The Solution Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-center">The Solution: Test 100x Faster Without Spending 100x More</h2>

            <p className="text-xl mb-8 text-center text-muted-foreground">
              AdGenius AI gives you the same creative output as a $15,000/month agency team - for free.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="card">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-2xl font-bold mb-3">Generate Images That Convert</h3>
                <p className="text-muted-foreground">
                  Upload a reference image or describe what you want. Get professional ad creatives in 30 seconds. No designers. No Canva. No Photoshop.
                </p>
              </div>

              <div className="card">
                <div className="text-4xl mb-4">✍️</div>
                <h3 className="text-2xl font-bold mb-3">Copy That Actually Sells</h3>
                <p className="text-muted-foreground">
                  Premium AI trained on 7-figure ad copy. Generates headlines, body copy, and CTAs that sound like a $500/hour copywriter wrote them.
                </p>
              </div>

              <div className="card">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold mb-3">Strategic Angles On Demand</h3>
                <p className="text-muted-foreground">
                  Not sure what angle to test? Generate 10 proven marketing angles for your product in 10 seconds. Pain points, desires, social proof - all covered.
                </p>
              </div>

              <div className="card">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-2xl font-bold mb-3">Save Everything That Works</h3>
                <p className="text-muted-foreground">
                  Found a winner? Save it to your library. Clone it for different products. Build a swipe file of your best performers.
                </p>
              </div>
            </div>

            <div className="bg-primary/10 border-2 border-primary p-8 rounded-lg text-center">
              <p className="text-2xl font-bold mb-4">Here's What This Means For Your Business:</p>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div>
                  <p className="text-3xl font-bold text-primary mb-2">10x</p>
                  <p className="text-lg">More ad variations tested per week</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary mb-2">$0</p>
                  <p className="text-lg">Cost per creative (vs $200-500 from agencies)</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary mb-2">60 sec</p>
                  <p className="text-lg">To create a complete ad (vs 3-5 days)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">How It Works (Dead Simple)</h2>

            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">1</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Tell Us What You're Selling</h3>
                  <p className="text-muted-foreground text-lg">Enter your product details, target audience, and what makes it special. Or use our Brand Manager to save this info once and reuse it forever.</p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">2</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Generate Your Creative</h3>
                  <p className="text-muted-foreground text-lg">Click generate. AI creates professional images and scroll-stopping copy in seconds. Upload reference images to guide the style if you want.</p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">3</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Export & Launch</h3>
                  <p className="text-muted-foreground text-lg">Download your ad creative and copy. Upload to Facebook Ads Manager. Done. Scale what works, kill what doesn't.</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                to="/app"
                className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl px-12 py-6 rounded-lg shadow-xl transition-all hover:scale-105"
              >
                Create Your First Ad Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Who This Is For */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">Who This Is For (Be Honest With Yourself)</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-primary bg-card p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-4 text-primary">✓ This IS for you if:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>You're spending $1k+ per month on Facebook ads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>You want to test more creative but agencies are too slow/expensive</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>You're tired of mediocre ROAS and want to scale profitably</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>You need winning ads yesterday, not next week</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>You understand that volume of testing = winning</span>
                  </li>
                </ul>
              </div>

              <div className="border-2 border-muted bg-card p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-4 text-muted-foreground">✗ This is NOT for you if:</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>You're not actively running paid ads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>You want a magic button that prints money without testing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>You're looking for someone to run your ads for you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>You think one ad creative is enough</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>You don't want to put in the work to scale</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 border-t border-border py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Stop Leaving Money On The Table
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Every day you wait is another day your competitors are testing more, learning faster, and scaling harder.
            </p>
            <p className="text-2xl font-bold mb-8">
              The tool is free. The opportunity cost of NOT using it? Massive.
            </p>

            <Link
              to="/app"
              className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-2xl px-16 py-8 rounded-lg shadow-2xl transition-all hover:scale-105"
            >
              Start Creating Winning Ads Now
            </Link>

            <p className="text-sm text-muted-foreground mt-6">
              No signup. No credit card. No excuses.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>🧠 AdGenius AI • Premium AI-Powered Ad Creation</p>
          <p className="mt-2">Built with React, Vite, Tailwind CSS, Node.js & Express</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
