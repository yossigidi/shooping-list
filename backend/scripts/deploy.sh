#!/bin/bash
# ListNest Backend Deployment Script

set -e

echo "🚀 ListNest Deployment Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root for production
if [ "$EUID" -eq 0 ] && [ "$1" != "--force" ]; then
    echo -e "${YELLOW}Warning: Running as root. Use --force to override.${NC}"
fi

# Check for required tools
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required but not installed.${NC}" >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}Docker Compose is required but not installed.${NC}" >&2; exit 1; }

# Environment check
if [ ! -f .env ]; then
    echo -e "${YELLOW}No .env file found. Creating from example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}Please edit .env with your production values!${NC}"
        exit 1
    else
        echo -e "${RED}.env.example not found!${NC}"
        exit 1
    fi
fi

# Function to show help
show_help() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  start       Start all services"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  logs        Show logs (use -f to follow)"
    echo "  status      Show service status"
    echo "  build       Build/rebuild containers"
    echo "  migrate     Run database migrations"
    echo "  update      Pull latest code and restart"
    echo "  backup      Backup database"
    echo "  ssl         Setup SSL with Let's Encrypt"
    echo "  scrape      Trigger immediate price scrape"
    echo ""
}

# Parse command
case "$1" in
    start)
        echo -e "${GREEN}Starting ListNest services...${NC}"
        docker-compose up -d
        echo -e "${GREEN}Services started!${NC}"
        docker-compose ps
        ;;

    stop)
        echo -e "${YELLOW}Stopping ListNest services...${NC}"
        docker-compose down
        echo -e "${GREEN}Services stopped.${NC}"
        ;;

    restart)
        echo -e "${YELLOW}Restarting ListNest services...${NC}"
        docker-compose restart
        echo -e "${GREEN}Services restarted!${NC}"
        ;;

    logs)
        if [ "$2" == "-f" ]; then
            docker-compose logs -f
        else
            docker-compose logs --tail=100
        fi
        ;;

    status)
        echo -e "${GREEN}Service Status:${NC}"
        docker-compose ps
        echo ""
        echo -e "${GREEN}Health Check:${NC}"
        curl -s http://localhost:8000/api/v1/health | jq . 2>/dev/null || echo "API not responding"
        ;;

    build)
        echo -e "${GREEN}Building containers...${NC}"
        docker-compose build --no-cache
        echo -e "${GREEN}Build complete!${NC}"
        ;;

    migrate)
        echo -e "${GREEN}Running database migrations...${NC}"
        docker-compose exec api python -c "
from app.db.database import init_db
import asyncio
asyncio.run(init_db())
print('Migrations complete!')
"
        ;;

    update)
        echo -e "${GREEN}Updating ListNest...${NC}"
        git pull origin main
        docker-compose build
        docker-compose up -d
        echo -e "${GREEN}Update complete!${NC}"
        ;;

    backup)
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        echo -e "${GREEN}Creating database backup: ${BACKUP_FILE}${NC}"
        docker-compose exec db pg_dump -U listnest listnest > "backups/${BACKUP_FILE}"
        gzip "backups/${BACKUP_FILE}"
        echo -e "${GREEN}Backup created: backups/${BACKUP_FILE}.gz${NC}"
        ;;

    ssl)
        DOMAIN="${2:-api.listnest.co.il}"
        echo -e "${GREEN}Setting up SSL for ${DOMAIN}...${NC}"

        # Create directories
        mkdir -p nginx/ssl

        # Get certificate
        docker-compose run --rm certbot certonly --webroot \
            -w /var/www/certbot \
            -d ${DOMAIN} \
            --email admin@listnest.co.il \
            --agree-tos \
            --no-eff-email

        echo -e "${GREEN}SSL setup complete!${NC}"
        echo -e "${YELLOW}Update nginx.conf to enable HTTPS server block${NC}"
        ;;

    scrape)
        CHAIN="${2:-all}"
        echo -e "${GREEN}Triggering price scrape for: ${CHAIN}${NC}"
        docker-compose exec api python -c "
from app.tasks.price_tasks import update_all_prices, update_chain_prices
if '${CHAIN}' == 'all':
    result = update_all_prices.delay()
else:
    result = update_chain_prices.delay('${CHAIN}')
print(f'Task queued: {result.id}')
"
        ;;

    *)
        show_help
        ;;
esac
