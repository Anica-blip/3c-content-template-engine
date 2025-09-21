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

    const { formData } = req.body;
    
    if (!formData) {
      return res.status(400).json({ error: 'Form data is required' });
    }

    // MINIMAL DATA - Only absolutely required fields to identify the constraint issue
    const newContentId = `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const insertData = {
      content_id: newContentId,
      template_id: formData.templateId,
      status: 'pending',
      is_active: true
    };

    console.log('Testing minimal insert:', insertData);

    const { data: savedData, error: saveError } = await supabase
      .from('pending_content_library')
      .insert(insertData)
      .select()
      .single();

    if (saveError) {
      console.error('EXACT ERROR:', {
        message: saveError.message,
        details: saveError.details,
        hint: saveError.hint,
        code: saveError.code
      });
      
      return res.status(500).json({
        error: 'Minimal insert failed',
        supabaseError: {
          message: saveError.message,
          details: saveError.details,
          hint: saveError.hint,
          code: saveError.code
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Minimal insert worked',
      data: savedData
    });

  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({
      error: 'Handler error',
      message: error.message
    });
  }
}
