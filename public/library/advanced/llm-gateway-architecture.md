# LLM Gateway Architecture Guide

> **Purpose:** Design and build a centralized LLM API gateway that provides unified request tagging, intelligent routing, rate limiting, cost tracking, response caching, and circuit breaking across all LLM providers. This document covers architecture, components, deployment patterns, and a reference implementation.

---

## 1 · Why You Need a Gateway

Without a gateway, every service calls LLM providers directly. This leads to:

| Problem | Without Gateway | With Gateway |
|---------|----------------|-------------|
| **Cost visibility** | Each team tracks costs differently (or not at all) | Every request tagged with service, feature, cost center; unified cost stream |
| **Rate limiting** | Each service manages its own provider quotas | Centralized rate limiter prevents any single service from exhausting org limits |
| **Cost tracking** | Requires manual aggregation across services | Real-time cost calculation and budget enforcement per request |
| **Routing** | Hardcoded model choices in application code | Dynamic routing by task type, complexity, cost target, and provider health |
| **Caching** | No shared cache; duplicate requests re-processed | Semantic cache shared across services; 20–40% cost reduction |
| **Resilience** | Service-level retries cause retry storms | Centralized circuit breakers and intelligent failover |
| **Security** | API keys scattered across services | Single point for key management, PII filtering, and audit logging |
| **Observability** | Fragmented metrics; no unified view | Consistent metrics, traces, and logs across all LLM traffic |

---

