# Motzkin Store Web

A modern Next.js website with a basic layout structure including header, main content area, and footer.

## Features

- ✅ Next.js 16 with App Router
- ✅ TypeScript support
- ✅ Tailwind CSS for styling
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Reusable layout components (Header, Footer, Layout)

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Homepage
│   ├── globals.css         # Global styles
│   └── favicon.ico         # Site favicon
└── components/
    ├── Layout.tsx          # Main layout wrapper with header and footer
    ├── Header.tsx          # Navigation header component
    └── Footer.tsx          # Footer component
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## License

See [LICENSE](LICENSE) file for details.
