# Cloudinary Image Upload Setup Guide

This guide explains how to configure Cloudinary for image uploads in the Puck editor.

## Prerequisites

1. A Cloudinary account (free tier available at https://cloudinary.com)
2. Your Cloudinary dashboard credentials

## Step 1: Get Your Cloudinary Credentials

1. Log in to your Cloudinary dashboard: https://cloudinary.com/console
2. Navigate to **Settings** > **Account**
3. Copy the following values:
   - **Cloud Name** (e.g., `image-solar`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

## Step 2: Create an Upload Preset (Optional)

For client-side uploads, you'll need an unsigned upload preset:

1. Go to **Settings** > **Upload**
2. Click **Add upload preset**
3. Configure:
   - **Preset Name**: `pucked_uploads` (or your preferred name)
   - **Signing Mode**: Unsigned
   - **Folder**: `pucked`
   - **Transformation**: Add quality optimization (optional)
     - Quality: Auto
     - Fetch Format: Auto
4. Click **Save**
5. Copy the **Upload Preset Name** (e.g., `pucked_uploads`)

## Step 3: Configure Environment Variables

Update your `.env.local` file with your Cloudinary credentials:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Public Cloudinary config (for client-side uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

**Example**:
```bash
CLOUDINARY_CLOUD_NAME=image-solar
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=image-solar
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=pucked_uploads
```

## Step 4: Test the Configuration

1. Restart your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to the Puck editor at `/admin/pages/en/home/edit`

3. Add an **ImageBlock** component to your page

4. Click **Choose Image** and select an image file

5. The image should upload to Cloudinary and appear in the editor

## How It Works

### Server-Side Upload (Current Implementation)

The current implementation uses server-side uploads:

1. User selects an image in the Puck editor
2. File is sent to `/api/upload` route (server action)
3. Server uploads to Cloudinary using the SDK
4. Cloudinary returns the image URL
5. URL is saved in the Puck component data

**Advantages**:
- More secure (API secret never exposed to client)
- Better validation on server-side
- Can add server-side transformations

**Files Involved**:
- `lib/cloudinary.ts` - Cloudinary SDK configuration and helper functions
- `app/api/upload/route.ts` - Upload API endpoint
- `components/admin/image-block.tsx` - Image component for Puck
- `components/admin/image-field.tsx` - Custom field with upload UI

### Client-Side Upload (Alternative)

For client-side uploads (not implemented), you would:

1. Use Cloudinary's upload widget or direct upload API
2. Configure unsigned upload preset
3. Upload directly from browser to Cloudinary

## Features

### Automatic Optimization

Images are automatically optimized using Cloudinary transformations:

```typescript
transformation: [
  { quality: 'auto', fetch_format: 'auto' }
]
```

This ensures:
- Best quality for the viewing device
- Optimal format (WebP, AVIF, etc.)
- Reduced file size

### Folder Organization

All uploaded images are stored in the `pucked` folder in your Cloudinary account:

```
cloudinary://image-solar/pucked/image_abc123.jpg
```

### Image Validation

The upload API validates:

- **File Type**: Only images (PNG, JPG, GIF, WebP, etc.)
- **File Size**: Maximum 5MB
- **Authentication**: User must be logged in with accepted invitation

## Troubleshooting

### Error: "No file provided"

- Ensure you're selecting a file (not a folder)
- Check browser console for JavaScript errors

### Error: "File must be an image"

- Only image files are accepted (PNG, JPG, GIF, WebP, etc.)
- Check the file's MIME type

### Error: "File size must be less than 5MB"

- Compress your image before uploading
- Or increase the limit in `app/api/upload/route.ts`

### Error: "Failed to upload image"

- Check your Cloudinary credentials in `.env.local`
- Verify your Cloudinary account has available credits
- Check the server logs for detailed error messages

### Images not appearing in editor

- Clear browser cache and reload
- Check the browser console for errors
- Verify the image URL in the Puck data

## Advanced Configuration

### Custom Transformations

You can add custom transformations in `lib/cloudinary.ts`:

```typescript
const uploadStream = cloudinary.uploader.upload_stream(
  {
    folder: 'pucked',
    resource_type: 'image',
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width: 2000, crop: 'limit' }, // Max width
      { fetch_format: 'auto' },
    ],
  },
  // ...
);
```

### Responsive Images

For responsive images, you can use the `getOptimizedImageUrl` helper:

```typescript
import { getOptimizedImageUrl } from '@/lib/cloudinary';

const smallUrl = getOptimizedImageUrl(publicId, 400);
const mediumUrl = getOptimizedImageUrl(publicId, 800);
const largeUrl = getOptimizedImageUrl(publicId, 1200);
```

### Image Deletion

To delete images from Cloudinary:

```typescript
import { deleteImageFromCloudinary } from '@/lib/cloudinary';

await deleteImageFromCloudinary(publicId);
```

## Security Notes

1. **Never commit `.env.local`** to version control
2. **API Secret** should only be used server-side
3. **Authentication** is required for uploads (enforced by `requireAuth`)
4. **Rate limiting** should be considered for production use

## Next Steps

- Add image editing capabilities (crop, rotate, filters)
- Implement image gallery component
- Add lazy loading for better performance
- Consider using Cloudinary's AI features (auto-tagging, moderation)
