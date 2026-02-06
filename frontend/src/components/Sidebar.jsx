export default function Sidebar({
  investments,
  selectedId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}) {
  return (
    <aside className="w-72 bg-slate-800 text-white flex flex-col">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-slate-400">
          Investments
        </h2>
        <button
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition"
        >
          + Add
        </button>
      </div>
      <ul className="flex-1 overflow-auto">
        {investments.length === 0 && (
          <li className="px-4 py-8 text-center text-slate-500 text-sm">
            No investments yet
          </li>
        )}
        {investments.map((inv) => (
          <li
            key={inv.id}
            onClick={() => onSelect(inv.id)}
            className={`px-4 py-3 cursor-pointer border-b border-slate-700 transition group ${
              selectedId === inv.id
                ? "bg-slate-700"
                : "hover:bg-slate-750 hover:bg-slate-700/50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">
                  {inv.investment_name}
                </p>
                {inv.series && (
                  <p className="text-xs text-slate-400 mt-0.5">{inv.series}</p>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition ml-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(inv);
                  }}
                  className="text-slate-400 hover:text-blue-400 text-xs p-1"
                  title="Edit"
                >
                  &#9998;
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(inv.id);
                  }}
                  className="text-slate-400 hover:text-red-400 text-xs p-1"
                  title="Delete"
                >
                  &#10005;
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
