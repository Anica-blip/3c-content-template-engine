// Notion Integration for 3C Template Engine
// Add this to your existing script.js or create as separate file

class NotionIntegration {
    constructor() {
        this.notionToken = process.env.NOTION_TOKEN; // Your Notion Integration Token
        this.templatesDbId = process.env.NOTION_TEMPLATES_DB_ID;
        this.dashboardDbId = process.env.NOTION_DASHBOARD_DB_ID;
        this.countersDbId = process.env.NOTION_COUNTERS_DB_ID;
        this.baseUrl = 'https://api.notion.com/v1';
        this.headers = {
            'Authorization': `Bearer ${this.notionToken}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
        };
    }

    // Generate Template ID with auto-incrementing counter
    async generateTemplateId(selections) {
        const pattern = `${selections.theme.code}-${selections.audience.code}-${selections.media.code}-${selections.template_type.code}`;
        
        try {
            const counter = await this.getTemplateCounter(pattern);
            const newNumber = String(counter + 1).padStart(3, '0');
            const templateId = `${pattern}-${newNumber}`;
            
            // Update counter
            await this.updateTemplateCounter(pattern, counter + 1);
            
            return templateId;
        } catch (error) {
            console.error('Error generating template ID:', error);
            return `${pattern}-001`; // Fallback
        }
    }

    // Get current counter for template pattern
    async getTemplateCounter(pattern) {
        try {
            const response = await fetch(`${this.baseUrl}/databases/${this.countersDbId}/query`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    filter: {
                        property: 'pattern_id',
                        title: {
                            equals: pattern
                        }
                    }
                })
            });

            const data = await response.json();
            
            if (data.results.length > 0) {
                const counter = data.results[0].properties.current_count.number || 0;
                return counter;
            } else {
                // Create new counter entry
                await this.createTemplateCounter(pattern, 0);
                return 0;
            }
        } catch (error) {
            console.error('Error getting template counter:', error);
            return 0;
        }
    }

    // Create new counter entry
    async createTemplateCounter(pattern, count) {
        try {
            const response = await fetch(`${this.baseUrl}/pages`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    parent: { database_id: this.countersDbId },
                    properties: {
                        pattern_id: {
                            title: [{ text: { content: pattern } }]
                        },
                        current_count: {
                            number: count
                        }
                    }
                })
            });

            return await response.json();
        } catch (error) {
            console.error('Error creating template counter:', error);
            throw error;
        }
    }

    // Update counter value
    async updateTemplateCounter(pattern, newCount) {
        try {
            // First, get the page ID for this pattern
            const queryResponse = await fetch(`${this.baseUrl}/databases/${this.countersDbId}/query`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    filter: {
                        property: 'pattern_id',
                        title: {
                            equals: pattern
                        }
                    }
                })
            });

            const queryData = await queryResponse.json();
            
            if (queryData.results.length > 0) {
                const pageId = queryData.results[0].id;
                
                // Update the counter
                const updateResponse = await fetch(`${this.baseUrl}/pages/${pageId}`, {
                    method: 'PATCH',
                    headers: this.headers,
                    body: JSON.stringify({
                        properties: {
                            current_count: {
                                number: newCount
                            }
                        }
                    })
                });

                return await updateResponse.json();
            }
        } catch (error) {
            console.error('Error updating template counter:', error);
            throw error;
        }
    }

    // Search for existing templates with same pattern
    async searchExistingTemplates(templateId) {
        const basePattern = templateId.substring(0, templateId.lastIndexOf('-'));
        
        try {
            const response = await fetch(`${this.baseUrl}/databases/${this.templatesDbId}/query`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    filter: {
                        property: 'template_id',
                        title: {
                            starts_with: basePattern
                        }
                    },
                    sorts: [
                        {
                            property: 'date_created',
                            direction: 'descending'
                        }
                    ]
                })
            });

            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error('Error searching templates:', error);
            return [];
        }
    }

    // Save template to Notion database
    async saveTemplate(templateData) {
        try {
            const response = await fetch(`${this.baseUrl}/pages`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    parent: { database_id: this.templatesDbId },
                    properties: {
                        template_id: {
                            title: [{ text: { content: templateData.templateId } }]
                        },
                        theme_label: {
                            select: { 
                                name: this.formatSelectValue(templateData.selections.theme.value)
                            }
                        },
                        character_profile: templateData.selections.character ? {
                            select: { 
                                name: this.formatSelectValue(templateData.selections.character.value)
                            }
                        } : null,
                        brand_voice: templateData.selections.voice ? {
                            select: { 
                                name: this.formatSelectValue(templateData.selections.voice.value)
                            }
                        } : null,
                        target_audience: {
                            select: { 
                                name: this.formatSelectValue(templateData.selections.audience.value)
                            }
                        },
                        media_type: {
                            select: { 
                                name: this.formatSelectValue(templateData.selections.media.value)
                            }
                        },
                        template_type: {
                            select: { 
                                name: this.formatSelectValue(templateData.selections.template_type.value)
                            }
                        },
                        platform_selected: templateData.selections.platform ? {
                            select: { 
                                name: this.formatSelectValue(templateData.selections.platform.value)
                            }
                        } : null,
                        auto_number: {
                            number: parseInt(templateData.templateId.split('-').pop())
                        },
                        status: {
                            select: { name: 'Template' }
                        },
                        content_data: {
                            rich_text: [
                                {
                                    text: {
                                        content: JSON.stringify(templateData.content, null, 2)
                                    }
                                }
                            ]
                        },
                        is_active: {
                            checkbox: true
                        }
                    }
                })
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(`Notion API error: ${result.message}`);
            }

            return result;
        } catch (error) {
            console.error('Error saving template:', error);
            throw error;
        }
    }

    // Forward template to dashboard
    async forwardToDashboard(templateData, assignedMember, priority = 'Medium') {
        const forwardId = `FWD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        try {
            // First, save the template if it's not already saved
            let templatePageId = templateData.notionPageId;
            if (!templatePageId) {
                const savedTemplate = await this.saveTemplate(templateData);
                templatePageId = savedTemplate.id;
            }

            // Create dashboard entry
            const response = await fetch(`${this.baseUrl}/pages`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    parent: { database_id: this.dashboardDbId },
                    properties: {
                        forward_id: {
                            title: [{ text: { content: forwardId } }]
                        },
                        template_id: {
                            relation: [{ id: templatePageId }]
                        },
                        assigned_member: {
                            select: { name: this.formatSelectValue(assignedMember) }
                        },
                        platform_target: templateData.selections.platform ? {
                            select: { 
                                name: this.formatSelectValue(templateData.selections.platform.value)
                            }
                        } : null,
                        status: {
                            select: { name: 'Pending' }
                        },
                        priority: {
                            select: { name: priority }
                        },
                        notes: {
                            rich_text: [
                                {
                                    text: {
                                        content: `Template forwarded from builder. Platform: ${templateData.selections.platform?.value || 'Not specified'}`
                                    }
                                }
                            ]
                        }
                    }
                })
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(`Notion API error: ${result.message}`);
            }

            return {
                forwardId,
                notionPageId: result.id,
                dashboardUrl: this.generateDashboardUrl(assignedMember, forwardId, templateData.templateId)
            };
        } catch (error) {
            console.error('Error forwarding to dashboard:', error);
            throw error;
        }
    }

    // Load template from Notion
    async loadTemplate(templateId) {
        try {
            const response = await fetch(`${this.baseUrl}/databases/${this.templatesDbId}/query`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    filter: {
                        property: 'template_id',
                        title: {
                            equals: templateId
                        }
                    }
                })
            });

            const data = await response.json();
            
            if (data.results.length > 0) {
                const notionPage = data.results[0];
                return this.parseNotionTemplate(notionPage);
            } else {
                throw new Error('Template not found');
            }
        } catch (error) {
            console.error('Error loading template:', error);
            throw error;
        }
    }

    // Parse Notion page data back to template format
    parseNotionTemplate(notionPage) {
        const properties = notionPage.properties;
        
        return {
            templateId: properties.template_id.title[0]?.text?.content || '',
            selections: {
                theme: {
                    value: this.parseSelectProperty(properties.theme_label),
                    code: this.getThemeCode(this.parseSelectProperty(properties.theme_label))
                },
                character: properties.character_profile.select ? {
                    value: this.parseSelectProperty(properties.character_profile),
                    code: null
                } : null,
                voice: properties.brand_voice.select ? {
                    value: this.parseSelectProperty(properties.brand_voice),
                    code: null
                } : null,
                audience: {
                    value: this.parseSelectProperty(properties.target_audience),
                    code: this.getAudienceCode(this.parseSelectProperty(properties.target_audience))
                },
                media: {
                    value: this.parseSelectProperty(properties.media_type),
                    code: this.getMediaCode(this.parseSelectProperty(properties.media_type))
                },
                template_type: {
                    value: this.parseSelectProperty(properties.template_type),
                    code: this.getTemplateTypeCode(this.parseSelectProperty(properties.template_type))
                },
                platform: properties.platform_selected.select ? {
                    value: this.parseSelectProperty(properties.platform_selected),
                    code: this.getPlatformCode(this.parseSelectProperty(properties.platform_selected))
                } : null
            },
            content: JSON.parse(properties.content_data.rich_text[0]?.text?.content || '{}'),
            notionPageId: notionPage.id,
            created: properties.date_created.created_time,
            modified: properties.last_modified.last_edited_time
        };
    }

    // Helper methods
    formatSelectValue(value) {
        return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    parseSelectProperty(property) {
        return property.select?.name?.replace(/\s+/g, '_').toLowerCase() || '';
    }

    generateDashboardUrl(member, forwardId, templateId) {
        const baseUrl = process.env.DASHBOARD_BASE_URL || 'https://threadcommand.center/dashboard/settings';
        return `${baseUrl}?member=${member}&forward_id=${forwardId}&template_id=${templateId}`;
    }

    // Code mapping functions (you'll need to implement these based on your mapping logic)
    getThemeCode(value) {
        const codes = {
            'news_alert': 'NA',
            'promotion': 'PR',
            'standard_post': 'SP',
            'cta_quiz': 'QZ',
            'cta_game': 'GA',
            'cta_puzzle': 'PZ',
            'cta_challenge': 'CH',
            'news': 'NS',
            'blog': 'BP',
            'tutorial_guide': 'TG',
            'course_tool': 'CT',
            'assessment': 'AS'
        };
        return codes[value] || 'XX';
    }

    getAudienceCode(value) {
        const codes = {
            'existing_members': 'EM',
            'new_members': 'NM',
            'persona_falcon': 'FL',
            'persona_panther': 'PA',
            'persona_wolf': 'WF',
            'persona_lion': 'LI',
            'general_public': 'GP'
        };
        return codes[value] || 'XX';
    }

    getMediaCode(value) {
        const codes = {
            'image': 'IM',
            'video': 'VD',
            'gifs': 'GF',
            'pdf': 'PF',
            'interactive_media': 'IM',
            'url_link': 'UL'
        };
        return codes[value] || 'XX';
    }

    getTemplateTypeCode(value) {
        const codes = {
            'social_media': 'SM',
            'presentation': 'PR',
            'video_message': 'VM',
            'anica_chat': 'AC',
            'blog_posts': 'BP',
            'news_article': 'NA',
            'newsletter': 'NL',
            'email_templates': 'ET',
            'custom_templates': 'CT'
        };
        return codes[value] || 'XX';
    }

    getPlatformCode(value) {
        const codes = {
            'instagram': 'IS',
            'facebook': 'FB',
            'linkedin': 'LK',
            'twitter': 'TX',
            'youtube': 'YT',
            'tiktok': 'TK',
            'telegram': 'TG',
            'pinterest': 'PI',
            'whatsapp': 'WB'
        };
        return codes[value] || 'XX';
    }
}

// Export for use in your main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotionIntegration;
}

// Browser global
if (typeof window !== 'undefined') {
    window.NotionIntegration = NotionIntegration;
}
