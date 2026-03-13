export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-400 text-sm font-bold text-white shadow-lg shadow-sky-500/30">
        CB
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-sky-700">ClinAI Bridge</p>
        <p className="text-sm text-slate-500">Clinic support, not a replacement for care</p>
      </div>
    </div>
  );
}
