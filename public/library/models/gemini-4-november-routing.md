# Gemini 4: Hydrogen and Argon routing

Official model and pricing pages checked 14/11/2026. Prices below are USD per million tokens; subscription credits are not equivalent to API token rates.

## Portfolio economics

| Model | Standard input / output | Cached input | Budget consideration |
|---|---|---|---|
| Hydrogen | $1.50 / $7.50 | $0.075 | Batch/Flex $0.75 / $3.75; implicit caching only |
| Argon, through 30/11/2026 | $2 / $10 | $0.10 | Introductory pricing, not a permanent budget baseline |
| Argon, from 01/12/2026 | $4 / $20 | $0.20 | The site uses these recurring rates conservatively |

Both use a unified 1,048,576-token input/output context window. Default synchronous output is 65,536; long decode can extend output within the unified budget. This is not one million input tokens plus another million output tokens. Budget thinking tokens as output and account for internal tool instructions and function declarations.

## Match the route to the workload

Hydrogen is the everyday coding and agentic route to evaluate first. Argon is a frontier reasoning candidate for difficult coding, mathematics, science and agent decisions. Treat provider descriptions as starting hypotheses, not measured quality or latency results. Evaluate your own accepted tasks before migration.

Illustrative 10,000-request month with 2,000 input and 500 output tokens: Hydrogen standard token spend is $67.50. Argon is $90 at introductory rates or $180 at recurring rates, excluding thinking beyond the stated output, tools, retries and overhead.

## Cost controls specific to this generation

- Cap reasoning and long-decode budgets independently of context admission.
- Keep stable instruction prefixes for implicit caching, but measure actual billed cache hits.
- Batch only when the delivery deadline permits; do not promise interactive latency for discounted asynchronous work.
- Search grounding can fan out into multiple separately billed queries. Count tool calls, not only user requests.
- Use Argon's post-promotion rates for annual planning; reconcile the invoice against the price applicable on the service date.
- Pin model identifiers and run shadow evaluations before replacing an older route.

## Migration checklist

Replay representative coding, tool-use and multimodal tasks. Record accepted-task cost, p50/p95 latency, retries, safety violations and token use. Set a finite retry and fallback budget. Test the unified context boundary and long-output cancellation. Preserve source citations and human review for regulated decisions.

## Official sources

- [Gemini pricing: Hydrogen](https://ai.google.dev/gemini-api/docs/pricing#gemini-4-hydrogen)
- [Gemini pricing: Argon](https://ai.google.dev/gemini-api/docs/pricing#gemini-4-argon)
- [Hydrogen model specification](https://ai.google.dev/gemini-api/docs/models/gemini-4-hydrogen)
- [Argon model specification](https://ai.google.dev/gemini-api/docs/models/gemini-4-argon)
