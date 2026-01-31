import { Box, Container, Typography } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          AI Code Assistant
        </Typography>
        <Typography variant="body1" color="text.secondary">
          コーディング支援AIチャットボット
        </Typography>
      </Box>
    </Container>
  );
}
