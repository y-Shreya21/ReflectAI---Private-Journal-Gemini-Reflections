import React, { useState } from "react";
import Markdown from "react-markdown";
import {
  Sparkles,
  Send,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Download,
  ArrowLeft,
  Tag,
  Clock,
  Cpu,
  CornerDownRight,
  ListFilter,
  Lightbulb
} from "lucide-react";
import { JournalEntry, ChatMessage, ReflectionMode } from "../types";

interface ConversationViewProps {
  entry: JournalEntry;
  onSendFollowUp: (prompt: string, mode?: ReflectionMode) => Promise<void>;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onNewReflection: () => void;
  isLoading: boolean;
  errorMessage: string | null;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  entry,
  onSendFollowUp,
  onDeleteEntry,
  onNewReflection,
  isLoading,
  errorMessage,
}) => {
  const [followUpPrompt, setFollowUpPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpPrompt.trim() || isLoading) return;
    const text = followUpPrompt.trim();
    // Clear only if successful or delegate to parent
    await onSendFollowUp(text, entry.mode);
    setFollowUpPrompt("");
  };

  const handleQuickAction = async (actionPrompt: string, actionMode: ReflectionMode) => {
    if (isLoading) return;
    await onSendFollowUp(actionPrompt, actionMode);
  };

  const handleCopy = () => {
    const fullContent = [
      `# ${entry.title}`,
      `Date: ${new Date(entry.createdAt).toLocaleString()}`,
      `Mood: ${entry.mood || "N/A"} | Mode: ${entry.mode} | Model: ${entry.modelUsed}`,
      `\n## Initial Reflection:`,
      entry.initialPrompt,
      `\n## Gemini Reflection:`,
      entry.initialResponse,
      ...(entry.messages || []).map((m) =>
        m.role === "user"
          ? `\n### Follow-up User Thought:\n${m.content}`
          : `\n### Gemini Reply:\n${m.content}`
      ),
    ].join("\n");

    navigator.clipboard.writeText(fullContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const markdownContent = [
      `# ${entry.title}`,
      `*Recorded on: ${new Date(entry.createdAt).toLocaleString()}*`,
      `*Mood: ${entry.mood || "Thoughtful"} | Model: ${entry.modelUsed}*`,
      `\n---\n`,
      `### ✍️ Reflection`,
      entry.initialPrompt,
      `\n### ✨ Gemini Insights`,
      entry.initialResponse,
      ...(entry.messages || []).map((m) =>
        m.role === "user"
          ? `\n---\n**You:**\n${m.content}`
          : `\n**Gemini:**\n${m.content}`
      ),
    ].join("\n");

    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${entry.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this journal entry from your Firestore?")) {
      setIsDeleting(true);
      try {
        await onDeleteEntry(entry.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#E5E3DC]">
        <button
          onClick={onNewReflection}
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-[#73716B] hover:text-[#1A1A1A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Write New Entry</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#1A1A1A] bg-[#F3EDE2] hover:bg-[#EADCC9] border border-[#E5E3DC] transition-colors cursor-pointer"
            title="Copy entire entry to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#3E6B48]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#1A1A1A] bg-[#F3EDE2] hover:bg-[#EADCC9] border border-[#E5E3DC] transition-colors cursor-pointer"
            title="Export as Markdown file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            id="btn-delete-entry"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#B91C1C] bg-[#FDF2F0] hover:bg-[#FCE8E6] border border-[#F5C6CB] transition-colors disabled:opacity-50 cursor-pointer"
            title="Delete from Firestore"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? "Deleting..." : "Delete"}</span>
          </button>
        </div>
      </div>

      {/* Entry Metadata Header */}
      <div className="bg-[#FAF9F5] p-6 rounded-2xl border border-[#E5E3DC] shadow-[0_2px_8px_rgba(26,26,26,0.03)] space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center space-x-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white text-[#73716B] border border-[#E5E3DC]">
            <Clock className="w-3 h-3 text-[#8C8A84]" />
            <span>{new Date(entry.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
          </span>

          {entry.mood && (
            <span className="inline-flex items-center space-x-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#F3EDE2] text-[#9E472A] border border-[#E5D8C5]">
              <Tag className="w-3 h-3 text-[#9E472A]" />
              <span>Mood: {entry.mood}</span>
            </span>
          )}

          <span className="inline-flex items-center space-x-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white text-[#73716B] border border-[#E5E3DC]">
            <Cpu className="w-3 h-3 text-[#8C8A84]" />
            <span>Model: {entry.modelUsed || "gemini-3.6-flash"}</span>
          </span>

          <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F3EDE2] text-[#9E472A] border border-[#E5D8C5]">
            Mode: {entry.mode}
          </span>
        </div>

        <h1 className="text-2xl font-serif text-[#1A1A1A] tracking-tight">{entry.title}</h1>
      </div>

      {/* Conversation Thread */}
      <div className="space-y-6">
        {/* Turn 1: User's Initial Prompt */}
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 text-xs font-semibold shadow-xs">
            You
          </div>
          <div className="flex-1 bg-[#F3EDE2]/60 rounded-2xl rounded-tl-xs p-5 text-[#1A1A1A] text-sm leading-relaxed border border-[#E5E3DC] shadow-xs">
            <p className="whitespace-pre-wrap">{entry.initialPrompt}</p>
          </div>
        </div>

        {/* Turn 1: Gemini Initial Response */}
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#9E472A] text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
            <Sparkles className="w-4 h-4 text-[#F3EDE2]" />
          </div>
          <div className="flex-1 bg-white rounded-2xl rounded-tl-xs p-6 text-[#1A1A1A] border border-[#E5E3DC] shadow-[0_2px_8px_rgba(26,26,26,0.04)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E3DC]/60">
              <span className="text-xs font-semibold text-[#9E472A] flex items-center space-x-1 font-serif">
                <Sparkles className="w-3.5 h-3.5 text-[#9E472A]" />
                <span>Gemini Reflection</span>
              </span>
              <span className="text-[10px] text-[#8C8A84] font-mono">Verified in Firestore</span>
            </div>
            <div className="prose prose-stone prose-sm max-w-none text-[#1A1A1A] leading-relaxed">
              <Markdown>{entry.initialResponse}</Markdown>
            </div>
          </div>
        </div>

        {/* Follow-up multi-turn messages */}
        {(entry.messages || []).map((msg) => (
          <div key={msg.id} className="flex items-start space-x-3">
            {msg.role === "user" ? (
              <>
                <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 text-xs font-semibold shadow-xs">
                  You
                </div>
                <div className="flex-1 bg-[#F3EDE2]/60 rounded-2xl rounded-tl-xs p-5 text-[#1A1A1A] text-sm leading-relaxed border border-[#E5E3DC] shadow-xs">
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="block text-[10px] text-[#8C8A84] mt-2 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-[#9E472A] text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
                  <Sparkles className="w-4 h-4 text-[#F3EDE2]" />
                </div>
                <div className="flex-1 bg-white rounded-2xl rounded-tl-xs p-6 text-[#1A1A1A] border border-[#E5E3DC] shadow-[0_2px_8px_rgba(26,26,26,0.04)] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5E3DC]/60">
                    <span className="text-xs font-semibold text-[#9E472A] flex items-center space-x-1 font-serif">
                      <Sparkles className="w-3.5 h-3.5 text-[#9E472A]" />
                      <span>Gemini Dialogue</span>
                    </span>
                    <span className="text-[10px] text-[#8C8A84]">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="prose prose-stone prose-sm max-w-none text-[#1A1A1A] leading-relaxed">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Quick Action Sparks for active thread */}
      <div className="pt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-[#73716B] font-medium">Quick Prompts:</span>
        <button
          type="button"
          onClick={() => handleQuickAction("Please provide a concise 3-bullet summary of everything we explored in this entry.", "summarize")}
          disabled={isLoading}
          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F3EDE2] hover:bg-[#EADCC9] text-[#1A1A1A] border border-[#E5E3DC] transition-colors disabled:opacity-50 cursor-pointer"
        >
          <ListFilter className="w-3.5 h-3.5 text-[#73716B]" />
          <span>Summarize thread</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickAction("What are 3 practical brainstorming action steps or questions to contemplate next?", "brainstorm")}
          disabled={isLoading}
          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F3EDE2] hover:bg-[#EADCC9] text-[#1A1A1A] border border-[#E5E3DC] transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Lightbulb className="w-3.5 h-3.5 text-[#9E472A]" />
          <span>Brainstorm next steps</span>
        </button>
      </div>

      {/* Error notification if follow-up failed */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#FDF2F0] border border-[#F5C6CB] text-[#852C27] text-xs sm:text-sm">
          <p className="font-semibold">Generation Notice</p>
          <p className="mt-0.5">{errorMessage}</p>
        </div>
      )}

      {/* Follow-up reply form */}
      <form onSubmit={handleSend} className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E5E3DC] shadow-[0_2px_12px_rgba(26,26,26,0.03)] space-y-3">
        <div className="flex items-center space-x-2 text-xs text-[#1A1A1A] font-medium font-serif">
          <CornerDownRight className="w-4 h-4 text-[#9E472A]" />
          <span>Continue this reflection with Gemini</span>
        </div>

        <div className="relative">
          <textarea
            id="follow-up-input"
            rows={3}
            value={followUpPrompt}
            onChange={(e) => setFollowUpPrompt(e.target.value)}
            placeholder="Ask a question about this reflection, add a new thought, or request further advice..."
            className="w-full px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-[#8C8A84] rounded-xl border border-[#E5E3DC] bg-white focus:outline-none focus:ring-2 focus:ring-[#9E472A]/20 focus:border-[#9E472A] transition-colors resize-none leading-relaxed"
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-end">
          <button
            id="btn-send-followup"
            type="submit"
            disabled={!followUpPrompt.trim() || isLoading}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#9E472A] hover:bg-[#853B23] text-white font-medium text-xs sm:text-sm transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <span>Send Follow-Up</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
