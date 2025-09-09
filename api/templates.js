import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Initialize Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  if (req.method === 'POST') {
    // Handle template creation/update
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
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
