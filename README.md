# 3C Content Template Engine

A powerful, cloud-integrated content management system designed for streamlined template creation, storage, and cross-platform content generation.

## 🚀 Features

### Core Functionality
- **Template Management**: Create, edit, and organize content templates
- **Multi-Platform Support**: Generate content for Instagram, LinkedIn, TikTok, YouTube, and more
- **Smart Categorization**: Tag and filter templates by category, platform, and content type
- **Real-time Preview**: See exactly how your content will look on each platform

### Cloud Integration
- **Wasabi Cloud Storage**: Cost-effective S3-compatible storage for all your brand assets
- **Canva Embedding**: Direct integration with Canva designs
- **LOVABLE Dashboard Sync**: Connect with your existing AI assistant and Telegram bot
- **PDF Viewer**: Smooth in-app PDF viewing and downloading

### File Management
- **Multi-format Support**: Handle images, videos, PDFs, and documents
- **Cloud Sync**: Automatic backup and retrieval from cloud storage
- **Embed Integration**: Direct embedding from Canva and other design tools

## 📁 Project Structure

```
3c-content-template-engine/
├── index.html              # Main template manager interface
├── generator.html           # Platform-specific content generator
├── style.css               # Unified styling system
├── script.js               # Template engine logic & cloud integration
├── platforms.json          # Platform configurations & specifications
├── templates/              # Local template storage directory
├── assets/                 # Brand assets (logos, icons, etc.)
└── README.md              # This file
```

## 🛠️ Setup Instructions

### 1. Basic Setup
1. Clone or download all files to your local directory
2. Open `index.html` in a modern web browser
3. Start creating templates immediately (works offline)

### 2. Wasabi Cloud Storage Setup
1. Create a Wasabi account at [wasabisys.com](https://wasabisys.com)
2. Create a new bucket for your brand content
3. Generate access keys (Access Key + Secret Key)
4. In the app, go to "Cloud Storage" → "Wasabi Storage"
5. Enter your credentials:
   - **Endpoint**: `s3.wasabisys.com` (or your region-specific endpoint)
   - **Bucket Name**: Your bucket name
   - **Access Key**: Your access key
   - **Secret Key**: Your secret key

### 3. LOVABLE Integration
1. Get your LOVABLE API endpoint and key
2. Go to "Cloud Storage" → "LOVABLE Sync"
3. Enter your credentials
4. Click "Sync Templates" to connect

### 4. Canva Integration
1. Create your design in Canva
2. Get the shareable link
3. In the app, go to "Cloud Storage" → "Canva Embeds"
4. Paste the URL and preview

## 💡 Usage Guide

### Creating Templates
1. Click "New Template" on the main dashboard
2. Fill in template details:
   - **Title**: Descriptive name for your template
   - **Platform**: Target social media platform
   - **Category**: Content type (promotional, educational, etc.)
   - **Description**: Brief explanation of the template's purpose
   - **Content**: Your template text with variables like `{product_name}`
   - **Tags**: Keywords for easy filtering

### Using Templates
1. Browse your template library
2. Click "Use Template" on any template
3. Fill in the variable fields
4. Preview the generated content
5. Copy or export to your desired platform

### Managing Files
- **Upload**: Drag and drop files or use the upload button
- **View PDFs**: Click on any PDF attachment for in-app viewing
- **Cloud Sync**: Files automatically sync with your configured cloud storage
- **Canva Embeds**: Preview and embed Canva designs directly

## ☁️ Cloud Storage Strategy

### Recommended Wasabi Structure
```
your-bucket/
├── brand-assets/
│   ├── logos/
│   ├── backgrounds/
│   └── product-images/
├── templates/
│   ├── social-media/
│   ├── email-campaigns/
│   └── blog-posts/
├── generated-content/
│   └── [organized by date/platform]
└── metadata/
    └── template-index.json
```

### Why Wasabi + Other Tools?
- **Wasabi**: Perfect for storing files (images, PDFs, videos) - extremely cost-effective
- **JSON files in Wasabi**: Store template metadata and configurations
- **LOVABLE/Supabase**: Handle relational data, user management, AI interactions
- **Canva**: Design creation and collaborative editing

## 🔧 Advanced Configuration

### Platform Customization
Edit `platforms.json` to add new platforms or modify existing ones:

```json
{
  "platform_name": {
    "name": "Platform Name",
    "fields": {
      "character_limit": 280,
      "supports_images": true,
      "supports_video": true,
      "hashtag_limit": 30
    },
    "formatting": {
      "bold": "**text**",
      "italic": "*text*",
      "link": "[text](url)"
    }
  }
}
```

### API Integration
The system is designed to integrate with:
- **Wasabi S3 API** for file storage
- **Your LOVABLE API** for AI-powered content generation
- **Canva API** (when available) for design automation
- **Telegram Bot API** for notifications and updates

## 🔐 Security Considerations

- **API Keys**: Store securely, never commit to version control
- **Local Storage**: Used for demo purposes - implement proper encryption for production
- **File Access**: Ensure proper permissions on your Wasabi bucket
- **CORS**: Configure properly for cross-origin requests

## 🚧 Development Roadmap

### Immediate Enhancements
- [ ] Real Wasabi S3 API integration (requires AWS SDK)
- [ ] Bulk template import/export
- [ ] Advanced filtering and search
- [ ] Template versioning

### Future Features
- [ ] Real-time collaboration
- [ ] AI-powered content suggestions
- [ ] Analytics and performance tracking
- [ ] Multi-user support with permissions

## 📞 Support & Integration

This template engine is designed to work seamlessly with your existing LOVABLE dashboard. For integration support:

1. **Wasabi Documentation**: [docs.wasabisys.com](https://docs.wasabisys.com)
2. **AWS S3 SDK**: For full cloud integration
3. **Your LOVABLE API**: Custom integration based on your specific setup

## 🎯 Best Practic
