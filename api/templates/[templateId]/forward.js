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

    // Get the full template data from content_templates
    const { data: fullTemplate, error: fetchError } = await supabase
      .from('content_templates')
      .select('*')
      .eq('template_id', templateId)
      .eq('is_active', true)
      .single();
      
    if (fetchError || !fullTemplate) {
      if (fetchError && fetchError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Template not found',
          templateId: templateId
        });
      }
      throw new Error(`Template ${templateId} not found`);
    }

    // Create a COPY for Template Library (pending_content_library table) - EXACT SAME AS SUPABASE.JS
    const pendingTemplateData = {
      id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      template_id: fullTemplate.template_id,
      content_title: fullTemplate.content_title || 'Untitled Template',
      content_id: `content_${Date.now()}`,
      
      // Transform template data to Template Library format
      character_profile: fullTemplate.character_value,
      theme: fullTemplate.theme_value,
      audience: fullTemplate.audience_value,
      media_type: fullTemplate.media_value,
      template_type: fullTemplate.template_type_value,
      platform: fullTemplate.platform_value,
      
      // Content fields
      title: fullTemplate.content_title,
      description: fullTemplate.content_description,
      hashtags: fullTemplate.content_hashtags || [],
      keywords: fullTemplate.content_keywords,
      cta: fullTemplate.content_cta,
      
      // Template Library specific fields
      status: 'pending',
      is_from_template: true,
      source_template_id: fullTemplate.template_id,
      is_active: true,
      voiceStyle: fullTemplate.voice_value,
      
      // Platform selection for form
      selected_platforms: fullTemplate.platform_value ? [fullTemplate.platform_value] : [],
      media_files: [],
      
      // Timestamps and user info
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: fullTemplate.user_id,
      created_by: 'template_engine'
    };

    // Insert COPY into pending_content_library table (Template Library reads from here)
    const { data: insertedData, error: insertError } = await supabase
      .from('pending_content_library')
      .insert(pendingTemplateData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating template copy:', insertError);
      return res.status(500).json({ 
        error: 'Failed to forward template to Template Library',
        details: insertError.message 
      });
    }

    // NOTE: Original template remains unchanged in content_templates table
    
    res.status(200).json({
      success: true,
      message: 'Template copy forwarded to dashboard successfully',
      data: {
        pendingTemplateId: insertedData.id,
        originalTemplateId: templateId,
        forwardedAt: new Date().toISOString()
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
