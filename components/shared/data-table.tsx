import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type PaginationMeta = {
  total: number;
  limit: number;
  offset: number;
};

export function DataTable({
  headers,
  children,
  className,
  pagination,
  onPageChange,
}: {
  headers: string[];
  children: React.ReactNode;
  className?: string;
  pagination?: PaginationMeta;
  onPageChange?: (offset: number) => void;
}) {
  const total = pagination?.total ?? 0;
  const limit = pagination?.limit ?? 0;
  const offset = pagination?.offset ?? 0;
  const currentPage = limit > 0 ? Math.floor(offset / limit) + 1 : 1;
  const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;
  const from = total > 0 ? offset + 1 : 0;
  const to = limit > 0 ? Math.min(offset + limit, total) : total;
  const previousOffset = Math.max(0, offset - limit);
  const nextOffset = offset + limit;

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/70 text-left text-xs uppercase text-muted-foreground">
            <tr>{headers.map((header) => <th key={header} className="px-4 py-3 font-medium">{header}</th>)}</tr>
          </thead>
          <tbody className="divide-y">{children}</tbody>
        </table>
      </div>
      {pagination ? (
        <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            Showing {from}-{to} of {total}
          </div>
          <div className="flex items-center gap-3">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!onPageChange || offset <= 0}
                onClick={() => onPageChange?.(previousOffset)}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!onPageChange || nextOffset >= total}
                onClick={() => onPageChange?.(nextOffset)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
