PROJECT_PLAN.md

# Phase 1 Project Plan — Onchain Risk Monitor

## Goals

- Collect metrics from Aave testnet reliably
- Visualize key metrics and anomalies in Grafana
- Send alerts for unusual activity via email/Telegram
- Validate the system using a test harness and chaos simulations

## Success Criteria

1. Metrics collection ≥95% coverage, reconciled and deduplicated
2. Grafana dashboards accurately reflect state
3. Alerts verified against actual events
4. Structured logging and hash-verified audit trails
5. Test harness successfully simulates extreme conditions

## Residual Issues (Deferred to Phase 2)

- Extreme reorg ordering edge cases
- Correlated multi-source outages
- Unknown anomalies / novel exploits
- Rare network failures affecting collectors
- Alert misestimation
- Logging / audit pipeline bugs
- RPC/API latency spikes
- Phase 2 gating skew
