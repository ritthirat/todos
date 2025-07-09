"use client";
import { useState, useEffect } from "react";

type Todo = {
  id: string;
  name: string;
  description: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const API_URL = "https://686c8f9614219674dcc85323.mockapi.io/api/v1/todos";

// API functions
async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch todos');
  }
  return response.json();
}

async function addTodo(description: string): Promise<Todo> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, status: false })
  });
  if (!response.ok) {
    throw new Error('Failed to add todo');
  }
  return response.json();
}

async function updateTodo(id: string, data: Partial<Todo>): Promise<Todo> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error('Failed to update todo');
  }
  return response.json();
}

async function deleteTodo(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete todo');
  }
}

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTodos();
        setTodos(data);
        setError(null);
      } catch (err) {
        setError('Failed to load todos. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim() === "") return;

    try {
      setIsLoading(true);
      const addedTodo = await addTodo(newTodo);
      setTodos([...todos, addedTodo]);
      setNewTodo("");
      setError(null);
      toast.success("เพิ่มรายการสำเร็จ", {
        style: { backgroundColor: "#dcfce7", color: "#166534", borderColor: "#86efac" },
        className: "border-l-4 font-medium",
        duration: 3000,
        icon: "➕"
      });
    } catch (err) {
      setError('Failed to add todo. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const todoToUpdate = todos.find(todo => todo.id === id);
      if (!todoToUpdate) return;

      setIsLoading(true);
      const updatedTodo = await updateTodo(id, { status: !todoToUpdate.status });
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
      setError(null);
      
      const statusText = updatedTodo.status ? "ทำเสร็จแล้ว" : "ยังไม่ทำ";
      toast.success(`เปลี่ยนสถานะเป็น ${statusText}`, {
        style: { backgroundColor: "#dcfce7", color: "#166534", borderColor: "#86efac" },
        className: "border-l-4 font-medium",
        duration: 3000,
        icon: updatedTodo.status ? "✅" : "⏳"
      });
    } catch (err) {
      setError('Failed to update todo. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingTodoId(id);
    setDialogOpen(true);
  };

  const cancelDelete = () => {
    setDeletingTodoId(null);
    setDialogOpen(false);
  };

  const removeTodo = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
      setError(null);
      toast.success("ลบรายการสำเร็จ", {
        style: { backgroundColor: "#dcfce7", color: "#166534", borderColor: "#86efac" },
        className: "border-l-4 font-medium",
        duration: 3000,
        icon: "❌"
      });
    } catch (err) {
      setError('Failed to delete todo. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setDeletingTodoId(null);
      setDialogOpen(false);
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditText(todo.description);
  };

  const cancelEditing = () => {
    setEditingTodoId(null);
    setEditText('');
  };

  const saveEdit = async (id: string) => {
    if (editText.trim() === '') return;
    
    try {
      setIsLoading(true);
      const updatedTodo = await updateTodo(id, { description: editText.trim() });
      if (updatedTodo) {
        toast.success("แก้ไขสำเร็จ", {
          style: { backgroundColor: "#dcfce7", color: "#166534", borderColor: "#86efac" },
          className: "border-l-4 font-medium",
          duration: 3000,
          icon: "✅"
        })
      }
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
      setEditingTodoId(null);
      setEditText('');
      setError(null);
    } catch (err) {
      setError('Failed to update todo. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  console.log(todos);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Todo List</h1>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ </AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?
   
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} disabled={isLoading}>
              ยกเลิก 
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingTodoId && removeTodo(deletingTodoId)} 
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground text-white hover:bg-destructive/90"
            >
              ยืนยัน 
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {error && (
        <div className="w-full p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex w-full gap-2 mb-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a new todo..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add'}
          </button>
        </form>

        {isLoading && todos.length === 0 ? (
          <div className="w-full p-4 text-center text-gray-500">
            Loading todos...
          </div>
        ) : (
          <ul className="w-full space-y-2">
            {todos.length === 0 ? (
              <div className="text-center p-4 text-gray-500">No todos yet. Add one above!</div>
            ) : (
              todos.map(todo => (
                <li
                  key={todo.id}
                  className="flex flex-wrap items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                >
                  {editingTodoId === todo.id ? (
                    <div className="flex items-center w-full mb-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                        autoFocus
                      />
                      <div className="flex ml-2">
                        <button
                          onClick={() => saveEdit(todo.id)}
                          className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 mr-1 text-sm"
                          disabled={isLoading || editText.trim() === ''}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-2 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="">
                        {todo.description}
                      </span>
                      <button
                        onClick={() => startEditing(todo)}
                        className="ml-2 text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                        disabled={isLoading || editingTodoId !== null}
                        aria-label="Edit todo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15.9a2 2 0 01-.586.586l-4.5 1.5a.5.5 0 01-.618-.618l1.5-4.5a2 2 0 01.586-.586l9.9-9.9z" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <div className="flex items-center">
                    <button 
                      onClick={() => toggleTodo(todo.id)} 
                      className={`ml-2 px-3 py-1 rounded-md ${todo.status ? 'bg-green-100 text-green-700 cursor-pointer' : 'bg-red-100 text-red-700 cursor-pointer'}`}
                      disabled={isLoading || editingTodoId === todo.id}
                    >
                      {todo.status === true ? "Done" : "Not Done"}
                    </button>
                    <button
                      onClick={() => confirmDelete(todo.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 ml-2"
                      disabled={isLoading || editingTodoId === todo.id || deletingTodoId !== null}
                      aria-label="Delete todo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
    </div>
  );
}
