export default function BananaLoader({ message = 'Creating your amazing ad...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Banana Animation */}
      <div className="relative">
        {/* Animated Banana */}
        <div className="text-8xl animate-bounce">
          🍌
        </div>

        {/* Sparkle Effects */}
        <div className="absolute -top-2 -right-2 text-2xl animate-ping">
          ✨
        </div>
        <div className="absolute -bottom-2 -left-2 text-2xl animate-ping" style={{animationDelay: '0.5s'}}>
          ✨
        </div>
      </div>

      {/* Loading Message */}
      <div className="mt-6 text-center">
        <h3 className="text-lg font-semibold text-primary-300 mb-2">
          {message}
        </h3>

        {/* Animated Dots */}
        <div className="flex items-center justify-center gap-1">
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="mt-6 w-full max-w-xs space-y-3 text-sm">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Generating stunning image...</span>
        </div>
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-accent-teal border-t-transparent rounded-full animate-spin" style={{animationDelay: '0.3s'}}></div>
          <span>Crafting compelling copy...</span>
        </div>
      </div>

      {/* Loading Bar */}
      <div className="mt-6 w-full max-w-xs">
        <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-600 via-accent-purple to-accent-teal animate-[shimmer_2s_ease-in-out_infinite]"
               style={{width: '70%', animation: 'shimmer 2s ease-in-out infinite'}}>
          </div>
        </div>
      </div>

      {/* Fun Fact */}
      <div className="mt-6 px-6 py-3 bg-dark-800/50 rounded-lg border border-dark-700">
        <p className="text-xs text-gray-500 text-center">
          <span className="text-accent-teal font-medium">💡 Did you know?</span><br/>
          UGC-style ads perform 73% better than traditional corporate ads!
        </p>
      </div>
    </div>
  );
}
