"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  useTheme,
  TextField,
} from '@mui/material';
import useAuthStore from './store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CookieConsent from './components/CookieConsent';

const bannerImages = [
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80', // Financial dashboard
  'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=1600&q=80', // API and code visualization
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80', // Digital technology
];

const featuredCategories = [
  {
    title: 'Payment Integration',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&q=80',
    link: '/category/payment-integration',
  },
  {
    title: 'Banking APIs',
    image: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=500&q=80',
    link: '/category/banking-apis',
  },
  {
    title: 'Data Analytics',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80',
    link: '/category/data-analytics',
  },
  {
    title: 'Security & Compliance',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&q=80',
    link: '/category/security-compliance',
  },
];

interface Product {
  id?: string;
  title: string;
  image: string;
  price: string;
  creator: string;
}

const featuredProducts: Product[] = [
  {
    id: '1',
    title: 'Solana DeFi Package',
    image: 'https://images.unsplash.com/photo-1634193295627-1cdddf751ebf?w=500&q=80',
    price: '75 SOL',
    creator: 'SolanaLabs',
  },
  {
    id: '2',
    title: 'XRP Enterprise Suite',
    image: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=500&q=80',
    price: '1200 XRP',
    creator: 'RipplePro',
  },
  {
    id: '3',
    title: 'Solana Smart Contract Pack',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&q=80',
    price: '50 SOL',
    creator: 'SolanaGenius',
  },
  {
    id: '4',
    title: 'XRP Payment Gateway',
    image: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=500&q=80',
    price: '2000 XRP',
    creator: 'RippleChain',
  },
];

const adSections = [
  {
    title: 'Limited Time Offer',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&q=80',
    description: 'Get 20% off on all electronics',
    buttonText: 'Shop Now',
  },
  {
    title: 'New Collection',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
    description: 'Explore our latest fashion arrivals',
    buttonText: 'Discover More',
  },
];

const features = [
  {
    icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
    title: 'Free Shipping',
    description: 'On orders over $50',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    title: 'Secure Payments',
    description: '100% secure payment',
  },
  {
    icon: <SupportAgentIcon sx={{ fontSize: 40 }} />,
    title: '24/7 Support',
    description: 'Dedicated support',
  },
  {
    icon: <CreditCardIcon sx={{ fontSize: 40 }} />,
    title: 'Easy Returns',
    description: '30 days return policy',
  },
];

const MotionContainer = motion(Container);
const MotionCard = motion(Card);

