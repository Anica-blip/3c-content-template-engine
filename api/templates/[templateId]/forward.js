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

    // Get template first
    const { data: template, error: fetchError } = await supabase
      .from('content_templates')
      .select('*')
      .eq('template_id', templateId)
      .eq('status', 'active')
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

    if (!template.selections?.platform) {
      return res.status(400).json({
        error: 'Template must have platform selected for forwarding'
      });
    }

    // Update template status to forwarded
    const { error: updateError } = await supabase
      .from('content_templates')
      .update({ 
        status: 'forwarded',
        forwarded_at: new Date().toISOString()
      })
      .eq('template_id', templateId);

    if (updateError) throw updateError;

    // Insert into pending_content_library for Template Library
    const forwardData = {
      template_id: template.template_id,
      content_title: template.content?.title || template.content_title || 'Untitled Template',
      character_profile: template.selections?.character?.value || null,
      theme: template.selections?.theme?.value || null,
      audience: template.selections?.audience?.value || null,
      media_type: template.selections?.media?.value || null,
      template_type: template.selections?.template_type?.value || null,
      platform: template.selections?.platform?.value || null,
      title: template.content?.title || template.content_title || '',
      description: template.content?.description || template.content_description || '',
      hashtags: template.content?.hashtags || template.content_hashtags || [],
      keywords: template.content?.keywords || template.content_keywords || '',
      cta: template.content?.cta || template.content_cta || '',
      media_files: [],
      selected_platforms: template.selections?.platform ? [template.selections.platform.value] : [],
      // Template Library specific fields
      status: 'pending',
      is_from_template: true,
      is_active: true,
      created_at: new Date().toISOString(),
      user_id: 'system', // Replace with actual user ID if available
      created_by: 'content_template_engine'
    };

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
        platform: template.selections.platform.value,
        forwardedAt: new Date().toISOString(),
        status: 'forwarded',
        libraryEntry: insertData
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
