import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    const { templateId } = req.query;
    
    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    // Get template from content_templates
    const { data: template, error: fetchError } = await supabase
      .from('content_templates')
      .select('*')
      .eq('template_id', templateId)
      .eq('is_active', true)
      .single();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Template not found',
          templateId: templateId
        });
      }
      throw fetchError;
    }

    console.log('Template found:', template.template_id);

    // Map to pending_content_library schema - NO manual ID
    const insertData = {
      template_id: template.template_id,
      content_title: template.content_title || 'Untitled Template',
      content_id: `content_${Date.now()}`,
      character_profile: template.character_value || null,
      theme: template.theme_value || null,
      audience: template.audience_value || null,
      media_type: template.media_value || null,
      template_type: template.template_type_value || null,
      platform: template.platform_value || null,
      title: template.content_title || '',
      description: template.content_description || '',
      hashtags: template.content_hashtags || [],
      keywords: template.content_keywords || '',
      cta: template.content_cta || '',
      media_files: [],
      selected_platforms: template.platform_value ? [template.platform_value] : [],
      status: 'pending',
      is_from_template: true,
      source_template_id: template.template_id,
      user_id: template.user_id || 'system',
      created_by: 'content_template_engine',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    };

    console.log('Insert data prepared:', Object.keys(insertData));

    // Insert into pending_content_library
    const { data, error } = await supabase
      .from('pending_content_library')
      .insert(insertData)
      .select()
      .single();
      
    if (error) {
      console.error('Insert error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return res.status(500).json({
        error: 'Failed to forward template',
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }

    console.log('Successfully inserted into pending_content_library');

    res.status(200).json({
      success: true,
      message: 'Template forwarded to Template Library successfully',
      data: {
        templateId: templateId,
        platform: template.platform_value,
        forwardedAt: new Date().toISOString(),
        libraryEntry: data
      }
    });

  } catch (error) {
    console.error('Forward template error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    });
  }
}
