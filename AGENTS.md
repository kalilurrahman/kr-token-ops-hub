# Architecture decisions

- Keep all hosted model pricing, deployment, openness, licence, and verification metadata in `data/pricing.json`; calculators and generated references derive from it to prevent drift.
- Treat unavailable self-hosted token prices as `null`, never zero; calculate open-model economics from user-supplied infrastructure, throughput, utilisation, and overhead assumptions.
- Store reading lists only in device-local IndexedDB to preserve the product's no-account and no-tracking privacy model.
- Run AI workload advice through authenticated TanStack server functions and the Lovable AI Gateway; never expose credentials or prompts in browser code.
