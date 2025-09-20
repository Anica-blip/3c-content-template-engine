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

    // Get template from content_templates - SAME AS WORKING SAVE
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

    // Create data for pending_content_library - SAME PATTERN AS WORKING SAVE
    const insertData = {
      template_id: template.template_id,
      
      // Core fields - same structure as saveTemplate
      theme_value: template.theme_value,
      theme_code: template.theme_code,
      character_value: template.character_value,
      voice_value: template.voice_value,
      audience_value: template.audience_value,
      audience_code: template.audience_code,
      media_value: template.media_value,
      media_code: template.media_code,
      template_type_value: template.template_type_value,
      template_type_code: template.template_type_code,
      platform_value: template.platform_value,
      platform_code: template.platform_code,
      
      // Content data - same structure as saveTemplate
      content_title: template.content_title,
      content_description: template.content_description,
      content_hashtags: template.content_hashtags || [],
      content_keywords: template.content_keywords,
      content_credits: template.content_credits,
      content_cta: template.content_cta,
      
      // Metadata - same structure as saveTemplate
      phase: template.phase || 'creation',
      status: 'pending',
      
      // User tracking - same structure as saveTemplate
      user_id: template.user_id,
      created_by: template.created_by,
      is_active: true
    };

    // Insert into pending_content_library - SAME PATTERN AS WORKING SAVE
    const { data, error } = await supabase
      .from('pending_content_library')
      .insert(insertData)
      .select()
      .single();
      
    if (error) throw error;

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
      message: error.message
    });
  }
}
