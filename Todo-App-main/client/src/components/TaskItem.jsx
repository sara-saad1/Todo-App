import { useState } from 'react';

const CATEGORIES = ['General', 'Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Other'];

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0));
}

function toInputDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
}

export default function TaskItem({ task, onUpdate, onDelete, onToggleComplete, onError }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');
  const [editCategory, setEditCategory] = useState(task.category || 'General');
  const [editDueDate, setEditDueDate] = useState(toInputDate(task.dueDate));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editTitle.trim()) { onError('Task title cannot be empty.'); return; }
    setSaving(true);
    try {
      await onUpdate(task._id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        category: editCategory,
        dueDate: editDueDate || null,
      });
      setEditing(false);
    } catch (err) {
      onError(err?.response?.data?.message || 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditCategory(task.category || 'General');
    setEditDueDate(toInputDate(task.dueDate));
    setEditing(false);
  };

  const handleToggle = async () => {
    try {
      await onToggleComplete(task._id, task.completed);
    } catch (err) {
      onError(err?.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await onDelete(task._id);
    } catch (err) {
      onError(err?.response?.data?.message || 'Failed to delete task');
    }
  };

  const overdue = !task.completed && isOverdue(task.dueDate);

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''} ${editing ? 'editing' : ''}`}>
      {/* Checkbox */}
      <button
        className={`task-checkbox ${task.completed ? 'checked' : ''}`}
        onClick={handleToggle}
        title={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed && <span className="check-icon">✓</span>}
      </button>

      {/* Content */}
      <div className="task-content">
        {!editing ? (
          <>
            <div className={`task-title ${task.completed ? 'done' : ''}`}>{task.title}</div>
            {task.description && <div className="task-desc">{task.description}</div>}
            <div className="task-meta">
              <span className="badge badge-category">{task.category || 'General'}</span>
              {task.dueDate && (
                <span className={`badge badge-due ${overdue ? 'overdue' : ''}`}>
                  {overdue ? '⚠ ' : '📅 '}{formatDate(task.dueDate)}
                </span>
              )}
              {task.completed && <span className="badge badge-done">Completed</span>}
            </div>
          </>
        ) : (
          <div className="inline-edit">
            <div>
              <label style={{ fontSize: '0.73rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Title *</label>
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} autoFocus maxLength={200} />
            </div>
            <div>
              <label style={{ fontSize: '0.73rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
              <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} maxLength={1000} style={{ minHeight: 60 }} />
            </div>
            <div className="inline-edit-row">
              <div>
                <label style={{ fontSize: '0.73rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</label>
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.73rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Due Date</label>
                <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={handleCancel} style={{ padding: '7px 14px', fontSize: '0.83rem' }}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '7px 14px', fontSize: '0.83rem' }}>
                {saving ? 'Saving…' : '✓ Save'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="task-actions">
        {!editing && (
          <button className="btn-ghost warn" onClick={() => setEditing(true)} title="Edit task">✎</button>
        )}
        <button className="btn-ghost danger" onClick={handleDelete} title="Delete task">✕</button>
      </div>
    </div>
  );
}
