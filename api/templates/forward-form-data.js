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

    // FIXED: Use ONLY the fields that actually exist in pending_content_library schema
    const insertData = {
      // Generate new unique content_id for this copy
      content_id: newContentId,
      
      // Use original template_id as reference but this is a NEW copy
      template_id: formData.templateId,
      content_title: formData.content.title || 'Untitled Copy',
      
      // RESTORED: voiceStyle field (was added later to schema)
      character_profile: formData.selections.character?.value || null,
      theme: formData.selections.theme?.value || null,
      audience: formData.selections.audience?.value || null,
      media_type: formData.selections.media?.value || null,
      template_type: formData.selections.template_type?.value || null,
      platform: formData.selections.platform?.value || null,
      voice_style: formData.selections.voice?.value || null,
      
      // Current content from form - using simple field names from schema
      title: formData.content.title || '',
      description: formData.content.description || '',
      hashtags: formData.content.hashtags || [],
      keywords: formData.content.keywords || '',
      cta: formData.content.cta || '',
      
      // Optional fields that exist in schema
      selected_platforms: formData.selections.platform?.value ? [formData.selections.platform.value] : [],
      media_files: [],
      
      // Mark this as a copy from template
      status: 'pending',
      is_from_template: true,
      source_template_id: formData.templateId, // Reference to original
      is_active: true,
      user_id: null,
      created_by: 'template_engine_copy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Inserting NEW copy to pending_content_library with content_id:', newContentId);

    // ALWAYS INSERT - never update existing
    const { data: savedData, error: saveError } = await supabase
      .from('pending_content_library')
      .insert(insertData)
      .select()
      .single();

    if (saveError) {
      console.error('Failed to create new copy - Full error details:', {
        message: saveError.message,
        details: saveError.details,
        hint: saveError.hint,
        code: saveError.code
      });
      return res.status(500).json({
        error: 'Failed to create new copy in pending library',
        message: saveError.message,
        details: saveError.details,
        hint: saveError.hint,
        code: saveError.code,
        insertData: Object.keys(insertData) // Show what fields we tried to insert
      });
    }

    console.log('NEW copy created successfully with ID:', savedData.id);

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
    console.error('Forward form data error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
