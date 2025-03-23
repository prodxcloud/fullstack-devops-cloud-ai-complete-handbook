'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Rating,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  ImageList,
  ImageListItem,
  Link,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import useCartStore from '../../store/cartStore';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCartStore();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Please login to view product details');
      router.push('/auth/login');
      return;
    }
    fetchProductDetails();
  }, [params.id]);

  const fetchProductDetails = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axios.post(
        'http://127.0.0.1:8585/api/v1/store/products/id/',
        {
          id: params.id
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Log the entire response data
      console.log('Product API Response:', {
        status: response.data?.status,
        data: response.data?.data,
        fullResponse: response.data
      });
      
      if (response.data?.status === 'success' && response.data?.data) {
        const productData = response.data.data;
        console.log('Product Details:', {
          id: productData.id,
          name: productData.name,
          price: productData.price,
          thumbnail: productData.thumbnail,
          images: productData.images
        });
        
        setProduct(productData);
        // Set the first product image as selected if available
        if (productData.thumbnail) {
          setSelectedImage(0);
        }
      } else {
        console.error('Product data not in expected format:', response.data);
        toast.error('Product not found');
      }
    } catch (error: any) {
      console.error('Error fetching product details:', {
        error: error,
        response: error.response?.data,
        status: error.response?.status
      });
      if (error.response?.status === 401) {
        toast.error('Please login to view product details');
        router.push('/auth/login');
      } else {
        toast.error('Failed to load product details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success('Added to cart!');
    }
  };

  const handleBuyNow = async () => {
    const token = localStorage.getItem('accessToken');
    if (product) {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8585/api/v1/store/checkout/',
          {
            items: [{
              id: product.id,
              quantity: 1,
              price: product.price
            }]
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.data.checkout_url) {
          window.location.href = response.data.checkout_url;
        }
      } catch (error: any) {
        console.error('Error initiating checkout:', error);
        if (error.response?.status === 401) {
          toast.error('Please login to checkout');
          router.push('/auth/login');
        } else {
          toast.error('Failed to process checkout');
        }
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container>
        <Typography color="error">Product not found</Typography>
      </Container>
    );
  }

  // If no images available, show a placeholder
  const noImagePlaceholder = "https://via.placeholder.com/500x500?text=No+Image+Available";
  const productImages = product.thumbnail 
    ? [product.thumbnail] 
    : [noImagePlaceholder];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Left Column - Images */}
        <Grid item xs={12} md={5}>
          <Box sx={{ position: 'sticky', top: 100 }}>
            <Box 
              sx={{ 
                mb: 2, 
                position: 'relative', 
                height: 500,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.9
                }
              }}
              onClick={() => {
                if (productImages[selectedImage] !== noImagePlaceholder) {
                  window.open(productImages[selectedImage], '_blank');
                }
              }}
            >
              <Image
                src={productImages[selectedImage]}
                alt={product.name}
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </Box>
            {productImages.length > 1 && (
              <ImageList sx={{ height: 100 }} cols={4} rowHeight={100}>
                {productImages.map((img: string, index: number) => (
                  <ImageListItem 
                    key={index}
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedImage === index ? '2px solid #1976d2' : 'none',
                      '&:hover': {
                        opacity: 0.8
                      }
                    }}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={img}
                      alt={`Product view ${index + 1}`}
                      style={{ objectFit: 'contain' }}
                      loading="lazy"
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </Box>
        </Grid>

        {/* Middle Column - Product Info */}
        <Grid item xs={12} md={4}>
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ 
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.main'
              }
            }}
            onClick={() => router.push(`/products/${product.id}`)}
          >
            {product.name}
          </Typography>
          
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating value={4.5} precision={0.5} readOnly />
            <Typography color="text.secondary">(4.5) 2,345 ratings</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h5" color="primary" gutterBottom>
            ${product.price?.toFixed(2)}
          </Typography>

          <Typography variant="body1" paragraph>
            {product.desc}
          </Typography>

          <List>
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShippingIcon color="primary" />
                    <Typography variant="body1">Free Delivery</Typography>
                  </Box>
                }
                secondary="Free delivery on orders over $50"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon color="primary" />
                    <Typography variant="body1">Secure Transaction</Typography>
                  </Box>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentReturnIcon color="primary" />
                    <Typography variant="body1">30-Day Returns</Typography>
                  </Box>
                }
              />
            </ListItem>
          </List>

          {product.tags?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Categories:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {product.tags.map((tag: any) => (
                  <Chip
                    key={tag.name}
                    label={tag.name}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Grid>

        {/* Right Column - Buy Box */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, position: 'sticky', top: 100 }}>
            <Typography variant="h4" color="primary" gutterBottom>
              ${product.price?.toFixed(2)}
            </Typography>

            <Typography variant="body2" color="success.main" gutterBottom>
              In Stock
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                sx={{ mb: 1 }}
              >
                Add to Cart
              </Button>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                startIcon={<FlashOnIcon />}
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              Ships from and sold by ProdxCloud
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 