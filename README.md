# Investio

A modern financial investment dashboard built with React, Vite, and Tailwind CSS.

## Features

- Real-time market overview
- AI-powered chat assistant
- Portfolio tracking
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **API**: OpenAI GPT-5-nano
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Deployment

This project is configured for deployment on Vercel.

### Environment Variables

Set the following environment variable in your Vercel project:

- `OPENAI_API_KEY`: Your OpenAI API key

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add the environment variable
4. Deploy

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Atomic design components
│   │   ├── atoms/      # Basic UI elements
│   │   ├── molecules/  # Component combinations
│   │   ├── organisms/  # Complex components
│   │   └── templates/  # Page layouts
│   ├── pages/          # Page components
│   ├── styles/         # Global styles
│   └── main.tsx        # App entry point
├── dist/               # Build output
└── index.html          # HTML template
```

## License

Private
