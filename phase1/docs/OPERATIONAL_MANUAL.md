# Operational Manual - Onchain Risk Monitor

## Overview

This document provides operational procedures for the Onchain Risk Monitor Phase 1 deployment.

## System Components & Endpoints

| Component    | Port | URL                          | Description                    |
|--------------|------|------------------------------|--------------------------------|
| Collector    | 9090 | http://localhost:9090        | Metrics collection from Aave   |
| Prometheus   | 9091 | http://localhost:9091        | Metrics storage and alerting   |
| Alertmanager | 9093 | http://localhost:9093        | Alert routing and delivery     |
| Grafana      | 3000 | http://localhost:3000        | Visualization dashboards       |

### Collector Endpoints

| Endpoint  | URL                           | Description              |
|-----------|-------------------------------|--------------------------|
| Metrics   | http://localhost:9090/metrics | Prometheus metrics       |
| Health    | http://localhost:9090/health  | Health check (JSON)      |
| Status    | http://localhost:9090/status  | System status (JSON)     |

### Default Credentials

| Service  | Username | Password |
|----------|----------|----------|
| Grafana  | admin    | admin    |

## Startup Procedures

### Local Development

```bash
cd phase1
npm install
cp .env.example .env
# Configure RPC_URL in .env
npm run dev
```

### Docker Compose (Production)

```bash
cd phase1
cp .env.example .env
# Configure all required variables in .env
docker-compose up -d
```

### Verify Startup

1. Check collector health: `curl http://localhost:9090/health`
2. Check metrics endpoint: `curl http://localhost:9090/metrics | head`
3. Access Grafana: http://localhost:3000

## Monitoring Procedures

### Daily Checks

1. **Grafana Dashboards**
   - Verify all panels are showing data
   - Check collector health status (green = healthy)
   - Review any triggered alerts

2. **Prometheus Targets**
   - Access http://localhost:9091/targets
   - Verify collector target is "UP"

3. **Log Review**
   - Check `phase1/logs/collector.log` for errors
   - Verify audit log integrity: `npm run test:harness` (run audit test)

### Alert Response

#### High Utilization Rate (Warning)
- **Threshold**: >90% for 5 minutes
- **Action**: Monitor closely, may indicate high demand

#### Critical Utilization Rate (Critical)
- **Threshold**: >95% for 2 minutes
- **Action**: Immediate investigation required

#### Collector Unhealthy (Critical)
- **Threshold**: Health = 0 for 2 minutes
- **Action**:
  1. Check RPC endpoint connectivity
  2. Restart collector: `docker-compose restart collector`
  3. Review logs for errors

#### Flashloan/Liquidation Spike (Warning)
- **Action**: Review transactions on block explorer

## Troubleshooting

### Collector Not Starting

1. Check RPC URL is valid and accessible
2. Verify environment variables are set
3. Check logs: `docker-compose logs collector`

### No Metrics in Grafana

1. Verify Prometheus target is UP
2. Check collector metrics endpoint directly
3. Verify Grafana datasource configuration

### Alerts Not Sending

1. Check Telegram bot token and chat ID
2. Verify SMTP credentials for email
3. Check Alertmanager logs: `docker-compose logs alertmanager`

### Memory Issues

1. Monitor with `docker stats`
2. Consider reducing `POLLING_INTERVAL_MS`
3. Restart containers if needed

## Maintenance Procedures

### Log Rotation

Logs are automatically rotated (10MB max, 5 files). To manually archive:

```bash
cd phase1/logs
tar -czvf logs-$(date +%Y%m%d).tar.gz *.log
rm *.log
```

### Database Cleanup

Prometheus retains 15 days by default. To adjust:

Edit `docker-compose.yml`:
```yaml
command:
  - '--storage.tsdb.retention.time=30d'
```

### Updating Dashboards

1. Modify JSON files in `phase1/dashboards/`
2. Grafana auto-reloads every 30 seconds

### Updating Alert Rules

1. Edit `phase1/config/alert_rules.yml`
2. Reload Prometheus: `curl -X POST http://localhost:9091/-/reload`

## Disaster Recovery

### Backup Procedures

```bash
# Backup Prometheus data
docker run --rm -v phase1_prometheus_data:/data -v $(pwd):/backup alpine tar czvf /backup/prometheus-backup.tar.gz /data

# Backup Grafana data
docker run --rm -v phase1_grafana_data:/data -v $(pwd):/backup alpine tar czvf /backup/grafana-backup.tar.gz /data

# Backup audit logs
cp phase1/logs/*.audit.jsonl ./audit-backup/
```

### Restore Procedures

```bash
# Stop services
docker-compose down

# Restore data
docker run --rm -v phase1_prometheus_data:/data -v $(pwd):/backup alpine tar xzvf /backup/prometheus-backup.tar.gz -C /

# Restart services
docker-compose up -d
```

## Security Considerations

1. Never commit `.env` files with real credentials
2. Use environment variables for all secrets
3. Restrict access to Grafana with strong passwords
4. Monitor for unauthorized access attempts
5. Regularly rotate API keys and credentials

## Contact Information

For issues or questions, refer to:
- GitHub Issues: https://github.com/your-repo/onchain-risk-monitor/issues
- Documentation: This manual and README.md
