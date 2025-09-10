import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { templateId } = req.query;
  
  if (!templateId) {
    return res.status(400).json({ error: 'Template ID is required' });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('content_templates')
        .select('*')
        .eq('template_id', templateId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Template not found',
            templateId: templateId
          });
        }
        throw error;
      }

      res.status(200).json({
        success: true,
        data: data
      });

    } else if (req.method === 'DELETE') {
      const { data, error } = await supabase
        .from('content_templates')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('template_id', templateId)
        .select();

      if (error) throw error;

      if (data.length === 0) {
        return res.status(404).json({
          error: 'Template not found',
          templateId: templateId
        });
      }

      res.status(200).json({
        success: true,
        message: 'Template deleted successfully',
        templateId: templateId
      });

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
