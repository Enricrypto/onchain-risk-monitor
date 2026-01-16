ARCHITECTURE.md

# Phase 1 Architecture — Onchain Risk Monitor

## High-Level Overview

Phase 1 implements a testnet-ready monitoring system for Aave, including:

- Blockchain data collection (polling + event listeners)
- Prometheus metrics pipeline
- Grafana dashboards
- Alerting via email and Telegram
- Logging and auditability
- Test harness for simulations and chaos testing

## Component Diagram

Blockchain Node (Aave Testnet)
|
v
Collector(s) (Poller / Event)
|
v
Prometheus
|
v
Alertmanager --> email/Telegram
|
v
Grafana
^
|
Test Harness / Simulations

## Component Responsibilities

1. **Collectors:** Deduplicate, timestamp-align, reorg rollback, push metrics.
2. **Prometheus:** Scrape metrics, monitor collector health, orchestrate recovery.
3. **Alertmanager:** Dynamic thresholds, circuit breakers, manual overrides, verification loops.
4. **Grafana:** Dashboards, anomaly indicators, end-to-end verification.
5. **Test Harness:** Simulate flashloans, liquidity changes, extreme reorgs, network chaos.
