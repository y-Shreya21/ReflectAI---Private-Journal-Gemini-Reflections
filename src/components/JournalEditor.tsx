import React, { useState } from "react";
import { Sparkles, Send, RefreshCw, AlertTriangle, Lightbulb, Heart, Compass, CheckCircle2 } from "lucide-react";
import { ReflectionMode } from "../types";

interface JournalEditorProps {
  onSubmit: (data: {
    prompt: string;
    mode: ReflectionMode;
    mood: string;
    title: string;
  }) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  onClearError: () => void;
}

const STARTER_PROMPTS = [
  "What is one unexpected lesson or moment of clarity you had today?",
  "Describe a decision or challenge you're navigating right now.",
  "What are you feeling deeply grateful for, and why does it matter?",
  "Brainstorm 3 ambitious paths for an idea that has been on your mind."
];

const MOOD_OPTIONS = [
  { label: "Peaceful", icon: "🌿" },
  { label: "Thoughtful", icon: "🤔" },
  { label: "Grateful", icon: "🙏" },
  { label: "Energized", icon: "⚡" },
  { label: "Challenged", icon: "🧗" },
  { label: "Curious", icon: "✨" }
];

export const JournalEditor: React.FC<JournalEditorProps> = ({
  onSubmit,
  isLoading,
  errorMessage,
  onClearError,
}) => {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<ReflectionMode>("reflect");
  const [mood, setMood] = useState("Thoughtful");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    // Guaranteed Transaction: Do not clear prompt until parent confirms successful save
    await onSubmit({
      prompt: prompt.trim(),
      mode,
      mood,
      title: title.trim() || prompt.trim().slice(0, 48) + "...",
    });
  };

  const handleApplyStarter = (starterText: string) => {
    setPrompt(starterText);
    if (!title) {
      setTitle(starterText.slice(0, 36) + "...");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="bg-[#FAF9F5] rounded-2xl border border-[#E5E3DC] shadow-[0_2px_12px_rgba(26,26,26,0.03)] overflow-hidden transition-all">
        {/* Header Ribbon */}
        <div className="px-6 py-4 border-b border-[#E5E3DC] bg-[#FAF9F5] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-serif font-medium text-[#1A1A1A]">New Reflection</h2>
            <p className="text-xs text-[#73716B]">Express your thoughts, feelings, or ideas freely.</p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="inline-flex p-1 bg-[#F3EDE2] border border-[#E5E3DC]/60 rounded-xl text-xs font-medium">
            <button
              type="button"
              id="mode-reflect"
              onClick={() => setMode("reflect")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "reflect"
                  ? "bg-white text-[#1A1A1A] shadow-xs font-semibold"
                  : "text-[#73716B] hover:text-[#1A1A1A]"
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-[#C86446]" />
              <span>Deep Reflection</span>
            </button>

            <button
              type="button"
              id="mode-summarize"
              onClick={() => setMode("summarize")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "summarize"
                  ? "bg-white text-[#1A1A1A] shadow-xs font-semibold"
                  : "text-[#73716B] hover:text-[#1A1A1A]"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6B48]" />
              <span>Summary</span>
            </button>

            <button
              type="button"
              id="mode-brainstorm"
              onClick={() => setMode("brainstorm")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "brainstorm"
                  ? "bg-white text-[#1A1A1A] shadow-xs font-semibold"
                  : "text-[#73716B] hover:text-[#1A1A1A]"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-[#B85D38]" />
              <span>Brainstorm</span>
            </button>
          </div>
        </div>

        {/* Error Escalation Banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-[#FDF2F0] border border-[#F5C6CB] text-[#852C27] flex items-start justify-between space-x-3 text-xs sm:text-sm">
            <div className="flex items-start space-x-2.5">
              <AlertTriangle className="w-5 h-5 text-[#852C27] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#852C27]">Save or Generation Alert</p>
                <p className="text-[#852C27]/90 mt-0.5">{errorMessage}</p>
                <p className="text-[#73716B] text-[11px] mt-1">Your reflection input has been safely preserved below.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClearError}
              className="text-[#8C8A84] hover:text-[#1A1A1A] text-xs px-2 py-1 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Optional Title */}
          <div>
            <label htmlFor="journal-title" className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
              Entry Title <span className="text-[#8C8A84] font-normal">(Optional)</span>
            </label>
            <input
              id="journal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Thoughts, Project Crossroads, Quiet Evening..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E5E3DC] bg-white text-[#1A1A1A] placeholder-[#8C8A84] focus:outline-none focus:ring-2 focus:ring-[#9E472A]/20 focus:border-[#9E472A] transition-colors"
              maxLength={100}
            />
          </div>

          {/* Mood Selection Pills */}
          <div>
            <label className="block text-xs font-medium text-[#1A1A1A] mb-1.5">Current Mindset / Mood</label>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setMood(item.label)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    mood === item.label
                      ? "bg-[#F3EDE2] text-[#9E472A] border border-[#E5D8C5] font-semibold"
                      : "bg-white hover:bg-[#F3EDE2] text-[#73716B] border border-[#E5E3DC]"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt / Reflection Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="journal-input" className="block text-xs font-medium text-[#1A1A1A]">
                Your Reflection
              </label>
              <span className="text-[11px] text-[#8C8A84]">{prompt.length} characters</span>
            </div>
            <textarea
              id="journal-input"
              rows={7}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Write whatever is on your mind. You can reflect on personal thoughts, describe a work dilemma, ask for perspective, or outline creative ideas..."
              className="w-full px-4 py-3 text-sm text-[#1A1A1A] rounded-xl border border-[#E5E3DC] bg-white placeholder-[#8C8A84] focus:outline-none focus:ring-2 focus:ring-[#9E472A]/20 focus:border-[#9E472A] transition-all resize-y leading-relaxed"
              required
            />
          </div>

          {/* Starter Prompts Carousel */}
          <div>
            <p className="text-xs font-medium text-[#73716B] mb-2 flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-[#9E472A]" />
              <span>Prompt Sparks:</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STARTER_PROMPTS.map((starter, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyStarter(starter)}
                  className="text-left p-2.5 rounded-lg border border-[#E5E3DC] bg-[#F7F6F2] hover:bg-[#F0EEE6] text-[#1A1A1A] text-xs transition-colors line-clamp-2 cursor-pointer"
                >
                  "{starter}"
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="pt-2 flex items-center justify-between border-t border-[#E5E3DC]">
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Clear current reflection draft?")) {
                  setPrompt("");
                  setTitle("");
                }
              }}
              disabled={!prompt && !title}
              className="text-xs text-[#8C8A84] hover:text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Reset Draft
            </button>

            <button
              id="btn-submit-reflection"
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#9E472A] hover:bg-[#853B23] text-white font-medium text-sm transition-all shadow-xs shadow-[#9E472A]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Reflecting with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#F3EDE2]" />
                  <span>
                    {mode === "summarize"
                      ? "Summarize Reflection"
                      : mode === "brainstorm"
                      ? "Brainstorm with Gemini"
                      : "Reflect with Gemini"}
                  </span>
                  <Send className="w-3.5 h-3.5 ml-1 text-[#F3EDE2]" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
