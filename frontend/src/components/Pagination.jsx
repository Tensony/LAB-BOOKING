import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, totalPages, onPageChange, totalItems, pageSize = 10 }) => {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-surface-200 dark:border-surface-800">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium text-slate-700 dark:text-slate-200">{start}–{end}</span> of{' '}
        <span className="font-medium text-slate-700 dark:text-slate-200">{totalItems}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <span className="text-sm text-slate-500 dark:text-slate-400 px-2">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
