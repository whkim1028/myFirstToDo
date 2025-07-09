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

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  const updatedFields = await request.json();
  const todos = await getTodos();

  const todoIndex = todos.findIndex((todo: any) => todo.id === parseInt(id));

  if (todoIndex === -1) {
    return NextResponse.json({ message: 'To-do not found' }, { status: 404 });
  }

  todos[todoIndex] = { ...todos[todoIndex], ...updatedFields };

  await fs.writeFile(todosFilePath, JSON.stringify(todos, null, 2));

  return NextResponse.json({ message: 'To-do updated successfully', todo: todos[todoIndex] });
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  let todos = await getTodos();

  const initialLength = todos.length;
  todos = todos.filter((todo: any) => todo.id !== parseInt(id));

  if (todos.length === initialLength) {
    return NextResponse.json({ message: 'To-do not found' }, { status: 404 });
  }

  await fs.writeFile(todosFilePath, JSON.stringify(todos, null, 2));

  return NextResponse.json({ message: 'To-do deleted successfully' });
}