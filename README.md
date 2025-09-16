# Reino Dashboard

A minimal dashboard application built with SvelteKit and shadcn-svelte components for managing and executing Python scripts.

## Features

- **Clean, Modern UI**: Built with shadcn-svelte components and Tailwind CSS
- **Python Script Integration**: Execute Python scripts directly from the dashboard
- **Real-time Execution Logs**: View script output and errors in real-time
- **Analytics Dashboard**: Monitor script execution metrics and performance
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: SvelteKit + TypeScript
- **UI Components**: shadcn-svelte
- **Styling**: Tailwind CSS
- **Backend**: SvelteKit API routes
- **Python Integration**: Node.js child_process for script execution

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.7+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd dashboard-reino
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
dashboard-reino/
├── src/
│   ├── lib/
│   │   └── components/
│   │       ├── ui/              # shadcn-svelte components
│   │       └── DashboardLayout.svelte
│   ├── routes/
│   │   ├── api/
│   │   │   └── scripts/         # API endpoints for script execution
│   │   ├── analytics/           # Analytics page
│   │   ├── scripts/             # Scripts management page
│   │   ├── settings/            # Settings page
│   │   └── +page.svelte         # Home page
│   └── app.css                  # Global styles
├── scripts/                     # Python scripts directory
│   ├── data_analysis.py
│   ├── backup_database.py
│   └── send_notifications.py
└── static/                      # Static assets
```

## Usage

### Dashboard Pages

- **Home**: Overview of the dashboard with quick access cards
- **Analytics**: View script execution metrics and performance data
- **Scripts**: Manage and execute Python scripts
- **Settings**: Configure dashboard preferences and Python environment

### Adding Python Scripts

1. Place your Python scripts in the `scripts/` directory
2. Update the scripts array in `src/routes/api/scripts/+server.ts`
3. The scripts will automatically appear in the Scripts page

### Script Execution

- Navigate to the Scripts page
- Click the "Run" button next to any script
- View real-time output in the execution log section

## Development

### Navigation Guidelines

This project follows strict SPA (Single Page Application) navigation patterns to ensure optimal performance and user experience.

**📖 Important**: Before implementing any navigation, read our comprehensive guidelines:

- [`docs/navigation-guidelines.md`](docs/navigation-guidelines.md) - Complete navigation rules and examples
- [`docs/navigation-quick-ref.md`](docs/navigation-quick-ref.md) - Quick reference for common patterns
- [`docs/navigation-code-review-checklist.md`](docs/navigation-code-review-checklist.md) - Code review checklist
- [`docs/chatbot-navigation-rules.md`](docs/chatbot-navigation-rules.md) - Rules for chatbot assistance
- [`docs/ai-navigation-context.md`](docs/ai-navigation-context.md) - AI context and prompts
- [`docs/ai-prompt-navigation.md`](docs/ai-prompt-navigation.md) - Ready-to-use AI prompt

**Key Rule**: Always use `goto()` from `$app/navigation` for internal routing, never `window.location.href` (except for external links).

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Type Checking

```bash
npm run check
```

## Deployment

The application can be deployed to any platform that supports Node.js applications:

- **Vercel**: Zero-config deployment
- **Netlify**: Static site hosting with serverless functions
- **Railway**: Full-stack deployment
- **DigitalOcean App Platform**: Container-based deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
