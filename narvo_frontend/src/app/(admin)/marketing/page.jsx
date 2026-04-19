'use client';

import { useState } from 'react';
import { Send, Loader2, Mail, CheckCircle2, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { adminApi } from '@/lib/axios';

const broadcastSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  html: z.string().min(10, 'Email body too short').max(100000),
});

const EMAIL_TEMPLATES = [
  {
    name: 'New Arrivals',
    subject: '🆕 New Products Just Arrived!',
    html: `<div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f8f6;">
  <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e8e4dc;">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 56px; height: 56px; background: #f97316; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
        <span style="color: white; font-size: 24px;">🛍️</span>
      </div>
      <h1 style="font-size: 28px; color: #1a1007; margin: 0 0 8px;">New Arrivals!</h1>
      <p style="color: #9a8774; font-size: 14px; margin: 0;">Fresh products just landed in our store</p>
    </div>
    <p style="color: #4a3728; font-size: 15px; line-height: 1.6;">We have exciting new products waiting for you. Don't miss out on our latest collection!</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="http://localhost:3000" style="background: #f97316; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">Shop Now →</a>
    </div>
    <p style="color: #9a8774; font-size: 12px; text-align: center; margin-top: 24px; border-top: 1px solid #e8e4dc; padding-top: 16px;">
      You're receiving this because you have an account with us.
    </p>
  </div>
</div>`,
  },
  {
    name: 'Flash Sale',
    subject: '⚡ Flash Sale — Up to 50% Off!',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff7f0;">
  <div style="background: white; border-radius: 16px; overflow: hidden; border: 1px solid #fed7aa;">
    <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px; text-align: center;">
      <h1 style="color: white; font-size: 36px; margin: 0 0 8px;">⚡ FLASH SALE</h1>
      <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0;">Up to 50% off selected products</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #4a3728; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 24px;">
        Hurry! This sale won't last long. Grab your favourites before they're gone.
      </p>
      <div style="text-align: center;">
        <a href="http://localhost:3000" style="background: #f97316; color: white; padding: 16px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">Claim Your Discount</a>
      </div>
    </div>
  </div>
</div>`,
  },
];

export default function MarketingPage() {
  const [sent, setSent] = useState(false);
  const [result, setResult] = useState(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(broadcastSchema),
    defaultValues: { subject: '', html: '' },
  });

  const htmlValue = watch('html');

  const onSubmit = async (data) => {
    try {
      const res = await adminApi.post('/admin/marketing/broadcast', data);
      setResult(res.data.data);
      setSent(true);
      toast.success('Broadcast queued!', { description: res.data.message });
    } catch (err) {
      toast.error('Broadcast failed', { description: err.message });
    }
  };

  const applyTemplate = (template) => {
    setValue('subject', template.subject);
    setValue('html', template.html);
    setSent(false);
    toast.success(`Template "${template.name}" loaded`);
  };

  if (sent && result) {
    return (
      <div className="max-w-lg mx-auto animate-slide-up">
        <div className="bg-white border border-border rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-3xl text-foreground mb-2">Broadcast Queued!</h2>
          <p className="text-muted-foreground mb-6">Emails are being sent in the background in batches of 50.</p>

          <div className="bg-secondary/40 rounded-xl p-4 text-left space-y-2.5 mb-6">
            {[
              ['Subject', result.subject],
              ['Recipients', `${result.totalRecipients} users`],
              ['Queued at', new Date(result.queuedAt).toLocaleString()],
              ['Queued by', result.queuedBy],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted-foreground font-mono text-xs uppercase">{label}</span>
                <span className="font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setSent(false); setResult(null); reset(); }}
            className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            <Mail className="w-4 h-4" /> Send Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl text-foreground">Email Marketing</h1>
        <p className="text-sm text-muted-foreground mt-1">Send promotional emails to all active users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-border rounded-2xl p-6 space-y-5">
            {/* Subject */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
                Email Subject <span className="text-destructive">*</span>
              </label>
              <input
                {...register('subject')}
                placeholder="e.g. 🎉 Special offer just for you!"
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.subject ? 'border-destructive' : 'border-border focus:ring-primary/30 focus:border-primary'
                }`}
              />
              {errors.subject && <p className="text-xs text-destructive mt-1">⚠ {errors.subject.message}</p>}
            </div>

            {/* HTML Body */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
                Email Body (HTML) <span className="text-destructive">*</span>
              </label>
              <textarea
                {...register('html')}
                rows={14}
                placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
                className={`w-full px-4 py-3 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 transition-all resize-y ${
                  errors.html ? 'border-destructive' : 'border-border focus:ring-primary/30 focus:border-primary'
                }`}
              />
              {errors.html && <p className="text-xs text-destructive mt-1">⚠ {errors.html.message}</p>}
              <p className="text-xs text-muted-foreground mt-1.5">
                {htmlValue?.length || 0} / 100,000 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
              ) : (
                <><Send className="w-4 h-4" /> Send Broadcast</>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar: Templates + Preview */}
        <div className="space-y-4">
          {/* Templates */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Quick Templates</p>
            <div className="space-y-2">
              {EMAIL_TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => applyTemplate(t)}
                  className="w-full text-left px-3 py-2.5 border border-border rounded-xl text-sm hover:border-primary/40 hover:bg-secondary/40 transition-all group"
                >
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.subject}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Info card */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Background Processing</p>
                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                  Emails are sent in batches of 50 with 2-second delays to prevent SMTP blocking. The API responds immediately — delivery continues in the background.
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          {htmlValue && (
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Live Preview</p>
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Approximate</span>
              </div>
              <div
                className="p-4 max-h-64 overflow-y-auto text-xs"
                dangerouslySetInnerHTML={{ __html: htmlValue }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
