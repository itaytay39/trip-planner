import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Tabs, Tab, AppBar } from '@mui/material';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import TravelPlanner from './components/TravelPlanner';
import BudgetTracker from './components/BudgetTracker';
import './styles/App.css';

// הגדרת RTL
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
});

const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    primary: { main: '#667eea' },
    secondary: { main: '#764ba2' }
  },
  typography: {
    fontFamily: 'Heebo, Arial, sans-serif'
  }
});

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ width: '100%', direction: 'rtl' }}>
          <AppBar position="static" sx={{ 
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              centered
              textColor="inherit"
              TabIndicatorProps={{
                style: { backgroundColor: 'white', height: 3 }
              }}
            >
              <Tab label="🗺️ תכנון מסלול" />
              <Tab label="💰 ניהול תקציב" />
            </Tabs>
          </AppBar>
          
          <TabPanel value={tabValue} index={0}>
            <TravelPlanner />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <BudgetTracker />
          </TabPanel>
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
