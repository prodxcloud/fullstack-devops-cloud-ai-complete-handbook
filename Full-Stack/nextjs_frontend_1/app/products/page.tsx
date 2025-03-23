'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Paper,
  Chip,
  CardActions,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Rating,
  Skeleton,
  useTheme,
  Alert,
  CircularProgress,
} from '@mui/material';
import useProductStore from '../store/productStore';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingOverlay from '../components/LoadingOverlay';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';

const categories = [
  'All Products',
  'Electronics',
  'Fashion',
  'Home & Living',
  'Sports',
  'Books',
];

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Popular', value: 'popular' },
];

const cryptoAds = [
  {
    title: 'Bitcoin',
    subtitle: 'Leading Digital Currency',
    icon: <CurrencyBitcoinIcon sx={{ fontSize: 40 }} />,
    color: '#F7931A',
  },
  {
    title: 'Ethereum',
    subtitle: 'Smart Contract Platform',
    icon: <ShowChartIcon sx={{ fontSize: 40 }} />,
    color: '#627EEA',
  },
  {
    title: 'XRP',
    subtitle: 'Fast Global Payments',
    icon: <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />,
    color: '#00827F',
  },
  {
    title: 'DeFi',
    subtitle: 'Decentralized Finance',
    icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
    color: '#FF6B6B',
  },
];

const featuredProducts = [
  {
    id: 'featured-1',
    name: 'Premium API Package',
    description: 'Enterprise-grade API integration suite',
    price: 999.99,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80',
  },
  {
    id: 'featured-2',
    name: 'Developer Toolkit',
    description: 'Complete development environment setup',
    price: 499.99,
    thumbnail: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=500&q=80',
  },
  {
    id: 'featured-3',
    name: 'Analytics Dashboard',
    description: 'Real-time data visualization platform',
    price: 299.99,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80',
  },
];

const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);

interface Product {
  id: string;
  name: string;
  desc?: string;
  price?: number;
  default_price?: string | null | number;
  images?: string[];
  thumbnail?: string;
  active?: boolean;
  stripe_product_id?: string;
  tags?: string[];
  quantity?: number;
  created_at?: string;
  updated_at?: string;
}

