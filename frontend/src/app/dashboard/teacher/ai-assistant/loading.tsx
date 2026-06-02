export default function AiAssistantLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] min-h-[560px] max-h-[900px] -mt-1 animate-pulse">
      {/* Header Info area */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0">
        <div className="w-48 h-4 bg-slate-800/60 rounded-lg" />
        <div className="flex gap-2">
          <div className="w-20 h-5 bg-slate-800/60 rounded-full" />
          <div className="w-28 h-5 bg-slate-800/60 rounded-full" />
        </div>
      </div>

      {/* Main chat window skeleton */}
      <div className="flex flex-1 min-h-0 rounded-2xl border border-slate-800/50 bg-slate-950/20 overflow-hidden shadow-2xl">
        <div className="flex flex-1 min-h-0 flex-col">
          {/* Top Bar inside panel */}
          <header className="h-12 shrink-0 border-b border-white/5 px-4 sm:px-5 flex items-center justify-between bg-slate-900/20">
            <div className="w-16 h-4 bg-slate-800/60 rounded-lg" />
            <div className="w-20 h-7 bg-slate-800/60 rounded-lg" />
          </header>

          {/* Chat history list placeholder */}
          <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
            {/* User message skeleton */}
            <div className="flex justify-end">
              <div className="w-2/3 max-w-md space-y-2">
                <div className="h-3 bg-slate-800/40 rounded-lg ml-auto w-3/4" />
                <div className="h-3 bg-slate-800/40 rounded-lg ml-auto w-1/2" />
              </div>
            </div>

            {/* AI message skeleton */}
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-xl bg-slate-800/60 shrink-0" />
              <div className="w-2/3 max-w-lg space-y-2">
                <div className="h-3 bg-slate-800/50 rounded-lg w-full" />
                <div className="h-3 bg-slate-800/50 rounded-lg w-5/6" />
                <div className="h-3 bg-slate-800/50 rounded-lg w-4/5" />
              </div>
            </div>

            {/* User message skeleton */}
            <div className="flex justify-end">
              <div className="w-1/2 max-w-md space-y-2">
                <div className="h-3 bg-slate-800/40 rounded-lg ml-auto w-5/6" />
              </div>
            </div>

            {/* AI message skeleton */}
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-xl bg-slate-800/60 shrink-0" />
              <div className="w-3/4 max-w-lg space-y-2">
                <div className="h-3 bg-slate-800/50 rounded-lg w-full" />
                <div className="h-3 bg-slate-800/50 rounded-lg w-11/12" />
              </div>
            </div>
          </div>

          {/* Bottom input area skeleton */}
          <div className="shrink-0 p-4 border-t border-white/5 bg-slate-950/40">
            <div className="max-w-3xl mx-auto h-12 bg-slate-900/50 border border-slate-800/60 rounded-xl flex items-center justify-between px-4">
              <div className="w-1/3 h-4 bg-slate-800/40 rounded-lg" />
              <div className="w-8 h-8 bg-slate-800/80 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
