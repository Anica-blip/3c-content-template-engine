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

    // Get template from content_templates table
    const { data: template, error: fetchError } = await supabase
      .from('content_templates')
      .select('*')
      .eq('template_id', templateId)
      .eq('is_active', true)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Template not found',
          templateId: templateId
        });
      }
      throw fetchError;
    }

    // Check if platform is selected
    if (!template.platform_value) {
      return res.status(400).json({
        error: 'Template must have platform selected for forwarding'
      });
    }

    // Create COPY in pending_content_library table ONLY
    const forwardData = {
      template_id: template.template_id,
      content_title: template.content_title || 'Untitled Template',
      character_profile: template.character_value,
      theme: template.theme_value,
      audience: template.audience_value,
      media_type: template.media_value,
      template_type: template.template_type_value,
      platform: template.platform_value,
      title: template.content_title || '',
      description: template.content_description || '',
      hashtags: template.content_hashtags || [],
      keywords: template.content_keywords || '',
      cta: template.content_cta || '',
      media_files: [],
      selected_platforms: template.platform_value ? [template.platform_value] : [],
      status: 'pending',
      is_from_template: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: template.user_id || 'system',
      created_by: 'content_template_engine'
    };

    // Insert COPY into pending_content_library table
    const { data: insertData, error: insertError } = await supabase
      .from('pending_content_library')
      .insert(forwardData)
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ 
        error: 'Failed to forward template to Template Library',
        details: insertError.message 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Template forwarded to Template Library successfully',
      data: {
        templateId: templateId,
        platform: template.platform_value,
        forwardedAt: new Date().toISOString(),
        libraryEntry: insertData,
        pendingTemplateId: insertData.id
      }
    });

  } catch (error) {
    console.error('Forward template error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
