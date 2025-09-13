# Rate Card Calculator

A professional resource planning application that calculates custom resource rates and SWAT team rates with live currency conversion, email quote functionality, and PDF export capabilities.

## 🚀 Features

### Core Functionality
- **Custom Resource Calculator**: Calculate rates based on region, role, and seniority level
- **SWAT Team Calculator**: Specialized calculator for SWAT team rates with workload and duration options
- **Live Currency Conversion**: Real-time exchange rates from multiple APIs
- **Email Quote System**: Send professional quotes via email using SendGrid
- **PDF Export**: Generate text-based PDF quotes for both calculator types
- **Dark/Light Theme**: Toggle between dark and light modes with persistent preferences

### Technical Features
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Data**: Live currency rates and dynamic calculations
- **Professional UI**: Modern interface with Radix UI components
- **Type Safety**: Full TypeScript implementation
- **Database Integration**: Supabase for data persistence
- **Email Integration**: SendGrid for professional email delivery

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI framework
- **TypeScript 5.6.3** - Type safety
- **Vite 5.4.19** - Build tool and dev server
- **Tailwind CSS 3.4.17** - Styling framework
- **Radix UI** - Accessible component library
- **TanStack Query 5.60.5** - Data fetching and caching
- **Wouter 3.3.5** - Client-side routing

### Backend
- **Node.js 20** - Runtime environment
- **Express 4.21.2** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM 0.39.1** - Database ORM
- **Supabase 2.57.4** - Backend-as-a-Service

### External Services
- **SendGrid 8.1.5** - Email delivery service
- **Live Currency APIs** - Real-time exchange rates
- **Supabase** - Database and storage

### Development Tools
- **ESBuild 0.25.0** - JavaScript bundler
- **PostCSS 8.4.47** - CSS processing
- **Autoprefixer 10.4.20** - CSS vendor prefixes
- **Drizzle Kit 0.30.4** - Database migrations

## 📦 Installation

### Prerequisites
- Node.js 20 or higher
- npm or yarn package manager
- Supabase account
- SendGrid account

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/abuzarmughis95/Rate-Card-Calculator.git
   cd RateCardReplica
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   DATABASE_URL=
   SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=

   # Email Service
   SENDGRID_API_KEY=
   SENDGRID_FROM_EMAIL=
   ```

4. **Initialize Database**
   ```bash
   npm run init-supabase
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes
- `npm run init-supabase` - Initialize Supabase with sample data

## 🏗️ Project Structure

```
RateCardReplica/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/         # Reusable UI components
│   │   │   └── layout/     # Layout components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   └── pages/          # Page components
│   └── index.html          # HTML entry point
├── server/                 # Backend Express application
│   ├── services/           # Business logic services
│   └── routes.ts           # API routes
├── shared/                 # Shared TypeScript types
└── package.json            # Dependencies and scripts
```

## 🔧 Configuration

### Currency APIs
The application uses below API for currency conversion:
- exchangerate-api.com

### Database Schema
- **Regions**: Geographic regions with multipliers
- **Roles**: Job roles with base rates
- **Seniority Levels**: Experience levels with multipliers
- **Currencies**: Live exchange rates

### Email Templates
Professional HTML email templates for quote delivery with:
- Company branding
- Detailed rate calculations
- Contact information
- Terms and conditions

## 📱 Mobile Responsiveness

The application is fully responsive with:
- Mobile-first design approach
- Touch-friendly interface elements
- Optimized layouts for small screens
- Responsive typography and spacing
- Mobile-specific UI adjustments

## 🎨 Theming

### Dark Mode
- Professional black theme
- High contrast for readability
- Consistent color scheme
- Smooth transitions

### Light Mode
- Clean white theme
- Professional appearance
- Optimized for daylight use
- Accessible color combinations

## 🔒 Security

- Environment variable protection
- Input validation with Zod
- Secure API endpoints
- Row-level security with Supabase
- Email validation and sanitization

## 📊 Performance

- **Code Splitting**: Optimized bundle sizes
- **Lazy Loading**: Components loaded on demand
- **Caching**: TanStack Query for data caching
- **Optimized Images**: Efficient asset delivery
- **Minimal Dependencies**: Lean dependency tree

## 🧪 Testing

The application includes comprehensive test coverage:
- Component testing with data-testid attributes
- API endpoint testing
- Currency conversion validation
- Email delivery testing
- PDF generation testing

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
Ensure all required environment variables are set in production:
- Database connection strings
- API keys for external services
- Email configuration
- Port configuration

## 📈 Monitoring

- Error logging and tracking
- Performance monitoring
- API response time tracking
- User interaction analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub
- Contact the development team

## 🔄 Version History

### v1.0.0
- Initial release
- Custom resource calculator
- SWAT team calculator
- Live currency conversion
- Email quote system
- PDF export functionality
- Dark/light theme support
- Mobile responsiveness
- Professional UI/UX

---

**Built with ❤️ using modern web technologies.**