export default function ProductsPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { products, loading, error, fetchProducts, addToCart, buyNow, resetError } = useProductStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [sortOption, setSortOption] = useState('newest');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [initialized, setInitialized] = useState(false);
  
  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please log in to view products');
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);
  
  // Fetch products on component mount
  useEffect(() => {
    const initProducts = async () => {
      // Only initialize once
      if (initialized) return;
      
      try {
        if (user) {
          await fetchProducts();
          
          // Load favorites from localStorage
          const savedFavorites = localStorage.getItem('favorites');
          if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
          }
          
          setInitialized(true);
        }
      } catch (err) {
        console.error('Error initializing products:', err);
      }
    };
    
    // Only fetch products if user is authenticated
    if (user) {
      initProducts();
    }
  }, [fetchProducts, user, initialized]);
  
  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      resetError();
    };
  }, [resetError]);
  
  // If still loading auth or not authenticated, show loading or nothing
  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!user) {
    return null; // Will redirect in the useEffect
  }
  
  const handleAddToCart = (product: Product) => {
    // Create a compatible product object
    const cartProduct = {
      ...product,
      stripe_product_id: product.stripe_product_id || '',
      desc: product.desc || '',
      active: product.active || true,
      default_price: product.default_price || null,
      thumbnail: product.thumbnail || '',
      quantity: product.quantity || 1,
      tags: product.tags || [],
      created_at: product.created_at || new Date().toISOString(),
      updated_at: product.updated_at || new Date().toISOString()
    };
    
    addToCart(cartProduct);
  };
  
  const handleBuyNow = async (product: Product) => {
    try {
      // Check if user is authenticated (should always be true at this point)
      if (!user) {
        toast.error('Please log in to checkout');
        router.push('/auth/login');
        return;
      }
      
      // Create a compatible product object
      const cartProduct = {
        ...product,
        stripe_product_id: product.stripe_product_id || '',
        desc: product.desc || '',
        active: product.active || true,
        default_price: product.default_price || null,
        thumbnail: product.thumbnail || '',
        quantity: product.quantity || 1,
        tags: product.tags || [],
        created_at: product.created_at || new Date().toISOString(),
        updated_at: product.updated_at || new Date().toISOString()
      };
      
      const checkoutUrl = await buyNow(cartProduct);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Failed to checkout:', error);
      toast.error('Failed to checkout. Please try again.');
    }
  };
  
  const toggleFavorite = (productId: string) => {
    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    
    toast.success(
      favorites.includes(productId)
        ? 'Removed from favorites'
        : 'Added to favorites'
    );
  };
  
  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) return product.images[0];
    if (product.thumbnail) return product.thumbnail;
    
    // Return a placeholder image if no image is available
    return 'https://via.placeholder.com/500x500?text=No+Image+Available';
  };
  
  const getProductPrice = (product: Product) => {
    if (product.price) return product.price;
    
    // Try to extract price from default_price if it's a Stripe price ID
    if (product.default_price && typeof product.default_price === 'string') {
      if (product.default_price.includes('_')) {
        const priceParts = product.default_price.split('_');
        if (priceParts.length > 1) {
          const priceInCents = parseInt(priceParts[1]);
          if (!isNaN(priceInCents)) {
            return priceInCents / 100;
          }
        }
      }
      
      // Try to parse as a number
      const parsedPrice = parseFloat(product.default_price);
      if (!isNaN(parsedPrice)) {
        return parsedPrice;
      }
    }
    
    return 0; // Default price if nothing else works
  };
  
  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      (selectedCategory === 'All Products' || 
       (product.tags && product.tags.includes(selectedCategory))) &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (product.desc && product.desc.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'price_asc':
          return getProductPrice(a) - getProductPrice(b);
        case 'price_desc':
          return getProductPrice(b) - getProductPrice(a);
        case 'popular':
          // This would ideally use a popularity metric
          return 0;
        case 'newest':
        default:
          // Sort by created_at date if available
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });
  
  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };
  
  return (
    <MotionContainer maxWidth="xl" sx={{ py: 4 }}>
      {/* Search and filter controls */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              startIcon={<FilterListIcon />}
              onClick={() => setFilterDrawerOpen(true)}
              variant="outlined"
            >
              Filters
            </Button>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="sort-label">Sort By</InputLabel>
              <Select
                labelId="sort-label"
                value={sortOption}
                label="Sort By"
                onChange={(e) => setSortOption(e.target.value)}
                startAdornment={<SortIcon sx={{ mr: 1 }} />}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* No products found */}
      {!loading && filteredProducts.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">No products found</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search or filter criteria
          </Typography>
        </Paper>
      )}

      {/* Product grid */}
      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                  transition: 'all 0.3s ease-in-out'
                }
              }}
            >
              <Box
                sx={{ 
                  position: 'relative',
                  paddingTop: '75%',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.9
                  }
                }}
                onClick={() => handleProductClick(product.id)}
              >
                <CardMedia
                  component="img"
                  image={getProductImage(product)}
                  alt={product.name}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    bgcolor: 'background.paper',
                    p: 1
                  }}
                />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography 
                  variant="h6" 
                  component="h2" 
                  gutterBottom
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                  onClick={() => handleProductClick(product.id)}
                >
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, height: '40px', overflow: 'hidden' }}>
                  {product.desc || 'No description available'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={4.5} precision={0.5} size="small" readOnly />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    (4.5)
                  </Typography>
                </Box>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  ${getProductPrice(product).toFixed(2)}
                </Typography>
                {product.tags && product.tags.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {product.tags.slice(0, 2).map((tag) => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }} 
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  size="small" 
                  variant="contained" 
                  fullWidth
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => handleAddToCart(product)}
                  sx={{ mr: 1 }}
                >
                  Add to Cart
                </Button>
                <Button 
                  size="small" 
                  variant="outlined"
                  fullWidth
                  startIcon={<FlashOnIcon />}
                  onClick={() => handleBuyNow(product)}
                >
                  Buy Now
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filter drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Categories
          </Typography>
          <List>
            {categories.map((category) => (
              <ListItem 
                button 
                key={category}
                selected={selectedCategory === category}
                onClick={() => {
                  setSelectedCategory(category);
                  setFilterDrawerOpen(false);
                }}
              >
                <ListItemText primary={category} />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Button 
            variant="outlined" 
            fullWidth
            onClick={() => {
              setSelectedCategory('All Products');
              setSearchTerm('');
              setSortOption('newest');
              setFilterDrawerOpen(false);
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Drawer>
    </MotionContainer>
  );
} 