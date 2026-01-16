# Onchain Risk Monitor — Phase 1

**Description:**  
Testnet-ready on-chain risk monitoring system for Aave. Collects blockchain metrics, visualizes them in Grafana, and generates alerts via email and Telegram. Includes full auditability, logging, and operational documentation.

**Scope:**

- Aave testnet only
- Prometheus + Grafana dashboards
- Hybrid polling + event-driven collectors
- Alerts with dynamic thresholds, circuit breaker, backup channels
- Test harness for high-frequency events and chaos simulation

**Next Steps:**

- Deploy testnet collectors and dashboards
- Validate metrics, alerts, and logging with simulations
- Document outcomes for Phase 2 (mainnet and multi-protocol expansion)

**Folder Structure:**
phase1/
├── collectors/
├── metrics/
├── alerts/
├── dashboards/
├── test_harness/
├── logs/
├── config/
├── docs/
├── package.json / requirements.txt
├── docker-compose.yml
└── README.md
