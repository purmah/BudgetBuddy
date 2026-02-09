import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { useFinanceData } from '../hooks/useFinanceData';
import { useAuth } from '../hooks/useAuth';
import { ExpenseCategory } from '../types';

interface BudgetGoal {
    id: string;
    category: ExpenseCategory;
    limit: number;
    month: string; // Format: YYYY-MM
}

const BudgetGoals: React.FC = () => {
    const { user } = useAuth();
    const { expenses } = useFinanceData(user?.id);
    
    // Load budget goals from localStorage
    const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>(() => {
        const saved = localStorage.getItem('budgetbuddy_goals');
        return saved ? JSON.parse(saved) : [];
    });

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.Food);
    const [limit, setLimit] = useState('');

    const currentMonth = new Date().toISOString().slice(0, 7);

    // Save budget goals to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('budgetbuddy_goals', JSON.stringify(budgetGoals));
    }, [budgetGoals]);

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!limit) return;

        const newGoal: BudgetGoal = {
            id: Date.now().toString(),
            category,
            limit: parseFloat(limit),
            month: currentMonth
        };

        // Remove existing goal for same category/month if exists
        const filteredGoals = budgetGoals.filter(
            g => !(g.category === category && g.month === currentMonth)
        );

        setBudgetGoals([...filteredGoals, newGoal]);
        
        // Reset form
        setLimit('');
        setCategory(ExpenseCategory.Food);
        setShowForm(false);
    };

    // Delete a budget goal
    const deleteGoal = (id: string) => {
        setBudgetGoals(budgetGoals.filter(g => g.id !== id));
    };

    // Calculate total spending for a specific budget goal
    const getSpendingForGoal = (goal: BudgetGoal) => {
        const [year, month] = goal.month.split('-');
        
        const categoryExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.createdDate);
            return (
                expense.category === goal.category &&
                expenseDate.getFullYear() === parseInt(year) &&
                expenseDate.getMonth() === parseInt(month) - 1
            );
        });
        
        return categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    };

    // Get progress bar color based on percentage
    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return 'bg-red-500';
        if (percentage >= 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    // Get status icon based on percentage
    const getStatusIcon = (percentage: number) => {
        if (percentage >= 100) return <AlertCircle className="w-5 h-5 text-red-600" />;
        if (percentage >= 80) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    };

    // Filter goals for current month
    const currentMonthGoals = budgetGoals.filter(g => g.month === currentMonth);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Budget Goals</h1>
                    <p className="text-gray-600">Set spending limits and track your progress</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Current Month</p>
                    <p className="text-lg font-semibold text-gray-900">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Add Budget Goal Button */}
            <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
                <Plus className="w-4 h-4 mr-2" />
                Set Budget Goal
            </button>

            {/* Add Budget Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Set Budget Goal</h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Category Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    {Object.values(ExpenseCategory).map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Limit Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Monthly Limit ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={limit}
                                    onChange={(e) => setLimit(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="500.00"
                                    required
                                />
                            </div>

                            {/* Info Message */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                    This will set a budget limit for <strong>{category}</strong> expenses in{' '}
                                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
                                </p>
                            </div>

                            {/* Form Actions */}
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Set Goal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Budget Goals List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Active Budget Goals</h2>
                </div>
                
                <div className="p-6">
                    {currentMonthGoals.length === 0 ? (
                        // Empty State
                        <div className="text-center py-8">
                            <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">No budget goals set for this month</p>
                            <p className="text-sm text-gray-400 mt-1">Click "Set Budget Goal" to get started</p>
                        </div>
                    ) : (
                        // Goals List
                        <div className="space-y-6">
                            {currentMonthGoals.map((goal) => {
                                const spent = getSpendingForGoal(goal);
                                const percentage = (spent / goal.limit) * 100;
                                const remaining = goal.limit - spent;

                                return (
                                    <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                                        {/* Goal Header */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                {getStatusIcon(percentage)}
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{goal.category}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        ${spent.toFixed(2)} of ${goal.limit.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-3">
                                                <div className="text-right">
                                                    <p className={`text-sm font-medium ${
                                                        remaining >= 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {remaining >= 0 ? 'Remaining' : 'Over Budget'}
                                                    </p>
                                                    <p className={`text-lg font-bold ${
                                                        remaining >= 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        ${Math.abs(remaining).toFixed(2)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => deleteGoal(goal.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="relative">
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1 text-right">
                                                {percentage.toFixed(1)}% used
                                            </p>
                                        </div>

                                        {/* Warning Messages */}
                                        {percentage >= 100 && (
                                            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                                                <p className="text-sm text-red-800 font-medium">
                                                    ⚠️ You've exceeded your budget for {goal.category}!
                                                </p>
                                            </div>
                                        )}
                                        
                                        {percentage >= 80 && percentage < 100 && (
                                            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                <p className="text-sm text-yellow-800 font-medium">
                                                    ⚡ You're approaching your budget limit for {goal.category}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Stats */}
            {currentMonthGoals.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Budget */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <p className="text-sm text-gray-500 mb-1">Total Budget</p>
                        <p className="text-2xl font-bold text-gray-900">
                            ${currentMonthGoals.reduce((sum, g) => sum + g.limit, 0).toFixed(2)}
                        </p>
                    </div>

                    {/* Total Spent */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                        <p className="text-2xl font-bold text-blue-600">
                            ${currentMonthGoals.reduce((sum, g) => sum + getSpendingForGoal(g), 0).toFixed(2)}
                        </p>
                    </div>

                    {/* Goals On Track */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <p className="text-sm text-gray-500 mb-1">Goals On Track</p>
                        <p className="text-2xl font-bold text-green-600">
                            {currentMonthGoals.filter(g => (getSpendingForGoal(g) / g.limit) < 1).length} / {currentMonthGoals.length}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetGoals;