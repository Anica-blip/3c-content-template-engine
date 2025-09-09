const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client with environment variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test Supabase connection
app.get('/api/test-connection', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('content_templates')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    res.json({ 
      status: 'connected', 
      message: 'Supabase connection successful' 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Search templates by pattern
app.get('/api/templates/search/:pattern', async (req, res) => {
  try {
    const { pattern } = req.params;
    
    const { data, error } = await supabase
      .from('content_templates')
      .select('*')
      .like('template_id', `${pattern}-%`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    res.json({ data: data || [] });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Load specific template by ID
app.get('/api/templates/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const { data, error } = await supabase
      .from('content_templates')
      .select('*')
      .eq('template_id', templateId)
      .eq('is_active', true)
      .single();
      
    if (error) throw error;
    
    // Transform data to expected format
    const transformedData = {
      templateId: data.template_id,
      selections: {
        theme: data.theme_code ? { value: data.theme_value, code: data.theme_code } : null,
        character: data.character_value ? { value: data.character_value, code: null } : null,
        voice: data.voice_value ? { value: data.voice_value, code: null } : null,
        audience: data.audience_code ? { value: data.audience_value, code: data.audience_code } : null,
        media: data.media_code ? { value: data.media_value, code: data.media_code } : null,
        template_type: data.template_type_code ? { value: data.template_type_value, code: data.template_type_code } : null,
        platform: data.platform_code ? { value: data.platform_value, code: data.platform_code } : null
      },
      content: {
        title: data.content_title || '',
        description: data.content_description || '',
        hashtags: data.content_hashtags || [],
        keywords: data.content_keywords || '',
        credits: data.content_credits || '',
        cta: data.content_cta || ''
      },
      timestamp: data.created_at,
      phase: data.phase || 'creation',
      status: data.status || 'draft'
    };
    
    res.json({ data: transformedData });
  } catch (error) {
    console.error('Load template error:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Generate next available template ID
app.post('/api/templates/generate-id', async (req, res) => {
  try {
    const { selections } = req.body;
    
    const theme = selections.theme?.code || 'XX';
    const audience = selections.audience?.code || 'XX';
    const media = selections.media?.code || 'XX';
    const template = selections.template_type?.code || 'XX';
    
    const pattern = `${theme}-${audience}-${media}-${template}`;
    
    // Find highest number for this pattern
    const { data, error } = await supabase
      .from('content_templates')
      .select('template_id')
      .like('template_id', `${pattern}-%`)
      .eq('is_active', true)
      .order('template_id', { ascending: false })
      .limit(1);
      
    if (error) throw error;
    
    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastId = data[0].template_id;
      const lastNumber = parseInt(lastId.split('-').pop());
      nextNumber = lastNumber + 1;
    }
    
    const templateId = `${pattern}-${String(nextNumber).padStart(3, '0')}`;
    
    res.json({ templateId });
  } catch (error) {
    console.error('Generate ID error:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Save template (create or update)
app.post('/api/templates', async (req, res) => {
  try {
    const { templateData } = req.body;
    
    const insertData = {
      template_id: templateData.templateId,
      theme_value: templateData.selections.theme?.value || null,
      theme_code: templateData.selections.theme?.code || null,
      character_value: templateData.selections.character?.value || null,
      voice_value: templateData.selections.voice?.value || null,
      audience_value: templateData.selections.audience?.value || null,
      audience_code: templateData.selections.audience?.code || null,
      media_value: templateData.selections.media?.value || null,
      media_code: templateData.selections.media?.code || null,
      template_type_value: templateData.selections.template_type?.value || null,
      template_type_code: templateData.selections.template_type?.code || null,
      platform_value: templateData.selections.platform?.value || null,
      platform_code: templateData.selections.platform?.code || null,
      content_title: templateData.content.title || null,
      content_description: templateData.content.description || null,
      content_hashtags: templateData.content.hashtags || [],
      content_keywords: templateData.content.keywords || null,
      content_credits: templateData.content.credits || null,
      content_cta: templateData.content.cta || null,
      phase: templateData.phase || 'creation',
      status: 'template',
      user_id: null,
      created_by: null,
      is_active: true
    };
    
    // Check if template exists
    const { data: existing } = await supabase
      .from('content_templates')
      .select('id')
      .eq('template_id', templateData.templateId)
      .eq('is_active', true)
      .maybeSingle();
      
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('content_templates')
        .update({ ...insertData, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
        
      if (error) throw error;
      res.json({ data, action: 'updated' });
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('content_templates')
        .insert(insertData)
        .select()
        .single();
        
      if (error) throw error;
      res.json({ data, action: 'created' });
    }
  } catch (error) {
    console.error('Save template error:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Delete (archive) template
app.delete('/api/templates/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const { error } = await supabase
      .from('content_templates')
      .update({ 
        is_active: false, 
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('template_id', templateId);
      
    if (error) throw error;
    
    res.json({ 
      message: 'Template archived successfully',
      templateId 
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Forward template to dashboard
app.post('/api/templates/:templateId/forward', async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const { error } = await supabase
      .from('content_templates')
      .update({ 
        status: 'forwarded',
        updated_at: new Date().toISOString()
      })
      .eq('template_id', templateId);
      
    if (error) throw error;
    
    res.json({ 
      message: 'Template forwarded to dashboard successfully',
      templateId 
    });
  } catch (error) {
    console.error('Forward template error:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found' 
  });
});

app.listen(PORT, () => {
  console.log(`Template Engine API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