## 2 · Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CLIENT SERVICES                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Chatbot  │  │  Email   │  │ Pipeline │  │  Search  │            │
│  │ Service  │  │Generator │  │  Worker  │  │  Service │            │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘            │
│       │              │              │              │                  │
│       └──────────────┴──────────────┴──────────────┘                  │
│                              │                                       │
│                    x-tokenops-* headers                               │
│                    (service, feature, cost-center)                    │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        LLM GATEWAY                                   │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  Request     │  │  Metadata   │  │   Rate      │                 │
│  │ Interceptor  │──│   Tagger    │──│  Limiter    │                 │
│  └─────────────┘  └─────────────┘  └──────┬──────┘                 │
│                                           │                          │
│                                    ┌──────▼──────┐                  │
│                                    │   Router    │                   │
│                                    │ (task/cost/ │                   │
│                                    │  tier/health│                   │
│                                    └──────┬──────┘                  │
│                                           │                          │
│                                    ┌──────▼──────┐     ┌──────────┐ │
│                                    │  Response   │────▶│ Semantic  │ │
│                                    │   Cache     │◀────│  Cache   │ │
│                                    └──────┬──────┘     │  Store   │ │
│                                           │            └──────────┘ │
│                                    ┌──────▼──────┐                  │
│                                    │  Circuit    │                   │
│                                    │  Breaker    │                   │
│                                    └──────┬──────┘                  │
│                                           │                          │
│  ┌─────────────┐                   ┌──────▼──────┐                  │
│  │ Cost Logger │◀──────────────────│  Provider   │                  │
│  │ (async)     │                   │  Adapter    │                  │
│  └──────┬──────┘                   └──────┬──────┘                  │
│         │                                 │                          │
└─────────┼─────────────────────────────────┼──────────────────────────┘
          │                                 │
          ▼                                 ▼
┌──────────────────┐          ┌──────────────────────────────────────┐
│  Analytics       │          │          LLM PROVIDERS               │
│  Pipeline        │          │  ┌────────┐ ┌─────────┐ ┌────────┐  │
│  ┌────────────┐  │          │  │ OpenAI │ │Anthropic│ │ Google │  │
│  │ Data       │  │          │  └────────┘ └─────────┘ └────────┘  │
│  │ Warehouse  │  │          │  ┌────────┐                          │
│  └────────────┘  │          │  │Together│ (Meta/Llama)             │
│  ┌────────────┐  │          │  └────────┘                          │
│  │ Dashboard  │  │          └──────────────────────────────────────┘
│  └────────────┘  │
└──────────────────┘
```

---

## 3 · Core Components

### 3.1 Request Interceptor

The entry point for all LLM requests. Validates, normalizes, and enriches the incoming request.

**Responsibilities:**

- Accept requests in a provider-agnostic format (OpenAI-compatible API)
- Validate request structure, authentication, and authorization
- Extract and validate `x-tokenops-*` headers
- Assign a unique `request_id` for tracing
- Measure request start time for latency calculation

```python
class RequestInterceptor:
    def process(self, request: GatewayRequest) -> GatewayRequest:
        # Validate authentication
        tenant = self.auth_manager.authenticate(request.api_key)
        if not tenant:
            raise AuthenticationError("Invalid API key")

        # Assign request ID
        request.id = generate_request_id()
        request.received_at = time.time()
        request.tenant = tenant

        # Validate request body
        self.validator.validate(request.body)

        # Count input tokens (for routing and cost estimation)
        request.input_token_count = self.tokenizer.count(
            request.body.messages,
            request.body.model or "default"
        )

        return request
```

### 3.2 Metadata Tagger

Enriches the request with cost-attribution metadata from headers, tenant config, and inference.

**Responsibilities:**

- Extract `x-tokenops-service`, `x-tokenops-feature`, `x-tokenops-cost-center` from headers
- Apply default tags from tenant configuration
- Infer task type from request content (if not explicitly provided)
- Estimate request complexity from input token count

```python
class MetadataTagger:
    def tag(self, request: GatewayRequest) -> GatewayRequest:
        # Extract explicit tags from headers
        request.tags = {
            "service": request.headers.get("x-tokenops-service", "unknown"),
            "feature": request.headers.get("x-tokenops-feature", "unknown"),
            "cost_center": request.headers.get("x-tokenops-cost-center",
                           self.tenant_defaults[request.tenant].cost_center),
            "environment": request.headers.get("x-tokenops-environment", "production"),
            "user_tier": request.tenant.tier,
        }

        # Infer task type if not provided
        if "x-tokenops-task" not in request.headers:
            request.tags["task_type"] = self.task_classifier.classify(
                request.body.messages
            )
        else:
            request.tags["task_type"] = request.headers["x-tokenops-task"]

        # Estimate complexity
        if request.input_token_count < 500:
            request.tags["complexity"] = "simple"
        elif request.input_token_count < 4000:
            request.tags["complexity"] = "medium"
        else:
            request.tags["complexity"] = "complex"

        return request
```

### 3.3 Router

Selects the optimal model and provider based on routing rules, cost targets, and provider health.

**Responsibilities:**

- Evaluate routing rules from `multi-provider-routing-config.yaml`
- Check circuit breaker state for candidate providers
- Check rate limit availability for candidate providers
- Apply user-tier restrictions
- Select the best candidate based on load balancing strategy

```python
class Router:
    def __init__(self, config: RoutingConfig):
        self.rules = config.routing_rules
        self.circuit_breakers = config.circuit_breakers
        self.load_balancer = config.load_balancer

    def route(self, request: GatewayRequest) -> RoutingDecision:
        # 1. Find matching routing rules (first match wins)
        candidates = self.match_rules(request)

        # 2. Filter out unhealthy candidates
        healthy = [
            c for c in candidates
            if self.circuit_breakers[c.provider].is_closed()
            and self.rate_limiters[c.provider].has_capacity()
        ]

        if not healthy:
            # 3. Try fallback chain
            tier = self.model_registry[candidates[0]].tier
            healthy = self.get_fallback_chain(tier)

        if not healthy:
            raise NoAvailableModelError("All models exhausted")

        # 4. Select from healthy candidates via load balancing
        selected = self.load_balancer.select(
            healthy,
            task_type=request.tags["task_type"]
        )

        return RoutingDecision(
            model=selected.model_id,
            provider=selected.provider,
            reason=f"Matched rule: {selected.matched_rule}",
            fallback_used=selected.is_fallback
        )
```

### 3.4 Rate Limiter

Enforces per-tenant, per-service, and per-provider rate limits using a token bucket algorithm.

**Responsibilities:**

- Per-tenant RPM (requests per minute) and TPM (tokens per minute) limits
- Per-provider rate limit management (respect provider quotas)
- Per-service budget-based rate limiting
- Queue or reject requests that exceed limits

```python
class RateLimiter:
    def __init__(self, config: RateLimitConfig, redis: Redis):
        self.config = config
        self.redis = redis

    def check(self, request: GatewayRequest, model: str) -> RateLimitResult:
        provider = self.model_registry[model].provider

        # Check tenant limit
        tenant_key = f"rl:tenant:{request.tenant.id}"
        tenant_ok = self.token_bucket_check(
            tenant_key,
            self.config.tenant_limits[request.tenant.tier]
        )

        # Check provider limit
        provider_key = f"rl:provider:{provider}"
        provider_ok = self.token_bucket_check(
            provider_key,
            self.config.provider_limits[provider]
        )

        # Check service budget pace
        service_key = f"rl:service:{request.tags['service']}"
        budget_ok = self.budget_pace_check(
            service_key,
            request.tags["service"]
        )

        if not (tenant_ok and provider_ok and budget_ok):
            return RateLimitResult(
                allowed=False,
                retry_after_seconds=self.calculate_retry_after(
                    tenant_ok, provider_ok, budget_ok
                )
            )

        return RateLimitResult(allowed=True)
```

### 3.5 Response Cache (Semantic Cache)

Caches LLM responses to serve identical or semantically similar requests without calling the provider.

**Responsibilities:**

- Hash-based exact match for deterministic requests (temperature = 0)
- Embedding-based similarity matching for near-duplicate requests
- Cache invalidation on prompt version changes
- Respect `no-cache` header for bypassing cache

```python
class ResponseCache:
    def __init__(self, redis: Redis, embedding_model):
        self.redis = redis
        self.embedding_model = embedding_model
        self.similarity_threshold = 0.95

    def get(self, request: GatewayRequest) -> Optional[CachedResponse]:
        # 1. Try exact match (fast path)
        cache_key = self.compute_hash(request)
        cached = self.redis.get(f"cache:exact:{cache_key}")
        if cached:
            return CachedResponse(response=cached, cache_type="exact")

        # 2. Try semantic match (slower, embedding-based)
        if request.body.temperature == 0:
            embedding = self.embedding_model.encode(
                self.extract_user_message(request)
            )
            neighbors = self.vector_store.search(
                embedding,
                top_k=1,
                threshold=self.similarity_threshold,
                filter={"model": request.routed_model}
            )
            if neighbors:
                return CachedResponse(
                    response=neighbors[0].response,
                    cache_type="semantic",
                    similarity=neighbors[0].score
                )

        return None  # Cache miss

    def put(self, request: GatewayRequest, response: LLMResponse):
        cache_key = self.compute_hash(request)
        ttl = self.get_ttl(request.tags["service"])

        # Store exact match
        self.redis.setex(f"cache:exact:{cache_key}", ttl, response)

        # Store embedding for semantic search
        if request.body.temperature == 0:
            embedding = self.embedding_model.encode(
                self.extract_user_message(request)
            )
            self.vector_store.upsert(
                id=cache_key,
                embedding=embedding,
                metadata={"model": request.routed_model, "response": response}
            )
```

### 3.6 Circuit Breaker

Stops sending traffic to a degraded provider and routes to healthy alternatives.

**Responsibilities:**

- Track error rates per provider using a sliding window
- Open the circuit when error rate exceeds threshold
- Periodically send probe requests in half-open state
- Close the circuit after consecutive probe successes

*(Configuration details in `multi-provider-routing-config.yaml`, Section 4)*

### 3.7 Cost Logger

Calculates per-request cost and emits cost events asynchronously for downstream analytics.

**Responsibilities:**

- Calculate cost from input tokens, output tokens, and model pricing
- Enrich the cost event with all request tags
- Emit to configured sinks (webhook, Kafka, stdout)
- Update real-time budget aggregation in Redis

```python
class CostLogger:
    def __init__(self, pricing: PricingTable, sinks: list[CostSink]):
        self.pricing = pricing
        self.sinks = sinks

    async def log(self, request: GatewayRequest, response: LLMResponse):
        # Calculate cost
        price = self.pricing[request.routed_model]
        input_cost = request.input_token_count * price.input_per_1m / 1_000_000
        output_cost = response.output_token_count * price.output_per_1m / 1_000_000
        total_cost = input_cost + output_cost

        # Build cost event
        event = CostEvent(
            request_id=request.id,
            timestamp=datetime.utcnow(),
            provider=request.routed_provider,
            model=request.routed_model,
            input_tokens=request.input_token_count,
            output_tokens=response.output_token_count,
            input_cost_usd=input_cost,
            output_cost_usd=output_cost,
            total_cost_usd=total_cost,
            latency_ms=response.latency_ms,
            status_code=response.status_code,
            cache_hit=response.cache_hit,
            tags=request.tags,
            routing_rule=request.routing_decision.reason,
            fallback_used=request.routing_decision.fallback_used,
        )

        # Emit asynchronously to all sinks
        await asyncio.gather(
            *[sink.emit(event) for sink in self.sinks]
        )

        # Update real-time budget aggregation
        await self.budget_tracker.increment(
            service=request.tags["service"],
            cost=total_cost,
            tokens=request.input_token_count + response.output_token_count
        )
```

---

## 4 · Technology Options

| Approach | Description | Pros | Cons | Best For |
|----------|-----------|------|------|----------|
| **LiteLLM** | Open-source LLM proxy with 100+ provider support | Fast to deploy, active community, built-in routing | Limited customization, dependency risk | Startups, small teams, rapid prototyping |
| **Custom middleware** | Purpose-built gateway (Python/Go/Rust) | Full control, tailored to your needs | Significant engineering investment | Enterprise, high-scale, unique requirements |
| **Kong + plugins** | API gateway with custom LLM plugins | Mature platform, plugin ecosystem | Complexity, requires Kong expertise | Teams already using Kong |
| **Envoy + WASM** | High-performance proxy with custom filters | Extreme performance, L7 flexibility | Steep learning curve, WASM limitations | High-throughput, low-latency requirements |
| **SDK wrapper** | Client-side library that wraps provider SDKs | No infrastructure, easy adoption | No centralized control, harder to enforce | Small teams, early-stage |
| **Cloud-managed** | AWS Bedrock, Azure AI Gateway, GCP Vertex | Managed, integrated with cloud ecosystem | Vendor lock-in, less customization | Cloud-native organizations |

### Recommended Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Gateway core | **Python (FastAPI)** or **Go** | FastAPI for rapid development; Go for high throughput |
| Rate limiting | **Redis** (token bucket) | Fast, distributed, battle-tested |
| Semantic cache | **Redis + pgvector** | Redis for exact match, pgvector for semantic similarity |
| Circuit breaker | **In-process** (sliding window) | No external dependency; millisecond decisions |
| Cost logging | **Kafka** → data warehouse | Decoupled, high throughput, replayable |
| Configuration | **YAML file** + hot reload | Simple, version-controlled, auditable |
| Observability | **Prometheus + Grafana** | Industry standard, rich ecosystem |

---

## 5 · Data Flow

The complete lifecycle of a request through the gateway:

```
1. SERVICE sends request
      │
      ▼
2. REQUEST INTERCEPTOR
   ├── Validate authentication (API key / JWT)
   ├── Assign request_id (UUID v7)
   ├── Validate request body schema
   └── Count input tokens
      │
      ▼
3. METADATA TAGGER
   ├── Extract x-tokenops-* headers
   ├── Apply tenant default tags
   ├── Infer task type (if not explicit)
   └── Estimate complexity from token count
      │
      ▼
4. RATE LIMITER
   ├── Check tenant RPM / TPM limits
   ├── Check provider quota availability
   ├── Check service budget pace
   └── → If over limit: return 429 + Retry-After
      │
      ▼
5. ROUTER
   ├── Evaluate routing rules (task → complexity → tier → default)
   ├── Filter by circuit breaker state
   ├── Filter by rate limit availability
   ├── Apply load balancing strategy
   └── → Selected model + provider
      │
      ▼
6. CACHE CHECK
   ├── Compute request hash
   ├── Check exact match in Redis
   ├── Check semantic match in vector store (if temperature=0)
   └── → If HIT: skip to step 9 with cached response
      │
      ▼
7. PROVIDER ADAPTER
   ├── Transform request to provider-specific format
   ├── Add authentication headers
   ├── Send request to provider API
   ├── Handle streaming (if applicable)
   └── Transform response to gateway-standard format
      │
      ▼
8. CIRCUIT BREAKER UPDATE
   ├── Record success or failure
   ├── Update sliding window error rate
   └── Trip circuit if threshold exceeded
      │
      ▼
9. CACHE STORE (if cache miss)
   ├── Store exact hash → response
   └── Store embedding → response (for semantic cache)
      │
      ▼
10. COST LOGGER (async)
    ├── Calculate cost from token counts + pricing
    ├── Enrich with all request tags
    ├── Emit to Kafka / webhook / stdout
    └── Update real-time budget aggregation in Redis
      │
      ▼
11. RESPONSE
    ├── Add x-tokenops-request-id header
    ├── Add x-tokenops-routed-model header (if configured)
    ├── Add x-tokenops-cost header (if configured)
    └── Return response to service
```

---

## 6 · Deployment Patterns

### 6.1 Centralized Proxy (Recommended)

All services route LLM traffic through a shared gateway deployment.

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Service A │     │ Service B │     │ Service C │
└─────┬────┘     └─────┬────┘     └─────┬────┘
      │                │                │
      └────────────────┼────────────────┘
                       │
                ┌──────▼──────┐
                │ LLM Gateway │
                │ (3 replicas)│
                └──────┬──────┘
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
          OpenAI  Anthropic  Google
```

**Pros:** Single control plane, shared cache, centralized rate limiting.  
**Cons:** Single point of failure (mitigate with replicas), additional network hop.

### 6.2 Sidecar Pattern

Each service gets its own gateway instance as a sidecar container.

```
┌──────────────────────────┐
│         Pod A            │
│  ┌──────────┐ ┌────────┐│
│  │ Service A │─│Sidecar ││
│  └──────────┘ │Gateway ││
│               └───┬────┘│
└───────────────────┼─────┘
                    ▼
                Providers
```

**Pros:** No shared dependency, lower latency, service-specific config.  
**Cons:** No shared cache, duplicate resources, harder to manage globally.

### 6.3 SDK Wrapper

No separate infrastructure; the gateway logic lives in a client library.

```python
# Instead of calling OpenAI directly:
# client = OpenAI()
# response = client.chat.completions.create(...)

# Use the TokenOps SDK wrapper:
from tokenops import TokenOpsClient

client = TokenOpsClient(
    gateway_url="https://llm-gateway.internal.company.com",
    service="support_chatbot",
    feature="ticket-classifier",
    cost_center="CC-5520-CX"
)
response = client.complete(
    messages=[{"role": "user", "content": "Classify this ticket..."}],
    task_type="classification",
)
# SDK automatically adds x-tokenops-* headers
```

**Pros:** Easiest adoption, no infrastructure changes.  
**Cons:** Limited enforcement (teams can bypass), no server-side caching.

### Deployment Comparison

| Factor | Centralized Proxy | Sidecar | SDK Wrapper |
|--------|------------------|---------|-------------|
| **Shared cache** | ✅ Yes | ❌ No | ❌ No |
| **Centralized rate limiting** | ✅ Yes | ⚠️ Partial | ❌ No |
| **Enforcement** | ✅ Strong | ✅ Strong | ⚠️ Weak |
| **Additional latency** | ~5–20ms | ~1–5ms | ~0ms |
| **Infrastructure cost** | Medium | High (N×) | None |
| **Adoption effort** | Medium | High | Low |
| **Recommended for** | Most teams | High-isolation needs | Early-stage teams |

---

## 7 · Observability Integration

### 7.1 Metrics to Export

Export these metrics to Prometheus (or your metrics backend):

| Metric Name | Type | Labels | Description |
|-------------|------|--------|-------------|
| `tokenops_request_total` | Counter | service, model, provider, status, cache_hit | Total request count |
| `tokenops_request_duration_seconds` | Histogram | service, model, provider | End-to-end latency (gateway perspective) |
| `tokenops_provider_duration_seconds` | Histogram | model, provider | Provider-only latency (network + inference) |
| `tokenops_input_tokens_total` | Counter | service, model | Total input tokens processed |
| `tokenops_output_tokens_total` | Counter | service, model | Total output tokens generated |
| `tokenops_cost_usd_total` | Counter | service, model, cost_center | Cumulative cost in USD |
| `tokenops_cost_per_request_usd` | Histogram | service, model | Per-request cost distribution |
| `tokenops_cache_hits_total` | Counter | service, cache_type | Cache hits (exact, semantic) |
| `tokenops_cache_misses_total` | Counter | service | Cache misses |
| `tokenops_cache_hit_rate` | Gauge | service | Rolling cache hit rate |
| `tokenops_rate_limit_rejections_total` | Counter | service, limit_type | Rate limit rejections |
| `tokenops_circuit_breaker_state` | Gauge | provider | 0=closed, 1=half-open, 2=open |
| `tokenops_circuit_breaker_trips_total` | Counter | provider | Circuit breaker trip count |
| `tokenops_errors_total` | Counter | service, provider, error_type | Error count by type |
| `tokenops_fallback_total` | Counter | service, from_model, to_model | Fallback invocations |

### 7.2 Key Dashboard Panels

Build these Grafana dashboards:

**Dashboard 1: Gateway Overview**

- Request rate (RPM) by service
- P50/P95/P99 latency by provider
- Error rate by provider
- Active circuit breakers
- Cache hit rate

**Dashboard 2: Cost Tracking**

- Hourly cost by service (stacked bar)
- Cost per request by model (time series)
- MTD spend vs. budget (progress bar)
- Cost by provider (pie chart)
- Top 10 most expensive requests (table)

**Dashboard 3: Provider Health**

- Provider availability (uptime)
- Provider latency trends
- Rate limit utilization (% of quota used)
- Circuit breaker history (state changes over time)

### 7.3 Distributed Tracing

Add OpenTelemetry spans for each gateway component:

```python
from opentelemetry import trace

tracer = trace.get_tracer("tokenops-gateway")

async def handle_request(request):
    with tracer.start_as_current_span("gateway.request") as span:
        span.set_attribute("tokenops.service", request.tags["service"])
        span.set_attribute("tokenops.request_id", request.id)

        with tracer.start_as_current_span("gateway.authenticate"):
            authenticate(request)

        with tracer.start_as_current_span("gateway.tag"):
            tag(request)

        with tracer.start_as_current_span("gateway.rate_limit"):
            check_rate_limit(request)

        with tracer.start_as_current_span("gateway.route"):
            decision = route(request)
            span.set_attribute("tokenops.model", decision.model)

        with tracer.start_as_current_span("gateway.cache_check"):
            cached = check_cache(request)

        if not cached:
            with tracer.start_as_current_span("gateway.provider_call") as prov:
                prov.set_attribute("tokenops.provider", decision.provider)
                response = call_provider(request, decision)
                prov.set_attribute("tokenops.output_tokens",
                                   response.output_token_count)

        with tracer.start_as_current_span("gateway.cost_log"):
            await log_cost(request, response)

        return response
```

---

## 8 · Security Considerations

### 8.1 API Key Management

| Practice | Implementation |
|----------|---------------|
| **Never store provider keys in code** | Use environment variables or a secrets manager (Vault, AWS Secrets Manager) |
| **Rotate keys quarterly** | Automate rotation; the gateway resolves keys at runtime |
| **Per-tenant gateway keys** | Each service gets its own gateway API key; map to tenant config |
| **Key scoping** | Gateway keys can restrict access to specific models or tiers |
| **Audit key usage** | Log which key was used for each request (not the key itself) |

### 8.2 Tenant Isolation

```python
class TenantIsolation:
    def enforce(self, request: GatewayRequest):
        tenant = request.tenant

        # 1. Rate limit isolation (per-tenant buckets)
        assert self.rate_limiter.check_tenant(tenant.id)

        # 2. Model access control
        requested_model = request.body.model
        if requested_model and requested_model not in tenant.allowed_models:
            raise ForbiddenError(
                f"Tenant {tenant.id} not authorized for model {requested_model}"
            )

        # 3. Budget isolation
        if self.budget_tracker.is_exhausted(tenant.id):
            raise BudgetExhaustedError(
                f"Tenant {tenant.id} has exhausted its budget"
            )

        # 4. Data isolation (logs, cache)
        request.cache_namespace = f"tenant:{tenant.id}"
        request.log_partition = tenant.id
```

### 8.3 PII Filtering

```python
class PIIFilter:
    """Redact PII from requests before sending to external LLM providers."""

    PATTERNS = {
        "email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        "phone": r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
        "ssn": r'\b\d{3}-\d{2}-\d{4}\b',
        "credit_card": r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',
    }

    def filter(self, request: GatewayRequest) -> GatewayRequest:
        if not request.tenant.pii_filtering_enabled:
            return request

        for message in request.body.messages:
            for pii_type, pattern in self.PATTERNS.items():
                message.content = re.sub(
                    pattern,
                    f"[REDACTED_{pii_type.upper()}]",
                    message.content
                )

        return request
```

---

## 9 · Scaling Considerations

### 9.1 Horizontal Scaling

```
                    ┌──────────────┐
                    │   Load       │
                    │  Balancer    │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Gateway  │ │ Gateway  │ │ Gateway  │
        │ Pod 1    │ │ Pod 2    │ │ Pod 3    │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
             │             │             │
             └─────────────┼─────────────┘
                           │
                    ┌──────▼───────┐
                    │    Redis     │
                    │ (rate limits,│
                    │  cache,      │
                    │  budgets)    │
                    └──────────────┘
```

**Scaling guidelines:**

| Load Level | Gateway Pods | Redis | Notes |
|-----------|-------------|-------|-------|
| < 100 RPM | 2 (HA) | 1 node | Minimum viable deployment |
| 100–1,000 RPM | 3–5 | 3-node cluster | Standard production |
| 1,000–10,000 RPM | 5–15 | 6-node cluster | Consider read replicas |
| > 10,000 RPM | 15+ | Redis Cluster | Shard by tenant or service |

### 9.2 Connection Pooling

```python
# Maintain persistent connections to each provider
class ProviderConnectionPool:
    def __init__(self, providers: dict[str, ProviderConfig]):
        self.pools = {}
        for name, config in providers.items():
            self.pools[name] = httpx.AsyncClient(
                base_url=config.base_url,
                limits=httpx.Limits(
                    max_connections=config.connection_pool.max_connections,
                    max_keepalive_connections=config.connection_pool.max_connections // 2,
                    keepalive_expiry=config.connection_pool.idle_timeout_seconds
                ),
                timeout=httpx.Timeout(
                    connect=config.timeout.connect_ms / 1000,
                    read=config.timeout.read_ms / 1000,
                    write=config.timeout.write_ms / 1000,
                ),
                http2=True,  # HTTP/2 for multiplexing
            )
```

### 9.3 Performance Optimization

| Optimization | Impact | Implementation |
|-------------|--------|----------------|
| **Async I/O** | High | Use asyncio / goroutines for all provider calls |
| **Connection pooling** | High | Persistent HTTP/2 connections to providers |
| **Cache-first routing** | High | Check cache before routing decisions |
| **Async cost logging** | Medium | Fire-and-forget cost events; don't block response |
| **Token counting shortcut** | Medium | Use fast approximation (chars/4) for routing; exact for billing |
| **Request batching** | Medium | Batch cost events before flushing to Kafka |
| **Zero-copy streaming** | Medium | Stream provider responses directly to client |

---

## 10 · Reference Implementation

### 10.1 Complete Request Handler (Pseudocode)

```python
# main.py — LLM Gateway (FastAPI)
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse

app = FastAPI(title="TokenOps LLM Gateway")

# Initialize components
interceptor = RequestInterceptor(auth_manager, tokenizer)
tagger = MetadataTagger(task_classifier, tenant_defaults)
rate_limiter = RateLimiter(rate_config, redis)
router = Router(routing_config)
cache = ResponseCache(redis, embedding_model)
circuit_breakers = CircuitBreakerManager(cb_config)
provider_pool = ProviderConnectionPool(providers)
cost_logger = CostLogger(pricing_table, sinks)
pii_filter = PIIFilter()

@app.post("/v1/chat/completions")
async def chat_completions(raw_request: Request):
    # 1. Intercept and validate
    request = interceptor.process(raw_request)

    # 2. Tag with metadata
    request = tagger.tag(request)

    # 3. Filter PII
    request = pii_filter.filter(request)

    # 4. Check rate limits
    rl_result = rate_limiter.check(request)
    if not rl_result.allowed:
        raise HTTPException(
            status_code=429,
            headers={"Retry-After": str(rl_result.retry_after_seconds)}
        )

    # 5. Route to optimal model
    decision = router.route(request)
    request.routed_model = decision.model
    request.routed_provider = decision.provider
    request.routing_decision = decision

    # 6. Check cache
    cached = cache.get(request)
    if cached:
        response = cached.response
        response.cache_hit = True
        response.cache_type = cached.cache_type
    else:
        # 7. Call provider
        try:
            adapter = provider_pool.get_adapter(decision.provider)
            response = await adapter.call(request, decision.model)
            response.cache_hit = False

            # 8. Update circuit breaker (success)
            circuit_breakers.record_success(decision.provider)

            # 9. Store in cache
            cache.put(request, response)

        except ProviderError as e:
            # 8b. Update circuit breaker (failure)
            circuit_breakers.record_failure(decision.provider)

            # Try fallback
            fallback = router.get_next_fallback(request, decision)
            if fallback:
                response = await provider_pool.get_adapter(
                    fallback.provider
                ).call(request, fallback.model)
            else:
                raise HTTPException(status_code=502, detail=str(e))

    # 10. Log cost (async — don't block response)
    asyncio.create_task(cost_logger.log(request, response))

    # 11. Build and return response
    return build_response(
        response,
        headers={
            "x-tokenops-request-id": request.id,
            "x-tokenops-model": decision.model,
            "x-tokenops-cache-hit": str(response.cache_hit).lower(),
        }
    )
```

### 10.2 Docker Compose (Development)

```yaml
# docker-compose.yaml
version: "3.9"
services:
  gateway:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - GOOGLE_AI_API_KEY=${GOOGLE_AI_API_KEY}
      - TOGETHER_API_KEY=${TOGETHER_API_KEY}
      - REDIS_URL=redis://redis:6379
      - CONFIG_PATH=/config/routing.yaml
    volumes:
      - ./config:/config:ro
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    volumes:
      - ./monitoring/dashboards:/etc/grafana/provisioning/dashboards
    depends_on:
      - prometheus

volumes:
  redis-data:
```

---

## 11 · Implementation Checklist

- [ ] **Phase 1 — Foundation (Week 1–2)**
  - [ ] Set up gateway skeleton (FastAPI or Go)
  - [ ] Implement Request Interceptor and Metadata Tagger
  - [ ] Implement Provider Adapter for primary provider (OpenAI)
  - [ ] Add basic request/response logging
  - [ ] Deploy in development environment

- [ ] **Phase 2 — Routing & Resilience (Week 3–4)**
  - [ ] Add multi-provider support (Anthropic, Google, Together)
  - [ ] Implement Router with task-based and complexity-based rules
  - [ ] Add Circuit Breaker per provider
  - [ ] Implement fallback chains
  - [ ] Add Rate Limiter (Redis-backed)

- [ ] **Phase 3 — Cost & Caching (Week 5–6)**
  - [ ] Implement Cost Logger with pricing table
  - [ ] Add cost event sinks (Kafka/webhook)
  - [ ] Implement exact-match Response Cache
  - [ ] Add semantic cache (embedding-based)
  - [ ] Integrate with budget guardrails

- [ ] **Phase 4 — Observability & Security (Week 7–8)**
  - [ ] Export Prometheus metrics
  - [ ] Build Grafana dashboards
  - [ ] Add OpenTelemetry tracing
  - [ ] Implement PII filtering
  - [ ] Add tenant isolation and API key management
  - [ ] Security review and penetration testing

- [ ] **Phase 5 — Production Rollout (Week 9–10)**
  - [ ] Load testing (target: 2× expected peak traffic)
  - [ ] Canary deployment with one service
  - [ ] Migrate services incrementally
  - [ ] Document runbooks for on-call
  - [ ] Set up anomaly detection alerts

---

*Template version 1.0 — Maintained by the TokenOps team.*
