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

    const { data, error } = await supabase
      .from('content_templates')
      .insert([{
        template_id: templateData.templateId,
        selections: templateData.selections,
        content: templateData.content,
        timestamp: templateData.timestamp,
        phase: templateData.phase,
        is_valid: templateData.isValid,
        status: 'active'
      }])
      .select();

    if (error) throw error;

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
