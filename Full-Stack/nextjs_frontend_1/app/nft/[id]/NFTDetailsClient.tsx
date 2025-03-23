'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineContent, TimelineDot, TimelineConnector } from '@mui/lab';

// Mock NFT data
const mockNFTs = {
  '1': {
    id: '1',
    title: 'Cosmic Voyager #1',
    image: 'https://images.unsplash.com/photo-1634193295627-1cdddf751ebf?w=500&q=80',
    price: '0.75 ETH',
    creator: 'CryptoArtist',
    description: 'A unique digital artwork exploring the depths of space and imagination.',
    properties: [
      { trait: 'Background', value: 'Deep Space' },
      { trait: 'Character', value: 'Astronaut' },
      { trait: 'Rarity', value: 'Legendary' },
    ],
    history: [
      { date: '2024-03-01', event: 'Listed', price: '0.75 ETH' },
      { date: '2024-02-15', event: 'Created', price: '-' },
    ],
  },
  '2': {
    id: '2',
    title: 'Digital Dreams',
    image: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=500&q=80',
    price: '1.2 ETH',
    creator: 'NFTMaster',
    description: 'An abstract representation of digital consciousness.',
    properties: [
      { trait: 'Style', value: 'Abstract' },
      { trait: 'Colors', value: 'Neon' },
      { trait: 'Rarity', value: 'Epic' },
    ],
    history: [
      { date: '2024-03-05', event: 'Listed', price: '1.2 ETH' },
      { date: '2024-03-01', event: 'Created', price: '-' },
    ],
  },
  '3': {
    id: '3',
    title: 'Abstract Future',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&q=80',
    price: '0.5 ETH',
    creator: 'DigitalGenius',
    description: 'A glimpse into the future of digital art.',
    properties: [
      { trait: 'Theme', value: 'Futuristic' },
      { trait: 'Medium', value: 'Digital' },
      { trait: 'Rarity', value: 'Rare' },
    ],
    history: [
      { date: '2024-03-03', event: 'Listed', price: '0.5 ETH' },
      { date: '2024-02-28', event: 'Created', price: '-' },
    ],
  },
  '4': {
    id: '4',
    title: 'Cyber Punk City',
    image: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=500&q=80',
    price: '2.0 ETH',
    creator: 'BlockchainArt',
    description: 'A cyberpunk interpretation of future cityscapes.',
    properties: [
      { trait: 'Setting', value: 'City' },
      { trait: 'Style', value: 'Cyberpunk' },
      { trait: 'Rarity', value: 'Mythic' },
    ],
    history: [
      { date: '2024-03-04', event: 'Listed', price: '2.0 ETH' },
      { date: '2024-02-20', event: 'Created', price: '-' },
    ],
  },
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`nft-tabpanel-${index}`}
      aria-labelledby={`nft-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface NFTDetailsClientProps {
  id: string;
}

export default function NFTDetailsClient({ id }: NFTDetailsClientProps) {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [nft, setNft] = useState<any>(null);

  useEffect(() => {
    // Simulate loading the NFT data
    setLoading(true);
    const nftData = mockNFTs[id as keyof typeof mockNFTs];
    
    if (nftData) {
      setNft(nftData);
      setLoading(false);
    } else {
      // Handle NFT not found
      setLoading(false);
    }
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!nft) {
    return (
      <Container>
        <Typography variant="h4" align="center" sx={{ mt: 4 }}>
          NFT not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Left column - Image */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box
              component="img"
              src={nft.image}
              alt={nft.title}
              sx={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </Paper>
        </Grid>

        {/* Right column - Details */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {nft.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Created by {nft.creator}
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" color="primary" gutterBottom>
              {nft.price}
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary" fullWidth>
                Buy Now
              </Button>
              <Button variant="outlined" color="primary" fullWidth>
                Make Offer
              </Button>
            </Box>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Paper sx={{ width: '100%' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="NFT information tabs"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Overview" />
                <Tab label="Properties" />
                <Tab label="History" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <Typography variant="body1">
                  {nft.description}
                </Typography>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={2}>
                  {nft.properties.map((prop: any, index: number) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {prop.trait}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {prop.value}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Timeline>
                  {nft.history.map((event: any, index: number) => (
                    <TimelineItem key={index}>
                      <TimelineSeparator>
                        <TimelineDot color="primary" />
                        {index < nft.history.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2">{event.event}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {event.date}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {event.price}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </TabPanel>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
} 