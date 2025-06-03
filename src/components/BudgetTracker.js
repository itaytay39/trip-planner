import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const BudgetTracker = () => {
  const [budget, setBudget] = useState(5000);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    category: 'תחבורה',
    amount: '',
    description: ''
  });

  const categories = [
    { name: 'תחבורה', color: '#8884d8', icon: '🚗' },
    { name: 'לינה', color: '#82ca9d', icon: '🏨' },
    { name: 'אוכל', color: '#ffc658', icon: '🍽️' },
    { name: 'אטרקציות', color: '#ff7300', icon: '🎢' },
    { name: 'קניות', color: '#0088fe', icon: '🛍️' }
  ];

  const handleAddExpense = () => {
    if (newExpense.amount > 0 && newExpense.description.trim()) {
      const expense = {
        ...newExpense,
        amount: Number(newExpense.amount),
        date: new Date().toLocaleDateString('he-IL'),
        id: Date.now()
      };
      
      setExpenses([...expenses, expense]);
      setNewExpense({ category: 'תחבורה', amount: '', description: '' });
    }
  };

  const calculateTotalSpent = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const calculateRemaining = () => {
    return budget - calculateTotalSpent();
  };

  const getProgressPercentage = () => {
    return (calculateTotalSpent() / budget) * 100;
  };

  const getExpensesByCategory = () => {
    const categoryTotals = {};
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    return categories.map(cat => ({
      name: cat.name,
      value: categoryTotals[cat.name] || 0,
      color: cat.color,
      icon: cat.icon
    })).filter(cat => cat.value > 0);
  };

  return (
    <Box sx={{ p: 3, direction: 'rtl' }}>
      <Typography variant="h4" gutterBottom sx={{ 
        fontWeight: 700,
        color: '#2c3e50',
        textAlign: 'center',
        mb: 4
      }}>
        💰 ניהול תקציב נסיעה
      </Typography>

      <Grid container spacing={3}>
        {/* סיכום תקציב */}
        <Grid item xs={12} md={6}>
          <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 סיכום תקציב
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="תקציב כולל (₪)"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    נוצל: ₪{calculateTotalSpent().toLocaleString()} מתוך ₪{budget.toLocaleString()}
                  </Typography>
                </Box>
                
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(getProgressPercentage(), 100)}
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getProgressPercentage() > 90 ? '#f44336' : 
                                      getProgressPercentage() > 70 ? '#ff9800' : '#4caf50'
                    }
                  }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Chip 
                    label={`נותר: ₪${calculateRemaining().toLocaleString()}`}
                    color={calculateRemaining() > 0 ? 'success' : 'error'}
                    size="small"
                  />
                  <Chip 
                    label={`${getProgressPercentage().toFixed(1)}%`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* הוספת הוצאה */}
        <Grid item xs={12} md={6}>
          <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ➕ הוסף הוצאה חדשה
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>קטגוריה</InputLabel>
                    <Select
                      value={newExpense.category}
                      label="קטגוריה"
                      onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat.name} value={cat.name}>
                          {cat.icon} {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="סכום (₪)"
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="תיאור"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddCircleIcon />}
                    onClick={handleAddExpense}
                    disabled={!newExpense.amount || !newExpense.description.trim()}
                    sx={{
                      borderRadius: '25px',
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #764ba2, #667eea)',
                      }
                    }}
                  >
                    הוסף הוצאה
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* גרף התפלגות הוצאות */}
        {getExpensesByCategory().length > 0 && (
          <Grid item xs={12} md={6}>
            <Card elevation={4} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📈 התפלגות הוצאות
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getExpensesByCategory()}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({name, value}) => `${name}: ₪${value}`}
                    >
                      {getExpensesByCategory().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₪${value}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* רשימת הוצאות */}
        {expenses.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card elevation={4} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📝 הוצאות אחרונות
                </Typography>
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {expenses.slice(-5).reverse().map((expense) => (
                    <Box key={expense.id} sx={{ 
                      p: 2, 
                      mb: 1, 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {categories.find(c => c.name === expense.category)?.icon} {expense.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {expense.category} • {expense.date}
                        </Typography>
                      </Box>
                      <Typography variant="h6" color="primary">
                        ₪{expense.amount}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default BudgetTracker;
