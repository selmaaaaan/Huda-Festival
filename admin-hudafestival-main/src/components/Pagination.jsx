import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-surface)] border-t border-[var(--color-border)] sm:px-6">
            <div className="flex items-center gap-2">
                <p className="text-sm text-[var(--color-text-muted)]">
                    Page <span className="font-medium text-[var(--color-text-heading)]">{currentPage}</span> of <span className="font-medium text-[var(--color-text-heading)]">{totalPages}</span>
                </p>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium border border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-heading)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={16} className="mr-1" /> Prev
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium border border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-heading)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next <ChevronRight size={16} className="ml-1" />
                </button>
            </div>
        </div>
    );
}
