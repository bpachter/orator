import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { formatComboForDisplay } from '../../hooks/useKeyboardShortcuts'

export interface ShortcutEntry {
  combo: string
  description: string
  group?: string
}

interface KeyboardShortcutsDialogProps {
  open: boolean
  onClose: () => void
  shortcuts: ShortcutEntry[]
}

function Kbd({ combo }: { combo: string }) {
  return (
    <Box
      component="kbd"
      sx={{
        px: 0.75,
        py: 0.25,
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.default',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        color: 'text.primary',
        minWidth: 22,
        textAlign: 'center',
      }}
    >
      {formatComboForDisplay(combo)}
    </Box>
  )
}

export function KeyboardShortcutsDialog({ open, onClose, shortcuts }: KeyboardShortcutsDialogProps) {
  const groups = new Map<string, ShortcutEntry[]>()
  for (const s of shortcuts) {
    const key = s.group ?? 'General'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(s)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        Keyboard shortcuts
        <IconButton size="small" onClick={onClose} aria-label="Close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {Array.from(groups.entries()).map(([groupName, items]) => (
            <Box key={groupName}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>{groupName}</Typography>
              <Stack spacing={1}>
                {items.map((item) => (
                  <Stack key={item.combo} direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {item.description}
                    </Typography>
                    <Kbd combo={item.combo} />
                  </Stack>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
