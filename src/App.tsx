import React, { useState, useEffect, useCallback } from "react";
import {
  auth,
  signInWithGoogle,
  signOutUser,
  onAuthStateChanged,
  saveJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  fetchUserJournalEntries
} from "./lib/firebase";
import { AuthUserProfile, JournalEntry, ReflectionMode, ChatMessage } from "./types";
import { Navbar } from "./components/Navbar";
import { LandingHero } from "./components/LandingHero";
import { HistorySidebar } from "./components/HistorySidebar";
import { JournalEditor } from "./components/JournalEditor";
import { ConversationView } from "./components/ConversationView";
import { ThreatModelModal } from "./components/ThreatModelModal";

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthActionLoading, setIsAuthActionLoading] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  // Journal State
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [isEntriesLoading, setIsEntriesLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  // UI state
  const [isThreatModalOpen, setIsThreatModalOpen] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
        setAuthErrorMessage(null);
      } else {
        setCurrentUser(null);
        setEntries([]);
        setActiveEntryId(null);
      }
      setIsAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch entries for authenticated user
  const loadUserEntries = useCallback(async (uid: string) => {
    setIsEntriesLoading(true);
    try {
      const userEntries = await fetchUserJournalEntries(uid);
      setEntries(userEntries);
    } catch (err: any) {
      console.error("Failed to load user journal entries:", err);
      setApiErrorMessage("Could not load past entries from Firestore. Please verify your connection.");
    } finally {
      setIsEntriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.uid) {
      loadUserEntries(currentUser.uid);
    }
  }, [currentUser?.uid, loadUserEntries]);

  // Sign In Handler
  const handleSignIn = async () => {
    setIsAuthActionLoading(true);
    setAuthErrorMessage(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Sign-in error:", error);
      setAuthErrorMessage(
        error?.message || "Failed to sign in with Google. If popups are blocked, please enable popups or open in a new tab."
      );
    } finally {
      setIsAuthActionLoading(false);
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    try {
      await signOutUser();
      setCurrentUser(null);
      setEntries([]);
      setActiveEntryId(null);
    } catch (error: any) {
      console.error("Sign-out error:", error);
    }
  };

  // Submit New Reflection
  const handleNewReflectionSubmit = async ({
    prompt,
    mode,
    mood,
    title,
  }: {
    prompt: string;
    mode: ReflectionMode;
    mood: string;
    title: string;
  }) => {
    if (!currentUser) return;
    setIsGenerating(true);
    setApiErrorMessage(null);

    try {
      // Step 1: Call Gemini Reflection API via server endpoint
      const response = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          mode,
          history: [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned error (${response.status})`);
      }

      const { reply, modelUsed } = await response.json();

      // Step 2: Construct new journal entry
      const newEntryId = `entry_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const newEntry: JournalEntry = {
        id: newEntryId,
        userId: currentUser.uid,
        title,
        initialPrompt: prompt,
        initialResponse: reply,
        messages: [],
        mode,
        modelUsed: modelUsed || "gemini-3.6-flash",
        mood,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Step 3: Guaranteed Transaction Persistence to Firestore
      await saveJournalEntry(currentUser.uid, newEntry);

      // Step 4: Update UI state
      setEntries((prev) => [newEntry, ...prev]);
      setActiveEntryId(newEntryId);
    } catch (error: any) {
      console.error("Failed to process reflection:", error);
      setApiErrorMessage(error?.message || "An unexpected error occurred while reflecting with Gemini.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Follow-up message on active entry
  const handleFollowUpSubmit = async (followUpPrompt: string, overrideMode?: ReflectionMode) => {
    if (!currentUser || !activeEntryId) return;
    const activeEntry = entries.find((e) => e.id === activeEntryId);
    if (!activeEntry) return;

    setIsGenerating(true);
    setApiErrorMessage(null);

    try {
      // Prepare history for multi-turn conversational context
      const chatHistory = [
        { role: "user" as const, content: activeEntry.initialPrompt },
        { role: "model" as const, content: activeEntry.initialResponse },
        ...(activeEntry.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      const response = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: followUpPrompt,
          history: chatHistory,
          mode: overrideMode || activeEntry.mode,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${response.status}`);
      }

      const { reply } = await response.json();

      const userMsg: ChatMessage = {
        id: `msg_u_${Date.now()}`,
        role: "user",
        content: followUpPrompt,
        timestamp: Date.now(),
      };

      const modelMsg: ChatMessage = {
        id: `msg_m_${Date.now() + 1}`,
        role: "model",
        content: reply,
        timestamp: Date.now() + 1,
      };

      const updatedMessages = [...(activeEntry.messages || []), userMsg, modelMsg];
      const updatedEntry: JournalEntry = {
        ...activeEntry,
        messages: updatedMessages,
        updatedAt: Date.now(),
      };

      // Persist update in Firestore
      await updateJournalEntry(currentUser.uid, activeEntry.id, {
        messages: updatedMessages,
        updatedAt: Date.now(),
      });

      // Update in memory
      setEntries((prev) => prev.map((e) => (e.id === activeEntry.id ? updatedEntry : e)));
    } catch (error: any) {
      console.error("Follow-up error:", error);
      setApiErrorMessage(error?.message || "Failed to process follow-up reflection.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete Entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!currentUser) return;
    try {
      await deleteJournalEntry(currentUser.uid, entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      if (activeEntryId === entryId) {
        setActiveEntryId(null);
      }
    } catch (error: any) {
      console.error("Failed to delete entry:", error);
      setApiErrorMessage("Failed to delete the entry from Firestore.");
    }
  };

  const activeEntry = entries.find((e) => e.id === activeEntryId);

  // Initial loading screen while checking auth
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F6F2] space-y-4">
        <div className="w-10 h-10 border-3 border-[#9E472A] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-[#73716B] uppercase tracking-widest font-serif">
          Authenticating Session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#1A1A1A] font-sans flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        onSignOut={handleSignOut}
        onNewReflection={() => {
          setActiveEntryId(null);
          setApiErrorMessage(null);
        }}
        onOpenThreatModel={() => setIsThreatModalOpen(true)}
        isCreatingNew={activeEntryId === null}
      />

      {/* Main Content Body */}
      {!currentUser ? (
        <LandingHero
          onSignIn={handleSignIn}
          isLoading={isAuthActionLoading}
          errorMessage={authErrorMessage}
        />
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto">
          {/* Left History Sidebar */}
          <HistorySidebar
            entries={entries}
            activeEntryId={activeEntryId}
            onSelectEntry={(id) => {
              setActiveEntryId(id);
              setApiErrorMessage(null);
            }}
            onNewReflection={() => {
              setActiveEntryId(null);
              setApiErrorMessage(null);
            }}
            onDeleteEntry={handleDeleteEntry}
            isLoading={isEntriesLoading}
          />

          {/* Right Work Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {activeEntry ? (
              <ConversationView
                entry={activeEntry}
                onSendFollowUp={handleFollowUpSubmit}
                onDeleteEntry={handleDeleteEntry}
                onNewReflection={() => {
                  setActiveEntryId(null);
                  setApiErrorMessage(null);
                }}
                isLoading={isGenerating}
                errorMessage={apiErrorMessage}
              />
            ) : (
              <JournalEditor
                onSubmit={handleNewReflectionSubmit}
                isLoading={isGenerating}
                errorMessage={apiErrorMessage}
                onClearError={() => setApiErrorMessage(null)}
              />
            )}
          </main>
        </div>
      )}

      {/* Threat Model Modal */}
      <ThreatModelModal
        isOpen={isThreatModalOpen}
        onClose={() => setIsThreatModalOpen(false)}
      />
    </div>
  );
}
