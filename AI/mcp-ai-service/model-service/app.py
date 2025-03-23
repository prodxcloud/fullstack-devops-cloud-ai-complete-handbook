from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import os
import time
import logging
from typing import Optional
import redis
from prometheus_client import Counter, Histogram, generate_latest
from prometheus_fastapi_instrumentator import Instrumentator

# Initialize FastAPI app
app = FastAPI(title="AI Model Service")

# Add Prometheus metrics
Instrumentator().instrument(app).expose(app)

# Initialize metrics
model_inference_requests = Counter('model_inference_requests_total', 'Total model inference requests')
model_inference_latency = Histogram('model_inference_latency_seconds', 'Model inference latency')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
SERVICE_PORT = int(os.getenv("SERVICE_PORT", "8001"))
CLOUD_PROVIDER = os.getenv("CLOUD_PROVIDER", "aws")
MODEL_PATH = os.getenv("MODEL_PATH", "/models/llama2")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")

# Initialize Redis
redis_client = redis.Redis(
    host=REDIS_URL.split("://")[1].split(":")[0],
    port=6379,
    decode_responses=True
)

class InferenceRequest(BaseModel):
    prompt: str
    max_tokens: Optional[int] = 100
    temperature: Optional[float] = 0.7

class InferenceResponse(BaseModel):
    text: str
    model: str
    latency: float

# Load model and tokenizer
@torch.inference_mode()
def load_model():
    logger.info(f"Loading model from {MODEL_PATH}")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_PATH,
        torch_dtype=torch.float16,
        device_map="auto"
    )
    return model, tokenizer

try:
    model, tokenizer = load_model()
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {e}")
    raise

@app.get("/health")
async def health_check():
    return {"status": "healthy", "cloud_provider": CLOUD_PROVIDER}

@app.post("/predict", response_model=InferenceResponse)
async def predict(request: InferenceRequest):
    try:
        start_time = time.time()
        
        # Tokenize input
        inputs = tokenizer(request.prompt, return_tensors="pt").to(model.device)
        
        # Generate response
        outputs = model.generate(
            inputs["input_ids"],
            max_new_tokens=request.max_tokens,
            temperature=request.temperature,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )
        
        # Decode response
        response_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        latency = time.time() - start_time
        
        # Update metrics
        model_inference_requests.inc()
        model_inference_latency.observe(latency)
        
        return InferenceResponse(
            text=response_text,
            model="llama2",
            latency=latency
        )
        
    except Exception as e:
        logger.error(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/metrics")
async def get_metrics():
    return generate_latest()

# Startup event
@app.on_event("startup")
async def startup_event():
    # Register service in Redis
    redis_client.hset(
        "service_status",
        CLOUD_PROVIDER,
        "1"
    )
    logger.info(f"Service registered for {CLOUD_PROVIDER}")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    # Unregister service from Redis
    redis_client.hset(
        "service_status",
        CLOUD_PROVIDER,
        "0"
    )
    logger.info(f"Service unregistered for {CLOUD_PROVIDER}") 