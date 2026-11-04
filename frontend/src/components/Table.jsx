import React from 'react'
import LoadingSpinner from './LoadingSpinner'

export default function Table({ columns, data, loading, emptyText = 'No records found', onRow }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="table-th" style={col.width ? { width: col.width } : {}}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length}>
                <LoadingSpinner size="sm" text="Loading..." />
              </td>
            </tr>
          ) : !data?.length ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-sm text-slate-400">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row._id || row.id || i}
                className={`table-row${onRow ? ' cursor-pointer' : ''}`}
                onClick={() => onRow?.(row)}
              >
                {columns.map(col => (
                  <td key={col.key} className="table-td">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
