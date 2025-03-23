# High-Traffic Django & Stripe E-commerce Website [Part 6]: Cart and Checkout In Modern E-commerce Platform with Next.JS
## Learn how to build a complete e-commerce platform using React or NextJS, Django, and Stripe, featuring Google Authentication and real-time cart management. This comprehensive guide covers everything from user authentication to secure payment processing, helping you create a production-ready online store with modern web technologies.

![image](https://github.com/joelwembo/django-multitenant-saas-ecommerce-kubernetes/assets/19718580/f52b4f26-b42f-4f16-81fc-3aac8cc62f82)

## Author
- [@Joel O. Wembo](https://www.joelotepawembo.com)
- [@twitter](twitter.com/joelwembo1)
- [@linkedin](https://www.linkedin.com/in/joelotepawembo)

## Installation and Setup

### Backend (Django) Setup

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file in the backend directory with:
```
SECRET_KEY=your_django_secret_key
DEBUG=True
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

4. Run database migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Start the Django development server:
```bash
python manage.py runserver
```

### Frontend (Next.js) Setup

1. Install Node.js dependencies:
```bash
cd frontend
npm install
```

2. Set up environment variables:
Create a `.env.local` file in the frontend directory with:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

3. Run the development server:
```bash
npm run dev
```

## Key Features
- 🛍️ Full E-commerce Functionality
- 🔐 Google Authentication
- 💳 Stripe Payment Integration
- 🛒 Real-time Cart Management
- 📱 Responsive Design
- 🔒 Secure Payment Processing
- 🎨 Modern UI/UX

## API Endpoints

### Base URL
The base URL for all API endpoints is: `http://127.0.0.1:8585/api/v1`

### Authentication
- `POST /auth/token/` - Get authentication token
- `POST /auth/token/refresh/` - Refresh authentication token

### Store
#### Cart
- `GET /store/carts/` - Get user's cart
- `POST /store/carts/` - Add/Update cart items
- `DELETE /store/carts/{id}/` - Remove item from cart

#### Orders
- `GET /store/orders/` - List user's orders
- `POST /store/orders/` - Create new order
- `GET /store/orders/{id}/` - Get order details

#### Checkout
- `POST /store/checkout/` - Process checkout and payment

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.