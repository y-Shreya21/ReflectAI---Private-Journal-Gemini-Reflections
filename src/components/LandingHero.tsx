import React from "react";
import { Shield, Sparkles, Lock, ArrowRight, BookOpen, Key, AlertCircle } from "lucide-react";

interface LandingHeroProps {
  onSignIn: () => void;
  isLoading: boolean;
  errorMessage: string | null;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onSignIn,
  isLoading,
  errorMessage,
}) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 py-12 bg-[#F7F6F2]">
      <div className="w-full max-w-3xl mx-auto text-center space-y-8">
        {/* Security & Tech pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#F3EDE2] border border-[#E5D8C5] text-[#9E472A] text-xs font-medium">
          <Shield className="w-3.5 h-3.5 text-[#9E472A]" />
          <span>Strict User-Isolated Cloud Firestore & Gemini 3.6 Flash</span>
        </div>

        {/* Hero Title & Description */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1A1A1A] tracking-tight leading-tight">
            Your Private Sanctuary for Mindful Reflections & AI Dialogue
          </h1>
          <p className="text-base sm:text-lg text-[#73716B] max-w-2xl mx-auto leading-relaxed">
            Write uninhibited thoughts, brainstorm creative ideas, and explore your daily reflections with Gemini 3.6 Flash. Every journal interaction is securely sandboxed under your individual user ID in Cloud Firestore.
          </p>
        </div>

        {/* Error notification if popup was blocked or sign-in failed */}
        {errorMessage && (
          <div className="max-w-md mx-auto p-4 rounded-xl bg-[#FDF2F0] border border-[#F5C6CB] text-left text-sm text-[#852C27] flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-[#852C27] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Authentication Notice</p>
              <p className="text-xs text-[#852C27]/90 mt-1">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Sign In CTA */}
        <div className="pt-2 flex flex-col items-center justify-center space-y-4">
          <button
            id="btn-google-signin"
            onClick={onSignIn}
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[280px] flex items-center justify-center space-x-3 px-6 py-3.5 rounded-xl bg-[#1A1A1A] hover:bg-[#2C2926] text-[#FAF9F5] font-medium text-sm transition-all duration-200 shadow-md shadow-[#1A1A1A]/10 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#FAF9F5]/30 border-t-[#FAF9F5] rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                  />
                </svg>
                <span>Continue with Google Sign-In</span>
                <ArrowRight className="w-4 h-4 text-[#DCD9D0] group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
          <p className="text-xs text-[#73716B] flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-[#8C8A84]" />
            <span>Federated Identity • No passwords stored in app code</span>
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left">
          <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E5E3DC] shadow-[0_2px_8px_rgba(26,26,26,0.03)] space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#F3EDE2] flex items-center justify-center text-[#9E472A]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-medium text-[#1A1A1A] text-sm font-serif">Gemini 3.6 Flash Engine</h3>
            <p className="text-xs text-[#73716B] leading-relaxed">
              Provides multi-turn reflections, empathetic breakdowns, and structured summaries with resilient model failover.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E5E3DC] shadow-[0_2px_8px_rgba(26,26,26,0.03)] space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#E8F0EA] flex items-center justify-center text-[#3E6B48]">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-medium text-[#1A1A1A] text-sm font-serif">Strict Per-User Isolation</h3>
            <p className="text-xs text-[#73716B] leading-relaxed">
              Rules restrict database read/writes to <code>request.auth.uid == userId</code>. Other users can never read your entries.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E5E3DC] shadow-[0_2px_8px_rgba(26,26,26,0.03)] space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#F1EBF5] flex items-center justify-center text-[#6A4C82]">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-medium text-[#1A1A1A] text-sm font-serif">Multi-Turn Journal History</h3>
            <p className="text-xs text-[#73716B] leading-relaxed">
              Review past journal entries, search by keyword or mood, and continue conversational dialogues whenever inspiration strikes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
