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

    // Prepare data for insertion - match your actual table structure
    const insertData = {
      template_id: templateData.templateId,
      selections: templateData.selections,
      content: templateData.content,
      phase: templateData.phase || 'creation',
      is_valid: templateData.isValid || false,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Attempting to insert:', insertData);

    const { data, error } = await supabase
      .from('content_templates')
      .insert([insertData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    }

    if (!data || data.length === 0) {
      return res.status(500).json({
        error: 'Insert failed',
        message: 'No data returned from insert operation'
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
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
