# Onchain Risk Monitor - Phase 1

Testnet-ready on-chain risk monitoring system for Aave V3 on Sepolia.

## Features

- **Collectors**: Hybrid polling + event-driven data collection
- **Metrics**: Prometheus metrics for liquidity, debt, utilization, rates, events
- **Dashboards**: Pre-configured Grafana dashboards
- **Alerts**: Email and Telegram notifications with circuit breaker
- **Audit Trail**: Hash-verified logging for full auditability
- **Test Harness**: Comprehensive simulation and chaos testing

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (for full stack)
- RPC endpoint (Alchemy or Infura recommended)

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy and configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your RPC_URL and alerting credentials
   ```

3. Run the collector:
   ```bash
   npm run dev
   ```

4. Access metrics at http://localhost:9090/metrics

### Docker Compose (Full Stack)

1. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. Start all services:
   ```bash
   docker-compose up -d
   ```

3. Access services:
   - **Grafana**: http://localhost:3000 (admin/admin)
   - **Prometheus**: http://localhost:9091
   - **Alertmanager**: http://localhost:9093
   - **Collector Metrics**: http://localhost:9090/metrics

### Run Tests

```bash
# Unit tests
npm test

# Test harness (all scenarios)
npm run test:harness

# Specific scenario
npm run test:harness metrics
npm run test:harness alerts
npm run test:harness stress
npm run test:harness chaos
```

## Configuration

### Required

| Variable | Description |
|----------|-------------|
| `RPC_URL` | Ethereum Sepolia RPC endpoint |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `TELEGRAM_BOT_TOKEN` | - | Telegram bot token for alerts |
| `TELEGRAM_CHAT_ID` | - | Telegram chat ID for alerts |
| `SMTP_HOST` | - | SMTP server for email alerts |
| `SMTP_USER` | - | SMTP username |
| `SMTP_PASSWORD` | - | SMTP password |
| `POLLING_INTERVAL_MS` | 30000 | Polling interval in milliseconds |
| `LOG_LEVEL` | info | Log level (debug, info, warn, error) |

## Architecture

```
Blockchain (Aave Sepolia)
         │
         ▼
    ┌─────────────────────┐
    │     Collectors      │
    │  (Polling + Event)  │
    └─────────────────────┘
         │
         ▼ /metrics
    ┌─────────────────────┐
    │     Prometheus      │
    └─────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────────┐
│Grafana │ │ Alertmanager │
└────────┘ └──────────────┘
                │
         ┌──────┴──────┐
         ▼             ▼
     Telegram       Email
```

## Metrics Collected

### Reserve Metrics
- `aave_total_liquidity` - Total liquidity per asset
- `aave_total_debt` - Total debt per asset
- `aave_utilization_rate` - Utilization rate percentage
- `aave_liquidity_rate` - Supply APY
- `aave_variable_borrow_rate` - Variable borrow rate
- `aave_stable_borrow_rate` - Stable borrow rate

### Event Metrics
- `aave_flashloan_total` - Flashloan count
- `aave_flashloan_volume_total` - Flashloan volume
- `aave_liquidation_total` - Liquidation count
- `aave_liquidation_volume_total` - Liquidation volume
- `aave_supply_total` - Supply event count
- `aave_borrow_total` - Borrow event count
- `aave_withdraw_total` - Withdraw event count
- `aave_repay_total` - Repay event count

### Collector Health
- `collector_health` - Health status (1=healthy, 0=unhealthy)
- `collector_last_block_processed` - Last processed block
- `collector_errors_total` - Error count

## Setting Up Alerts

### Telegram

1. Create a bot via @BotFather on Telegram
2. Get your chat ID by messaging your bot and visiting:
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Add to `.env`:
   ```
   TELEGRAM_BOT_TOKEN=your_token
   TELEGRAM_CHAT_ID=your_chat_id
   ```

### Email

1. For Gmail, create an app password
2. Add to `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   ALERT_EMAIL_TO=recipient@example.com
   ```

## License

MIT
