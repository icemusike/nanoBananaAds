import { Mail, Video, HelpCircle, Play } from 'lucide-react';

export default function Help() {
  const videos = [
    {
      title: 'Mastering Ads Creation',
      description: 'Learn how to create stunning Facebook ads with AI-powered tools',
      embedCode: '<iframe src="https://share.descript.com/embed/LTOiJ0I7kTY" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>',
      link: 'https://share.descript.com/view/LTOiJ0I7kTY',
      duration: '15:30'
    },
    {
      title: '10x Your Ads Creation Process',
      description: 'Master the power of Brands, Angles, and Prompts to supercharge your workflow',
      embedCode: '<iframe src="https://share.descript.com/embed/mbDLlcnn3Z6" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>',
      link: 'https://share.descript.com/view/mbDLlcnn3Z6',
      duration: '12:45'
    },
    {
      title: 'Settings Walkthrough',
      description: 'Configure AdGenius AI to match your preferences and workflow',
      embedCode: '<iframe src="https://share.descript.com/embed/MujVR3zc1o1" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>',
      link: 'https://share.descript.com/view/MujVR3zc1o1',
      duration: '8:20'
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
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl mb-4">
              <Video className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Video Walkthroughs
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Watch these comprehensive video guides to master every feature of AdGenius AI
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-8">
            {videos.map((video, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Video Header */}
                <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 p-6 border-b border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-primary-foreground font-bold text-lg">{index + 1}</span>
                        </div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          Tutorial {index + 1}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {video.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {video.description}
                      </p>
                    </div>
                    {video.duration && (
                      <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-lg border border-border">
                        <Play className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">{video.duration}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Player */}
                <div className="bg-muted/30 p-4">
                  <div
                    className="aspect-video w-full rounded-lg overflow-hidden bg-black shadow-inner"
                    dangerouslySetInnerHTML={{ __html: video.embedCode }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Form Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl mb-4">
              <HelpCircle className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Need Additional Help?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Submit a support ticket and our team will get back to you as soon as possible
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 p-6 border-b border-border">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Support Request Form
                </h3>
                <p className="text-sm text-muted-foreground">
                  Fill out the form below and we'll respond within 24 hours
                </p>
              </div>
              <div className="p-1 bg-muted/30">
                <iframe
                  sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
                  width="100%"
                  height="660px"
                  style={{ border: 0, overflow: 'hidden', overflowX: 'auto' }}
                  src="https://forms.helpdesk.com?licenseID=1442838910&contactFormID=54daa0b9-042a-4783-a165-361057d1278e"
                  title="Support Request Form"
                >
                  Your browser does not allow embedded content.
                </iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
