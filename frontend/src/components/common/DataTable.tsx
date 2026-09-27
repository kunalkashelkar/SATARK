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
        'w-full min-w-0 overflow-x-auto rounded-lg border border-[#262a31] bg-[#181c22]',
        className
      )}
    >
      <table className={cn('w-full border-collapse text-left text-[12px] md:text-[13px]', tableClassName)}>
        <thead>
          <tr className="border-b border-[#262a31] bg-[#1c2026] text-[12px] font-semibold text-[#8c90a0] uppercase tracking-wider select-none">
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{ width: col.width }}
                className={cn(
                  'h-10 px-3 py-2 text-left font-mono font-medium',
                  col.headerClassName
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#262a31]/60 text-[#dfe2eb]">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-24 px-4 text-center text-[13px] text-[#8c90a0]"
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
                  'h-11 transition-colors',
                  striped && rowIdx % 2 === 1 && 'bg-[#15191f]',
                  onRowClick
                    ? 'cursor-pointer hover:bg-[#262a31]/60'
                    : 'hover:bg-[#1f232a]'
                )}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={cn(
                      'px-3 py-2 text-[12px] md:text-[13px] align-middle',
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
