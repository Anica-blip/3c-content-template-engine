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

    console.log('Forwarding form data to pending_content_library:', formData.templateId);

    // Map current form data directly to pending_content_library schema
    const insertData = {
      template_id: formData.templateId,
      content_title: formData.content.title || 'Untitled Template',
      content_id: `content_${Date.now()}`, // Generate new content_id for this copy
      
      // Current selections from form (not from original template)
      character_profile: formData.selections.character?.value || null,
      theme: formData.selections.theme?.value || null,
      audience: formData.selections.audience?.value || null,
      media_type: formData.selections.media?.value || null,
      template_type: formData.selections.template_type?.value || null,
      platform: formData.selections.platform?.value || null,
      voiceStyle: formData.selections.voice?.value || null,
      
      // Current content from form
      title: formData.content.title || '',
      description: formData.content.description || '',
      hashtags: formData.content.hashtags || [],
      keywords: formData.content.keywords || '',
      cta: formData.content.cta || '',
      
      // Standard fields for pending_content_library
      status: 'pending',
      is_from_template: true,
      source_template_id: formData.templateId, // Reference to source template
      is_active: true,
      selected_platforms: formData.selections.platform?.value ? [formData.selections.platform.value] : [],
      media_files: [],
      user_id: null,
      created_by: 'template_engine',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Saving form data copy to pending_content_library:', Object.keys(insertData));

    // Insert into pending_content_library table as NEW copy
    const { data: savedData, error: saveError } = await supabase
      .from('pending_content_library')
      .insert(insertData)
      .select()
      .single();

    if (saveError) {
      console.error('Database save error:', saveError);
      return res.status(500).json({
        error: 'Failed to save copy to pending library',
        message: saveError.message,
        details: saveError.details,
        hint: saveError.hint,
        code: saveError.code
      });
    }

    console.log('Form data copy saved successfully:', savedData.id);

    res.status(200).json({
      success: true,
      message: 'Form data forwarded as new copy to Template Library',
      data: {
        pendingTemplateId: savedData.id,
        sourceTemplateId: formData.templateId,
        platform: formData.selections.platform?.value,
        forwardedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Forward form data error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    });
  }
}
