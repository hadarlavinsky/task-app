"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useSubtasks } from "@/hooks/useSubtasks";

interface SubtaskChecklistProps {
  taskId: string;
  userId: string | null;
}

// The checklist of steps on the task page. It sits inside the task's form, so
// its buttons use type="button" and Enter in the input adds a step instead of
// submitting the form.
export function SubtaskChecklist({ taskId, userId }: SubtaskChecklistProps) {
  const { subtasks, isLoading, error, addSubtask, toggleSubtask, deleteSubtask } =
    useSubtasks(taskId, userId);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const done = subtasks.filter((s) => s.completed).length;
  const percent = subtasks.length ? Math.round((done / subtasks.length) * 100) : 0;

  const handleAdd = async () => {
    if (!newTitle.trim() || adding) return;
    setAdding(true);
    try {
      await addSubtask(newTitle);
      setNewTitle("");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-2 rounded-md border p-3">
      {subtasks.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="h-1.5 flex-1 rounded-full bg-gray-100">
            <div
              className="h-1.5 rounded-full bg-green-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span>
            {done}/{subtasks.length} done
          </span>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading checklist…</p>
      ) : subtasks.length === 0 ? (
        <p className="text-sm text-gray-400">No steps yet. Add the first one below.</p>
      ) : (
        <ul className="space-y-1">
          {subtasks.map((s) => (
            <li key={s.subtask_id} className="group flex items-center gap-2">
              <Checkbox
                checked={s.completed}
                onCheckedChange={(checked) =>
                  toggleSubtask(s.subtask_id, checked === true)
                }
                aria-label={`Mark "${s.title}" as done`}
              />
              <span
                className={`flex-1 text-sm ${
                  s.completed ? "text-gray-400 line-through" : ""
                }`}
              >
                {s.title}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-60 hover:opacity-100"
                onClick={() => deleteSubtask(s.subtask_id)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Delete step</span>
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 pt-1">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Add a step, e.g. Book the flight"
          maxLength={200}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAdd}
          disabled={!newTitle.trim() || adding}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
