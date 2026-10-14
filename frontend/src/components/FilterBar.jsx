import React from 'react';

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  onlyPending,
  setOnlyPending,
  sortByPending,
  setSortByPending,
  onReset,
}) {
  return (
    <div className="filter-bar">
      <div className="search-group">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          id="student-search-input"
          placeholder="Search students by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button
            className="clear-search-btn"
            onClick={() => setSearchQuery('')}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className="controls-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            id="pending-filter-checkbox"
            checked={onlyPending}
            onChange={(e) => setOnlyPending(e.target.checked)}
          />
          <span>Show Pending Only</span>
        </label>

        <div className="sort-group">
          <label htmlFor="sort-select" className="sort-label">Sort Pending:</label>
          <select
            id="sort-select"
            value={sortByPending}
            onChange={(e) => setSortByPending(e.target.value)}
            className="select-input"
          >
            <option value="none">Default Order</option>
            <option value="desc">Highest First (↓)</option>
            <option value="asc">Lowest First (↑)</option>
          </select>
        </div>

        {(searchQuery || onlyPending || sortByPending !== 'none') && (
          <button className="btn-reset" onClick={onReset}>
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
