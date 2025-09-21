const { createClient } = require('@supabase/supabase-js');

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

    // FIXED: Use current form data from POST body instead of fetching original template
    const currentTemplateData = req.body;
    
    if (!currentTemplateData) {
      return res.status(400).json({ error: 'Template data is required in request body' });
    }

    console.log('Forwarding current form data:', currentTemplateData.templateId);

    // FIXED: Map current form data to pending_content_library schema directly
    const insertData = {
      template_id: currentTemplateData.templateId,
      content_title: currentTemplateData.content.title || 'Untitled Template',
      content_id: `content_${Date.now()}`,
      
      // Map current selections to pending_content_library format
      character_profile: currentTemplateData.selections.character?.value || null,
      theme: currentTemplateData.selections.theme?.value || null,
      audience: currentTemplateData.selections.audience?.value || null,
      media_type: currentTemplateData.selections.media?.value || null,
      template_type: currentTemplateData.selections.template_type?.value || null,
      platform: currentTemplateData.selections.platform?.value || null,
      voice_style: currentTemplateData.selections.voice?.value || null,
      
      // Map current content to pending_content_library format
      title: currentTemplateData.content.title || '',
      description: currentTemplateData.content.description || '',
      hashtags: currentTemplateData.content.hashtags || [],
      keywords: currentTemplateData.content.keywords || '',
      cta: currentTemplateData.content.cta || '',
      
      // Standard fields for pending_content_library
      media_files: [],
      selected_platforms: currentTemplateData.selections.platform?.value ? [currentTemplateData.selections.platform.value] : [],
      status: 'pending',
      is_from_template: true,
      source_template_id: currentTemplateData.templateId,
      user_id: null, // Will be set by Supabase auth if available
      created_by: 'template_engine',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    };

    console.log('Insert data prepared with current form data:', Object.keys(insertData));

    // Insert current form data into pending_content_library
    const { data, error } = await supabase
      .from('pending_content_library')
      .insert(insertData)
      .select()
      .single();
      
    if (error) {
      console.error('Insert error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return res.status(500).json({
        error: 'Failed to forward template',
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }

    console.log('Successfully inserted current form data into pending_content_library');

    res.status(200).json({
      success: true,
      message: 'Template forwarded to Template Library successfully',
      data: {
        templateId: currentTemplateData.templateId,
        platform: currentTemplateData.selections.platform?.value,
        forwardedAt: new Date().toISOString(),
        libraryEntry: data,
        pendingTemplateId: data.id
      }
    });

  } catch (error) {
    console.error('Forward template error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    });
  }
}
