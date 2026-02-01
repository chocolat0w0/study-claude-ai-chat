'use client';

import { Box, Typography } from '@mui/material';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';

interface DiffViewerProps {
  oldValue: string;
  newValue: string;
  oldTitle?: string;
  newTitle?: string;
  splitView?: boolean;
  showDiffOnly?: boolean;
}

const customStyles = {
  variables: {
    dark: {
      diffViewerBackground: '#1e1e1e',
      diffViewerColor: '#d4d4d4',
      addedBackground: '#1e3a1e',
      addedColor: '#d4d4d4',
      removedBackground: '#3a1e1e',
      removedColor: '#d4d4d4',
      wordAddedBackground: '#2e5d2e',
      wordRemovedBackground: '#5d2e2e',
      addedGutterBackground: '#1e3a1e',
      removedGutterBackground: '#3a1e1e',
      gutterBackground: '#2d2d2d',
      gutterBackgroundDark: '#262626',
      highlightBackground: '#2a2d2e',
      highlightGutterBackground: '#2a2d2e',
      codeFoldGutterBackground: '#2d2d2d',
      codeFoldBackground: '#262626',
      emptyLineBackground: '#1e1e1e',
      gutterColor: '#858585',
      addedGutterColor: '#85b685',
      removedGutterColor: '#b68585',
      codeFoldContentColor: '#858585',
      diffViewerTitleBackground: '#2d2d2d',
      diffViewerTitleColor: '#d4d4d4',
      diffViewerTitleBorderColor: '#3d3d3d',
    },
  },
  line: {
    padding: '4px 8px',
    fontSize: '13px',
    fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
  },
  gutter: {
    minWidth: '40px',
    padding: '0 8px',
  },
  contentText: {
    fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
  },
};

export function DiffViewer({
  oldValue,
  newValue,
  oldTitle = '変更前',
  newTitle = '変更後',
  splitView = true,
  showDiffOnly = false,
}: DiffViewerProps) {
  return (
    <Box
      sx={{
        borderRadius: 1,
        overflow: 'hidden',
        my: 2,
        border: '1px solid #3d3d3d',
      }}
    >
      {/* タイトル */}
      <Box
        sx={{
          display: 'flex',
          backgroundColor: '#2d2d2d',
          borderBottom: '1px solid #3d3d3d',
        }}
      >
        <Box sx={{ flex: 1, px: 2, py: 1, borderRight: splitView ? '1px solid #3d3d3d' : 'none' }}>
          <Typography variant="caption" color="text.secondary">
            {oldTitle}
          </Typography>
        </Box>
        {splitView && (
          <Box sx={{ flex: 1, px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {newTitle}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Diff本体 */}
      <ReactDiffViewer
        oldValue={oldValue}
        newValue={newValue}
        splitView={splitView}
        useDarkTheme={true}
        styles={customStyles}
        compareMethod={DiffMethod.WORDS}
        showDiffOnly={showDiffOnly}
        hideLineNumbers={false}
      />
    </Box>
  );
}
