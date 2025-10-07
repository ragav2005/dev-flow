# DevFlow - Online Code Editor

A modern, full-featured online code editor built with Next.js, featuring real-time code execution, snippet management, social features, and a beautiful dark theme interface.

![DevFlow](https://img.shields.io/badge/DevFlow-Online%20Editor-blue?style=for-the-badge&logo=visual-studio-code)
![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)

## Features

### Core Functionality

- **Real-time Code Execution** - Execute code in multiple programming languages
- **Syntax Highlighting** - Beautiful syntax highlighting for popular languages
- **Multi-language Support** - JavaScript, Python, Java, C++, and more
- **Responsive Design** - Works seamlessly on desktop and mobile devices

### User Management

- **Authentication** - Secure sign-up and sign-in with Supabase
- **User Profiles** - Comprehensive profile pages with coding statistics
- **Personal Dashboard** - Track your coding activity and achievements

### Snippet Management

- **Create & Edit Snippets** - Save and organize your code snippets
- **Public Sharing** - Share your code with the community
- **Search & Discovery** - Find snippets by language, popularity, or content

### Social Features

- **Star System** - Star your favorite snippets for easy access
- **Comments** - Discuss and collaborate on code snippets
- **Community Driven** - Build and contribute to a coding community

### User Experience

- **Dark Theme** - Modern dark theme optimized for coding
- **Intuitive UI** - Clean, professional interface with smooth animations
- **Fast Performance** - Optimized for speed and responsiveness

## Tech Stack

### Frontend

- **Next.js 15.5.3** - React framework with App Router
- **React 19** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework

### Backend & Database

- **Supabase** - Backend-as-a-Service with PostgreSQL database
- **Row Level Security (RLS)** - Database-level access control
- **Real-time Subscriptions** - Live updates for social features

### Code Execution

- **Piston API** - Remote code execution engine
- **Multi-language Support** - 40+ programming languages supported

### UI/UX

- **Lucide React** - Beautiful, consistent icon library
- **Framer Motion** - Smooth animations and transitions
- **Monaco Editor** - VS Code's editor component
- **React Syntax Highlighter** - Advanced syntax highlighting

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm, yarn, or pnpm
- A Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ragav2005/dev-flow.git
   cd dev-flow
   ```
2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```
3. **Set up environment variables**

   Create a `.env.local` file in the project root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. **Set up the database**

   Run the SQL script in `supabase_seed.sql` in your Supabase dashboard to create the necessary tables and policies.
5. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The application uses the following main tables:

- **`users`** - User account information
- **`snippets`** - Code snippets with metadata
- **`codeExecutions`** - Code execution history
- **`stars`** - User snippet stars/favorites
- **`snippetComments`** - Comments on snippets

All tables include proper Row Level Security (RLS) policies for data protection.

## Usage

### For New Users

1. **Sign Up** - Create an account to access all features
2. **Explore** - Browse existing code snippets
3. **Execute Code** - Try the code editor and execution features
4. **Create Snippets** - Save and share your code

### For Developers

1. **Write Code** - Use the Monaco editor with full syntax highlighting
2. **Execute** - Run your code in real-time with instant feedback
3. **Save & Share** - Create snippets and share with the community
4. **Collaborate** - Star snippets, leave comments, and engage with others

## Project Structure

```
code-editor/
├── app/
│   ├── _components/          # Shared UI components
│   ├── _constants/           # App constants and configurations
│   ├── (auth)/              # Authentication pages
│   ├── (site)/              # Main application pages
│   │   ├── profile/         # User profile pages
│   │   ├── snippets/        # Snippet management
│   │   └── page.tsx         # Home page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── lib/                     # Utility functions
├── store/                   # Zustand state management
├── types/                   # TypeScript type definitions
└── utils/                   # Helper utilities
```

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test your changes**
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed
- Follow the existing code style

Built with using Next.js, Supabase, and modern web technologies.

## Tech Stack

### Frontend

- **Next.js 15.5.3** - React framework with App Router
- **React 19** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework

### Backend & Database

- **Supabase** - Backend-as-a-Service with PostgreSQL database
- **Row Level Security (RLS)** - Database-level access control
- **Real-time Subscriptions** - Live updates for social features

### Code Execution

- **Piston API** - Remote code execution engine
- **Multi-language Support** - 40+ programming languages supported

### UI/UX

- **Lucide React** - Beautiful, consistent icon library
- **Framer Motion** - Smooth animations and transitions
- **Monaco Editor** - VS Code's editor component
- **React Syntax Highlighter** - Advanced syntax highlighting

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm, yarn, or pnpm
- A Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ragav2005/dev-flow.git
   cd dev-flow
   ```
2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```
3. **Set up environment variables**

   Create a `.env.local` file in the project root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. **Set up the database**

   Run the SQL script in `supabase_seed.sql` in your Supabase dashboard to create the necessary tables and policies.
5. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The application uses the following main tables:

- **`users`** - User account information
- **`snippets`** - Code snippets with metadata
- **`codeExecutions`** - Code execution history
- **`stars`** - User snippet stars/favorites
- **`snippetComments`** - Comments on snippets

All tables include proper Row Level Security (RLS) policies for data protection.

## Project Structure

```
code-editor/
├── app/
│   ├── _components/          # Shared UI components
│   ├── _constants/           # App constants and configurations
│   ├── (auth)/              # Authentication pages
│   ├── (site)/              # Main application pages
│   │   ├── profile/         # User profile pages
│   │   ├── snippets/        # Snippet management
│   │   └── page.tsx         # Home page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── lib/                     # Utility functions
├── store/                   # Zustand state management
├── types/                   # TypeScript type definitions
└── utils/                   # Helper utilities
```


Built with ❤️ using Next.js, Supabase, and modern web technologies.
