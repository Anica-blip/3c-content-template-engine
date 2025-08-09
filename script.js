// 3C Content Template Engine - Core Logic
// Main template management and content generation system

class ContentTemplateEngine {
    constructor() {
        this.platforms = {};
        this.templates = new Map();
        this.currentTemplate = null;
        this.init();
    }

    async init() {
        try {
            await this.loadPlatforms();
            this.setupEventListeners();
            this.renderPlatformSelector();
            this.loadSavedTemplates();
        } catch (error) {
            console.error('Failed to initialize template engine:', error);
            this.showError('Failed to load platform configurations');
        }
    }

    async loadPlatforms() {
        try {
            const response = await fetch('./platforms.json');
            if (!response.ok) throw new Error('Failed to load platforms.json');
            this.platforms = await response.json();
        } catch (error) {
            console.error('Error loading platforms:', error);
            // Fallback platforms if file fails to load
            this.platforms = {
                instagram: {
                    name: "Instagram",
                    character_limits: { caption: 2200, bio: 150 },
                    hashtag_limits: { max_hashtags: 30, recommended: 11 },
                    features: ["stories", "reels", "posts", "igtv"]
                },
                linkedin: {
                    name: "LinkedIn", 
                    character_limits: { post: 3000, headline: 120 },
                    hashtag_limits: { max_hashtags: 5, recommended: 3 },
                    features: ["articles", "posts", "stories"]
                }
            };
        }
    }

    setupEventListeners() {
        // Platform selection
        const platformSelector = document.getElementById('platform-selector');
        if (platformSelector) {
            platformSelector.addEventListener('change', (e) => {
                this.selectPlatform(e.target.value);
            });
        }

        // Template actions
        const saveBtn = document.getElementById('save-template');
        const loadBtn = document.getElementById('load-template');
        const generateBtn = document.getElementById('generate-content');
        const exportBtn = document.getElementById('export-template');

        if (saveBtn) saveBtn.addEventListener('click', () => this.saveCurrentTemplate());
        if (loadBtn) loadBtn.addEventListener('click', () => this.showTemplateLoader());
        if (generateBtn) generateBtn.addEventListener('click', () => this.generateContent());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportTemplate());

