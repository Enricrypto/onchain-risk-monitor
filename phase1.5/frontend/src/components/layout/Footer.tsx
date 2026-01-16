import { ExternalLink, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-secondary/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left side - Branding */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted">
              Onchain Risk Monitor v1.5
            </span>
            <span className="hidden sm:inline text-text-muted">|</span>
            <span className="text-sm text-text-muted">
              Sepolia Testnet
            </span>
          </div>

          {/* Right side - Links */}
          <div className="flex items-center gap-6">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              <span>Grafana</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="http://localhost:9091"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              <span>Prometheus</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border-subtle">
          <StatusIndicator label="Collector" status="online" />
          <StatusIndicator label="Prometheus" status="online" />
          <StatusIndicator label="Alertmanager" status="online" />
        </div>
      </div>
    </footer>
  );
}

interface StatusIndicatorProps {
  label: string;
  status: 'online' | 'offline' | 'degraded';
}

function StatusIndicator({ label, status }: StatusIndicatorProps) {
  const statusColors = {
    online: 'bg-status-healthy',
    offline: 'bg-status-critical',
    degraded: 'bg-status-warning',
  };

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        {status === 'online' && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${statusColors[status]} opacity-75`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${statusColors[status]}`} />
      </span>
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
}
