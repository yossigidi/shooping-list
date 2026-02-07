# ListNest Price Comparison Backend

Backend API for the ListNest shopping list application that provides real-time price comparison across Israeli supermarkets using official government-mandated price data.

## Features

- **Real Supermarket Prices**: Data from 20+ Israeli chains (Shufersal, Rami Levy, Victory, etc.)
- **Government Data Source**: Uses Israeli Price Transparency Law (2015) mandated public data
- **Shopping List Comparison**: Compare entire shopping lists across all chains
- **Basket Optimization**: Find the cheapest combination of stores
- **Price History**: Track price changes over time
- **Automatic Updates**: Prices updated twice daily via scheduled tasks

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         VPS Server                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   FastAPI   │  │   Celery    │  │    PostgreSQL       │  │
│  │   REST API  │◄─┤   Workers   │◄─┤  products, prices,  │  │
│  │   /api/v1   │  │  (scrapers) │  │  chains, stores     │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────┘  │
│         │         ┌──────┴──────┐                           │
│         │         │    Redis    │                           │
│         │         │ cache/queue │                           │
│         │         └─────────────┘                           │
└─────────┼───────────────────────────────────────────────────┘
          │ HTTPS
          ▼
    ListNest Frontend
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Domain name (optional, for production)

### Development Setup

1. Clone and navigate to backend:
```bash
cd backend
```

2. Copy environment file:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Start services:
```bash
docker-compose up -d
```

4. Check status:
```bash
./scripts/deploy.sh status
```

5. Trigger initial price scrape:
```bash
./scripts/deploy.sh scrape all
```

### API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Health Check
```
GET /api/v1/health
```

### Get All Chains
```
GET /api/v1/chains
```

### Search Product Prices
```
GET /api/v1/prices/search?q=חלב
```

### Compare Shopping List
```
POST /api/v1/compare/list
Content-Type: application/json

{
  "items": [
    {"name": "חלב", "quantity": 2},
    {"name": "לחם", "quantity": 1},
    {"name": "ביצים", "quantity": 1}
  ]
}
```

### Optimize Basket
```
POST /api/v1/optimize/basket
Content-Type: application/json

{
  "items": [...],
  "max_chains": 2,
  "strategy": "optimal"  // "single", "split", or "optimal"
}
```

## Production Deployment

### VPS Requirements
- **RAM**: 4GB minimum
- **CPU**: 2 vCPU
- **Storage**: 50GB SSD
- **OS**: Ubuntu 22.04 LTS

### Recommended VPS Providers
| Provider | Cost/Month | Notes |
|----------|------------|-------|
| Hetzner | €4.50 | Recommended, EU servers |
| DigitalOcean | $6 | Easy to use |
| Vultr | $6 | Good performance |

### Initial Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Clone and deploy
git clone <repo> && cd listnest/backend
cp .env.example .env
# Edit .env with production values
./scripts/deploy.sh build
./scripts/deploy.sh start
```

### SSL Setup
```bash
./scripts/deploy.sh ssl api.listnest.co.il
# Then edit nginx/nginx.conf to enable HTTPS server block
```

## Data Sources

The scrapers collect data from the following sources:

1. **Shufersal**: http://prices.shufersal.co.il/
2. **Rami Levy**: https://url.retail.publishedprices.co.il/
3. **Victory**: Matrix API
4. **Yeinot Bitan**: Bina system
5. **And 15+ more chains...**

All data is publicly available per Israeli law.

## Maintenance

### View Logs
```bash
./scripts/deploy.sh logs -f
```

### Backup Database
```bash
./scripts/deploy.sh backup
```

### Manual Price Update
```bash
./scripts/deploy.sh scrape shufersal
./scripts/deploy.sh scrape rami_levy
# or all chains:
./scripts/deploy.sh scrape all
```

## Project Structure

```
backend/
├── app/
│   ├── api/            # FastAPI routes
│   ├── core/           # Configuration
│   ├── db/             # Database setup
│   ├── models/         # SQLAlchemy models & Pydantic schemas
│   ├── scrapers/       # Price data scrapers
│   ├── services/       # Business logic
│   └── tasks/          # Celery tasks
├── nginx/              # Nginx configuration
├── scripts/            # Deployment scripts
├── docker-compose.yml  # Docker orchestration
├── Dockerfile          # Container image
└── requirements.txt    # Python dependencies
```

## License

Price data is publicly available per Israeli law. Application code is proprietary.

## Support

For issues or questions, contact the development team.
