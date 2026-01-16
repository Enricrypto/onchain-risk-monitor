RESIDUAL_RISKS.md

# Phase 1 Residual Risks — Onchain Risk Monitor

| Risk                              | Severity   | Mitigation (Phase 2)                                       |
| --------------------------------- | ---------- | ---------------------------------------------------------- |
| Extreme reorg ordering edge cases | Low        | Deterministic event sequencing / timestamp reconciliation  |
| Correlated multi-source outages   | Low-Medium | Multi-cloud / geographically redundant nodes               |
| Unknown anomalies                 | Medium     | Adaptive detection, anomaly feedback, independent auditing |
| Alert misestimation               | Low        | Manual overrides, periodic threshold recalibration         |
| Large-scale network failures      | Low        | Redundant collector deployment, WAN simulations            |
| Logging/audit pipeline bugs       | Very low   | External audits, automated test suites                     |
| RPC/API latency spikes            | Low        | Longer stress tests, additional redundancy                 |
| Phase 2 gating skew               | Low        | Outlier detection and recalibration                        |
