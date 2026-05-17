export function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-border">
      <td className="px-4 py-3">
        <div className="h-5 w-20 rounded-full bg-muted" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-40 rounded bg-muted" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-28 rounded bg-muted" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-16 rounded bg-muted" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-24 rounded bg-muted" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-16 rounded bg-muted" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-14 rounded bg-muted" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-12 rounded bg-muted" />
      </td>
    </tr>
  )
}
