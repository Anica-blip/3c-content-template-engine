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

    const { templateData } = req.body;
    
    if (!templateData || !templateData.templateId) {
      return res.status(400).json({
        error: 'Invalid template data',
        message: 'templateData and templateId are required'
      });
    }

    // Map to actual table columns
    const { data, error } = await supabase
      .from('content_templates')
      .insert([{
        template_id: templateData.templateId,
        // Selections - separate columns
        theme_value: templateData.selections?.theme?.value || null,
        theme_code: templateData.selections?.theme?.code || null,
        character_value: templateData.selections?.character?.value || null,
        voice_value: templateData.selections?.voice?.value || null,
        audience_value: templateData.selections?.audience?.value || null,
        audience_code: templateData.selections?.audience?.code || null,
        media_value: templateData.selections?.media?.value || null,
        media_code: templateData.selections?.media?.code || null,
        template_type_value: templateData.selections?.template_type?.value || null,
        template_type_code: templateData.selections?.template_type?.code || null,
        platform_value: templateData.selections?.platform?.value || null,
        platform_code: templateData.selections?.platform?.code || null,
        // Content - separate columns
        content_title: templateData.content?.title || null,
        content_description: templateData.content?.description || null,
        content_hashtags: templateData.content?.hashtags || null,
        content_keywords: templateData.content?.keywords || null,
        content_credits: templateData.content?.credits || null,
        content_cta: templateData.content?.cta || null,
        // Other fields
        phase: templateData.phase || 'creation',
        status: 'active',
        user_id: null,
        created_by: null,
        is_active: true
      }])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Template saved successfully',
      data: data[0]
    });

  } catch (error) {
    console.error('Save template error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
