# Contact Messages Feature - Setup Instructions

## Database Migration

Run this SQL migration to create the contact_messages table:

```bash
# Connect to your PostgreSQL database
psql -U your_username -d your_database_name -f server/models/contact_messages.sql
```

Or manually execute the SQL from `server/models/contact_messages.sql`

## Backend Setup

1. **Restart the backend server** to load the new routes:
   ```powershell
   cd server
   npm start
   ```

## Features Implemented

### 1. **Contact Form (Public)**
   - Location: `/contact`
   - Users can submit messages with:
     - First Name & Last Name (required)
     - Email or Phone (at least one required)
     - Message (required, min 10 characters)
   - Confirmation email sent to users automatically
   - Toast notifications for success/error
   - Form validation with error messages

### 2. **Admin Messages Dashboard**
   - Location: `/admin/messages` (admin only)
   - Features:
     - View all contact messages
     - See message details (name, email, phone, timestamp)
     - Messages sorted by newest first
     - Visual indicators for replied/unreplied messages
     - Total count and replied count statistics

### 3. **Email Reply System**
   - **Two reply options:**
     1. **Direct Reply**: Write and send reply from the dashboard
        - Opens textarea within the message card
        - Sends email with reply message
        - Includes original message in reply
        - Automatically marks message as "replied"
     
     2. **Email Client**: Opens default email client (Outlook, Gmail, etc.)
        - Pre-fills recipient email address
        - Useful for formatted replies or attachments

### 4. **Admin Navigation**
   - Added "View Messages" to admin dropdown menu
   - Located between "Manage Subscriptions" and "Logout"
   - Only visible to admin users

## API Endpoints

### Public:
- `POST /api/contact/submit` - Submit contact message

### Admin Only:
- `GET /api/contact/messages` - Get all messages
- `POST /api/contact/messages/:messageId/reply` - Send reply email
- `PATCH /api/contact/messages/:messageId/replied` - Mark as replied

## Database Schema

```sql
contact_messages (
  message_id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  country_code VARCHAR(10),
  phone VARCHAR(20),
  message TEXT NOT NULL,
  replied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Testing

1. **Test Contact Form:**
   - Go to `/contact`
   - Fill in required fields
   - Submit and verify success toast
   - Check email for confirmation

2. **Test Admin Dashboard:**
   - Login as admin
   - Click username → "View Messages"
   - Verify messages display correctly
   - Test reply functionality
   - Check recipient email for reply

3. **Test Email Reply:**
   - Click "Reply via Email" button
   - Enter reply message
   - Click "Send Reply"
   - Verify email sent and message marked as replied
   - Or click "Open Email Client" to use default mail app

## Notes

- Messages without email cannot receive replies (shows appropriate message)
- Replied messages are highlighted with green border and badge
- All admin routes require authentication and admin role
- Email sending uses existing nodemailer configuration
