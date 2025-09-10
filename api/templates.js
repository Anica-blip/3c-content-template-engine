import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    // ADDED: Handle GET requests for loading templates
    if (req.method === 'GET') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          error: 'Template ID required',
          message: 'Template ID must be provided'
        });
      }

      const { data, error } = await supabase
        .from('content_templates')
        .select('*')
        .eq('template_id', id)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return res.status(404).json({
          error: 'Template not found',
          message: `Template ${id} does not exist`
        });
      }

      return res.status(200).json({
        success: true,
        data: data
      });
    }

    // EXISTING: Handle POST requests for saving templates
    if (req.method === 'POST') {
      const { templateData } = req.body;
      
      if (!templateData || !templateData.templateId) {
        return res.status(400).json({
          error: 'Invalid template data',
          message: 'templateData and templateId are required'
        });
      }

      // Structure data like your working sample
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
      
      // Upsert logic from your working sample
      const { data: existing } = await supabase
        .from('content_templates')
        .select('id')
        .eq('template_id', templateData.templateId)
        .eq('is_active', true)
        .maybeSingle();
        
      if (existing) {
        // Update
        const { data, error } = await supabase
          .from('content_templates')
          .update({ ...insertData, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        
        res.status(200).json({
          success: true,
          message: 'Template updated successfully',
          data: data
        });
      } else {
        // Insert
        const { data, error } = await supabase
          .from('content_templates')
          .insert(insertData)
          .select()
          .single();
        if (error) throw error;
        
        res.status(201).json({
          success: true,
          message: 'Template saved successfully',
          data: data
        });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Template operation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
