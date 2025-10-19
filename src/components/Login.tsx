import { useState } from 'react';
import { ShieldAlert, User, Lock } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Login = () => {
  const login = useStore((state) => state.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const result = login(username, password);
    if (!result.success) {
      setError(result.error ?? 'Anmeldung fehlgeschlagen');
      setIsSubmitting(false);
      return;
    }
    setError(null);
    setUsername('');
    setPassword('');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-6 rounded-3xl border border-dark-border/70 bg-dark-surface/95 px-8 py-10 shadow-[0_28px_70px_-40px_rgba(15,23,42,0.9)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-900/30 text-primary-200">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-primary-100 tracking-wide">QAI Login</h1>
            <p className="mt-2 text-sm text-dark-muted leading-relaxed">
              Bitte melden Sie sich mit Ihrem Namen an. Für die nächste Iteration stehen die
              Benutzer <strong>Thomas</strong>, <strong>Sabine</strong> und <strong>Claudia</strong>
              zur Verfügung. Das Passwort lautet jeweils <code className="text-primary-200">demo</code>.
            </p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm text-dark-muted">
            <span className="font-semibold uppercase tracking-[0.3em] text-xs text-dark-muted/80">
              Benutzername
            </span>
            <div className="flex items-center gap-2 rounded-2xl border border-dark-border/70 bg-dark-bg/60 px-3 py-3 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/40 transition-all">
              <User className="h-4 w-4 text-dark-muted" />
              <input
                className="flex-1 bg-transparent text-dark-text outline-none text-sm"
                placeholder="Thomas"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
          </label>

          <label className="flex flex-col gap-2 text-sm text-dark-muted">
            <span className="font-semibold uppercase tracking-[0.3em] text-xs text-dark-muted/80">
              Passwort
            </span>
            <div className="flex items-center gap-2 rounded-2xl border border-dark-border/70 bg-dark-bg/60 px-3 py-3 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/40 transition-all">
              <Lock className="h-4 w-4 text-dark-muted" />
              <input
                className="flex-1 bg-transparent text-dark-text outline-none text-sm"
                placeholder="demo"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>
          </label>

          {error && (
            <div className="rounded-2xl border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-2xl bg-primary-600 hover:bg-primary-500 transition-colors text-sm font-semibold tracking-wide uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Prüfen…' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  );
};


