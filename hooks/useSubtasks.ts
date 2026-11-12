import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Subtask } from "@/types/models";

// Reads and changes the checklist (subtasks) of one task.
// Every change is saved to the database right away.
export function useSubtasks(taskId: string | undefined, userId: string | null | undefined) {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      ),
    []
  );
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;
    const load = async () => {
      const { data, error } = await supabase
        .from("subtasks")
        .select("*")
        .eq("task_id", taskId)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) setError(error.message);
      else setSubtasks(data ?? []);
      setIsLoading(false);
    };
    load();
  }, [taskId, supabase]);

  const addSubtask = async (title: string) => {
    const clean = title.trim();
    if (!clean || !taskId || !userId) return;
    const position = subtasks.length
      ? Math.max(...subtasks.map((s) => s.position)) + 1
      : 0;
    const { data, error } = await supabase
      .from("subtasks")
      .insert({ task_id: taskId, user_id: userId, title: clean.slice(0, 200), position })
      .select()
      .single();
    if (error) {
      setError(error.message);
      throw error;
    }
    setSubtasks((prev) => [...prev, data]);
    setError(null);
  };

  const toggleSubtask = async (subtaskId: string, completed: boolean) => {
    // Show the change at once; undo it if saving fails.
    setSubtasks((prev) =>
      prev.map((s) => (s.subtask_id === subtaskId ? { ...s, completed } : s))
    );
    const { error } = await supabase
      .from("subtasks")
      .update({ completed })
      .eq("subtask_id", subtaskId);
    if (error) {
      setError(error.message);
      setSubtasks((prev) =>
        prev.map((s) =>
          s.subtask_id === subtaskId ? { ...s, completed: !completed } : s
        )
      );
    }
  };

  const deleteSubtask = async (subtaskId: string) => {
    const { error } = await supabase
      .from("subtasks")
      .delete()
      .eq("subtask_id", subtaskId);
    if (error) {
      setError(error.message);
      return;
    }
    setSubtasks((prev) => prev.filter((s) => s.subtask_id !== subtaskId));
  };

  return { subtasks, isLoading, error, addSubtask, toggleSubtask, deleteSubtask };
}

// For the dashboard: how many subtasks each task has, and how many are done.
// Row Level Security limits this to the user's own subtasks.
export function useSubtaskCounts(refreshKey: unknown) {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      ),
    []
  );
  const [counts, setCounts] = useState<Record<string, { done: number; total: number }>>({});

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("subtasks")
        .select("task_id, completed");
      if (error) {
        console.error("Error fetching subtask counts:", error.message);
        return;
      }
      const next: Record<string, { done: number; total: number }> = {};
      for (const row of data ?? []) {
        const c = (next[row.task_id] ??= { done: 0, total: 0 });
        c.total += 1;
        if (row.completed) c.done += 1;
      }
      setCounts(next);
    };
    load();
  }, [refreshKey, supabase]);

  return counts;
}
