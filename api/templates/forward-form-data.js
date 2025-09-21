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

    console.log('Creating NEW copy in pending_content_library from form data');

    // Generate completely new content_id for this copy
    const newContentId = `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // SIMPLE: Just save the template_id as is, no validation or checking
    const insertData = {
      content_id: newContentId,
      template_id: formData.templateId,  // Use template_id exactly as passed
      content_title: formData.content.title || 'Untitled Copy',
      
      // Match pending_content_library schema exactly
      character_profile: formData.selections.character?.value || null,
      theme: formData.selections.theme?.value || null,
      audience: formData.selections.audience?.value || null,
      media_type: formData.selections.media?.value || null,
      template_type: formData.selections.template_type?.value || null,
      platform: formData.selections.platform?.value || null,
      voice_style: formData.selections.voice?.value || null,
      
      // Content fields
      title: formData.content.title || '',
      description: formData.content.description || '',
      hashtags: formData.content.hashtags || [],
      keywords: formData.content.keywords || '',
      cta: formData.content.cta || '',
      
      // Basic metadata
      status: 'pending',
      is_from_template: true,
      source_template_id: formData.templateId,
      is_active: true,
      selected_platforms: formData.selections.platform?.value ? [formData.selections.platform.value] : [],
      media_files: [],
      user_id: null,
      created_by: 'template_engine_copy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Inserting to pending_content_library with content_id:', newContentId);

    // DIRECT INSERT - no validation, no checking
    const { data: savedData, error: saveError } = await supabase
      .from('pending_content_library')
      .insert(insertData)
      .select()
      .single();

    if (saveError) {
      console.error('Insert failed:', saveError);
      return res.status(500).json({
        error: 'Failed to create copy',
        message: saveError.message,
        details: saveError.details
      });
    }

    console.log('Copy created successfully:', savedData.id);

    res.status(201).json({
      success: true,
      message: 'New copy created in Template Library',
      data: {
        pendingTemplateId: savedData.id,
        newContentId: newContentId,
        sourceTemplateId: formData.templateId,
        platform: formData.selections.platform?.value,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Forward error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
