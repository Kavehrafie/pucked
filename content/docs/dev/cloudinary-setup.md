---
title: Cloudinary Setup
description: Complete guide to configuring Cloudinary for image uploads in the Pucked application.
order: 8
category: Development
tags:
  - cloudinary
  - images
  - upload
  - media
  - configuration
lastModified: 2025-12-27
author: Pucked Team
---

# Cloudinary Setup

This guide covers configuring Cloudinary for image uploads in the Pucked application.

## Overview

**What is Cloudinary?**
Cloudinary is a cloud-based image and video management service that provides:
- Image upload and storage
- Automatic optimization
- On-the-fly transformations
- CDN delivery
- Advanced media features

**Integration in Pucked:**
- Custom Puck field for drag-and-drop uploads
- Server-side upload handler with validation
- Optimized image delivery
- Image deletion support

## Prerequisites

### 1. Cloudinary Account

1. **Sign up** at [cloudinary.com](https://cloudinary.com)
2. **Choose a plan**:
   - Free tier: 25 credits/month (good for development)
   - Paid plans: For production use

### 2. Get Your Credentials

After signing up:

1. **Log in** to Cloudinary dashboard
2. **Navigate** to Settings → API Security
3. **Copy** the following:
   - Cloud Name (required)
   - API Key (required)
   - API Secret (server-side only, never expose to client)

## Configuration

### 1. Environment Variables

Add to `.env.local`:

```bash
# Server-side (required for uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Upload preset name
CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

**⚠️ Security Notes:**
- Never commit `.env.local` to version control
- API Secret should NEVER be exposed to client-side code
- Use different Cloudinary accounts for dev/staging/production

### 2. Upload Preset (Optional)

Upload presets simplify uploads by pre-configuring settings.

**Create a preset:**

1. Go to Settings → Upload
2. Click "Add upload preset"
3. Configure settings:
   - **Signing Mode**: Signed (recommended) or Unsigned
   - **Folder**: Optional folder organization
   - **Transformation**: Auto-quality, auto-format (recommended)
   - **Incoming Transformations**: Resize limits, format conversion

**Example transformations:**
```
f_auto,q_auto,w_1920,c_limit
```
- `f_auto`: Automatic format selection
- `q_auto`: Automatic quality
- `w_1920`: Max width 1920px
- `c_limit`: Limit dimensions

## Server-Side Setup

### Cloudinary Client

**File**: `lib/cloudinary.ts`

```typescript
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image
export async function uploadImageToCloudinary(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'pucked', // Optional: organize in folder
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1920, crop: 'limit' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
}

// Delete image
export async function deleteImageFromCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

// Get optimized URL
export function getOptimizedImageUrl(
  publicId: string,
  width?: number,
  height?: number
) {
  return cloudinary.url(publicId, {
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width, height, crop: 'limit' }
    ].filter(Boolean)
  });
}

// Get client config (safe to expose)
export function getCloudinaryConfig() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET
  };
}
```

### API Endpoint

**File**: `app/api/upload/route.ts`

```typescript
import { requireAuth } from "@/lib/route-guard";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  // Require authentication
  const { user } = await requireAuth();

  // Parse form data
  const formData = await request.formData();
  const file = formData.get('file') as File;

  // Validate file
  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    return Response.json({ error: 'File must be an image' }, { status: 400 });
  }

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: 'File size exceeds 5MB' }, { status: 400 });
  }

  try {
    // Upload to Cloudinary
    const result = await uploadImageToCloudinary(file);

    // Return response
    return Response.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
```

## Client-Side Integration

### Custom Puck Field

**File**: `components/admin/image-field.tsx`

```tsx
"use client";

import { useState } from "react";

interface ImageFieldProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export function ImageField({ name, value, onChange }: ImageFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Upload UI */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {/* Preview */}
      {value && (
        <img src={value} alt="Preview" />
      )}

      {/* Error */}
      {error && (
        <p className="text-destructive">{error}</p>
      )}

      {/* Loading */}
      {uploading && (
        <p>Uploading...</p>
      )}
    </div>
  );
}
```

## Testing

### 1. Test Upload

```bash
# Start dev server
pnpm dev

# Login and navigate to page editor
# Try uploading an image
```

### 2. Verify Cloudinary Dashboard

1. Log in to Cloudinary
2. Check "Media Library"
3. Verify image appears
4. Check transformations are applied

### 3. Test Optimization

Upload a large image and verify:
- File size is reduced
- Format is optimized (WebP if supported)
- Dimensions are limited

## Best Practices

### Security

1. **Always validate** file types on server
2. **Limit file sizes** to prevent abuse
3. **Use signed uploads** in production
4. **Never expose** API secret to client
5. **Require authentication** for uploads

### Performance

1. **Enable auto-format** for WebP/AVIF
2. **Enable auto-quality** for optimization
3. **Set dimension limits** to prevent huge files
4. **Use CDN delivery** (automatic with Cloudinary)
5. **Lazy load images** in frontend

### Organization

1. **Use folders** to organize media
2. **Name uploads** descriptively
3. **Tag images** for easy searching
4. **Clean up** unused images periodically

## Troubleshooting

### Upload Fails

**Check:**
- Environment variables are set correctly
- API credentials are valid
- File size is under limit
- File type is supported

### Images Not Optimizing

**Check:**
- Transformations are configured
- Upload preset has transformations
- URL includes transformation parameters

### CORS Errors

**Solution:**
Add allowed origins in Cloudinary dashboard:
Settings → Security → CORS allowed origins

### API Secret Exposed

**Immediate Actions:**
1. Rotate API secret in Cloudinary dashboard
2. Update environment variable
3. Check git history for accidental commits
4. Deploy new environment variable

## Advanced Features

### On-the-Fly Transformations

```typescript
// Resize
cloudinary.url(publicId, { width: 800, height: 600, crop: 'fill' })

// Quality
cloudinary.url(publicId, { quality: 80 })

// Format
cloudinary.url(publicId, { fetch_format: 'auto' })

// Multiple transformations
cloudinary.url(publicId, {
  transformation: [
    { width: 800, crop: 'scale' },
    { quality: 'auto', fetch_format: 'auto' }
  ]
})
```

### Responsive Images

```tsx
<img
  src={getOptimizedImageUrl(publicId, 1920)}
  srcSet={`
    ${getOptimizedImageUrl(publicId, 640)} 640w,
    ${getOptimizedImageUrl(publicId, 1280)} 1280w,
    ${getOptimizedImageUrl(publicId, 1920)} 1920w
  `}
  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
/>
```

## Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Upload API Reference](https://cloudinary.com/documentation/upload_images)
- [Transformation Reference](https://cloudinary.com/documentation/image_transformations)
- [Node.js SDK](https://cloudinary.com/documentation/node_integration)
