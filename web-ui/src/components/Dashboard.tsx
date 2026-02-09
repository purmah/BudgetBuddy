import React from 'react';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Calendar,
    AlertCircle
} from 'lucide-react';
import {useFinanceData} from '../hooks/useFinanceData';
import {useAuth} from '../hooks/useAuth';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend} from 'recharts';

const Dashboard: React.FC = () => {
    const {user} = useAuth();
    const {expenses, incomes, debts, investments, subscriptions} = useFinanceData(user?.id);
    // Load budget goals from localStorage
    const [budgetGoals, setBudgetGoals] = React.useState<any[]>(() => {
    const saved = localStorage.getItem('budgetbuddy_goals');
    return saved ? JSON.parse(saved) : [];
    });

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentMonthGoals = budgetGoals.filter((g: any) => g.month === currentMonth);

    // Calculate totals
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalDebts = debts.filter(debt => debt.status === 'Active').reduce((sum, debt) => sum + debt.amount, 0);
    const totalInvestments = investments.reduce((sum, investment) => sum + investment.amount, 0);
    const monthlySubscriptions = subscriptions.reduce((sum, sub) =>
        sum + (sub.billingCycle === 'Monthly' ? sub.amount : sub.amount / 12), 0
    );

    // Calculate net worth
    const netWorth = totalIncome - totalExpenses + totalInvestments - totalDebts;

    // Prepare data for expense trend chart (last 7 days)
    const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
    });

    const expenseChartData = last7Days.map(date => {
        const dayExpenses = expenses.filter(exp => 
            exp.createdDate.split('T')[0] === date
        );
        const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const dayName = new Date(date).toLocaleDateString('en-US', {weekday: 'short'});
        return {
            date: dayName,
            amount: total
        };
    });

    // Prepare data for category pie chart
    const categoryData: {[key: string]: number} = {};
    expenses.forEach(expense => {
        if (!categoryData[expense.category]) {
            categoryData[expense.category] = 0;
        }
        categoryData[expense.category] += expense.amount;
    });

    const pieChartData = Object.entries(categoryData).map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2))
    }));

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'];

    // Upcoming subscription payments (next 7 days)
    const upcomingPayments = subscriptions.filter(sub => {
        const nextPayment = new Date(sub.nextPaymentDate);
        const now = new Date();
        const diffTime = nextPayment.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    });

    const overdueDeyits = debts.filter(debt => {
        const repaymentDate = new Date(debt.repaymentDate);
        const now = new Date();
        return debt.status === 'Active' && repaymentDate < now;
    });

    const stats = [
        {
            title: 'Total Income',
            value: `$${totalIncome.toLocaleString('en-US', {minimumFractionDigits: 2})}`,
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            change: '+12.5%',
            changeColor: 'text-green-600'
        },
        {
            title: 'Total Expenses',
            value: `$${totalExpenses.toLocaleString('en-US', {minimumFractionDigits: 2})}`,
            icon: CreditCard,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            change: '-3.2%',
            changeColor: 'text-green-600'
        },
        {
            title: 'Active Debts',
            value: `$${totalDebts.toLocaleString('en-US', {minimumFractionDigits: 2})}`,
            icon: TrendingDown,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            change: overdueDeyits.length > 0 ? `${overdueDeyits.length} overdue` : 'On track',
            changeColor: overdueDeyits.length > 0 ? 'text-red-600' : 'text-green-600'
        },
        {
            title: 'Investments',
            value: `$${totalInvestments.toLocaleString('en-US', {minimumFractionDigits: 2})}`,
            icon: DollarSign,
            color: 'text-primary-600',
            bgColor: 'bg-primary-50',
            change: '+8.7%',
            changeColor: 'text-green-600'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Welcome back, {user?.account?.firstName}!</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Net Worth</p>
                    <p className={`text-2xl font-bold ${
                        netWorth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                        ${netWorth.toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index}
                             className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`}/>
                                </div>
                                <span className={`text-sm font-medium ${stat.changeColor}`}>
                  {stat.change}
                </span>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expense Trend Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense Trend (Last 7 Days)</h2>
                    {expenses.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={expenseChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#6b7280" style={{fontSize: '12px'}} />
                                <YAxis stroke="#6b7280" style={{fontSize: '12px'}} />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                    formatter={(value: any) => [`$${value.toFixed(2)}`, 'Spent']}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="amount" 
                                    stroke="#ef4444" 
                                    strokeWidth={2}
                                    dot={{fill: '#ef4444', r: 4}}
                                    activeDot={{r: 6}}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <p>No expense data to display</p>
                        </div>
                    )}
                </div>

                {/* Category Breakdown Pie Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h2>
                    {pieChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: $${entry.value}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                    formatter={(value: any) => `$${value.toFixed(2)}`}
                                />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{fontSize: '12px'}}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <p>No category data to display</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Alerts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alerts */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Reminders</h2>
                    <div className="space-y-4">
                        {overdueDeyits.length > 0 && (
                            <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5"/>
                                <div>
                                    <p className="text-sm font-medium text-red-900">Overdue Debts</p>
                                    <p className="text-sm text-red-700">
                                        You have {overdueDeyits.length} overdue
                                        debt{overdueDeyits.length > 1 ? 's' : ''} totaling
                                        ${overdueDeyits.reduce((sum, debt) => sum + debt.amount, 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {upcomingPayments.length > 0 && (
                            <div
                                className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <Calendar className="w-5 h-5 text-yellow-600 mt-0.5"/>
                                <div>
                                    <p className="text-sm font-medium text-yellow-900">Upcoming Payments</p>
                                    <p className="text-sm text-yellow-700">
                                        {upcomingPayments.length} subscription
                                        payment{upcomingPayments.length > 1 ? 's' : ''} due in the next 7 days
                                    </p>
                                </div>
                            </div>
                        )}

                        {overdueDeyits.length === 0 && upcomingPayments.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">No alerts at this time</p>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {/* Recent expenses */}
                        {expenses.slice(-3).reverse().map((expense) => (
                            <div key={expense.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                        <CreditCard className="w-4 h-4 text-red-600"/>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                                        <p className="text-xs text-gray-500">{expense.category}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-red-600">-${expense.amount.toFixed(2)}</span>
                            </div>
                        ))}

                        {/* Recent income */}
                        {incomes.slice(-2).reverse().map((income) => (
                            <div key={income.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-green-600"/>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{income.description}</p>
                                        <p className="text-xs text-gray-500">{income.category}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-green-600">+${income.amount.toFixed(2)}</span>
                            </div>
                        ))}

                        {expenses.length === 0 && incomes.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                        )}
                    </div>
                </div>
            </div>

            
    
    
        {/* Budget Goals Overview */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Budget Goals Progress</h2>
        <button
            onClick={() => window.location.reload()}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
            
        </button>
    </div>
    
    <div className="space-y-4">
        {currentMonthGoals.length > 0 ? (
            currentMonthGoals.map((goal: any) => {
                const [year, month] = goal.month.split('-');
                const categoryExpenses = expenses.filter(expense => {
                    const expenseDate = new Date(expense.createdDate);
                    return (
                        expense.category === goal.category &&
                        expenseDate.getFullYear() === parseInt(year) &&
                        expenseDate.getMonth() === parseInt(month) - 1
                    );
                });
                const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                const percentage = (spent / goal.limit) * 100;
                const progressColor = percentage >= 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500';

                return (
                    <div key={goal.id}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">{goal.category}</span>
                            <span className="text-sm text-gray-600">
                                ${spent.toFixed(2)} / ${goal.limit.toFixed(2)}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className={`${progressColor} h-2 rounded-full transition-all`} 
                                style={{width: `${Math.min(percentage, 100)}%`}}
                            ></div>
                        </div>
                        {percentage >= 100 && (
                            <p className="text-xs text-red-600 mt-1">⚠️ Over budget!</p>
                        )}
                    </div>
                );
            })
        ) : (
            <p className="text-sm text-gray-500 text-center py-4">
                Set budget goals to track your spending
            </p>
        )}
    </div>
</div>               

            {/* Monthly Subscription Cost */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Subscriptions</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-3xl font-bold text-gray-900">${monthlySubscriptions.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Total monthly subscription cost</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Active subscriptions</p>
                        <p className="text-xl font-semibold text-gray-900">{subscriptions.length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;