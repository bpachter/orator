import { IconButton, Tooltip } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import type { FredObs } from '../../types'
import { downloadCSV, downloadMultiSeriesCSV } from '../../utils/export'

interface DownloadSingleProps {
  data: FredObs[]
  filename: string
  seriesName?: string
  size?: 'small' | 'medium'
}

export function DownloadButton({ data, filename, seriesName, size = 'small' }: DownloadSingleProps) {
  const handleClick = () => {
    if (!data.length) return
    downloadCSV(data, filename, seriesName)
  }
  return (
    <Tooltip title="Download CSV">
      <span>
        <IconButton size={size} onClick={handleClick} disabled={!data.length} aria-label="Download CSV">
          <FileDownloadIcon fontSize={size === 'small' ? 'small' : 'medium'} />
        </IconButton>
      </span>
    </Tooltip>
  )
}

interface DownloadMultiProps {
  series: Record<string, FredObs[]>
  filename: string
  size?: 'small' | 'medium'
}

export function DownloadMultiButton({ series, filename, size = 'small' }: DownloadMultiProps) {
  const handleClick = () => {
    if (!series || !Object.keys(series).length) return
    downloadMultiSeriesCSV(series, filename)
  }
  const hasData = series && Object.keys(series).length > 0
  return (
    <Tooltip title="Download all series as CSV">
      <span>
        <IconButton size={size} onClick={handleClick} disabled={!hasData} aria-label="Download all series CSV">
          <FileDownloadIcon fontSize={size === 'small' ? 'small' : 'medium'} />
        </IconButton>
      </span>
    </Tooltip>
  )
}
