import React from 'react';
import { cn } from '@/utils/cn';

export interface Column<T> {
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T, index: number) => string | number;
  onRowClick?: (row: T, index: number) => void;
  emptyMessage?: string;
  className?: string;
  tableClassName?: string;
  striped?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No records found.',
  className,
  tableClassName,
  striped = false,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        'w-full min-w-0 overflow-x-auto rounded-md border border-[#212c3d] bg-[#131922]',
        className
      )}
    >
      <table className={cn('w-full border-collapse text-left text-[12px]', tableClassName)}>
        <thead>
          <tr className="border-b border-[#212c3d] bg-[#0e141c] text-[10px] font-mono font-semibold text-[#64748b] uppercase tracking-wider select-none">
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{ width: col.width }}
                className={cn(
                  'h-8 px-3 py-1.5 text-left font-mono font-medium',
                  col.headerClassName
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#212c3d]/60 text-[#f1f5f9]">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-20 px-4 text-center text-[12px] text-[#64748b] font-mono"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={keyExtractor ? keyExtractor(row, rowIdx) : rowIdx}
                onClick={() => onRowClick && onRowClick(row, rowIdx)}
                className={cn(
                  'h-9 transition-colors',
                  striped && rowIdx % 2 === 1 && 'bg-[#10151e]',
                  onRowClick
                    ? 'cursor-pointer hover:bg-[#161f2c]'
                    : 'hover:bg-[#161f2c]'
                )}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={cn(
                      'px-3 py-1.5 text-[12px] align-middle',
                      col.className
                    )}
                  >
                    {col.cell
                      ? col.cell(row, rowIdx)
                      : col.accessorKey
                      ? String(row[col.accessorKey] ?? '')
                      : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
