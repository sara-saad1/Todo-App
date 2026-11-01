import { useState, useEffect, useCallback } from 'react';
import TaskForm  from './components/TaskForm';
import TaskList  from './components/TaskList';
import FilterBar from './components/FilterBar';
import * as api  from './api/tasks';

// Keeping toast state in its own hook so App stays readable.
// The auto-dismiss timeout is 3.5s — long enough to read, short enough
// to not clutter the screen if multiple actions happen quickly.
let toastId = 0;
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'error') => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  return { toasts, addToast };
}

export default function App() {
  const [tasks,  setTasks]  = useState([]);
  const [stats,  setStats]  = useState({ total: 0, completed: 0, active: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState({ status: 'all', category: 'All' });
  const { toasts, addToast }  = useToasts();

  // Fetches the live stats summary from the dedicated /stats endpoint.
  // Keeping it separate from fetchTasks means the header numbers stay
  // accurate even when the task list is filtered.
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.getStats();
      setStats(res.data.data);
    } catch {
      // stats failing silently is fine — it's supplementary info
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.status === 'active')    params.completed = false;
      if (filter.status === 'completed') params.completed = true;
      if (filter.category !== 'All')     params.category  = filter.category;

      const res = await api.getTasks(params);
      setTasks(res.data.data);
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filter, addToast]);

  useEffect(() => { fetchTasks(); fetchStats(); }, [fetchTasks, fetchStats]);

  // After any mutation (create/update/delete/toggle) we refresh stats so
  // the header counters always reflect the real DB state.
  const handleCreate = async (data) => {
    const res = await api.createTask(data);
    setTasks((prev) => [res.data.data, ...prev]);
    addToast('Task created!', 'success');
    fetchStats();
  };

  const handleUpdate = async (id, data) => {
    const res = await api.updateTask(id, data);
    setTasks((prev) => prev.map((t) => (t._id === id ? res.data.data : t)));
    addToast('Task updated!', 'success');
    fetchStats();
  };

  const handleToggleComplete = async (id, isCompleted) => {
    const res = isCompleted
      ? await api.uncompleteTask(id)
      : await api.completeTask(id);
    setTasks((prev) => prev.map((t) => (t._id === id ? res.data.data : t)));
    addToast(isCompleted ? 'Task marked incomplete' : 'Task completed! ✓', 'success');
    fetchStats();
  };

  const handleDelete = async (id) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
    addToast('Task deleted', 'success');
    fetchStats();
  };

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1>TaskFlow</h1>
        <p>Stay organized, stay ahead.</p>
        <div className="header-stats">
          <div className="stat-pill"><span>{stats.total}</span> total</div>
          <div className="stat-pill"><span>{stats.active}</span> active</div>
          <div className="stat-pill"><span>{stats.completed}</span> done</div>
          {/* Only show overdue pill when there are actually overdue tasks */}
          {stats.overdue > 0 && (
            <div className="stat-pill" style={{ borderColor: 'rgba(239,68,68,0.35)', color: '#ef4444' }}>
              <span style={{ color: '#ef4444' }}>{stats.overdue}</span> overdue
            </div>
          )}
        </div>
      </header>

      <TaskForm onTaskCreated={handleCreate} onError={(msg) => addToast(msg)} />

      <FilterBar filter={filter} onFilterChange={setFilter} />

      {!loading && (
        <div className="task-list-header">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </div>
      )}

      <TaskList
        tasks={tasks}
        loading={loading}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onToggleComplete={handleToggleComplete}
        onError={(msg) => addToast(msg)}
      />

      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' ? '✓' : '✕'} {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
