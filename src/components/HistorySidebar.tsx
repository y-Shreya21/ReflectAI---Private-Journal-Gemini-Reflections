import React, { useState } from "react";
import { Search, Plus, BookOpen, Trash2, Calendar, MessageSquare, Tag, ChevronRight } from "lucide-react";
import { JournalEntry } from "../types";

interface HistorySidebarProps {
  entries: JournalEntry[];
  activeEntryId: string | null;
  onSelectEntry: (id: string) => void;
  onNewReflection: () => void;
  onDeleteEntry: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  entries,
  activeEntryId,
  onSelectEntry,
  onNewReflection,
  onDeleteEntry,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>("all");

  // Distinct moods from entries
  const availableMoods = Array.from(new Set(entries.map((e) => e.mood).filter(Boolean)));

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.initialPrompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.initialResponse.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMood = selectedMoodFilter === "all" || entry.mood === selectedMoodFilter;
    return matchesSearch && matchesMood;
  });

  return (
    <aside className="w-full lg:w-80 shrink-0 bg-[#FAF9F5]/90 border-r border-[#E5E3DC] flex flex-col h-[calc(100vh-4rem)] lg:sticky lg:top-16">
      {/* Sidebar Header & New Button */}
      <div className="p-4 border-b border-[#E5E3DC] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[#9E472A]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
              Reflections ({entries.length})
            </span>
          </div>

          <button
            onClick={onNewReflection}
            className="p-1.5 rounded-lg bg-[#F3EDE2] hover:bg-[#EADCC9] text-[#1A1A1A] transition-colors cursor-pointer"
            title="Create New Reflection"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8C8A84] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reflections..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E5E3DC] bg-white placeholder-[#8C8A84] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#9E472A]/20 focus:border-[#9E472A] transition-all"
          />
        </div>

        {/* Mood Filter Chips */}
        {availableMoods.length > 0 && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            <button
              onClick={() => setSelectedMoodFilter("all")}
              className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                selectedMoodFilter === "all"
                  ? "bg-[#1A1A1A] text-white font-medium"
                  : "bg-[#F3EDE2] text-[#73716B] hover:bg-[#EADCC9] hover:text-[#1A1A1A] border border-[#E5E3DC]"
              }`}
            >
              All
            </button>
            {availableMoods.map((mood) => (
              <button
                key={mood}
                onClick={() => setSelectedMoodFilter(mood as string)}
                className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  selectedMoodFilter === mood
                    ? "bg-[#9E472A] text-white font-medium"
                    : "bg-[#F3EDE2] text-[#73716B] hover:bg-[#EADCC9] hover:text-[#1A1A1A] border border-[#E5E3DC]"
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#E5E3DC]/60 p-2 space-y-1">
        {isLoading && entries.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-[#9E472A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#73716B]">Loading your private entries...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-6 text-center space-y-3 my-auto">
            <div className="w-10 h-10 rounded-full bg-[#F3EDE2] text-[#9E472A] flex items-center justify-center mx-auto">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1A1A1A] font-serif">No reflections found</p>
              <p className="text-[11px] text-[#73716B] mt-1">
                {searchTerm ? "No entries match your search." : "Write your first entry to get started."}
              </p>
            </div>
            {!searchTerm && (
              <button
                onClick={onNewReflection}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#9E472A] text-white hover:bg-[#853B23] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start First Reflection</span>
              </button>
            )}
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isActive = entry.id === activeEntryId;
            const messageCount = 1 + (entry.messages ? entry.messages.length : 0);

            return (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry.id)}
                className={`group relative p-3 rounded-xl transition-all cursor-pointer text-left ${
                  isActive
                    ? "bg-white shadow-xs border border-[#C86446]/50 ring-1 ring-[#C86446]/30"
                    : "hover:bg-white/80 border border-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-medium text-[#1A1A1A] font-serif line-clamp-1 flex-1">
                    {entry.title || "Untitled Reflection"}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete "${entry.title}"?`)) {
                        onDeleteEntry(entry.id);
                      }
                    }}
                    title="Delete Entry"
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#8C8A84] hover:text-red-700 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-[#73716B] line-clamp-2 mt-1 leading-relaxed">
                  {entry.initialPrompt}
                </p>

                <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#8C8A84]">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-[#8C8A84]" />
                      <span>{new Date(entry.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    </span>

                    {entry.mood && (
                      <span className="px-1.5 py-0.5 rounded bg-[#F3EDE2] text-[#9E472A] border border-[#E5D8C5] font-medium text-[10px]">
                        {entry.mood}
                      </span>
                    )}
                  </div>

                  <span className="flex items-center space-x-0.5 text-[#8C8A84]">
                    <MessageSquare className="w-3 h-3" />
                    <span>{messageCount}</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
