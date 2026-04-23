import { useState } from 'react'
import {
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useFilters } from '../../state/filters'
import { useSavedViews } from '../../state/savedViews'

export function SavedViewsMenu() {
  const { filters, setFilters } = useFilters()
  const { views, saveView, removeView } = useSavedViews()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [name, setName] = useState('')

  const open = Boolean(anchorEl)
  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const handleSave = () => {
    saveView({ name, view: filters.view, range: filters.range })
    setName('')
  }

  const handleLoad = (view: typeof views[number]) => {
    setFilters({ view: view.view, range: view.range })
    handleClose()
  }

  return (
    <>
      <Tooltip title="Saved views" arrow>
        <IconButton
          size="small"
          onClick={handleOpen}
          aria-label="Saved views"
          sx={{ color: 'text.secondary' }}
        >
          <BookmarkIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{ paper: { sx: { minWidth: 280, maxWidth: 360 } } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.25 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Save current view</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder={`${filters.view} · ${filters.range}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSave()
                }
              }}
              fullWidth
            />
            <Tooltip title="Save view" arrow>
              <span>
                <IconButton size="small" onClick={handleSave} aria-label="Save view">
                  <BookmarkAddIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Box>

        <Divider />

        {views.length === 0 ? (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              No saved views yet. Save the current dashboard above.
            </Typography>
          </Box>
        ) : (
          views.map((v) => (
            <MenuItem key={v.id} onClick={() => handleLoad(v)}>
              <ListItemIcon>
                <BookmarkIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText
                primary={v.name}
                secondary={`${v.view} · ${v.range}`}
                primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  removeView(v.id)
                }}
                aria-label={`Remove ${v.name}`}
                sx={{ ml: 1 }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  )
}
