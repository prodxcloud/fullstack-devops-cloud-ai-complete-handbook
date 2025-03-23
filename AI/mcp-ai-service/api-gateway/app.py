from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import redis
import os
import json
import random
from typing import List, Optional
import logging
from prometheus_client import Counter, Histogram, generate_latest
from prometheus_fastapi_instrumentator import Instrumentator

# Initialize FastAPI app
app = FastAPI(title="Multi-Cloud AI Service Gateway")

# Add Prometheus metrics
Instrumentator().instrument(app).expose(app)

# Initialize metrics
inference_requests = Counter('inference_requests_total', 'Total inference requests', ['model', 'cloud_provider'])
inference_latency = Histogram('inference_latency_seconds', 'Inference request latency', ['model', 'cloud_provider'])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Redis
redis_client = redis.Redis(
    host=os.getenv("REDIS_URL", "redis").split("://")[1].split(":")[0],
    port=6379,
    decode_responses=True
)

# Model service endpoints
MODEL_SERVICES = {
    "aws": os.getenv("MODEL_SERVICE_AWS", "http://model-service-aws:8001"),
    "gcp": os.getenv("MODEL_SERVICE_GCP", "http://model-service-gcp:8002"),
    "azure": os.getenv("MODEL_SERVICE_AZURE", "http://model-service-azure:8003")
}

class InferenceRequest(BaseModel):
    prompt: str
    max_tokens: Optional[int] = 100
    temperature: Optional[float] = 0.7
    cloud_provider: Optional[str] = None

class InferenceResponse(BaseModel):
    text: str
    cloud_provider: str
    model: str
    latency: float

async def check_service_health(service_url: str) -> bool:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{service_url}/health")
            return response.status_code == 200
    except:
        return False

async def update_service_status():
    while True:
        for provider, url in MODEL_SERVICES.items():
            status = await check_service_health(url)
            redis_client.hset("service_status", provider, "1" if status else "0")
        await asyncio.sleep(30)

@app.on_event("startup")
async def startup_event():
    background_tasks.add_task(update_service_status)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/inference", response_model=InferenceResponse)
async def inference(request: InferenceRequest):
    # Select cloud provider
    available_providers = []
    for provider in MODEL_SERVICES.keys():
        if redis_client.hget("service_status", provider) == "1":
            available_providers.append(provider)
    
    if not available_providers:
        raise HTTPException(status_code=503, detail="No available model services")
    
    selected_provider = request.cloud_provider or random.choice(available_providers)
    service_url = MODEL_SERVICES[selected_provider]
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{service_url}/predict",
                json={
                    "prompt": request.prompt,
                    "max_tokens": request.max_tokens,
                    "temperature": request.temperature
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Model service error")
            
            result = response.json()
            inference_requests.labels(model="llama2", cloud_provider=selected_provider).inc()
            
            return InferenceResponse(
                text=result["text"],
                cloud_provider=selected_provider,
                model=result["model"],
                latency=result["latency"]
            )
            
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail=f"Service {selected_provider} unavailable")

@app.get("/metrics")
async def get_metrics():
    return generate_latest()

@app.get("/status")
async def get_status():
    status = {}
    for provider in MODEL_SERVICES.keys():
        status[provider] = redis_client.hget("service_status", provider) == "1"
    return status 