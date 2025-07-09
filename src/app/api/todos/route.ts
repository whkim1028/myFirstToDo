import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const todosFilePath = path.join(process.cwd(), 'todos.json');

async function getTodos() {
  try {
    const data = await fs.readFile(todosFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function GET() {
  const todos = await getTodos();
  return NextResponse.json(todos);
}

export async function POST(request: Request) {
  const todoData = await request.json();
  const todos = await getTodos();

  const newId = todos.length > 0 ? Math.max(...todos.map((todo: any) => todo.id)) + 1 : 1;
  const newTodo = { id: newId, ...todoData };

  todos.push(newTodo);
  await fs.writeFile(todosFilePath, JSON.stringify(todos, null, 2));
  return NextResponse.json({ message: 'To-do added successfully', todo: newTodo });
}
