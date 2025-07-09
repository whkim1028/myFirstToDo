import TodoList from '@/components/TodoList';
import fs from 'fs/promises';
import path from 'path';

async function getTodos() {
  const todosFilePath = path.join(process.cwd(), 'todos.json');
  try {
    const data = await fs.readFile(todosFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export default async function Home() {
  const todos = await getTodos();

  return (
    <main className="container py-5">
      <h1 className="text-center mb-4">MyToDooApp</h1>
      <TodoList initialTodos={todos} />
    </main>
  );
}