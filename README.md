# Investio

AI-powered investment assistant built with Next.js and OpenAI.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-5-nano
- **Deployment**: Vercel

## Features

- 💬 AI chat assistant for market insights
- 📊 Portfolio dashboard overview
- 📱 Responsive design
- 🚀 Server-side rendering with Next.js

## Getting Started

### Prerequisites

- Node.js 20.2+
- OpenAI API key

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key
```

## Project Structure

```
app/
├── components/
│   ├── ui/          # Reusable components
│   └── layout/      # Layout components
├── lib/             # Constants & types
├── api/chat/        # OpenAI API route
├── page.tsx         # Dashboard
└── chat/page.tsx    # Chat interface
```

## Deployment

1. Push to GitHub
2. Import to Vercel
3. Add `OPENAI_API_KEY` environment variable
4. Deploy

## License

Private
