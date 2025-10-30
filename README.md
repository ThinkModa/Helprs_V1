# Helprs - Multi-Tenant SaaS Workforce Management Platform

A comprehensive workforce management platform built with Next.js 15, TypeScript, Supabase, and Tailwind CSS. This platform provides multi-tenant isolation through application-level security and includes user management, company management, and a modern dashboard interface.

## Features

- **Multi-Tenant Architecture**: Application-level tenant isolation without RLS
- **Authentication**: Email/password authentication with Supabase Auth
- **User Management**: Create, manage, and assign roles to users
- **Company Management**: Multi-company support with role-based access
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Type Safety**: Full TypeScript support throughout the application
- **Environment Configuration**: Support for multiple environments (dev/staging/prod)

## Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd Helprs_V1
npm install
```

### 2. Set up Supabase

1. Create a new project in [Supabase](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp env.example .env.local
```

**Update your `.env.local` file with your real Supabase credentials:**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-if-needed
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Helprs
NODE_ENV=development
```

To obtain these credentials:
1. Go to your Supabase project dashboard (https://app.supabase.com/project/YOUR_PROJECT_ID)
2. Find Project URL (use for `NEXT_PUBLIC_SUPABASE_URL`) and anon public key (use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in Settings ➔ API.
3. Replace the placeholder values above with your **real project**'s credentials.

### 3. Set up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL commands from `supabase-schema.sql` to create the database schema

### 4. Configure Authentication

1. In Supabase dashboard, go to Authentication > Settings
2. Configure your site URL: `http://localhost:3000`
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/reset-password`

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication pages
│   ├── register/
│   ├── forgot-password/
│   └── reset-password/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form components
│   └── layout/          # Layout components
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
│   ├── database/        # Database service layer
│   ├── supabase/        # Supabase configuration
│   └── utils.ts         # Utility functions
└── types/               # TypeScript type definitions
```

## Database Schema

The application uses a multi-tenant architecture with the following main tables:

- **companies**: Stores company information
- **profiles**: User profile information (extends Supabase auth.users)
- **company_users**: Junction table for user-company relationships with roles

## Multi-Tenant Security

This application implements **application-level tenant isolation** rather than Row Level Security (RLS). All database queries are filtered by company_id at the application level, ensuring proper data isolation between tenants.

## Environment Configuration

The application supports multiple environments:

- **Development**: `NODE_ENV=development`
- **Staging**: `NODE_ENV=staging` 
- **Production**: `NODE_ENV=production`

Each environment should have its own Supabase project and environment variables.

## Key Features

### Authentication
- Email/password registration and login
- Password reset functionality
- Protected routes with middleware

### User Management
- Create and manage user accounts
- Assign users to companies with specific roles
- Role-based access control (Owner, Admin, Manager, Employee)

### Company Management
- Multi-company support
- Company switching in the dashboard
- Company-specific user management

### Dashboard
- Modern, responsive dashboard interface
- Company selection and switching
- User statistics and activity overview
- Quick actions and recent activity

## Development

### Adding New Features

1. Create database tables in `supabase-schema.sql`
2. Add TypeScript types in `src/types/`
3. Create database service methods in `src/lib/database/`
4. Build UI components in `src/components/`
5. Add pages in `src/app/`

### Database Service Layer

The application uses a service layer pattern for database operations:

```typescript
// Example: UserService
const userService = new UserService()
const users = await userService.getUsersByCompany(companyId)
```

### Styling

The application uses Tailwind CSS with a custom design system. UI components are built with consistent styling and can be customized through CSS variables.

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.