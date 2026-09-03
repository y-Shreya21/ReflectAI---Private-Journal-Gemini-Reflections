import React from "react";
import { Shield, X, CheckCircle2, Lock, AlertTriangle, Database, Cpu } from "lucide-react";
import { ThreatItem } from "../types";

interface ThreatModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const THREAT_MODEL_DATA: ThreatItem[] = [
  {
    zone: "1. Input Surfaces",
    threat: "Prompt injection, oversized reflection payloads, malicious characters attempting SQLi/NoSQLi.",
    severity: "High",
    countermeasure:
      "Express body parser limit (10MB), input string sanitization, length boundaries (30,000 chars), and strict undefined stripping before database writes.",
  },
  {
    zone: "2. Planning & Reasoning",
    threat: "System instruction override, jailbreaking to leak system prompts or act outside journaling role.",
    severity: "Medium",
    countermeasure:
      "Strict system instruction anchoring with GoogleGenAI SDK, explicit separation between instructions and untrusted user reflection content, and deterministic model fallback ladder.",
  },
  {
    zone: "3. Tool Execution & APIs",
    threat: "Privilege escalation, SSRF, unauthorized model manipulation, or model API key theft.",
    severity: "Critical",
    countermeasure:
      "Server-side Gemini proxy (/api/reflect) keeping GEMINI_API_KEY secret from browser, zero dynamic shell/eval execution, defensive parameter schema validation.",
  },
  {
    zone: "4. Memory & State",
    threat: "Cross-user data leakage, unauthorized document tampering, reading other users' journals.",
    severity: "Critical",
    countermeasure:
      "Owner-bound Cloud Firestore security rules: `allow read, write: if request.auth != null && request.auth.uid == userId;` isolating entries under `/users/{userId}/interactions/{id}`.",
  },
  {
    zone: "5. Inter-System Communication",
    threat: "Credential interception, session hijacking, token leakage across network layers.",
    severity: "High",
    countermeasure:
      "Passwordless Federated Identity via Firebase Authentication Google Sign-In, TLS encrypted transport, Secret Manager environment variable injection.",
  },
];

export const ThreatModelModal: React.FC<ThreatModelModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF9F5] w-full max-w-3xl rounded-2xl border border-[#E5E3DC] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E5E3DC] flex items-center justify-between bg-[#F3EDE2]/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center text-[#3E6B48]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1A1A1A] font-serif">Production Security & Threat Model</h3>
              <p className="text-xs text-[#73716B]">The 5 Agentic Threat Zones & Countermeasures</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8A84] hover:text-[#1A1A1A] rounded-lg hover:bg-[#EADCC9]/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="p-4 rounded-xl bg-[#E8F0EA] border border-[#CDE0D1] flex items-start space-x-3 text-xs text-[#244A2C]">
            <CheckCircle2 className="w-4 h-4 text-[#3E6B48] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Zero Insecure Defaults Guarantee:</span>
              <p className="mt-0.5 text-[#244A2C]/90 leading-relaxed">
                Cloud Firestore rules strictly enforce owner-bound path checking (<code>request.auth.uid == userId</code>). 
                The Gemini API key is securely isolated on the backend server and never sent to client browsers.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E3DC] text-[#73716B] font-medium">
                  <th className="py-2.5 pr-3">Threat Zone</th>
                  <th className="py-2.5 px-3">Identified Risk</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 pl-3">Countermeasure Implemented</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E3DC]/60 text-[#1A1A1A]">
                {THREAT_MODEL_DATA.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#F3EDE2]/40 transition-colors">
                    <td className="py-3 pr-3 font-semibold text-[#1A1A1A] whitespace-nowrap align-top">
                      {item.zone}
                    </td>
                    <td className="py-3 px-3 text-[#73716B] align-top max-w-[220px]">
                      {item.threat}
                    </td>
                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          item.severity === "Critical"
                            ? "bg-[#FDF2F0] text-[#B91C1C] border border-[#F5C6CB]"
                            : item.severity === "High"
                            ? "bg-[#F3EDE2] text-[#9E472A] border border-[#E5D8C5]"
                            : "bg-[#E8F0EA] text-[#244A2C] border border-[#CDE0D1]"
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-3 pl-3 text-[#1A1A1A] leading-relaxed align-top">
                      {item.countermeasure}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Firestore Rules snippet */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#1A1A1A] flex items-center space-x-1.5 font-serif">
              <Database className="w-3.5 h-3.5 text-[#9E472A]" />
              <span>Deployed Firestore Isolation Rule (firestore.rules)</span>
            </h4>
            <pre className="p-3.5 rounded-xl bg-[#1A1A1A] text-[#FAF9F5] font-mono text-[11px] overflow-x-auto leading-relaxed border border-[#2D2D2D]">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#E5E3DC] bg-[#F3EDE2]/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Close Threat Model
          </button>
        </div>
      </div>
    </div>
  );
};
