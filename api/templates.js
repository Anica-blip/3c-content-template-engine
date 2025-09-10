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

    const { data, error } = await supabase
      .from('content_templates')
      .insert([{
        template_id: templateData.templateId,
        theme_value: templateData.selections?.theme?.value,
        theme_code: templateData.selections?.theme?.code,
        character_value: templateData.selections?.character?.value,
        voice_value: templateData.selections?.voice?.value,
        audience_value: templateData.selections?.audience?.value,
        audience_code: templateData.selections?.audience?.code,
        media_value: templateData.selections?.media?.value,
        media_code: templateData.selections?.media?.code,
        template_type_value: templateData.selections?.template_type?.value,
        template_type_code: templateData.selections?.template_type?.code,
        platform_value: templateData.selections?.platform?.value,
        platform_code: templateData.selections?.platform?.code,
        content_title: templateData.content?.title,
        content_description: templateData.content?.description,
        content_hashtags: templateData.content?.hashtags,
        content_keywords: templateData.content?.keywords,
        content_credits: templateData.content?.credits,
        content_cta: templateData.content?.cta,
        phase: templateData.phase,
        status: 'active',
        is_active: true
      }]);

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0]
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}
