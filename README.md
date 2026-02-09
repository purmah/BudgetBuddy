# 💰 BudgetBuddy - Personal Finance Manager

A full-stack web application for managing personal finances, tracking expenses, and achieving budget goals.

## 🌟 Features

### Core Functionality
- **User Authentication** - Secure registration and login system
- **Expense Tracking** - Add, view, and categorize expenses with CSV export
- **Income Management** - Track multiple income sources
- **Budget Goals** - Set monthly spending limits with visual progress tracking
- **Debt Management** - Monitor debts and repayment schedules
- **Investment Portfolio** - Track investments and returns
- **Subscription Tracking** - Manage recurring payments

### Advanced Features
- **Interactive Charts** - Expense trends and category breakdowns using Recharts
- **Budget Progress Bars** - Color-coded warnings (green → yellow → red)
- **CSV Export** - Download expense data for analysis or tax purposes
- **Real-time Calculations** - Dynamic net worth and spending totals
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Recharts for data visualization
- Lucide React for icons
- Vite as build tool

### Backend
- Node.js with Express
- PostgreSQL database
- Sequelize ORM for database management
- JWT for authentication
- Bcrypt for password hashing

### Deployment
- Frontend & Backend: Render
- Database: Render PostgreSQL
- Version Control: Git/GitHub

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/purmah/BudgetBuddy.git
   cd BudgetBuddy
```

2. **Set up Backend**
```bash
   cd web-api
   npm install
```

3. **Configure Environment Variables**
   
   Create `.env` file in `web-api/` folder:
```env
   NODE_ENV=development
   PORT=5100
   
   # Database
   DATABASE_URL=postgresql://username:password@host:port/database
   
   # JWT
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRES_IN=7d
   
   # Email (optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_password
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100
```

4. **Set up Frontend**
```bash
   cd ../web-ui
   npm install
```

5. **Run the Application**
   
   Terminal 1 (Backend):
```bash
   cd web-api
   npm run dev
```
   
   Terminal 2 (Frontend):
```bash
   cd web-ui
   npm run dev
```

6. **Access the Application**
   
   Open browser: `http://localhost:5173`

## 📊 Database Schema

Main tables:
- **Users** - User authentication and profile data
- **Expenses** - Expense records with categories
- **Incomes** - Income sources and amounts
- **Debts** - Debt tracking with repayment schedules
- **Investments** - Investment portfolio data
- **Subscriptions** - Recurring payment management

## 🎯 Key Features

### Budget Goals
Set monthly spending limits for any category. The app:
- Tracks spending in real-time
- Shows progress bars with color-coded warnings
- Alerts when approaching or exceeding limits
- Persists goals across sessions

### CSV Export
Download expense data as spreadsheet for:
- Tax preparation
- Accounting purposes
- Data analysis in Excel/Google Sheets
- Importing to other financial software

### Data Visualization
- **Line Chart**: 7-day expense trend
- **Pie Chart**: Category-wise spending breakdown
- Real-time updates

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- HTTP-only cookies
- SQL injection protection via Sequelize
- Input validation on all forms
- Rate limiting on API endpoints
- SSL/TLS for database connections

## 🌐 Live Demo

**[View Live Application](#)** **

**Demo Credentials:**
- Email: `demo@budgetbuddy.com`
- Password: `demo123`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `DELETE /api/expenses/:id` - Delete expense

### Income, Debts, Investments, Subscriptions
Similar CRUD operations available for each resource.

## 🤝 Contributing

Suggestions and feedback are welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request


## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Icons from [Lucide React](https://lucide.dev/)
- Charts powered by [Recharts](https://recharts.org/)
- UI styling with [Tailwind CSS](https://tailwindcss.com/)
- Database hosting by [Render](https://render.com/)

---

**Built with ❤️ Harika**