// Update wireframe images to more relevant ones
const wireframeImages = {
  mobile: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=80', // Lady with debit card shopping
  dashboard: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', // Financial dashboard with charts
};

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [imageError, setImageError] = useState(false);

  // Add error handling for images
  const handleImageError = (e: any) => {
    console.error('Image failed to load:', e);
    setImageError(true);
  };

  // Add loading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/auth/register');
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 0 }}>
      {/* Hero Section with Wireframes */}
      <Box sx={{ 
        bgcolor: '#f8fafc',
        pt: 0,
        mt: 0,
        pb: { xs: 4, sm: 6, md: 8 },
        position: 'relative',
        marginTop:-16,
        overflow: 'hidden',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <Container maxWidth="lg" sx={{ pt: 0 }}>
          <Grid container spacing={4} alignItems="center">
            {/* Left Column - Content */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ paddingTop: 0 }}
              >
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                    lineHeight: 1.2,
                    background: 'linear-gradient(45deg, #1976d2, #00a0b2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Low-Code Financial API Integration Platform
                </Typography>
                <Typography
                  variant="h5"
                  color="text.secondary"
                  paragraph
                  sx={{ 
                    mb: 4,
                    lineHeight: 1.6,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  }}
                >
                  Build, integrate, and deploy financial services in minutes, not months. 
                  ProdxCloud simplifies complex financial API integrations with our powerful 
                  low-code modeling platform.
                </Typography>

                {/* Feature Points */}
                <Box sx={{ mb: 4 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.8rem',
                          }}
                        >
                          1
                        </Box>
                        <Typography variant="body1">
                          Drag-and-drop API modeling
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.8rem',
                          }}
                        >
                          2
                        </Box>
                        <Typography variant="body1">
                          Pre-built financial connectors
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.8rem',
                          }}
                        >
                          3
                        </Box>
                        <Typography variant="body1">
                          Real-time data processing
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.8rem',
                          }}
                        >
                          4
                        </Box>
                        <Typography variant="body1">
                          Automated compliance checks
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Subscription Form */}
                <Box
                  component="form"
                  onSubmit={handleSubscribe}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    mb: 4,
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}
                >
                  <TextField
                    fullWidth
                    type="email"
                    placeholder="Enter your work email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ 
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      minWidth: { xs: '100%', sm: 'auto' },
                      px: 4,
                      bgcolor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    }}
                  >
                    Start Free Trial
                  </Button>
                </Box>

                {/* Trust Indicators */}
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon color="primary" />
                    <Typography variant="body2">Bank-grade Security</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SupportAgentIcon color="primary" />
                    <Typography variant="body2">24/7 API Support</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CreditCardIcon color="primary" />
                    <Typography variant="body2">99.9% Uptime SLA</Typography>
                  </Box>
                </Box>
              </motion.div>
            </Grid>

            {/* Right Column - Wireframes */}
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', height: { xs: 400, sm: 500, md: 600 } }}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <Box
                    component="img"
                    src={imageError ? '/placeholder.jpg' : wireframeImages.dashboard}
                    alt="Financial Dashboard Demo"
                    onError={handleImageError}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 2,
                      boxShadow: theme.shadows[10],
                      bgcolor: 'white',
                      p: 0,
                    }}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  style={{
                    position: 'absolute',
                    bottom: -20,
                    left: -20,
                    width: '35%',
                    height: '70%',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '8px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  }}
                >
                  <Box
                    component="img"
                    src={wireframeImages.mobile}
                    alt="Financial Mobile App"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                  />
                </motion.div>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Hero Slider */}
      <Box sx={{ 
        position: 'relative',
        mb: { xs: 4, sm: 5, md: 6 },
        height: { xs: '60vh', sm: '70vh', md: '80vh' },
        minHeight: { xs: 400, sm: 500, md: 600 },
      }}>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          loop
          style={{ height: '100%' }}
        >
          {bannerImages.map((image, index) => (
            <SwiperSlide key={index}>
              <Box
                sx={{
                  height: '100%',
                  background: `url(${image}) center/cover no-repeat`,
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                  },
                }}
              >
                <Container 
                  sx={{ 
                    position: 'relative', 
                    color: 'white',
                    py: { xs: 4, sm: 6, md: 8 },
                  }}
                >
                  <Typography
                    variant="h2"
                    component={motion.h2}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    gutterBottom
                  >
                    Welcome to ProdxCloud
                  </Typography>
                  <Typography
                    variant="h5"
                    component={motion.h5}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    gutterBottom
                  >
                    Discover amazing products at great prices
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    component={motion.button}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ mt: 2 }}
                  >
                    Shop Now
                  </Button>
                </Container>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* Featured Products Section */}
      <Container maxWidth="lg" sx={{ 
        my: { xs: 6, sm: 8, md: 10 },
        '& > .MuiGrid-root': {
          mt: { xs: 4, sm: 6 }
        }
      }}>
        <Typography
          variant="h4"
          component={motion.h4}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          gutterBottom
          align="center"
          sx={{ mb: 4 }}
        >
          Featured Products
        </Typography>
        <Grid container spacing={4}>
          {featuredProducts.map((product, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    transition: 'transform 0.3s ease',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  },
                }}
                onClick={() => handleProductClick(product.id || (index + 1).toString())}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="300"
                    image={product.image}
                    alt={product.title}
                    sx={{
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.875rem',
                    }}
                  >
                    {product.price}
                  </Box>
                </Box>
                <CardContent>
                  <Typography gutterBottom variant="h6">
                    {product.title}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    by {product.creator}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="h6" color="primary">
                      {product.price}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product.id || (index + 1).toString());
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Ad Sections */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {adSections.map((ad, index) => (
              <Grid item xs={12} md={6} key={index}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  sx={{
                    position: 'relative',
                    height: 300,
                    overflow: 'hidden',
                    '&:hover img': {
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    image={ad.image}
                    alt={ad.title}
                    sx={{
                      height: '100%',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 3,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      color: 'white',
                    }}
                  >
                    <Typography variant="h5" gutterBottom>
                      {ad.title}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {ad.description}
                    </Typography>
                    <Button variant="contained" color="primary">
                      {ad.buttonText}
                    </Button>
                  </Box>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <MotionContainer
        maxWidth="lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        sx={{ mb: 6 }}
      >
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                }}
              >
                {feature.icon}
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </MotionContainer>

      {/* Featured Categories */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component={motion.h4}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            gutterBottom
            align="center"
            sx={{ mb: 4 }}
          >
            Featured Categories
          </Typography>
          <Grid container spacing={4}>
            {featuredCategories.map((category, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      transition: 'transform 0.3s ease',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={category.image}
                    alt={category.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      {category.title}
                    </Typography>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Newsletter Section */}
      <Box
        sx={{
          bgcolor: theme.palette.primary.main,
          color: 'white',
          py: 6,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4"
            component={motion.h4}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            gutterBottom
          >
            Subscribe to Our Newsletter
          </Typography>
          <Typography
            variant="subtitle1"
            component={motion.p}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            gutterBottom
          >
            Get updates about new products and special offers
          </Typography>
          <Box
            component={motion.form}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            sx={{
              display: 'flex',
              gap: 2,
              maxWidth: 500,
              margin: '0 auto',
              mt: 3,
            }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                flex: 1,
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
              }}
            />
            <Button variant="contained" color="secondary" size="large">
              Subscribe
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Cookie Consent */}
      <CookieConsent />
    </Box>
  );
}