        // Content input listeners
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('content-input')) {
                this.updateCharacterCount(e.target);
                this.autoSave();
            }
        });

        // Real-time preview updates
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('template-field')) {
                this.updatePreview();
            }
        });
    }

    renderPlatformSelector() {
        const selector = document.getElementById('platform-selector');
        if (!selector) return;

        selector.innerHTML = '<option value="">Select Platform</option>';
        
        Object.entries(this.platforms).forEach(([key, platform]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = platform.name;
            selector.appendChild(option);
        });
    }

    selectPlatform(platformKey) {
        if (!platformKey || !this.platforms[platformKey]) {
            this.clearPlatformInterface();
            return;
        }

        const platform = this.platforms[platformKey];
        this.currentPlatform = platformKey;
        this.renderPlatformInterface(platform);
        this.updatePreview();
    }

    renderPlatformInterface(platform) {
        const container = document.getElementById('template-builder');
        if (!container) return;

        container.innerHTML = `
            <div class="platform-header">
                <h2>${platform.name} Content Template</h2>
                <div class="platform-stats">
                    <span class="feature-count">${platform.features?.length || 0} features</span>
                    <span class="limit-info">Character limits apply</span>
                </div>
            </div>

            <div class="template-sections">
                ${this.renderContentSections(platform)}
                ${this.renderHashtagSection(platform)}
                ${this.renderAdvancedOptions(platform)}
            </div>

            <div class="template-actions">
                <button id="preview-btn" class="btn btn-secondary">Preview</button>
                <button id="save-template" class="btn btn-primary">Save Template</button>
                <button id="generate-content" class="btn btn-success">Generate Content</button>
            </div>
        `;

        this.attachFieldListeners();
    }

    renderContentSections(platform) {
        const sections = [];
        
        // Main content areas based on platform
        if (platform.character_limits) {
            Object.entries(platform.character_limits).forEach(([field, limit]) => {
                sections.push(`
                    <div class="content-section">
                        <label for="${field}-input" class="section-label">
                            ${this.formatFieldName(field)}
                            <span class="char-limit">0/${limit}</span>
                        </label>
                        <textarea 
                            id="${field}-input" 
                            class="content-input template-field"
                            data-field="${field}"
                            data-limit="${limit}"
                            placeholder="Enter your ${field} content..."
                            maxlength="${limit}"
                        ></textarea>
                        <div class="field-tips">
                            ${this.getFieldTips(field, platform)}
                        </div>
                    </div>
                `);
            });
        }

        return sections.join('');
    }

    renderHashtagSection(platform) {
        if (!platform.hashtag_limits) return '';

        const { max_hashtags, recommended } = platform.hashtag_limits;
        
        return `
            <div class="hashtag-section">
                <label class="section-label">
                    Hashtags
                    <span class="hashtag-count">0/${max_hashtags}</span>
                </label>
                <div class="hashtag-input-container">
                    <input 
                        type="text" 
                        id="hashtag-input" 
                        class="hashtag-input template-field"
                        placeholder="Add hashtags (press Enter or comma to add)"
                        data-field="hashtags"
                    />
                    <button type="button" id="hashtag-suggestions" class="btn btn-outline">
                        Get Suggestions
                    </button>
                </div>
                <div id="hashtag-list" class="hashtag-list"></div>
                <div class="hashtag-tips">
                    <small>Recommended: ${recommended} hashtags | Max: ${max_hashtags}</small>
                </div>
            </div>
        `;
    }

    renderAdvancedOptions(platform) {
        return `
            <div class="advanced-options">
                <details>
                    <summary>Advanced Options</summary>
                    <div class="options-grid">
                        <div class="option-group">
                            <label>
                                <input type="checkbox" class="template-field" data-field="schedule_post"> 
                                Schedule Post
                            </label>
                            <input type="datetime-local" class="template-field" data-field="schedule_time" disabled>
                        </div>
                        
                        <div class="option-group">
                            <label>Content Tone:</label>
                            <select class="template-field" data-field="tone">
                                <option value="professional">Professional</option>
                                <option value="casual">Casual</option>
                                <option value="friendly">Friendly</option>
                                <option value="authoritative">Authoritative</option>
                                <option value="humorous">Humorous</option>
                            </select>
                        </div>

                        <div class="option-group">
                            <label>Target Audience:</label>
                            <select class="template-field" data-field="audience">
                                <option value="general">General</option>
                                <option value="business">Business</option>
                                <option value="creative">Creative</option>
                                <option value="technical">Technical</option>
                                <option value="youth">Youth</option>
                            </select>
                        </div>

                        ${platform.features ? this.renderPlatformFeatures(platform.features) : ''}
                    </div>
                </details>
            </div>
        `;
    }

    renderPlatformFeatures(features) {
        return `
            <div class="option-group">
                <label>Content Type:</label>
                <select class="template-field" data-field="content_type">
                    ${features.map(feature => 
                        `<option value="${feature}">${this.formatFieldName(feature)}</option>`
                    ).join('')}
                </select>
            </div>
        `;
    }

    attachFieldListeners() {
        // Character counting
        document.querySelectorAll('.content-input').forEach(input => {
            input.addEventListener('input', (e) => this.updateCharacterCount(e.target));
        });

        // Hashtag handling
        const hashtagInput = document.getElementById('hashtag-input');
        if (hashtagInput) {
            hashtagInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    this.addHashtag(e.target.value.trim());
                    e.target.value = '';
                }
            });
        }

        // Schedule toggle
        const scheduleCheckbox = document.querySelector('[data-field="schedule_post"]');
        const scheduleInput = document.querySelector('[data-field="schedule_time"]');
        if (scheduleCheckbox && scheduleInput) {
            scheduleCheckbox.addEventListener('change', (e) => {
                scheduleInput.disabled = !e.target.checked;
            });
        }

        // Hashtag suggestions
        const suggestBtn = document.getElementById('hashtag-suggestions');
        if (suggestBtn) {
            suggestBtn.addEventListener('click', () => this.showHashtagSuggestions());
        }
    }

    updateCharacterCount(input) {
        const limit = parseInt(input.dataset.limit);
        const current = input.value.length;
        const counter = input.parentElement.querySelector('.char-limit');
        
        if (counter) {
            counter.textContent = `${current}/${limit}`;
            counter.className = current > limit * 0.9 ? 'char-limit warning' : 'char-limit';
        }
    }

    addHashtag(tag) {
        if (!tag || tag.length < 2) return;
        
        const platform = this.platforms[this.currentPlatform];
        const maxHashtags = platform.hashtag_limits?.max_hashtags || 30;
        
        const hashtagList = document.getElementById('hashtag-list');
        const currentTags = hashtagList.querySelectorAll('.hashtag-tag').length;
        
        if (currentTags >= maxHashtags) {
            this.showWarning(`Maximum ${maxHashtags} hashtags allowed`);
            return;
        }

        // Clean and format hashtag
        const cleanTag = tag.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
        if (!cleanTag) return;

        // Check for duplicates
        const existing = Array.from(hashtagList.querySelectorAll('.hashtag-tag'))
            .some(el => el.dataset.tag === cleanTag);
        
        if (existing) {
            this.showWarning('Hashtag already added');
            return;
        }

        // Add hashtag element
        const tagElement = document.createElement('span');
        tagElement.className = 'hashtag-tag';
        tagElement.dataset.tag = cleanTag;
        tagElement.innerHTML = `
            #${cleanTag}
            <button type="button" class="remove-hashtag" onclick="this.parentElement.remove(); this.updateHashtagCount()">×</button>
        `;
        
        hashtagList.appendChild(tagElement);
        this.updateHashtagCount();
        this.updatePreview();
    }

    updateHashtagCount() {
        const count = document.querySelectorAll('.hashtag-tag').length;
        const platform = this.platforms[this.currentPlatform];
        const max = platform?.hashtag_limits?.max_hashtags || 30;
        
        const counter = document.querySelector('.hashtag-count');
        if (counter) {
            counter.textContent = `${count}/${max}`;
        }
    }

    generateContent() {
        const templateData = this.collectTemplateData();
        
        if (!templateData || !this.currentPlatform) {
            this.showError('Please fill in template data and select a platform');
            return;
        }

        // Show generation modal/interface
        this.showGenerationInterface(templateData);
    }

    collectTemplateData() {
        const data = {
            platform: this.currentPlatform,
            timestamp: new Date().toISOString(),
            content: {},
            hashtags: [],
            options: {}
        };

        // Collect text content
        document.querySelectorAll('.content-input').forEach(input => {
            const field = input.dataset.field;
            if (field && input.value.trim()) {
                data.content[field] = input.value.trim();
            }
        });

        // Collect hashtags
        document.querySelectorAll('.hashtag-tag').forEach(tag => {
            data.hashtags.push(tag.dataset.tag);
        });

        // Collect other options
        document.querySelectorAll('.template-field').forEach(field => {
            const fieldName = field.dataset.field;
            if (fieldName && !['hashtags'].includes(fieldName)) {
                if (field.type === 'checkbox') {
                    data.options[fieldName] = field.checked;
                } else if (field.value) {
                    data.options[fieldName] = field.value;
                }
            }
        });

        return data;
    }

    saveCurrentTemplate() {
        const templateData = this.collectTemplateData();
        if (!templateData) return;

        const name = prompt('Enter template name:');
        if (!name) return;

        const templateId = this.generateTemplateId();
        const template = {
            id: templateId,
            name: name,
            data: templateData,
            created: new Date().toISOString(),
            platform: this.currentPlatform
        };

        this.templates.set(templateId, template);
        this.saveTemplatesToStorage();
        this.showSuccess(`Template "${name}" saved successfully`);
    }

    loadSavedTemplates() {
        try {
            const saved = localStorage.getItem('3c-templates');
            if (saved) {
                const templates = JSON.parse(saved);
                Object.entries(templates).forEach(([id, template]) => {
                    this.templates.set(id, template);
                });
            }
        } catch (error) {
            console.error('Error loading saved templates:', error);
        }
    }

    saveTemplatesToStorage() {
        try {
            const templatesObj = Object.fromEntries(this.templates);
            localStorage.setItem('3c-templates', JSON.stringify(templatesObj));
        } catch (error) {
            console.error('Error saving templates:', error);
            this.showError('Failed to save template');
        }
    }

    // Utility methods
    formatFieldName(field) {
        return field.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    generateTemplateId() {
        return 'template_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getFieldTips(field, platform) {
        const tips = {
            caption: 'Include a compelling hook in the first line',
            post: 'Start with an engaging question or statement',
            bio: 'Make it clear, concise, and actionable',
            headline: 'Highlight your key value proposition'
        };
        return tips[field] || 'Keep it engaging and on-brand';
    }

    clearPlatformInterface() {
        const container = document.getElementById('template-builder');
        if (container) {
            container.innerHTML = '<p class="placeholder">Select a platform to start building your template</p>';
        }
    }

    updatePreview() {
        // Update live preview if preview panel exists
        const preview = document.getElementById('content-preview');
        if (preview) {
            const data = this.collectTemplateData();
            this.renderPreview(preview, data);
        }
    }

    renderPreview(container, data) {
        if (!data || !this.currentPlatform) {
            container.innerHTML = '<p>No preview available</p>';
            return;
        }

        const platform = this.platforms[this.currentPlatform];
        let previewHTML = `<div class="preview-platform">${platform.name} Preview</div>`;

        // Render content sections
        Object.entries(data.content).forEach(([field, content]) => {
            previewHTML += `
                <div class="preview-section">
                    <strong>${this.formatFieldName(field)}:</strong>
                    <p>${this.formatPreviewContent(content)}</p>
                </div>
            `;
        });

        // Render hashtags
        if (data.hashtags.length > 0) {
            previewHTML += `
                <div class="preview-section">
                    <strong>Hashtags:</strong>
                    <div class="preview-hashtags">
                        ${data.hashtags.map(tag => `<span class="preview-hashtag">#${tag}</span>`).join(' ')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = previewHTML;
    }

    formatPreviewContent(content) {
        return content.replace(/\n/g, '<br>');
    }

    // UI feedback methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showWarning(message) {
        this.showNotification(message, 'warning');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    autoSave() {
        // Debounced auto-save functionality
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            const data = this.collectTemplateData();
            if (data) {
                localStorage.setItem('3c-autosave', JSON.stringify(data));
            }
        }, 1000);
    }
}

// Initialize the template engine when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.templateEngine = new ContentTemplateEngine();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentTemplateEngine;
}
