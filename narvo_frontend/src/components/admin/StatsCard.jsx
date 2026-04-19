import { cn } from '@/lib/utils';

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'primary', trend }) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white border border-border rounded-2xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colorMap[color])}>
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </div>
        {trend !== undefined && (
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          )}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground font-mono tracking-tight mb-1">{value}</p>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}
