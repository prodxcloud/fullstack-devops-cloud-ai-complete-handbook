'use client';

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  Badge,
  MenuItem,
  Menu,
  IconButton,
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  styled,
  alpha,
  Paper,
  Select,
  FormControl,
  InputLabel,
  MenuItem as SelectMenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  LocationOn as LocationIcon,
  Favorite as FavoriteIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Home as HomeIcon,
  Category as CategoryIcon,
  LocalShipping as ShippingIcon,
  History as OrdersIcon,
  Public as PublicIcon,
  Sort as SortIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import api from '@/lib/axios';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}));

const CHRIST_LOGO = "https://christuniversity.in/uploads/userfiles/1/image/CHRIST.png";

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [filterOpen, setFilterOpen] = useState(false);

  const categories = [
    'Electronics',
    'Fashion',
    'Home & Kitchen',
    'Books',
    'Sports',
    'Toys & Games',
    'Beauty',
    'Automotive',
  ];

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCategoryClick = (event: React.MouseEvent<HTMLElement>) => {
    setCategoryMenuAnchor(event.currentTarget);
  };

  const handleCategoryClose = () => {
    setCategoryMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    router.push('/auth/login');
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      const response = await api.get(`http://127.0.0.1:8585/api/v1/store/products/`);
      const filteredProducts = response.data.filter((product: any) => 
        product.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredProducts);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Replace the Christ Logo button with World Icon
  const WorldIconButton = (
    <Button
      color="inherit"
      sx={{ ml: 2, display: { xs: 'none', md: 'flex' } }}
    >
      <PublicIcon sx={{ fontSize: 30 }} />
    </Button>
  );

  // Update the cart badge count
  const cartItemCount = cart ? cart.length : 0;

  // Update the isAuthenticated check
  const isAuthenticated = !!user;

  // Add Orders link to the navigation items
  const navigationItems = [
    { label: 'Products', href: '/products' },
    { label: 'Cart', href: '/cart' },
    { label: 'Orders', href: '/orders' },
  ];

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: '#131921' }}>
        <Toolbar>
          {/* Logo */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' }, cursor: 'pointer' }}
            onClick={() => router.push('/')}
          >
            ProdxCloud
          </Typography>

          {/* Mobile menu icon */}
          <IconButton
            color="inherit"
            sx={{ display: { xs: 'block', md: 'none' } }}
            onClick={() => setMobileMenuOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          {/* World Icon */}
          {WorldIconButton}

          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Search sx={{ flexGrow: 1, position: 'relative' }}>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchResults.length > 0 && searchQuery && (
                <Paper
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    mt: 1,
                    maxHeight: '400px',
                    overflow: 'auto',
                  }}
                >
                  <List>
                    {searchResults.map((product: any) => (
                      <ListItem
                        button
                        key={product.id}
                        onClick={() => {
                          router.push(`/products/${product.id}`);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                      >
                        <ListItemText
                          primary={product.name}
                          secondary={`$${(parseFloat(product.default_price?.split('_')[1]) / 100).toFixed(2)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Search>

            <IconButton 
              color="inherit"
              onClick={() => setFilterOpen(true)}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              <FilterListIcon />
            </IconButton>

            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 120, 
                display: { xs: 'none', md: 'flex' },
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.87)',
                  },
                },
                '& .MuiSelect-icon': {
                  color: 'white',
                },
              }}
            >
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                displayEmpty
                sx={{ color: 'white' }}
              >
                <SelectMenuItem value="relevance">Relevance</SelectMenuItem>
                <SelectMenuItem value="price_asc">Price: Low to High</SelectMenuItem>
                <SelectMenuItem value="price_desc">Price: High to Low</SelectMenuItem>
                <SelectMenuItem value="newest">Newest Arrivals</SelectMenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Navigation Items */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <Button
              color="inherit"
              onClick={handleProfileMenuOpen}
              startIcon={<PersonIcon />}
            >
              {isAuthenticated ? (
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="caption" display="block">
                    Hello,
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {user?.username || 'User'}
                  </Typography>
                </Box>
              ) : (
                'Sign In'
              )}
            </Button>

            <Button
              color="inherit"
              onClick={() => router.push('/orders')}
              startIcon={<OrdersIcon />}
            >
              Orders
            </Button>

            <IconButton color="inherit" onClick={() => router.push('/cart')}>
              <Badge badgeContent={cartItemCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Updated Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{ mt: 5 }}
      >
        {isAuthenticated ? (
          <>
            <MenuItem onClick={() => {
              router.push('/profile');
              handleMenuClose();
            }}>
              Profile
            </MenuItem>
            <MenuItem onClick={() => {
              router.push('/orders');
              handleMenuClose();
            }}>
              My Orders
            </MenuItem>
            <MenuItem onClick={() => {
              router.push('/wishlist');
              handleMenuClose();
            }}>
              Wishlist
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </>
        ) : (
          <>
            <MenuItem>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => router.push('/auth/login')}
                sx={{ mb: 1 }}
              >
                Login
              </Button>
            </MenuItem>
            <MenuItem>
              <Button
                fullWidth
                variant="contained"
                sx={{ 
                  bgcolor: '#ffd700',
                  '&:hover': {
                    bgcolor: '#ffcd00',
                  },
                }}
                onClick={() => router.push('/auth/register')}
              >
                Sign Up
              </Button>
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Categories Menu */}
      <Menu
        anchorEl={categoryMenuAnchor}
        open={Boolean(categoryMenuAnchor)}
        onClose={handleCategoryClose}
        sx={{ mt: 5 }}
      >
        {categories.map((category) => (
          <MenuItem
            key={category}
            onClick={() => {
              router.push(`/category/${category.toLowerCase()}`);
              handleCategoryClose();
            }}
          >
            {category}
          </MenuItem>
        ))}
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250 }} role="presentation">
          {isAuthenticated && (
            <Box sx={{ p: 2, backgroundColor: '#232f3e', color: 'white' }}>
              <Typography variant="h6">Hello, {user?.name}</Typography>
            </Box>
          )}
          <List>
            <ListItem button onClick={() => router.push('/')}>
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button onClick={() => router.push('/categories')}>
              <ListItemIcon><CategoryIcon /></ListItemIcon>
              <ListItemText primary="Shop by Category" />
            </ListItem>
            <Divider />
            <ListItem button onClick={() => router.push('/orders')}>
              <ListItemIcon><ShippingIcon /></ListItemIcon>
              <ListItemText primary="Your Orders" />
            </ListItem>
            <ListItem button onClick={() => router.push('/wishlist')}>
              <ListItemIcon><FavoriteIcon /></ListItemIcon>
              <ListItemText primary="Your Wishlist" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Toolbar spacing */}
      <Toolbar />
      <Toolbar variant="dense" sx={{ display: { xs: 'none', md: 'block' } }} />
    </>
  );
} 