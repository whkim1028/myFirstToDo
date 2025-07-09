"use client";

import { useState } from 'react';

interface Todo {
  id: number;
  title: string;
  dueDate: string;
  category: string;
  priority: string;
  isDone: boolean;
}

interface TodoListProps {
  initialTodos: Todo[];
}

export default function TodoList({ initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [editedTodo, setEditedTodo] = useState<Partial<Todo>>({});
  const [sortOrder, setSortOrder] = useState<'default' | 'priority' | 'dueDate'>('default');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTodo = {
      title,
      dueDate,
      category,
      priority,
      isDone: false,
    };

    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTodo),
    });

    if (response.ok) {
      const data = await response.json();
      setTodos([...todos, data.todo]);
      setTitle('');
      setDueDate('');
      setCategory('');
      setPriority('medium');
    }
  };

  const handleToggleDone = async (id: number, isDone: boolean) => {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isDone: !isDone }),
    });

    if (response.ok) {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, isDone: !isDone } : todo
        )
      );
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditedTodo(todo);
  };

  const handleSave = async (id: number) => {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedTodo),
    });

    if (response.ok) {
      setTodos(
        todos.map((todo) => (todo.id === id ? { ...todo, ...editedTodo } : todo))
      );
      setEditingTodoId(null);
      setEditedTodo({});
    }
  };

  const handleCancel = () => {
    setEditingTodoId(null);
    setEditedTodo({});
  };

  const handleDelete = async (id: number) => {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-danger';
      case 'medium':
        return 'bg-warning';
      case 'low':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  const groupTodosByDueDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const sortedTodos = [...todos].sort((a, b) => {
      if (sortOrder === 'priority') {
        const priorityOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (sortOrder === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

    const grouped: { today: Todo[]; tomorrow: Todo[]; other: Todo[] } = {
      today: [],
      tomorrow: [],
      other: [],
    };

    sortedTodos.forEach((todo) => {
      if (!todo.dueDate) {
        grouped.other.push(todo);
        return;
      }
      const todoDueDate = new Date(todo.dueDate);
      todoDueDate.setHours(0, 0, 0, 0);

      if (todoDueDate.getTime() === today.getTime()) {
        grouped.today.push(todo);
      } else if (todoDueDate.getTime() === tomorrow.getTime()) {
        grouped.tomorrow.push(todo);
      } else {
        grouped.other.push(todo);
      }
    });

    return grouped;
  };

  const groupedTodos = groupTodosByDueDate();

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="card p-4 mb-4">
        <div className="mb-3">
          <label className="form-label" htmlFor="title">
            Title
          </label>
          <input
            className="form-control"
            id="title"
            type="text"
            placeholder="Enter a new to-do"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="dueDate">
            Due Date
          </label>
          <input
            className="form-control"
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="category">
            Category
          </label>
          <input
            className="form-control"
            id="category"
            type="text"
            placeholder="e.g., Work, Personal"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="form-label" htmlFor="priority">
            Priority
          </label>
          <select
            className="form-select"
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="d-grid">
          <button
            className="btn btn-primary"
            type="submit"
          >
            Add To-Do
          </button>
        </div>
      </form>
      <div>
        <h2 className="my-4">To-Do List</h2>
        <div className="mb-3">
          <label htmlFor="sortOrder" className="form-label">Sort By:</label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'default' | 'priority' | 'dueDate')}
            className="form-select"
          >
            <option value="default">Default</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>
        {groupedTodos.today.length > 0 && (
          <div className="mb-4">
            <h3 className="h5">Today</h3>
            <ul className="list-group">
              {groupedTodos.today.map((todo) => (
                <li key={todo.id} className={`list-group-item d-flex flex-column ${todo.isDone ? 'text-muted' : ''}`}>
                  {editingTodoId === todo.id ? (
                    <div>
                      <input
                        type="text"
                        value={editedTodo.title || ''}
                        onChange={(e) => setEditedTodo({ ...editedTodo, title: e.target.value })}
                        className="form-control mb-2"
                      />
                      <input
                        type="date"
                        value={editedTodo.dueDate || ''}
                        onChange={(e) => setEditedTodo({ ...editedTodo, dueDate: e.target.value })}
                        className="form-control mb-2"
                      />
                      <input
                        type="text"
                        value={editedTodo.category || ''}
                        onChange={(e) => setEditedTodo({ ...editedTodo, category: e.target.value })}
                        className="form-control mb-2"
                      />
                      <select
                        value={editedTodo.priority || 'medium'}
                        onChange={(e) => setEditedTodo({ ...editedTodo, priority: e.target.value })}
                        className="form-select mb-2"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                      <div className="d-flex justify-content-end gap-2">
                        <button onClick={() => handleSave(todo.id)} className="btn btn-success btn-sm">Save</button>
                        <button onClick={handleCancel} className="btn btn-secondary btn-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex flex-column w-100">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            checked={todo.isDone}
                            onChange={() => handleToggleDone(todo.id, todo.isDone)}
                            className="form-check-input"
                            id={`todo-${todo.id}`}
                            suppressHydrationWarning
                          />
                          <label className={`form-check-label ${todo.isDone ? 'text-decoration-line-through' : ''}`} htmlFor={`todo-${todo.id}`}
                            suppressHydrationWarning
                          >
                            {todo.title}
                          </label>
                        </div>
                        <span className={`badge ${getPriorityClass(todo.priority)}`}>
                          {todo.priority}
                        </span>
                      </div>
                      <div className="text-muted mt-2">
                        <p className="mb-0"><strong>Category:</strong> {todo.category}</p>
                        <p className="mb-0"><strong>Due Date:</strong> {todo.dueDate}</p>
                      </div>
                      <div className="d-flex justify-content-end gap-2 mt-2">
                        <button onClick={() => handleEdit(todo)} className="btn btn-warning btn-sm">Edit</button>
                        <button onClick={() => handleDelete(todo.id)} className="btn btn-danger btn-sm">Delete</button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {groupedTodos.tomorrow.length > 0 && (
          <div className="mb-4">
            <h3 className="h5">Tomorrow</h3>
            <ul className="list-group">
              {groupedTodos.tomorrow.map((todo) => (
                <li key={todo.id} className={`list-group-item d-flex flex-column ${todo.isDone ? 'text-muted' : ''}`}>
                  {editingTodoId === todo.id ? (
                    <div>
                      <input
                        type="text"
                        value={editedTodo.title || ''}
                        onChange={(e) => setEditedTodo({ ...editedTodo, title: e.target.value })}
                        className="form-control mb-2"
                      />
                      <input
                        type="date"
                        value={editedTodo.dueDate || ''}
                        onChange={(e) => setEditedTodo({ ...editedTodo, dueDate: e.target.value })}
                        className="form-control mb-2"
                      />
                      <input
                        type="text"
                        value={editedTodo.category || ''}
                        onChange={(e) => setEditedTodo({ ...editedTodo, category: e.target.value })}
                        className="form-control mb-2"
                      />
                      <select
                        value={editedTodo.priority || 'medium'}
                        onChange={(e) => setEditedTodo({ ...editedTodo, priority: e.target.value })}
                        className="form-select mb-2"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                      <div className="d-flex justify-content-end gap-2">
                        <button onClick={() => handleSave(todo.id)} className="btn btn-success btn-sm">Save</button>
                        <button onClick={handleCancel} className="btn btn-secondary btn-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex flex-column w-100">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            checked={todo.isDone}
                            onChange={() => handleToggleDone(todo.id, todo.isDone)}
                            className="form-check-input"
                            id={`todo-${todo.id}`}
                            suppressHydrationWarning
                          />
                          <label className={`form-check-label ${todo.isDone ? 'text-decoration-line-through' : ''}`} htmlFor={`todo-${todo.id}`}
                            suppressHydrationWarning
                          >
                            {todo.title}
                          </label>
                        </div>
                        <span className={`badge ${getPriorityClass(todo.priority)}`}>
                          {todo.priority}
                        </span>
                      </div>
                      <div className="text-muted mt-2">
                        <p className="mb-0"><strong>Category:</strong> {todo.category}</p>
                        <p className="mb-0"><strong>Due Date:</strong> {todo.dueDate}</p>
                      </div>
                      <div className="d-flex justify-content-end gap-2 mt-2">
                        <button onClick={() => handleEdit(todo)} className="btn btn-warning btn-sm">Edit</button>
                        <button onClick={() => handleDelete(todo.id)} className="btn btn-danger btn-sm">Delete</button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {groupedTodos.other.length > 0 && (
          <div className="mb-4">
            <h3 className="h5">Other</h3>
            <ul className="list-group">
              {groupedTodos.other.map((todo) => (
                <li key={todo.id} className={`list-group-item d-flex flex-column ${todo.isDone ? 'text-muted' : ''}`}>
                  {editingTodoId === todo.id ? (
                    <div>
                      <input
                        type="text"
                        value={editedTodo.title || ''}
                        onChange={(e) => setEditedTodo({ ...editedTodo, title: e.target.value })}
                        className="form-control mb-2"
                      />
                      <input
                        type="date"
                        value={editedTodo.dueDate || ''}
                        onChange={(e) => setEditedTodo({ ...editedTodo, dueDate: e.target.value })}
                        className="form-control mb-2"
                      />
                      <input
                        type="text"
                        value={editedTodo.category || ''}
                        onChange={(e) => setEditedTodo({ ...editedTodo, category: e.target.value })}
                        className="form-control mb-2"
                      />
                      <select
                        value={editedTodo.priority || 'medium'}
                        onChange={(e) => setEditedTodo({ ...editedTodo, priority: e.target.value })}
                        className="form-select mb-2"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                      <div className="d-flex justify-content-end gap-2">
                        <button onClick={() => handleSave(todo.id)} className="btn btn-success btn-sm">Save</button>
                        <button onClick={handleCancel} className="btn btn-secondary btn-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex flex-column w-100">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            checked={todo.isDone}
                            onChange={() => handleToggleDone(todo.id, todo.isDone)}
                            className="form-check-input"
                            id={`todo-${todo.id}`}
                            suppressHydrationWarning
                          />
                          <label className={`form-check-label ${todo.isDone ? 'text-decoration-line-through' : ''}`} htmlFor={`todo-${todo.id}`}
                            suppressHydrationWarning
                          >
                            {todo.title}
                          </label>
                        </div>
                        <span className={`badge ${getPriorityClass(todo.priority)}`}>
                          {todo.priority}
                        </span>
                      </div>
                      <div className="text-muted mt-2">
                        <p className="mb-0"><strong>Category:</strong> {todo.category}</p>
                        <p className="mb-0"><strong>Due Date:</strong> {todo.dueDate}</p>
                      </div>
                      <div className="d-flex justify-content-end gap-2 mt-2">
                        <button onClick={() => handleEdit(todo)} className="btn btn-warning btn-sm">Edit</button>
                        <button onClick={() => handleDelete(todo.id)} className="btn btn-danger btn-sm">Delete</button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
