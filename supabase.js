// supabase.js - Supabase client configuration for 3C Template Engine
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Initialize with validation
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client created successfully');
} else {
  console.error('Missing Supabase environment variables');
}

// Template Engine API
const templateEngineAPI = {
  // Search for existing templates by pattern
  async searchExistingTemplates(templateId) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const searchPattern = templateId.substring(0, templateId.lastIndexOf('-'));
      console.log('Searching for pattern:', searchPattern);
      
      const { data, error } = await supabase
        .from('content_templates')
        .select('*')
        .like('template_id', `${searchPattern}-%`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching templates:', error);
      throw error;
    }
  },

  // Load specific template by ID
  async loadTemplate(templateId) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { data, error } = await supabase
        .from('content_templates')
        .select('*')
        .eq('template_id', templateId)
        .eq('is_active', true)
        .single();
        
      if (error) throw error;
      
      // Transform data back to expected format
      return {
        templateId: data.template_id,
        selections: {
          theme: data.theme_code ? { value: data.theme_value, code: data.theme_code } : null,
          character: data.character_value ? { value: data.character_value, code: null } : null,
          voice: data.voice_value ? { value: data.voice_value, code: null } : null,
          audience: data.audience_code ? { value: data.audience_value, code: data.audience_code } : null,
          media: data.media_code ? { value: data.media_value, code: data.media_code } : null,
          template_type: data.template_type_code ? { value: data.template_type_value, code: data.template_type_code } : null,
          platform: data.platform_code ? { value: data.platform_value, code: data.platform_code } : null
        },
        content: {
          title: data.content_title || '',
          description: data.content_description || '',
          hashtags: data.content_hashtags || [],
          keywords: data.content_keywords || '',
          credits: data.content_credits || '',
          cta: data.content_cta || ''
        },
        timestamp: data.created_at,
        phase: data.phase || 'creation',
        status: data.status || 'draft'
      };
    } catch (error) {
      console.error('Error loading template:', error);
      throw error;
    }
  },

  // Generate next available template ID
  async generateTemplateId(selections) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const theme = selections.theme?.code || 'XX';
      const audience = selections.audience?.code || 'XX';
      const media = selections.media?.code || 'XX';
      const template = selections.template_type?.code || 'XX';
      
      const pattern = `${theme}-${audience}-${media}-${template}`;
      
      // Find highest number for this pattern
      const { data, error } = await supabase
        .from('content_templates')
        .select('template_id')
        .like('template_id', `${pattern}-%`)
        .eq('is_active', true)
        .order('template_id', { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastId = data[0].template_id;
        const lastNumber = parseInt(lastId.split('-').pop());
        nextNumber = lastNumber + 1;
      }
      
      return `${pattern}-${String(nextNumber).padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating template ID:', error);
      throw error;
    }
  },

  // Save template
  async saveTemplate(templateData) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;
      
      const insertData = {
        template_id: templateData.templateId,
        
        // Selection data
        theme_value: templateData.selections.theme?.value || null,
        theme_code: templateData.selections.theme?.code || null,
        character_value: templateData.selections.character?.value || null,
        voice_value: templateData.selections.voice?.value || null,
        audience_value: templateData.selections.audience?.value || null,
        audience_code: templateData.selections.audience?.code || null,
        media_value: templateData.selections.media?.value || null,
        media_code: templateData.selections.media?.code || null,
        template_type_value: templateData.selections.template_type?.value || null,
        template_type_code: templateData.selections.template_type?.code || null,
        platform_value: templateData.selections.platform?.value || null,
        platform_code: templateData.selections.platform?.code || null,
        
        // Content data
        content_title: templateData.content.title || null,
        content_description: templateData.content.description || null,
        content_hashtags: templateData.content.hashtags || [],
        content_keywords: templateData.content.keywords || null,
        content_credits: templateData.content.credits || null,
        content_cta: templateData.content.cta || null,
        
        // Metadata
        phase: templateData.phase || 'creation',
        status: 'template',
        
        // Required user tracking
        user_id: userId,
        created_by: userId,
        is_active: true
      };
      
      // Check if template exists
      const { data: existing } = await supabase
        .from('content_templates')
        .select('id')
        .eq('template_id', templateData.templateId)
        .eq('is_active', true)
        .single();
        
      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('content_templates')
          .update(insertData)
          .eq('id', existing.id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('content_templates')
          .insert(insertData)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  },

  // Delete/archive template
  async deleteTemplate(templateId) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { error } = await supabase
        .from('content_templates')
        .update({ 
          is_active: false, 
          status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('template_id', templateId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

// Forward template to dashboard
async forwardToDashboard(templateData) {
  if (!supabase) throw new Error('Supabase not configured');
  try {
    // Update status to forwarded
    const { error } = await supabase
      .from('content_templates')
      .update({ 
        status: 'forwarded',
        updated_at: new Date().toISOString()
      })
      .eq('template_id', templateData.templateId);
      
    if (error) throw error;
    
    // Here you could also create an entry in a dashboard_queue table
    // or trigger other dashboard-related actions
    
    return true;
  } catch (error) {
    console.error('Error forwarding to dashboard:', error);
    throw error;
    }
  }
};

export { supabase, templateEngineAPI };
