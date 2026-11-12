-- Subtasks: a checklist of small steps inside a task.
--
-- Each row is one step. It belongs to one task (task_id) and to the user who
-- owns that task (user_id). Deleting a task deletes its subtasks too
-- (on delete cascade).

create table public.subtasks (
  subtask_id uuid default gen_random_uuid() primary key,
  task_id uuid not null references public.tasks(task_id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  completed boolean not null default false,
  -- The order of the steps in the checklist (0 = first).
  position integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Fast look-up of a task's subtasks, in order.
create index subtasks_task_id_position_idx on public.subtasks (task_id, position);

-- Row Level Security: users can only see and change their own subtasks,
-- and only add subtasks to tasks they own.
alter table public.subtasks enable row level security;

create policy "Users can read own subtasks"
on public.subtasks for select
using (auth.uid() = user_id);

create policy "Users can add subtasks to own tasks"
on public.subtasks for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.tasks t
    where t.task_id = subtasks.task_id and t.user_id = auth.uid()
  )
);

create policy "Users can update own subtasks"
on public.subtasks for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own subtasks"
on public.subtasks for delete
using (auth.uid() = user_id);
