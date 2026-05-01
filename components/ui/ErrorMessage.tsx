interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
    >
      <div className="text-4xl">😵</div>
      <p className="text-red-700 font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-full bg-red-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-red-600 active:scale-95"
        >
          Try again
        </button>
      )}
    </div>
  );
}
