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

    const { selections } = req.body;
    
    if (!selections) {
      return res.status(400).json({ error: 'Selections are required' });
    }

    const theme = selections.theme?.code || 'XX';
    const audience = selections.audience?.code || 'XX';
    const media = selections.media?.code || 'XX';
    const template = selections.template_type?.code || 'XX';
    
    const basePattern = `${theme}-${audience}-${media}-${template}`;

    // Query existing templates with this pattern
    const { data, error } = await supabase
      .from('content_templates')
      .select('template_id')
      .like('template_id', `${basePattern}-%`)
      .eq('is_active', true);

    if (error) throw error;

    // Find next available number
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

    const formattedNumber = nextNumber.toString().padStart(3, '0');
    const templateId = `${basePattern}-${formattedNumber}`;

    res.status(200).json({
      success: true,
      templateId: templateId,
      pattern: basePattern,
      number: nextNumber
    });

  } catch (error) {
    console.error('Generate ID error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
