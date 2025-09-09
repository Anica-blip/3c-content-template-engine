import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { templateId } = req.query;
  
  // Initialize Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  if (req.method === 'GET') {
    // Load specific template
    try {
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
      res.status(500).json({ error: error.message });
    }
  } 
  else if (req.method === 'DELETE') {
    // Delete (archive) template
    try {
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
      res.status(500).json({ error: error.message });
    }
  }
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
