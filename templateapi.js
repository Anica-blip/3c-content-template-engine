// templateapi.js — 3C Content Template Engine
// Talks to Supabase directly with the owner's sign-in (no server routes, no secret key).
// The database rules (owner-only) are what protect content_templates and pending_content_library.
// Needs, loaded BEFORE this file:  Supabase library  +  config.js  +  auth.js
// Same method names and results as the old /api version, so index.html keeps working unchanged.
// Built by Claude (Anthropic) × Chef Anica · 3C Thread To Success Cooking Lab

(() => {
  if (window.__TEMPLATE_API_LOADED__) return;
  window.__TEMPLATE_API_LOADED__ = true;

  // Every call waits for the owner sign-in check from auth.js, then uses that session.
  async function db() {
    const auth = await window.authReady;
    if (!auth || !window.sb) throw new Error('Not signed in');
    return window.sb;
  }

  const CHARACTER_CODES = { anica: 'AN', caelum: 'CA', aurion: 'AU' };
  const VOICE_CODES = { casual: 'CS', friendly: 'FR', professional: 'PR', creative: 'CR' };

  const templateEngineAPI = {

    // Check the database answers for the signed-in owner
    async testConnection() {
      try {
        const sb = await db();
        const { error } = await sb.from('content_templates').select('id').limit(1);
        if (error) throw error;
        return { status: 'connected', message: 'Supabase connection successful' };
      } catch (error) {
        throw new Error(`Connection failed: ${error.message}`);
      }
    },

    // Search templates by the first part of an ID (without the number at the end)
    async searchByPattern(searchPattern) {
      try {
        if (!searchPattern) throw new Error('Search pattern is required');
        const sb = await db();
        const { data, error } = await sb
          .from('content_templates')
          .select('template_id, content_title, status, created_at, updated_at, theme_value, platform_value')
          .like('template_id', `${searchPattern}-%`)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(template => ({
          template_id: template.template_id,
          content_title: template.content_title,
          status: template.status,
          created_at: template.created_at,
          updated_at: template.updated_at,
          theme: template.theme_value,
          platform: template.platform_value
        }));
      } catch (error) {
        console.error('Search error:', error);
        throw error;
      }
    },

    // Search templates that share the pattern of a full template ID
    async searchExistingTemplates(templateId) {
      const searchPattern = templateId.substring(0, templateId.lastIndexOf('-'));
      return templateEngineAPI.searchByPattern(searchPattern);
    },

    // Load one template and convert it to the shape the page uses
    async loadTemplate(templateId) {
      try {
        const sb = await db();
        const { data, error } = await sb
          .from('content_templates')
          .select('*')
          .eq('template_id', templateId)
          .eq('is_active', true)
          .single();
        if (error) {
          if (error.code === 'PGRST116') throw new Error('Template not found');
          throw error;
        }
        return {
          templateId: data.template_id,
          selections: {
            theme: data.theme_code ? { value: data.theme_value, code: data.theme_code } : null,
            character: data.character_value ? { value: data.character_value, code: null } : null,
            voice: data.voice_style ? { value: data.voice_style, code: null } : null,
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
          status: data.status || 'template'
        };
      } catch (error) {
        console.error('Load template error:', error);
        throw error;
      }
    },

    // Work out the next free template ID for a set of selections
    async generateTemplateId(selections) {
      try {
        if (!selections) throw new Error('Selections are required');
        const sb = await db();

        const theme = selections.theme?.code || 'XX';
        const audience = selections.audience?.code || 'XX';
        const media = selections.media?.code || 'XX';
        const template = selections.template_type?.code || 'XX';
        const character = CHARACTER_CODES[selections.character?.value] || 'XX';
        const voice = VOICE_CODES[selections.voice?.value] || 'XX';
        const basePattern = `${theme}-${audience}-${media}-${template}-${character}-${voice}`;

        const { data, error } = await sb
          .from('content_templates')
          .select('template_id')
          .like('template_id', `${basePattern}-%`)
          .eq('is_active', true);
        if (error) throw error;

        let nextNumber = 1;
        if (data && data.length > 0) {
          const existingNumbers = data
            .map(row => {
              const parts = row.template_id.split('-');
              const number = parseInt(parts[parts.length - 1]);
              return isNaN(number) ? 0 : number;
            })
            .sort((a, b) => b - a);
          nextNumber = existingNumbers[0] + 1;
        }
        return `${basePattern}-${nextNumber.toString().padStart(3, '0')}`;
      } catch (error) {
        console.error('Generate ID error:', error);
        throw error;
      }
    },

    // Save a template (update if the ID already exists, otherwise add)
    async saveTemplate(templateData) {
      try {
        if (!templateData || !templateData.templateId) {
          throw new Error('templateData and templateId are required');
        }
        const sb = await db();

        const insertData = {
          template_id: templateData.templateId,
          theme_value: templateData.selections.theme?.value || null,
          theme_code: templateData.selections.theme?.code || null,
          character_value: templateData.selections.character?.value || null,
          voice_style: templateData.selections.voice?.value || null,
          audience_value: templateData.selections.audience?.value || null,
          audience_code: templateData.selections.audience?.code || null,
          media_value: templateData.selections.media?.value || null,
          media_code: templateData.selections.media?.code || null,
          template_type_value: templateData.selections.template_type?.value || null,
          template_type_code: templateData.selections.template_type?.code || null,
          platform_value: templateData.selections.platform?.value || null,
          platform_code: templateData.selections.platform?.code || null,
          content_title: templateData.content.title || null,
          content_description: templateData.content.description || null,
          content_hashtags: templateData.content.hashtags || [],
          content_keywords: templateData.content.keywords || null,
          content_credits: templateData.content.credits || null,
          content_cta: templateData.content.cta || null,
          phase: templateData.phase || 'creation',
          status: 'template',
          user_id: null,
          created_by: null,
          is_active: true
        };

        const { data: existing } = await sb
          .from('content_templates')
          .select('id')
          .eq('template_id', templateData.templateId)
          .eq('is_active', true)
          .maybeSingle();

        if (existing) {
          const { data, error } = await sb
            .from('content_templates')
            .update({ ...insertData, updated_at: new Date().toISOString() })
            .eq('id', existing.id)
            .select()
            .single();
          if (error) throw error;
          return data;
        }

        const { data, error } = await sb
          .from('content_templates')
          .insert(insertData)
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Save template error:', error);
        throw error;
      }
    },

    // Delete = archive (the number becomes free for reuse)
    async deleteTemplate(templateId) {
      try {
        const sb = await db();
        const { data, error } = await sb
          .from('content_templates')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('template_id', templateId)
          .select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Template not found');
        return { success: true, message: 'Template deleted successfully', templateId };
      } catch (error) {
        console.error('Delete template error:', error);
        throw error;
      }
    },

    // Send the current form to the Template Library (pending_content_library)
    async forwardToDashboard(templateData) {
      try {
        if (!templateData || !templateData.templateId) throw new Error('Template data is required');
        const sb = await db();

        const insertData = {
          template_id: templateData.templateId,
          content_title: templateData.content.title || 'Untitled Template',
          content_id: `content_${Date.now()}`,
          character_profile: templateData.selections.character?.value || null,
          theme: templateData.selections.theme?.value || null,
          audience: templateData.selections.audience?.value || null,
          media_type: templateData.selections.media?.value || null,
          template_type: templateData.selections.template_type?.value || null,
          platform: templateData.selections.platform?.value || null,
          voice_style: templateData.selections.voice?.value || null,
          title: templateData.content.title || '',
          description: templateData.content.description || '',
          hashtags: templateData.content.hashtags || [],
          keywords: templateData.content.keywords || '',
          cta: templateData.content.cta || '',
          media_files: [],
          selected_platforms: templateData.selections.platform?.value ? [templateData.selections.platform.value] : [],
          status: 'pending',
          is_from_template: true,
          source_template_id: templateData.templateId,
          user_id: null,
          created_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true
        };

        const { data, error } = await sb
          .from('pending_content_library')
          .insert(insertData)
          .select()
          .single();
        if (error) throw error;

        return {
          success: true,
          message: 'Template forwarded to Template Library successfully',
          data: {
            templateId: templateData.templateId,
            platform: templateData.selections.platform?.value,
            forwardedAt: new Date().toISOString(),
            libraryEntry: data,
            pendingTemplateId: data.id
          }
        };
      } catch (error) {
        console.error('Forward template error:', error);
        throw error;
      }
    }
  };

  // Make the API available to the page
  window.templateEngineAPI = templateEngineAPI;

  // Show the connection status badge once the owner sign-in is confirmed
  async function showConnectionStatus() {
    const statusEl = document.getElementById('connection-status');
    if (!statusEl) return;
    try {
      const result = await templateEngineAPI.testConnection();
      if (result.status !== 'connected') throw new Error('Database not ready');
      statusEl.textContent = 'Database Connected';
      statusEl.className = 'connection-status connected';
    } catch (error) {
      statusEl.textContent = `Database Error: ${error.message}`;
      statusEl.className = 'connection-status disconnected';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showConnectionStatus);
  } else {
    showConnectionStatus();
  }

})();
