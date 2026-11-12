import { Database } from "@/lib/database.types";

// Database Models
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type Subtask = Database["public"]["Tables"]["subtasks"]["Row"];
export type Profile =Database["public"]["Tables"]["profiles"]["Row"];

// Extended User type that includes additional fields not in the database
export type User = Profile & {
  email: string;
  tasks_created: number;
};
