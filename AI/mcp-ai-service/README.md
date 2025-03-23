# Multi-Cloud AI Service with LLaMA 2

This service demonstrates a production-ready implementation of LLaMA 2 running across multiple cloud providers (AWS, GCP, Azure) with load balancing and failover capabilities.

## Architecture

```
                                    ┌─────────────────┐
                                    │   API Gateway   │
                                    │   (FastAPI)     │
                                    └────────┬────────┘
                                             │
                     ┌─────────────────┬─────┴─────┬─────────────────┐
                     │                 │           │                 │
              ┌──────┴──────┐  ┌──────┴──────┐    │          ┌──────┴──────┐
              │  AWS Model  │  │  GCP Model  │    │          │ Azure Model │
              │  Service    │  │  Service    │    │          │  Service    │
              └──────┬──────┘  └──────┬──────┘    │          └──────┬──────┘
                     │                 │           │                 │
                     └─────────────────┴───────────┴─────────────────┘
                                      │
                              ┌───────┴───────┐
                              │    Redis      │
                              │  (State Mgmt) │
                              └───────────────┘
```

## Features

- Multi-cloud deployment support
- Load balancing across cloud providers
- Automatic failover
- Health monitoring
- Prometheus metrics
- Grafana dashboards
- GPU acceleration
- Redis-based state management
- Docker containerization

## Components

### API Gateway
- FastAPI-based REST API
- Request routing and load balancing
- Health checking
- Metrics collection
- Rate limiting

### Model Service
- LLaMA 2 model deployment
- GPU acceleration
- Prometheus metrics
- Health monitoring
- Auto-scaling support

### Monitoring
- Prometheus metrics
- Grafana dashboards
- Health checks
- Performance monitoring
- Error tracking

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Download LLaMA 2 model:
   ```bash
   python scripts/download_model.py
   ```

4. Start services:
   ```bash
   docker-compose up -d
   ```

## API Usage

### Make a prediction
```bash
curl -X POST "http://localhost:8000/inference" \
     -H "Content-Type: application/json" \
     -d '{
           "prompt": "Tell me about artificial intelligence",
           "max_tokens": 100,
           "temperature": 0.7
         }'
```

### Check service status
```bash
curl "http://localhost:8000/status"
```

### View metrics
```bash
curl "http://localhost:8000/metrics"
```

## Environment Variables

- `SERVICE_PORT`: Port for the service (default: 8000)
- `CLOUD_PROVIDER`: Cloud provider name (aws/gcp/azure)
- `MODEL_PATH`: Path to the model files
- `REDIS_URL`: Redis connection URL

## Monitoring

Access Grafana dashboards:
- URL: http://localhost:3000
- Username: admin
- Password: admin

## Performance

The service is optimized for:
- Low latency responses
- High throughput
- GPU utilization
- Memory efficiency
- Auto-scaling

## Security

- CORS protection
- Rate limiting
- Input validation
- Error handling
- Secure dependencies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details 