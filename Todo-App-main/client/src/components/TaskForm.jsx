import { useState } from 'react';

const CATEGORIES = ['General', 'Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Other'];

export default function TaskForm({ onTaskCreated, onError }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      onError('Task title is required.');
      return;
    }
    setLoading(true);
    try {
      await onTaskCreated({ title: title.trim(), description: description.trim(), category, dueDate: dueDate || null });
      setTitle(''); setDescription(''); setCategory('General'); setDueDate('');
      setOpen(false);
    } catch (err) {
      onError(err?.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form">
      {!open ? (
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px' }} onClick={() => setOpen(true)}>
          + New Task
        </button>
      ) : (
        <div className="card">
          <div className="card-title">Create a new task</div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                autoFocus
                maxLength={200}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details... (optional)"
                maxLength={1000}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date (optional)</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating…' : '✓ Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
