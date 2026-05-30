# TokenOps - FinOps for Tokens

![TokenOps Demo](screenshots/demo.gif)

## Overview

TokenOps applies visibility, allocation, optimization, and governance to LLM token consumption so AI products can scale without invoice surprises. It acts as operational intelligence for LLM token spend, applying FinOps-style discipline to four key domains.

## Features

- **Visibility:** Know which services, features, teams, and use cases consume tokens and at what cost. Target: Tagging coverage %.
- **Optimization:** Reduce waste through prompt engineering, model tiering, caching, and context management. Target: Cost per 1K calls.
- **Allocation:** Join usage metadata with billing data so token costs become accountable.
- **Governance:** Embed token economics into budgets, alerts, reviews, and architecture decisions. Target: Budget utilization %.

## Application Sections

### Home

The landing page providing an executive summary of TokenOps and the core value proposition.
![Home Page](screenshots/home.png)

### Hub

Central hub for operational intelligence and managing token spend.
![Hub Page](screenshots/hub.png)

### Guide

Detailed guide to understanding and instrumenting token economics.
![Guide Page](screenshots/guide.png)

### Patterns

Typical savings profiles and techniques like model routing, prompt caching, and compression.
![Patterns Page](screenshots/patterns.png)

### Calculator

Interactive calculator to project and estimate token costs based on volume and techniques used.
![Calculator Page](screenshots/calculator.png)

### Dashboard

View key metrics, utilization, and cost breakdown in a unified dashboard.
![Dashboard Page](screenshots/dashboard.png)

### Library

Content library containing long-form artifacts, playbooks, checklists, and reference materials.
![Library Page](screenshots/library.png)

## Getting Started

To run the application locally:

1. Clone the repository.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser.

## Built With

- [React](https://reactjs.org/)
- [TanStack Start / Router](https://tanstack.com/router)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Vite](https://vitejs.dev/)

---

Made with ❤️ by Kalilur Rahman
