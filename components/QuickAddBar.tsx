"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Task } from "@/types/models";

interface QuickAddBarProps {
  onQuickAdd: (text: string) => Promise<Task>;
}

// One line at the top of the dashboard: type a sentence, and OpenAI turns it
// into a task with a title, due date and label.
export function QuickAddBar({ onQuickAdd }: QuickAddBarProps) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const task = await onQuickAdd(text);
      const parts = [
        `Added "${task.title}"`,
        task.due_date ? `due ${task.due_date.split("T")[0]}` : null,
        task.label ? `labelled ${task.label}` : null,
      ].filter(Boolean);
      setMessage({ ok: true, text: parts.join(", ") });
      setText("");
    } catch (err) {
      setMessage({
        ok: false,
        text: err instanceof Error ? err.message : "Couldn't add the task",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-1.5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Sparkles className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-500" />
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Quick add with AI: "Dentist next Tuesday, urgent"'
            maxLength={500}
            className="pl-9"
            disabled={busy}
            aria-label="Quick add a task with AI"
          />
        </div>
        <Button type="submit" disabled={!text.trim() || busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
        </Button>
      </div>
      {message && (
        <p className={`text-sm ${message.ok ? "text-green-600" : "text-red-500"}`}>
          {message.ok ? "✓ " : ""}
          {message.text}
        </p>
      )}
    </form>
  );
}
