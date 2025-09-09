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
    const { data, error } = await supabase
      .from('content_templates')
      .update({ 
        status: 'forwarded',
        forwarded_at: new Date().toISOString()
      })
      .eq('template_id', templateId)
      .select();

    if (error) throw error;

    const forwardData = {
      templateId: templateId,
      platform: template.selections.platform.value,
      content: template.content,
      forwardedAt: new Date().toISOString(),
      status: 'forwarded'
    };

    res.status(200).json({
      success: true,
      message: 'Template forwarded to dashboard successfully',
      data: forwardData
    });

  } catch (error) {
    console.error('Forward template error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
