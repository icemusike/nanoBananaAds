import { Download, FileText, BookOpen, Gift, ExternalLink, Lock, CheckCircle, Users } from 'lucide-react';
import { useLicense } from '../context/LicenseContext';

export default function Downloads() {
  const { hasTemplatesLibrary, hasAgencyFeatures } = useLicense();
  // Section 1: AdGenius AI Resources & Blueprints
  const resources = [
    {
      title: 'First Client in 7 Days Roadmap',
      description: 'Step-by-step roadmap to acquire your first client within a week. Includes actionable strategies, templates, and proven tactics.',
      fileType: 'PDF',
      fileSize: 'Digital Guide',
      downloadUrl: 'https://drive.google.com/file/d/1XICEzv3npV9tnJLOhlEw3i0mbKo6ZHNu/view?usp=sharing',
      value: '$497',
      category: 'blueprint'
    },
    {
      title: 'Prospect Finding System',
      description: 'Complete system for identifying and connecting with high-quality prospects who are ready to buy your services.',
      fileType: 'PDF',
      fileSize: 'Digital Guide',
      downloadUrl: 'https://drive.google.com/file/d/1_uP_gW68BW9K3vPolwv9bV4W4QGRDUI5/view?usp=sharing',
      value: '$297',
      category: 'guide'
    },
    {
      title: 'Client Operations Kit',
      description: 'Professional templates, workflows, and systems to manage client relationships and deliver exceptional results.',
      fileType: 'PDF',
      fileSize: 'Digital Kit',
      downloadUrl: 'https://drive.google.com/file/d/1ONbuyQQl_yLOzIe_pOmS0p1ti5UeYR96/view?usp=sharing',
      value: '$397',
      category: 'guide'
    },
    {
      title: 'Objection Handling Scripts',
      description: 'Word-for-word scripts to confidently handle any client objection and close more deals with ease.',
      fileType: 'PDF',
      fileSize: 'Digital Guide',
      downloadUrl: 'https://drive.google.com/file/d/1LLg81hqYp7Pz1oRNoyyzsKZsYF45IZX0/view?usp=sharing',
      value: '$197',
      category: 'guide'
    },
    {
      title: 'Retention Playbook',
      description: 'Proven strategies and tactics to retain clients longer, reduce churn, and build sustainable recurring revenue.',
      fileType: 'PDF',
      fileSize: 'Digital Guide',
      downloadUrl: 'https://drive.google.com/file/d/1hcFmd3fSZHGdRnSGT6ilNyF_GZn9oclr/view?usp=sharing',
      value: '$297',
      category: 'blueprint'
    },
    {
      title: '7 Days Email Sequence',
      description: 'Pre-written email sequences to nurture leads, build trust, and convert prospects into paying clients.',
      fileType: 'PDF',
      fileSize: 'Email Templates',
      downloadUrl: 'https://drive.google.com/file/d/1BOU41S9iVUmjEA0c_BomxKWggG1BE_97/view?usp=sharing',
      value: null,
      category: 'guide'
    }
  ];

  // Template License Exclusive Bonuses
  const templateBonuses = [
    {
      bonusNumber: 1,
      title: '10-Niche Client Acquisition Battle Plans',
      description: 'Step-by-Step Playbooks to Find, Contact & Close Clients in Each Industry. Ready-to-use acquisition strategies for 10 different niches.',
      fileType: 'Battle Plans',
      downloadUrl: 'https://drive.google.com/file/d/1fN0SjFbrzzW1aE7zkkZ8VBpC6COTRGMW/view?usp=sharing',
      value: '$97',
      category: 'bonus'
    },
    {
      bonusNumber: 2,
      title: 'Pitch Templates - The Complete Client Acquisition System',
      description: 'Proven pitch templates that convert prospects into paying clients. Everything you need to close deals with confidence.',
      fileType: 'Templates',
      downloadUrl: 'https://drive.google.com/file/d/14t7CnIynd0EA8b8dxpuMRO9uNSQFC0s3/view?usp=sharing',
      value: '$97',
      category: 'bonus'
    },
    {
      bonusNumber: 3,
      title: '10-Industry Proof & Case Study Builder Kit',
      description: 'Instant Credibility with Real Data. Done-for-you templates to create your own social proof fast and establish authority.',
      fileType: 'Builder Kit',
      downloadUrl: 'https://drive.google.com/file/d/1I6sIAH3Edvzw6x0Jy9-kCFbvQeDd5zHM/view?usp=sharing',
      value: '$67',
      category: 'bonus'
    }
  ];

  // Agency License Exclusive Resources
  const agencyResources = [
    {
      title: 'Client Contract Templates',
      description: 'Lawyer-reviewed contract templates to protect your agency and establish professional client relationships.',
      fileType: 'Legal Templates',
      downloadUrl: 'https://drive.google.com/file/d/1PgQtxiRMTiv8cTnNnaOPaDlrSq_lCJaR/view?usp=sharing',
      value: '$197',
      category: 'agency'
    },
    {
      title: 'Proposal Template',
      description: 'Proven proposal template with 35%+ close rate. Turn prospects into paying clients consistently.',
      fileType: 'Template',
      downloadUrl: 'https://drive.google.com/file/d/16KIQ3bY-WCJnq6y0un2fcUDz6paKXAdd/view?usp=sharing',
      value: '$147',
      category: 'agency'
    },
    {
      title: 'Industry Specific Pricing Calculator',
      description: 'Know exactly what to charge by industry. Maximize profits while staying competitive.',
      fileType: 'Calculator',
      downloadUrl: 'https://drive.google.com/file/d/16QQ3I5u-CB1IKX0jfHrDsY28pjZze9UR/view?usp=sharing',
      value: '$97',
      category: 'agency'
    },
    {
      title: 'Client Onboarding Checklist',
      description: 'Smooth client starts with professional onboarding. Set expectations and deliver excellence from day one.',
      fileType: 'Checklist',
      downloadUrl: 'https://drive.google.com/file/d/1ph43SwaDvwvJ7qeoqYDTS5VBh_GBkTEC/view?usp=sharing',
      value: '$67',
      category: 'agency'
    },
    {
      title: 'Professional Invoice Template',
      description: 'Get paid faster with professional invoices. Multiple formats and payment options included.',
      fileType: 'Template',
      downloadUrl: 'https://drive.google.com/file/d/1E8X98R9Oiwph4hn5gvfpOh734joOqQjx/view?usp=sharing',
      value: '$47',
      category: 'agency'
    },
    {
      title: 'Client Questionnaire Form',
      description: 'Gather critical client information efficiently. Understand their needs and deliver better results.',
      fileType: 'Form',
      downloadUrl: 'https://drive.google.com/file/d/1lO-YtPuIoLucaKpNFAiMqEnIjxLmvaeN/view?usp=sharing',
      value: '$37',
      category: 'agency'
    },
    {
      title: 'Done-For-You Agency Sales Kit',
      description: 'Complete sales arsenal: Pitch Deck, Cold Email Sequences (7 templates), Video Sales Script, Service Menu, 30 Days Social Content, Portfolio Builder.',
      fileType: 'Complete Kit',
      downloadUrl: 'https://drive.google.com/file/d/1XqIkMr76ZpK-Ikn8B5F_iDsHgmeTUnYB/view?usp=sharing',
      value: '$297',
      category: 'agency'
    }
  ];

  // Agency License Fast Action Bonuses
  const agencyBonuses = [
    {
      bonusNumber: 1,
      title: 'Local Business Prospecting Database',
      description: '10,000+ Pre-qualified Local Businesses with contact info, decision-maker names, sorted by industry and location. Your pipeline starts full.',
      fileType: 'Database',
      downloadUrl: 'https://drive.google.com/file/d/1pKSwCJMjRkXZT2B-1biasjIGmkgLzORU/view?usp=sharing',
      value: '$147',
      category: 'bonus'
    },
    {
      bonusNumber: 2,
      title: 'Client Success Playbook',
      description: 'Deliver jaw-dropping results. Includes retention strategies (keep clients 12+ months), upsell scripts (grow account value), and case study templates.',
      fileType: 'Playbook',
      downloadUrl: 'https://drive.google.com/file/d/1MjmC1k_PzUmQVHvaBxz1j5FTymG62Xd0/view?usp=sharing',
      value: '$97',
      category: 'bonus'
    },
    {
      bonusNumber: 3,
      title: 'Agency Price Calculator',
      description: 'What to charge by industry. Project vs retainer pricing models, profit margin calculator, and competitive analysis tool.',
      fileType: 'Calculator',
      downloadUrl: 'https://drive.google.com/file/d/1mt1fDFQB4VgZVsd8Q9TBJI0rmD2OgDjU/view?usp=sharing',
      value: '$67',
      category: 'bonus'
    }
  ];

  // Check if user has template license
  const hasTemplateLicense = hasTemplatesLibrary;
  const hasAgencyLicense = hasAgencyFeatures;

  // Section 2: Exclusive Bonuses
  const bonuses = [
    {
      bonusNumber: 1,
      title: '"First $500 Client By Friday" Blueprint',
      description: 'This is your 7-day roadmap from zero to paid. Get the exact step-by-step system to land your first paying client within a week.',
      fileType: 'Blueprint',
      downloadUrl: 'https://drive.google.com/file/d/1XICEzv3npV9tnJLOhlEw3i0mbKo6ZHNu/view?usp=sharing',
      value: '$497',
      category: 'bonus'
    },
    {
      bonusNumber: 2,
      title: '50-Prospects-In-50-Minutes System',
      description: 'Most people waste WEEKS looking for clients. You\'ll have a hot list in under an hour with this proven prospect-finding system.',
      fileType: 'System',
      downloadUrl: 'https://drive.google.com/file/d/1_uP_gW68BW9K3vPolwv9bV4W4QGRDUI5/view?usp=sharing',
      value: '$297',
      category: 'bonus'
    },
    {
      bonusNumber: 3,
      title: 'Client Operations Toolkit',
      description: 'The "boring" stuff that separates hobbyists from professionals. Get templates, workflows, and systems to run like a real agency.',
      fileType: 'Toolkit',
      downloadUrl: 'https://drive.google.com/file/d/1ONbuyQQl_yLOzIe_pOmS0p1ti5UeYR96/view?usp=sharing',
      value: '$397',
      category: 'bonus'
    },
    {
      bonusNumber: 4,
      title: '"Never Lose A Sale" Objection Scripts',
      description: 'Every objection you\'ll hear - and exactly what to say back. Turn objections into closed deals with these proven response scripts.',
      fileType: 'Scripts',
      downloadUrl: 'https://drive.google.com/file/d/1LLg81hqYp7Pz1oRNoyyzsKZsYF45IZX0/view?usp=sharing',
      value: '$197',
      category: 'bonus'
    },
    {
      bonusNumber: 5,
      title: 'The $10K/Month Retention Playbook',
      description: 'Keep clients paying month after month. The exact retention strategies that turn one-time projects into recurring revenue.',
      fileType: 'Playbook',
      downloadUrl: 'https://drive.google.com/file/d/1hcFmd3fSZHGdRnSGT6ilNyF_GZn9oclr/view?usp=sharing',
      value: '$297',
      category: 'bonus'
    },
    {
      bonusNumber: 6,
      title: '7-Day Email Nurture Sequence',
      description: 'Ready-to-use email sequence templates to nurture leads and convert prospects into paying clients on autopilot.',
      fileType: 'Templates',
      downloadUrl: 'https://drive.google.com/file/d/1BOU41S9iVUmjEA0c_BomxKWggG1BE_97/view?usp=sharing',
      value: 'FREE',
      category: 'bonus'
    }
  ];

  const handleDownload = (item) => {
    // Handle download logic
    if (item.downloadUrl && item.downloadUrl !== '#') {
      window.open(item.downloadUrl, '_blank');
    }
  };

  const getIcon = (category) => {
    switch (category) {
      case 'guide':
        return <FileText className="w-5 h-5" />;
      case 'blueprint':
        return <BookOpen className="w-5 h-5" />;
      case 'bonus':
        return <Gift className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl mb-4">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your Exclusive Bonus Downloads
          </h1>
          <p className="text-xl font-semibold text-primary mb-2">
            Download these valuable resources right now!
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to build a thriving agency - included FREE with your AdGenius AI account
          </p>
        </div>

        {/* Total Value Banner */}
        <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border border-primary/30 rounded-2xl p-8 mb-12 text-center shadow-lg">
          <div className="text-lg font-bold text-foreground mb-2">
            Total Value: <span className="line-through text-muted-foreground">$1,685</span>
          </div>
          <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
            Yours FREE!
          </div>
          <p className="text-base text-muted-foreground">
            All bonuses included with your AdGenius AI account at no additional cost
          </p>
        </div>

        {/* Section 1: AdGenius AI Resources & Blueprints */}
        {resources.length > 0 && (
          <div className="mb-16">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">
                  AdGenius AI Resources & Blueprints
                </h2>
              </div>
              <p className="text-muted-foreground ml-13">
                Essential guides and blueprints to help you master ad creation and maximize your results
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map((resource, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 group relative"
                >
                  {/* Value Badge (if applicable) */}
                  {resource.value && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                        {resource.value} Value
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors border border-primary/20">
                      {getIcon(resource.category)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pr-16">
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {resource.description}
                      </p>

                      {/* File Info */}
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                          {resource.fileType}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {resource.fileSize}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleDownload(resource)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium text-sm shadow-sm hover:shadow-md"
                        >
                          <Download className="w-4 h-4" />
                          Download Now
                        </button>
                        <a
                          href={resource.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-all font-medium text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Online
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Exclusive Bonuses */}
        <div className="mb-16">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center">
                <Gift className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">
                Exclusive Bonuses
              </h2>
            </div>
            <p className="text-muted-foreground ml-13">
              Premium bonuses included with your AdGenius AI account - real value, zero cost
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bonuses.map((bonus, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-card via-card to-accent/5 border border-accent/30 rounded-xl p-6 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
              >
                {/* Value Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-gradient-to-br from-accent to-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    {bonus.value} Value
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  {/* Bonus Number Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center border border-accent/30">
                      <span className="text-xl font-bold text-primary">#{bonus.bonusNumber}</span>
                    </div>
                    <div className="text-xs text-center text-muted-foreground mt-1 font-medium">
                      Bonus {bonus.bonusNumber}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pr-20">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {bonus.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {bonus.description}
                    </p>

                    {/* File Type Badge */}
                    <div className="mb-4">
                      <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-md">
                        {bonus.fileType}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleDownload(bonus)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all font-medium text-sm shadow-md hover:shadow-lg"
                      >
                        <Download className="w-4 h-4" />
                        Download Now
                      </button>
                      <a
                        href={bonus.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-accent/30 text-foreground rounded-lg hover:bg-accent/10 transition-all font-medium text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Online
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Template License Exclusive Bonuses (Conditional) */}
        <div className="mb-16">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                {hasTemplateLicense ? (
                  <CheckCircle className="w-5 h-5 text-primary" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <h2 className="text-3xl font-bold text-foreground">
                Template License Exclusive Bonuses
              </h2>
            </div>
            <p className="text-muted-foreground ml-13">
              {hasTemplateLicense
                ? 'Premium bonuses for Template License members - Total Value: $261'
                : 'Unlock these exclusive bonuses by upgrading to the Template Library License'
              }
            </p>
          </div>

          {hasTemplateLicense ? (
            // Show bonuses if user has template license
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templateBonuses.map((bonus, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-card via-card to-primary/5 border border-primary/30 rounded-xl p-6 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Value Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                      {bonus.value} Value
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Bonus Number Badge */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center border border-primary/30">
                        <span className="text-xl font-bold text-primary">#{bonus.bonusNumber}</span>
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        Template Bonus {bonus.bonusNumber}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-2 pr-16">
                        {bonus.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {bonus.description}
                      </p>

                      {/* File Type Badge */}
                      <div className="mb-4">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                          {bonus.fileType}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleDownload(bonus)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg hover:opacity-90 transition-all font-medium text-sm shadow-md hover:shadow-lg"
                        >
                          <Download className="w-4 h-4" />
                          Download Now
                        </button>
                        <a
                          href={bonus.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-card border border-primary/30 text-foreground rounded-lg hover:bg-primary/10 transition-all font-medium text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Online
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Show upgrade CTA if user doesn't have template license
            <div className="bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-dashed border-border rounded-xl p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full mb-6">
                  <Lock className="w-10 h-10 text-primary" />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Unlock Template License Bonuses
                </h3>

                <p className="text-muted-foreground mb-2">
                  Get instant access to 3 exclusive bonuses worth <span className="font-bold text-primary">$261</span>
                </p>

                <div className="bg-card border border-border rounded-lg p-6 my-6">
                  <div className="space-y-3 text-left">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground text-sm">10-Niche Client Acquisition Battle Plans ($97)</p>
                        <p className="text-xs text-muted-foreground">Step-by-step playbooks for 10 different industries</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground text-sm">Complete Pitch Templates ($97)</p>
                        <p className="text-xs text-muted-foreground">Proven templates that convert prospects into clients</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground text-sm">10-Industry Proof & Case Study Builder Kit ($67)</p>
                        <p className="text-xs text-muted-foreground">Create instant credibility with done-for-you templates</p>
                      </div>
                    </div>
                  </div>
                </div>

                <a
                  href="/settings"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-bold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
                >
                  <Gift className="w-5 h-5" />
                  Upgrade to Template Library License
                </a>

                <p className="text-xs text-muted-foreground mt-4">
                  Plus get access to 100+ professional ad templates
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Agency License Exclusive Resources (Conditional) */}
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full border border-purple-500/20">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-semibold text-purple-500">Agency License Exclusive</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground">
              Agency Toolkit & Resources
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Complete agency infrastructure to scale your business and serve clients professionally
            </p>
          </div>

          {hasAgencyLicense ? (
            <>
              {/* Agency Resources */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                  <h3 className="text-2xl font-bold text-foreground">Complete Agency Toolkit</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agencyResources.map((resource, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-card to-muted/30 rounded-xl p-6 border border-border hover:border-purple-500/30 transition-all hover:shadow-lg group"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6 text-purple-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground mb-1 group-hover:text-purple-500 transition-colors">
                            {resource.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded-full font-semibold">
                              {resource.fileType}
                            </span>
                            {resource.value && (
                              <span className="px-2 py-1 bg-accent/20 text-accent rounded-full font-bold">
                                {resource.value} Value
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {resource.description}
                      </p>

                      <div className="flex gap-2">
                        <a
                          href={resource.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg"
                        >
                          <Download className="w-4 h-4" />
                          Download Now
                        </a>
                        <a
                          href={resource.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-semibold transition-all border border-border hover:border-purple-500/30"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agency Fast Action Bonuses */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                  <h3 className="text-2xl font-bold text-foreground">Fast Action Bonuses</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {agencyBonuses.map((bonus, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-card to-muted/30 rounded-xl p-6 border border-border hover:border-purple-500/30 transition-all hover:shadow-lg group relative overflow-hidden"
                    >
                      {/* Bonus Number Badge */}
                      <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <div className="text-white font-bold text-lg">#{bonus.bonusNumber}</div>
                      </div>

                      <div className="flex items-start gap-4 mb-4 pr-12">
                        <div className="p-3 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                          <Gift className="w-6 h-6 text-purple-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground mb-1 group-hover:text-purple-500 transition-colors">
                            {bonus.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded-full font-semibold">
                              {bonus.fileType}
                            </span>
                            <span className="px-2 py-1 bg-accent/20 text-accent rounded-full font-bold">
                              {bonus.value} Value
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {bonus.description}
                      </p>

                      <div className="flex gap-2">
                        <a
                          href={bonus.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg"
                        >
                          <Download className="w-4 h-4" />
                          Download Now
                        </a>
                        <a
                          href={bonus.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-semibold transition-all border border-border hover:border-purple-500/30"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Agency License Upgrade CTA */
            <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl p-12 border-2 border-dashed border-purple-500/30 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full mb-4">
                <Lock className="w-10 h-10 text-purple-500" />
              </div>

              <div>
                <h3 className="text-3xl font-bold text-foreground mb-3">
                  Unlock Agency License Bonuses
                </h3>
                <p className="text-xl text-muted-foreground mb-2">
                  Get instant access to the complete agency toolkit worth <span className="text-purple-500 font-bold">$1,263</span>
                </p>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                  Everything you need to run a professional agency: contracts, proposals, pricing calculators, sales kits, and more
                </p>
              </div>

              <div className="max-w-3xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">Complete Agency Toolkit ($592)</p>
                      <p className="text-xs text-muted-foreground">7 essential resources including contracts, proposals, and calculators</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">Done-For-You Sales Kit ($297)</p>
                      <p className="text-xs text-muted-foreground">Pitch deck, email sequences, video scripts, and content templates</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">Prospecting Database ($147)</p>
                      <p className="text-xs text-muted-foreground">10,000+ pre-qualified local businesses ready to contact</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">Client Success Playbook ($97)</p>
                      <p className="text-xs text-muted-foreground">Retention strategies, upsell scripts, and case study templates</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">Agency Price Calculator ($67)</p>
                      <p className="text-xs text-muted-foreground">Know exactly what to charge by industry</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">Plus Agency Features</p>
                      <p className="text-xs text-muted-foreground">Client management, white-label options, and more</p>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href="/settings"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-bold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                <Gift className="w-5 h-5" />
                Upgrade to Agency License
              </a>

              <p className="text-xs text-muted-foreground mt-4">
                Plus unlock unlimited client accounts and white-label capabilities
              </p>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Need Help Accessing Your Downloads?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              If you're having trouble downloading any resources or bonuses, our support team is here to help.
            </p>
            <a
              href="mailto:support@adgeniusai.io"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
            >
              <ExternalLink className="w-4 h-4" />
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
