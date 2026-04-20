import { cn } from '@/lib/utils';

const THEMES = {
  primary: { container: 'bg-indigo-500/10 border-indigo-500/20', icon: 'text-indigo-400', glow: 'rgba(99,102,241,0.15)' },
  indigo:  { container: 'bg-indigo-500/10 border-indigo-500/20', icon: 'text-indigo-400', glow: 'rgba(99,102,241,0.15)' },
  emerald: { container: 'bg-emerald-500/10 border-emerald-500/20', icon: 'text-emerald-400', glow: 'rgba(16,185,129,0.15)' },
  blue:    { container: 'bg-blue-500/10 border-blue-500/20', icon: 'text-blue-400', glow: 'rgba(59,130,246,0.15)' },
  amber:   { container: 'bg-amber-500/10 border-amber-500/20', icon: 'text-amber-400', glow: 'rgba(245, 159, 11, 0.71)' },
  rose:    { container: 'bg-rose-500/10 border-rose-500/20', icon: 'text-rose-400', glow: 'rgba(244,63,94,0.15)' },
};

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'primary', trend }) {
  const theme = THEMES[color] || THEMES.primary;

  return (
    <div className="relative overflow-hidden bg-slate-950/80 border border-slate-700/60 p-7 lg:p-8 rounded-[2rem] backdrop-blur-xl shadow-2xl transition-all duration-500 group hover:-translate-y-1 hover:border-slate-500/80 cursor-default">
      
      {/* تأثير الإضاءة في الخلفية */}
      <div 
        className="absolute -left-12 -top-12 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl pointer-events-none"
        style={{ background: theme.glow }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-8">
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 shadow-lg', 
            theme.container, 
            theme.icon
          )}>
            <Icon size={26} strokeWidth={2.5} />
          </div>

          {trend !== undefined && (
            <div className={cn(
              'flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-xl border tracking-widest',
              trend >= 0
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
            )}>
              <span className="text-[10px]">{trend >= 0 ? '▲' : '▼'}</span>
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* العنوان (تم تفتيح اللون ليكون أبيض رمادي مقروء جداً) */}
          <p className="text-xs font-bold text-slate-200 uppercase tracking-widest">
            {title}
          </p>
          
          {/* القيمة (أبيض ناصع مع ظل خفيف لزيادة الوضوح) */}
          <h4 className="text-3xl lg:text-4xl font-black text-white tracking-tighter tabular-nums leading-none drop-shadow-sm">
            {value}
          </h4>
          
          {/* الوصف (رمادي واضح) */}
          {subtitle && (
            <p className="text-[11px] font-bold text-slate-400 tracking-wide">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}