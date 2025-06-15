
import React from "react";

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  perPage: number;
  setPage: (n: number) => void;
  setPerPage: (n: number) => void;
  perPageOptions?: number[];
}

export const SimplePagination: React.FC<SimplePaginationProps> = ({
  currentPage,
  totalPages,
  perPage,
  setPage,
  setPerPage,
  perPageOptions = [10, 50, 200],
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 justify-between p-2 text-xs">
      <div>
        <label className="mr-2 font-medium">Par page</label>
        <select
          className="border rounded px-1 py-0.5"
          value={perPage}
          onChange={e => setPerPage(Number(e.target.value))}
        >
          {perPageOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button
          className="border px-2 py-1 rounded disabled:opacity-50"
          onClick={() => setPage(1)}
          disabled={currentPage === 1}
        >&lt;&lt;</button>
        <button
          className="border px-2 py-1 rounded disabled:opacity-50"
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage === 1}
        >&lt;</button>
        <span>
          Page{" "}
          <input
            type="number"
            className="w-12 border rounded px-1"
            value={currentPage}
            min={1}
            max={totalPages}
            onChange={e =>
              setPage(Math.max(1, Math.min(totalPages, Number(e.target.value))))
            }
          />{" "}
          / {totalPages}
        </span>
        <button
          className="border px-2 py-1 rounded disabled:opacity-50"
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >&gt;</button>
        <button
          className="border px-2 py-1 rounded disabled:opacity-50"
          onClick={() => setPage(totalPages)}
          disabled={currentPage === totalPages}
        >&gt;&gt;</button>
      </div>
    </div>
  );
};

export default SimplePagination;
