import { useEffect } from 'react'

export interface KeyboardShortcut {
  /** Comma-separated tokens. Examples: 'Alt+1', 'Mod+K', 'Mod+E', '?'. 'Mod' = Meta on Mac, Ctrl on Windows/Linux. */
  combo: string
  description: string
  handler: (event: KeyboardEvent) => void
  /** Allow the shortcut to fire even when an input/textarea has focus. Defaults to false. */
  allowInInputs?: boolean
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.platform)

function matchesCombo(event: KeyboardEvent, combo: string): boolean {
  const tokens = combo.split('+').map((t) => t.trim().toLowerCase())
  const wantMod = tokens.includes('mod') || tokens.includes('cmd') || tokens.includes('ctrl')
  const wantShift = tokens.includes('shift')
  const wantAlt = tokens.includes('alt') || tokens.includes('option')
  const key = tokens.filter((t) => !['mod', 'cmd', 'ctrl', 'shift', 'alt', 'option'].includes(t))[0]
  if (!key) return false
  const modPressed = isMac ? event.metaKey : event.ctrlKey
  if (wantMod !== modPressed) return false
  if (wantShift !== event.shiftKey) return false
  if (wantAlt !== event.altKey) return false
  return event.key.toLowerCase() === key.toLowerCase()
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return false
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const editable = isEditableTarget(event.target)
      for (const shortcut of shortcuts) {
        if (editable && !shortcut.allowInInputs) continue
        if (matchesCombo(event, shortcut.combo)) {
          event.preventDefault()
          shortcut.handler(event)
          return
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcuts])
}

export function formatComboForDisplay(combo: string): string {
  return combo
    .split('+')
    .map((t) => t.trim())
    .map((t) => {
      const lower = t.toLowerCase()
      if (lower === 'mod') return isMac ? '⌘' : 'Ctrl'
      if (lower === 'cmd') return '⌘'
      if (lower === 'ctrl') return 'Ctrl'
      if (lower === 'shift') return isMac ? '⇧' : 'Shift'
      if (lower === 'alt' || lower === 'option') return isMac ? '⌥' : 'Alt'
      return t.length === 1 ? t.toUpperCase() : t
    })
    .join(isMac ? '' : '+')
}
