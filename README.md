# HealthyMeal 🥗

[![Angular](https://img.shields.io/badge/Angular-19.0.0-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Platform-purple.svg)](https://supabase.io/)

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

HealthyMeal is a web application (MVP) designed to help individuals without dietetic knowledge plan healthy and tasty meals or manage weight loss. The application leverages AI models to generate complete recipes tailored to users' dietary preferences (allergens, macro/micro-nutrients, caloric content) or creates general, balanced recipes when no specific preferences are provided.

### Key Features
- AI-powered recipe generation
- User preference profiles
- Recipe management (CRUD operations)
- Secure authentication
- Recipe feedback system
- Analytics integration

## Tech Stack

### Frontend
- Angular 19
- Angular Material 3
- TypeScript
- Progressive Web App (PWA) ready

### Backend
- Supabase
  - PostgreSQL database
  - Authentication
  - Backend-as-a-Service

### AI Integration
- Openrouter.ai
  - Access to multiple AI models
  - Cost-effective API management

### Infrastructure
- GitHub Actions (CI/CD)
- DigitalOcean (Docker hosting)

## Getting Started

### Prerequisites
- Node.js (version specified in .nvmrc)
- Angular CLI
- Supabase account
- Openrouter.ai API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/healthy-meal.git
cd healthy-meal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
OPENROUTER_API_KEY=your_openrouter_key
```

4. Start the development server:
```bash
npm start
```

## Available Scripts

- `npm start`: Start the development server
- `npm run build`: Build the project
- `npm run watch`: Build and watch for changes
- `npm test`: Run tests

## Project Scope

### MVP Features
- AI recipe generator
- User preference profiles
- Basic recipe CRUD operations
- Authentication system
- Basic analytics
- Recipe feedback mechanism

### Future Roadmap
- Recipe import from URLs/images
- Advanced social sharing features
- Enhanced media handling
- Meal cost optimization
- Shopping list export

## Project Status

This project is currently in active development. The MVP version is being implemented with the following focus areas:
- Core recipe generation functionality
- User authentication and profile management
- Basic analytics integration
- UI/UX improvements

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 