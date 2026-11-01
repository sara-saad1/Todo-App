const CATEGORIES = ['All', 'General', 'Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Other'];

export default function FilterBar({ filter, onFilterChange }) {
  return (
    <div className="filter-bar">
      {['all', 'active', 'completed'].map((f) => (
        <button
          key={f}
          className={`filter-chip ${filter.status === f ? 'active' : ''}`}
          onClick={() => onFilterChange({ ...filter, status: f })}
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
      <div className="filter-spacer" />
      <select
        value={filter.category}
        onChange={(e) => onFilterChange({ ...filter, category: e.target.value })}
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
        ))}
      </select>
    </div>
  );
}
