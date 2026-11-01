import TaskItem from './TaskItem';

export default function TaskList({ tasks, loading, onUpdate, onDelete, onToggleComplete, onError }) {
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading tasks…
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <p>No tasks found. Create one above!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
          onError={onError}
        />
      ))}
    </div>
  );
}
