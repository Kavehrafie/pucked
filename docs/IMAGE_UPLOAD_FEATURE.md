# Image Upload Feature - Implementation Summary

## Overview

This document summarizes the implementation of the image upload feature for the Puck editor, which allows users to upload images to Cloudinary directly from the page builder.

## Architecture

### Components

1. **Server-Side Upload Handler**
   - File: `lib/cloudinary.ts`
   - Purpose: Cloudinary SDK configuration and upload utilities
   - Functions:
     - `uploadImageToCloudinary(file)` - Upload with auto-optimization
     - `deleteImageFromCloudinary(publicId)` - Delete images
     - `getOptimizedImageUrl(publicId, width, height)` - Generate optimized URLs
     - `getCloudinaryConfig()` - Get client-side config

2. **API Endpoint**
   - File: `app/api/upload/route.ts`
   - Purpose: Handle image upload requests
   - Features:
     - Protected by authentication (`requireAuth`)
     - File type validation (images only)
     - File size validation (max 5MB)
     - Returns URL, dimensions, and metadata

3. **Custom Puck Field**
   - File: `components/admin/image-field.tsx`
   - Purpose: UI component for image uploads in the editor
   - Features:
     - Drag-and-drop upload area
     - Image preview with hover-to-remove
     - Manual URL entry option
     - Loading state during upload
     - File validation feedback

4. **Puck Component**
   - File: `components/admin/image-block.tsx`
   - Purpose: Render images in the page builder
   - Fields:
     - `url` - Image URL (custom field with upload UI)
     - `alt` - Alt text for accessibility
     - `width` - Optional width in pixels
     - `height` - Optional height in pixels

5. **Puck Configuration**
   - File: `puck.config.tsx`
   - Changes:
     - Imported `ImageBlock` component
     - Added to "Content" category
     - Registered in components object

## Data Flow

### Upload Flow

```
User selects file
    ↓
ImageField component validates file
    ↓
FormData sent to /api/upload
    ↓
Server validates authentication
    ↓
Server uploads to Cloudinary
    ↓
Cloudinary returns URL and metadata
    ↓
API returns response to client
    ↓
ImageField updates component data
    ↓
ImageBlock renders preview
```

### Response Format

```typescript
{
  url: string;           // Cloudinary URL
  publicId: string;      // Cloudinary public ID
  width: number;         // Image width
  height: number;        // Image height
  format: string;        // Image format (jpg, png, etc.)
}
```

## Configuration

### Environment Variables

Required variables in `.env.local`:

```bash
# Server-side (required for uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client-side (optional, for direct uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### Cloudinary Settings

- **Folder**: `pucked` - All uploads stored in this folder
- **Resource Type**: `image` - Only images allowed
- **Transformation**: 
  - Quality: `auto` - Automatic quality optimization
  - Format: `auto` - Automatic format selection (WebP, AVIF, etc.)

## Usage

### In the Puck Editor

1. Open any page in the Puck editor
2. Drag **ImageBlock** from the "Content" category
3. Click **Choose Image** in the component properties
4. Either:
   - Drag and drop an image file
   - Click to browse files
   - Enter a URL manually
5. Set alt text, width, and height as needed
6. See the image preview in the editor

### In Published Pages

Images render as standard `<img>` tags with:

- Responsive srcset (if width/height specified)
- Alt text for accessibility
- Lazy loading (browser default)
- Cloudinary CDN optimization

## Validation Rules

### File Type

Allowed types:
- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`
- `image/svg+xml`

### File Size

- Maximum: 5MB
- Configured in: `app/api/upload/route.ts`

### Authentication

- User must be logged in
- User must have accepted invitation
- Enforced by: `requireAuth()` in API route

## Error Handling

### Client-Side Errors

- **No file selected**: Shows error message
- **Invalid file type**: Shows "File must be an image"
- **File too large**: Shows "File size must be less than 5MB"

### Server-Side Errors

- **Not authenticated**: Returns 401, redirects to login
- **Upload failed**: Returns 500 with error message
- **Invalid file**: Returns 400 with validation error

## Performance Considerations

### Optimization

- **Automatic quality**: Cloudinary optimizes quality automatically
- **Format selection**: Serves best format for browser (WebP, AVIF)
- **CDN delivery**: Images served from Cloudinary's CDN
- **Lazy loading**: Browser-native lazy loading

### Best Practices

1. **Use appropriate dimensions**: Don't upload larger than needed
2. **Enable lazy loading**: For pages with many images
3. **Consider responsive images**: Use srcset for different screen sizes
4. **Monitor usage**: Check Cloudinary dashboard for bandwidth usage

## Security

### Authentication

- Upload endpoint requires authentication
- Only users with accepted invitations can upload
- API secret never exposed to client

### Validation

- File type validated on both client and server
- File size validated on server
- Malicious files rejected

### Rate Limiting

Currently not implemented. Consider adding:
- Per-user upload limits
- Daily/monthly quotas
- Rate limiting on API endpoint

## Future Enhancements

### Potential Features

1. **Image Editing**
   - Crop, rotate, flip
   - Filters and adjustments
   - Watermarking

2. **Gallery Component**
   - Multiple images
   - Grid layout
   - Lightbox view

3. **Advanced Optimization**
   - Responsive image srcset
   - Progressive loading
   - Blur placeholders

4. **AI Features**
   - Auto-tagging
   - Content moderation
   - Smart cropping

5. **Asset Management**
   - Browse uploaded images
   - Reuse images
   - Delete unused images

## Troubleshooting

### Common Issues

**Upload fails with "Invalid credentials"**
- Check Cloudinary credentials in `.env.local`
- Verify API key and secret are correct
- Ensure Cloudinary account is active

**Images not appearing in editor**
- Check browser console for errors
- Verify image URL is valid
- Clear browser cache

**Upload is slow**
- Check file size (max 5MB)
- Verify internet connection
- Check Cloudinary status

### Debug Mode

To enable debug logging, add to `.env.local`:

```bash
DEBUG=cloudinary:*
```

## Related Files

- `lib/cloudinary.ts` - Cloudinary utilities
- `app/api/upload/route.ts` - Upload API
- `components/admin/image-field.tsx` - Upload UI
- `components/admin/image-block.tsx` - Image component
- `puck.config.tsx` - Puck configuration
- `.env.local` - Environment variables

## Documentation

- **Setup Guide**: `docs/CLOUDINARY_SETUP.md`
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Puck Docs**: https://puckeditor.com

## Support

For issues or questions:
1. Check the Cloudinary setup guide
2. Review Cloudinary dashboard for errors
3. Check browser console for client errors
4. Check server logs for API errors
