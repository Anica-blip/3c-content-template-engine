# 3C Template Builder - Setup Instructions

## Files to Save

1. **`template-builder.html`** - Main template builder interface (complete, ready to use)
2. **`notion-integration.js`** - Notion API integration code  
3. **`environment-setup.md`** - This setup guide

## Quick Start

1. Save `template-builder.html` and open it in your browser immediately to test the interface
2. The template builder works without Notion integration for testing
3. Set up Notion integration when ready for production

## Notion Database Setup

### 1. Create Three Notion Databases

#### Database 1: `3C_Content_Templates`
```
Columns:
- template_id (Title) 
- theme_label (Select): News Alert, Promotion, Standard Post, CTA - Quiz, CTA - Game, CTA - Puzzle, CTA - Challenge, News, Blog, Tutorial Guide, Course Tool, Assessment
- theme_code (Formula): Switch statement for abbreviations
- character_profile (Select): Anica, Caelum, Aurion
- brand_voice (Select): Casual, Friendly, Professional, Creative
- target_audience (Select): Existing Members, New Members, Persona FALCON, Persona PANTHER, Persona WOLF, Persona LION, General Public
- audience_code (Formula): EM, NM, FL, PA, WF, LI, GP
- media_type (Select): Image, Video, GIFs, PDF, Interactive Media, URL Link
- media_code (Formula): IM, VD, GF, PF, IM, UL
- template_type (Select): Social Media, Presentation, Video Message, Anica Chat, Blog Posts, News Article, Newsletter, Email Templates, Custom Templates
- template_code (Formula): SM, PR, VM, AC, BP, NA, NL, ET, CT
- platform_selected (Select): Instagram, Facebook, LinkedIn, Twitter/X, YouTube, TikTok, Telegram, Pinterest, WhatsApp Business
- platform_code (Formula): IS, FB, LK, TX, YT, TK, TG, PI, WB
- auto_number (Number)
- date_created (Created Time)
- last_modified (Last Edited Time)
- status (Select): Draft, Template, Forwarded, Archived
- content_data (Rich Text)
- is_active (Checkbox)
```

#### Database 2: `3C_Dashboard_Queue`
```
Columns:
- forward_id (Title)
- template_id (Relation to Templates DB)
- assigned_member (Select): Anica, Caelum, Aurion
- platform_target (Select): Instagram, Facebook, etc.
- priority (Select): Low, Medium, High, Urgent
- forward_date (Created Time)
- status (Select): Pending, In Progress, Completed, Cancelled
- due_date (Date)
- notes (Rich Text)
```

#### Database 3: `3C_Template_Counters`
```
Columns:
- pattern_id (Title) - e.g., "NA-EM-IM-SM"
- current_count (Number)
- last_used (Last Edited Time)
```

### 2. Create Notion Integration

1. Go to https://developers.notion.com/
2. Create new integration: "3C Template Engine"
3. Copy the Integration Token
4. Share all 3 databases with your integration
5. Get database IDs from the URLs

### 3. Environment Variables

Add to your GitHub repository secrets or environment:

```bash
# Notion Integration
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_TEMPLATES_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DASHBOARD_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_COUNTERS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Dashboard Configuration
DASHBOARD_BASE_URL=https://threadcommand.center/dashboard/settings
```

## Integration with Existing Code

### Option 1: Replace Current Builder
- Replace your existing `index.html` with `template-builder.html`
- This gives you the complete new interface

### Option 2: Add to Existing System
- Keep `template-builder.html` as separate page
- Add navigation link from your existing `index.html`
- Integrate the JavaScript classes into your existing `script.js`

## Template Builder Features Ready Now

✅ **Complete Dropdown System** - All choice fields with proper abbreviations
✅ **Two-Phase Workflow** - Selection → Creation → Review
✅ **Platform-Specific Fields** - Dynamic forms based on platform constraints
✅ **Template ID Generation** - NA-EM-IM-SM-001 format
✅ **Character Counting** - Real-time validation with warnings
✅ **Hashtag Management** - Platform-specific limits
✅ **Responsive Design** - Works on desktop and mobile

## Template ID Logic

```javascript
// Pattern: NA-EM-IM-SM-001
// Theme-Audience-Media-Template-Number

// Search Logic:
// If user creates NA-EM-IM-SM template
// System checks for existing NA-EM-IM-SM-XXX
// Shows options: Edit existing | Make a copy | Create new | Exit
```

## Platform-Specific Configurations

Each platform has different constraints:

- **Instagram**: Title 125 chars, Description 2200 chars, 30 hashtags
- **Twitter**: No title, Description 280 chars, 2 hashtags  
- **LinkedIn**: Title 150 chars, Description 3000 chars, 5 hashtags
- **YouTube**: Title 100 chars, Description 5000 chars, 15 hashtags

The system automatically adjusts field visibility and limits based on platform selection.

## Testing Workflow

1. Open `template-builder.html` in browser
2. Select: Theme (News Alert) → Audience (Existing Members) → Media (Image) → Template (Social Media)
3. Watch Template ID generate: `NA-EM-IM-SM-001`
4. Click "Create Template" → See platform-specific fields
5. Select platform → See constraints adjust dynamically
6. Fill content → Test character counting and hashtag limits

## Next Development Steps

1. **Test the UI thoroughly** with the HTML file
2. **Set up Notion databases** with exact column structure
3. **Connect Notion API** using the integration code
4. **Test template saving/loading** workflow
5. **Implement dashboard forwarding** with team assignment
6. **Add template search** with edit/copy options

## File Organization

```
project/
├── template-builder.html (main builder)
├── notion-integration.js (API integration)  
├── index.html (your existing homepage)
├── script.js (your existing scripts)
├── style.css (your existing styles)
└── platforms.json (your existing config)
```

## Ready for Production

The template builder is engineered to handle:
- Complex platform matrix (9 platforms × content types × constraints)
- Intelligent form adaptation based on platform capabilities  
- Template ID pattern matching and auto-incrementing
- Notion database relationships and data integrity
- Team workflow with assignment and status tracking

The foundation is solid for scaling your content creation system.
