import React from 'react'
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  Home as HomeIcon,
  Favorite as FavoriteIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { useFilters } from '../state/filters'

export const MobileNav: React.FC = () => {
  const { filters, setView } = useFilters()

  // Map active view to nav index for BottomNavigation
  const getNavValue = () => {
    switch (filters.view) {
      case 'macro':
        return 0
      case 'compare':
        return 1
      case 'recession-early-warning':
        return 2
      case 'fed-cycle':
        return 3
      default:
        return 0
    }
  }

  const handleNavigationChange = (newValue: number) => {
    switch (newValue) {
      case 0:
        setView('macro')
        break
      case 1:
        setView('compare')
        break
      case 2:
        setView('recession-early-warning')
        break
      case 3:
        setView('fed-cycle')
        break
      default:
        break
    }
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        borderTop: '1px solid',
        borderTopColor: 'divider',
      }}
      elevation={3}
    >
      <BottomNavigation
        value={getNavValue()}
        onChange={(_, newValue) => handleNavigationChange(newValue)}
        showLabels
        sx={{
          '& .MuiBottomNavigationAction-root': {
            minHeight: 56,
            fontSize: '0.7rem',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
        }}
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Compare" icon={<TrendingUpIcon />} />
        <BottomNavigationAction label="Recession" icon={<FavoriteIcon />} />
        <BottomNavigationAction label="Fed" icon={<SearchIcon />} />
      </BottomNavigation>
    </Paper>
  )
}
