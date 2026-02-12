# 🔐 SECURE PRODUCTION ENVIRONMENT VARIABLES TEMPLATE

# Copy these values into your Vercel dashboard
# Generate new values for production - DO NOT use the ones from .env

# Database Configuration
MONGO_URI=mongodb+srv://YOUR_NEW_USERNAME:YOUR_NEW_PASSWORD@cluster0.mongodb.net/?appName=Cluster0

# JWT Configuration (generate new 32+ character secret)
JWT_SECRET=your_new_super_secure_jwt_secret_at_least_32_characters_long_and_random
JWT_EXPIRES_IN=30d

# Staff Registration Secret
STAFF_REGISTER_SECRET=your_new_staff_registration_secret_2024

# Mail Configuration
MAIL_PROVIDER=gmail
MAIL_USER=your_email@gmail.com
MAIL_APP_PASSWORD=your_new_app_specific_password_16_chars
MAIL_FROM_NAME=LostAndFound
NOTIFICATION_MODE=email

# Server Configuration
NODE_ENV=production
PORT=5000

# ⚠️ SECURITY REMINDERS:
# 1. Change your MongoDB Atlas password
# 2. Generate a new JWT secret (32+ chars)
# 3. Create app-specific password for Gmail
# 4. Never share these credentials
# 5. Enable 2FA on your email account
