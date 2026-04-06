# Docker Deployment Guide

## Quick Start

### Production Deployment (Recommended)

```bash
# Build and run with all services
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

### Development Mode

```bash
# Run with local Redis (instead of Upstash)
docker-compose --profile local-dev up -d

# Run with admin UI for SQLite management
docker-compose --profile with-admin up -d

# Run everything including LangGraph server
docker-compose --profile with-langgraph --profile with-admin up -d
```

## Services

### Main Application (`app`)
- **Port**: 3000
- **Health Check**: `/health` endpoint
- **Database**: SQLite stored in Docker volume (`sqlite-data`)
- **Persistence**: Database persists across container restarts

### Optional Services

#### LangGraph Server
- **Profile**: `with-langgraph`
- **Port**: 8000
- **Usage**: Local LangGraph execution (optional, can use external service)

#### Redis (Local Development Only)
- **Profile**: `local-dev`
- **Port**: 6379
- **Note**: Use Upstash Redis in production

#### SQLite Admin UI
- **Profile**: `with-admin`
- **Port**: 8978
- **Login**: admin / admin
- **Usage**: Web-based SQLite database management

## Environment Variables

Create a `.env` file in the project root:

```bash
# Copy example
cp .env.example .env

# Edit with your values
nano .env
```

### Required Variables

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token

# Upstash Redis
REDIS_URL=redis://your-upstash-redis-url

# Upstash Vector DB
UPSTASH_VECTOR_REST_URL=https://your-vector-db.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your_token

# AI Model
QWEN_API_KEY=your_qwen_api_key

# LangSmith
LANGSMITH_API_KEY=your_langsmith_key

# External Services (as needed)
TAVILY_API_KEY=your_tavily_key
FIRECRAWL_API_KEY=your_firecrawl_key
SKYVERN_API_KEY=your_skyvern_key
E2B_API_KEY=your_e2b_key
VAPI_PUBLIC_KEY=your_vapi_public_key
VAPI_PRIVATE_KEY=your_vapi_private_key
```

## Docker Commands

### Build
```bash
# Build the application
docker-compose build

# Build without cache
docker-compose build --no-cache
```

### Run
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d app

# Start with profiles
docker-compose --profile with-admin up -d
```

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app

# View last 100 lines
docker-compose logs --tail=100 app
```

### Stop
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database!)
docker-compose down -v

# Stop specific service
docker-compose stop app
```

### Execute Commands
```bash
# Enter running container
docker-compose exec app sh

# Run command in container
docker-compose exec app npm run test

# View database file location
docker-compose exec app ls -la /app/data/
```

## Database Management

### SQLite Database Location
The SQLite database is stored in a Docker volume at:
- **Container Path**: `/app/data/dev.db`
- **Volume Name**: `agentic-ai-backend_sqlite-data`

### Backup Database
```bash
# Create backup
docker-compose exec app cp /app/data/dev.db /tmp/dev.db.backup
docker cp agentic-ai-backend:/tmp/dev.db.backup ./backups/dev.db.$(date +%Y%m%d).backup

# Restore from backup
docker cp ./backups/dev.db.backup agentic-ai-backend:/tmp/dev.db.restore
docker-compose exec app cp /tmp/dev.db.restore /app/data/dev.db
```

### Using SQLite Admin UI
```bash
# Start with admin UI
docker-compose --profile with-admin up -d

# Access UI at http://localhost:8978
# Login: admin / admin
# Connection: SQLite -> /var/lib/cloudbeaver/data/dev.db
```

## Health Checks

```bash
# Check application health
curl http://localhost:3000/health

# Check container health
docker-compose ps

# View health check logs
docker inspect --format='{{json .State.Health}}' agentic-ai-backend | jq
```

## Scaling

```bash
# Scale application (if stateless, note: SQLite is stateful)
docker-compose up -d --scale app=3

# Note: For production scaling, consider:
# - Using external database (PostgreSQL)
# - Using shared Redis (Upstash)
# - Load balancer in front of multiple instances
```

## Production Considerations

### Security
- ✅ Non-root user in container
- ✅ Minimal Alpine base image
- ✅ Health checks enabled
- ⚠️ Use secrets management for sensitive data
- ⚠️ Enable TLS/SSL for external communication

### Performance
- ✅ Multi-stage build for smaller image
- ✅ Production dependencies only
- ⚠️ Consider resource limits in docker-compose

### Monitoring
- ✅ Health check endpoint
- ✅ LangSmith tracing integration
- ⚠️ Add Prometheus/Grafana for metrics
- ⚠️ Centralized logging (ELK stack)

### Resource Limits (Add to docker-compose.yml)
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs app

# Check environment variables
docker-compose exec app env

# Verify database directory permissions
docker-compose exec app ls -la /app/data/
```

### Database Issues
```bash
# Check database file
docker-compose exec app ls -la /app/data/

# Test database connection
docker-compose exec app sqlite3 /app/data/dev.db ".tables"

# Reset database (WARNING: deletes all data!)
docker-compose down -v
docker-compose up -d
```

### Network Issues
```bash
# Check network
docker network inspect agentic-network

# Test connectivity between services
docker-compose exec app ping langgraph
```

## Updating

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build

# Or force rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

## Customization

### Add Custom Tools
1. Add tool files to `src/agent/tools/`
2. Update `src/agent/agent.module.ts`
3. Rebuild: `docker-compose up -d --build`

### Change Port
Edit `docker-compose.yml`:
```yaml
ports:
  - "YOUR_PORT:3000"
```

### Add Volume Mounts
Edit `docker-compose.yml`:
```yaml
volumes:
  - ./custom-config:/app/config
```

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Check health endpoint: `http://localhost:3000/health`
4. Review LangSmith traces for debugging
