'use client';

import { Box, Typography } from '@mui/material';
import { Highlight, themes } from 'prism-react-renderer';
import { CopyButton } from './CopyButton';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({ code, language = 'text', showLineNumbers = false }: CodeBlockProps) {
  // 末尾の改行を削除
  const trimmedCode = code.replace(/\n$/, '');

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 1,
        overflow: 'hidden',
        my: 2,
        backgroundColor: '#1e1e1e',
      }}
    >
      {/* ヘッダー: 言語ラベルとコピーボタン */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 0.5,
          backgroundColor: '#2d2d2d',
          borderBottom: '1px solid #3d3d3d',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            textTransform: 'lowercase',
            fontFamily: 'monospace',
          }}
        >
          {language}
        </Typography>
        <CopyButton text={trimmedCode} />
      </Box>

      {/* コード本体 */}
      <Highlight theme={themes.vsDark} code={trimmedCode} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <Box
            component="pre"
            className={className}
            sx={{
              ...style,
              margin: 0,
              padding: 2,
              overflow: 'auto',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
            }}
          >
            {tokens.map((line, lineIndex) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { key: _lineKey, ...lineProps } = getLineProps({ line });
              return (
                <Box
                  key={lineIndex}
                  component="div"
                  {...lineProps}
                  sx={{
                    display: 'table-row',
                  }}
                >
                  {showLineNumbers && (
                    <Box
                      component="span"
                      sx={{
                        display: 'table-cell',
                        textAlign: 'right',
                        pr: 2,
                        userSelect: 'none',
                        opacity: 0.5,
                        minWidth: '2em',
                      }}
                    >
                      {lineIndex + 1}
                    </Box>
                  )}
                  <Box component="span" sx={{ display: 'table-cell' }}>
                    {line.map((token, tokenIndex) => {
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const { key: _tokenKey, ...tokenProps } = getTokenProps({ token });
                      return <span key={tokenIndex} {...tokenProps} />;
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Highlight>
    </Box>
  );
}
