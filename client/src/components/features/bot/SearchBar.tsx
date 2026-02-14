'use client';

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: 'all' | 'active' | 'offline';
  onStatusChange: (v: 'all' | 'active' | 'offline') => void;
};

export default function SearchBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: Props) {
  return (
    <div className="p-3 flex gap-2 bg-[#2c2c2c] border-b">
      {/* Search input */}
      <input
        type="text"
        placeholder="Search bot name or ID..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 px-3 py-2 rounded bg-[#1e1e1e] text-white outline-none"
      />

      {/* Filter */}
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as any)}
        className="px-3 py-2 rounded bg-[#1e1e1e] text-white"
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="offline">Offline</option>
      </select>
    </div>
  );
}