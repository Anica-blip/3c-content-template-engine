import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    const { pattern } = req.query;
    
    if (!pattern) {
      return res.status(400).json({ error: 'Search pattern is required' });
    }

    const { data, error } = await supabase
      .from('content_templates')
      .select('template_id, status, created_at, updated_at, theme_value, platform_value')
      .like('template_id', `${pattern}-%`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const matchingTemplates = data.map(template => ({
      template_id: template.template_id,
      status: template.status,
      created_at: template.created_at,
      updated_at: template.updated_at,
      theme: template.theme_value,
      platform: template.platform_value
    }));

    res.status(200).json({
      success: true,
      data: matchingTemplates,
      count: matchingTemplates.length,
      pattern: pattern
    });

  } catch (error) {
    console.error('Search templates error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
