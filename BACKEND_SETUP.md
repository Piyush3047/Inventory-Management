# Backend Setup - Inventory Management System

## Files Created

1. **api.php** - RESTful API backend that handles all inventory operations

## How It Works

The system uses a JSON file-based database for storing inventory data. No database server required!

### API Endpoints

- **GET /api.php?action=getProducts** - Fetch all products
- **POST /api.php?action=addProduct** - Add a new product
- **PUT /api.php?action=updateProduct** - Update an existing product
- **DELETE /api.php?action=deleteProduct** - Delete a product

### Data Storage

Products are stored in `data.json` which is automatically created in the same directory as api.php.

## Setup Instructions

1. **No additional setup required!** The system is ready to use.
   - api.php automatically creates the data.json file on first run
   - All CORS headers are properly configured

2. **Access the application:**
   - Open your browser and go to: `http://localhost/PPHP/MyProject/index.html`

3. **Verify it's working:**
   - Try adding a product
   - Check that `data.json` file appears in the MyProject directory
   - Refresh the page - your data should persist!

## Features

✅ Persistent data storage (survives page refreshes)
✅ CRUD operations (Create, Read, Update, Delete)
✅ SKU validation to prevent duplicates
✅ JSON-based storage (easy to backup/migrate)
✅ No database configuration needed
✅ CORS enabled for API calls

## File Structure

```
MyProject/
├── index.html          # Frontend UI
├── script.js           # Frontend JavaScript (updated to use API)
├── styles.css          # Styling
├── api.php             # Backend API
└── data.json           # Data storage (auto-created)
```

## Troubleshooting

### "Cannot fetch api.php" error
- Make sure XAMPP is running
- Verify api.php exists in the same directory as index.html
- Check browser console (F12) for detailed error messages

### Data not persisting
- Check that the MyProject directory has write permissions
- Ensure data.json file was created after the first add product attempt
- Check XAMPP error logs

### CORS errors
- The api.php file already includes CORS headers
- If you still see errors, verify your server is running PHP 5.4+

## Next Steps

Optional enhancements:
- Add user authentication
- Migrate to MySQL database
- Add more advanced reporting
- Add product images/attachments
- Export to Excel/PDF functionality (already partially implemented)
