import type { ToastContentProps } from "react-toastify";

export interface UndoDeleteToastData {
  title: string;
  onUndo: () => void;
}

export default function UndoDeleteToast({ data }: ToastContentProps<UndoDeleteToastData>) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="min-w-0 text-sm">
        <p className="font-semibold text-zinc-900">Quiz deleted</p>
        <p className="truncate text-zinc-600" title={data.title}>
          “{data.title}”
        </p>
      </div>
      <button
        type="button"
        onClick={data.onUndo}
        aria-label={`Undo deleting quiz "${data.title}"`}
        className="shrink-0 rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
      >
        Undo
      </button>
    </div>
  );
}
