// 3C Content Template Engine - Enhanced Core Logic
// Main template management and content generation system

class ContentTemplateEngine {
    constructor() {
        this.platforms = {};
        this.templates = new Map();
        this.currentTemplate = null;
        this.customLabels = this.getStoredLabels();
        this.customAudiences = this.getStoredAudiences();
        this.brandVoices = {
            'anica': 'Empathetic, encouraging, and professionally warm',
            'aurion': 'Strategic, insightful, and thought-provoking', 
            'caelum': 'Creative, inspiring, and authentically engaging'
        };
        this.dashboardUrl = 'https://threadcommand.center/dashboard/settings'; // Configurable dashboard URL
        this.init();
    }

    async init() {
        try {
            await this.loadPlatforms();
            this.setupEventListeners();
            this.renderPlatformSelector();
            this.loadSavedTemplates();
            this.renderBuilderInterface();
        } catch (error) {
            console.error('Failed to initialize template engine:', error);
            this.showError('Failed to load platform configurations');
        }
    }

    async loadPlatforms() {
        // Enhanced platform definitions with all major platforms
        this.platforms = {
            instagram: {
                name: "Instagram",
                character_limits: { caption: 2200, bio: 150 },
                hashtag_limits: { max_hashtags: 30, recommended: 11 },
                features: ["feed_post", "story", "reel", "igtv"],
                fields: ["title", "description", "hashtags", "keywords", "tags"]
            },
            facebook: {
                name: "Facebook", 
                character_limits: { post: 63206, headline: 255 },
                hashtag_limits: { max_hashtags: 5, recommended: 2 },
                features: ["post", "story", "page_post", "event"],
                fields: ["title", "description", "hashtags", "keywords", "tags"]
            },
            linkedin: {
                name: "LinkedIn", 
                character_limits: { post: 3000, headline: 120, article: 125000 },
                hashtag_limits: { max_hashtags: 5, recommended: 3 },
                features: ["post", "article", "story", "newsletter"],
                fields: ["title", "description", "hashtags", "keywords", "tags"]
            },
            twitter: {
                name: "Twitter/X", 
                character_limits: { tweet: 280, bio: 160 },
                hashtag_limits: { max_hashtags: 2, recommended: 1 },
                features: ["tweet", "thread", "space"],
                fields: ["title", "description", "hashtags", "keywords", "tags"]
            },
            youtube: {
                name: "YouTube", 
                character_limits: { title: 100, description: 5000 },
                hashtag_limits: { max_hashtags: 15, recommended: 5 },
                features: ["video", "short", "community_post"],
                fields: ["title", "description", "hashtags", "keywords", "tags", "credits", "referrals"]
            },
            tiktok: {
                name: "TikTok", 
                character_limits: { caption: 2200, bio: 80 },
                hashtag_limits: { max_hashtags: 20, recommended: 5 },
                features: ["video", "live"],
                fields: ["title", "description", "hashtags", "keywords", "tags"]
            },
            telegram: {
                name: "Telegram", 
                character_limits: { message: 4096, channel_name: 128 },
                hashtag_limits: { max_hashtags: 10, recommended: 3 },
                features: ["message", "channel_post", "bot_message"],
                fields: ["title", "description", "hashtags", "keywords", "tags"]
            },
            pinterest: {
                name: "Pinterest", 
                character_limits: { title: 100, description: 500 },
                hashtag_limits: { max_hashtags: 20, recommended: 8 },
                features: ["pin", "idea_pin", "board"],
                fields: ["title", "description", "hashtags", "keywords", "tags"]
            },
            whatsapp: {
                name: "WhatsApp Business", 
                character_limits: { status: 700, message: 4096 },
                hashtag_limits: { max_hashtags: 5, recommended: 2 },
                features: ["status", "broadcast", "message"],
                fields: ["title", "description", "hashtags", "keywords", "tags"]
            }
        };
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
        const createBtn = document.getElementById('create-template');

        if (saveBtn) saveBtn.addEventListener('click', () => this.saveCurrentTemplate());
        if (loadBtn) loadBtn.addEventListener('click', () => this.showTemplateLoader());
        if (generateBtn) generateBtn.addEventListener('click', () => this.generateContent());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportTemplate());
        if (createBtn) createBtn.addEventListener('click', () => this.createNewTemplate());

        // Label and audience management
        const manageLabelsBtn = document.getElementById('manage-labels');
        const manageAudiencesBtn = document.getElementById('manage-audiences');

        if (manageLabelsBtn) manageLabelsBtn.addEventListener('click', () => this.showLabelsManager());
        if (manageAudiencesBtn) manageAudiencesBtn.addEventListener('click', () => this.showAudienceManager());

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

    renderBuilderInterface() {
        const builderContainer = document.getElementById('template-builder');
        if (!builderContainer) return;

        builderContainer.innerHTML = `
            <div class="builder-header">
                <h2>3C Content Template Builder</h2>
                <div class="builder-actions">
                    <button id="manage-labels" class="btn btn-outline">Manage Labels</button>
                    <button id="manage-audiences" class="btn btn-outline">Manage Audiences</button>
                    <button id="create-template" class="btn btn-primary">Create New Template</button>
                </div>
            </div>

            <div class="platform-overview">
                <h3>Available Platforms</h3>
                <div class="platforms-grid">
                    ${this.renderPlatformsGrid()}
                </div>
                <p class="platform-instruction">Select a platform to see specific features and limitations</p>
            </div>

            <div id="template-form" class="template-form" style="display: none;">
                <!-- Dynamic template form will be inserted here -->
            </div>
        `;

        this.attachBuilderListeners();
    }

    renderPlatformsGrid() {
        return Object.entries(this.platforms).map(([key, platform]) => `
            <div class="platform-card" data-platform="${key}">
                <div class="platform-name">${platform.name}</div>
                <div class="platform-features">
                    ${platform.features.slice(0, 2).map(f => `<span class="feature-tag">${this.formatFieldName(f)}</span>`).join('')}
                    ${platform.features.length > 2 ? `<span class="feature-more">+${platform.features.length - 2}</span>` : ''}
                </div>
                <div class="platform-limits">
                    ${Object.entries(platform.character_limits).slice(0, 1).map(([field, limit]) => 
                        `<small>${this.formatFieldName(field)}: ${limit} chars</small>`
                    ).join('')}
                </div>
            </div>
        `).join('');
    }

    attachBuilderListeners() {
        // Platform card selection
        document.querySelectorAll('.platform-card').forEach(card => {
            card.addEventListener('click', () => {
                const platform = card.dataset.platform;
                this.selectPlatform(platform);
                document.getElementById('platform-selector').value = platform;
            });
        });

        // Manage Labels button
        const manageLabelsBtn = document.getElementById('manage-labels');
        if (manageLabelsBtn) {
            manageLabelsBtn.addEventListener('click', () => this.showLabelsManager());
        }

        // Manage Audiences button  
        const manageAudiencesBtn = document.getElementById('manage-audiences');
        if (manageAudiencesBtn) {
            manageAudiencesBtn.addEventListener('click', () => this.showAudienceManager());
        }
    }

    renderPlatformSelector() {
        const selector = document.getElementById('platform-selector');
        if (!selector) return;

        selector.innerHTML = '<option value="">All Platforms</option>';
        
        Object.entries(this.platforms).forEach(([key, platform]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = platform.name;
            selector.appendChild(option);
        });
    }

    selectPlatform(platformKey) {
        if (!platformKey) {
            this.showPlatformOverview();
            return;
        }

        if (!this.platforms[platformKey]) {
            this.showError('Invalid platform selected');
            return;
        }

        const platform = this.platforms[platformKey];
        this.currentPlatform = platformKey;
        this.renderTemplateForm(platform);
        this.updatePreview();

        // Highlight selected platform
        document.querySelectorAll('.platform-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.platform === platformKey);
        });
    }

    showPlatformOverview() {
        document.getElementById('template-form').style.display = 'none';
        document.querySelector('.platform-overview').style.display = 'block';
    }

    renderTemplateForm(platform) {
        const formContainer = document.getElementById('template-form');
        const overviewContainer = document.querySelector('.platform-overview');
        
        if (overviewContainer) overviewContainer.style.display = 'none';
        if (formContainer) {
            formContainer.style.display = 'block';
            formContainer.innerHTML = this.generateTemplateForm(platform);
            this.attachFormListeners();
        }
    }

    generateTemplateForm(platform) {
        return `
            <div class="template-header">
                <h3>${platform.name} Content Template</h3>
                <div class="template-meta">
                    <div class="meta-row">
                        <div class="meta-field">
                            <label>Theme/Label:</label>
                            <select class="template-field" data-field="theme" required>
                                <option value="">Select Theme</option>
                                ${this.customLabels.map(label => 
                                    `<option value="${label}">${this.formatFieldName(label)}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="meta-field">
                            <label>Sent From:</label>
                            <select class="template-field" data-field="sender" required>
                                <option value="">Select Sender</option>
                                <option value="anica">Anica</option>
                                <option value="aurion">Aurion</option>
                                <option value="caelum">Caelum</option>
                            </select>
                        </div>
                        
                        <div class="meta-field">
                            <label>Media Type:</label>
                            <select class="template-field" data-field="media_type">
                                <option value="all_types">All Types</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                <option value="gif">GIF</option>
                                <option value="pdf_document">PDF Document</option>
                                <option value="interactive_post">Interactive Post</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div class="meta-field">
                            <label>Target Audience:</label>
                            <select class="template-field" data-field="audience">
                                <option value="">Select Audience</option>
                                ${this.customAudiences.map(audience => 
                                    `<option value="${audience}">${this.formatFieldName(audience)}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="content-fields">
                ${this.renderContentFields(platform)}
            </div>

            <div class="template-actions">
                <button type="button" class="btn btn-secondary" onclick="templateEngine.showPlatformOverview()">
                    ← Back to Platforms
                </button>
                <button type="button" id="preview-template" class="btn btn-outline">Preview</button>
                <button type="button" id="save-current-template" class="btn btn-primary">Save Template</button>
                <button type="button" id="generate-final-content" class="btn btn-success">Generate Content</button>
                <button type="button" id="forward-to-dashboard" class="btn btn-info">Forward to Dashboard</button>
            </div>
        `;
    }

    renderContentFields(platform) {
        const fields = platform.fields || ['title', 'description', 'hashtags'];
        
        return fields.map(field => {
            switch (field) {
                case 'hashtags':
                    return this.renderHashtagField(platform);
                case 'title':
                case 'description':
                    return this.renderTextArea(field, platform);
                case 'keywords':
                case 'tags':
                case 'credits':
                case 'referrals':
                    return this.renderInputField(field, platform);
                default:
                    return this.renderInputField(field, platform);
            }
        }).join('');
    }

    renderTextArea(field, platform) {
        const limit = platform.character_limits?.[field] || platform.character_limits?.post || 1000;
        const isRequired = ['title', 'description'].includes(field);
        
        return `
            <div class="content-field">
                <label for="${field}-input" class="field-label">
                    ${this.formatFieldName(field)} ${isRequired ? '*' : ''}
                    <span class="char-limit">0/${limit}</span>
                </label>
                <textarea 
                    id="${field}-input" 
                    class="content-input template-field"
                    data-field="${field}"
                    data-limit="${limit}"
                    placeholder="Enter ${field}..."
                    ${isRequired ? 'required' : ''}
                    rows="4"
                ></textarea>
                <div class="field-tips">
                    ${this.getFieldTips(field, platform)}
                </div>
            </div>
        `;
    }

    renderInputField(field, platform) {
        return `
            <div class="content-field">
                <label for="${field}-input" class="field-label">
                    ${this.formatFieldName(field)}
                </label>
                <input 
                    type="text" 
                    id="${field}-input" 
                    class="content-input template-field"
                    data-field="${field}"
                    placeholder="Enter ${field}..."
                />
                <div class="field-tips">
                    ${this.getFieldTips(field, platform)}
                </div>
            </div>
        `;
    }

    renderHashtagField(platform) {
        const { max_hashtags, recommended } = platform.hashtag_limits || { max_hashtags: 10, recommended: 5 };
        
        return `
            <div class="content-field">
                <label class="field-label">
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
                <div class="field-tips">
                    <small>Recommended: ${recommended} hashtags | Max: ${max_hashtags}</small>
                </div>
            </div>
        `;
    }

    attachFormListeners() {
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

            hashtagInput.addEventListener('blur', (e) => {
                if (e.target.value.trim()) {
                    this.addHashtag(e.target.value.trim());
                    e.target.value = '';
                }
            });
        }

        // Form action buttons
        const saveBtn = document.getElementById('save-current-template');
        const previewBtn = document.getElementById('preview-template');
        const generateBtn = document.getElementById('generate-final-content');
        const forwardBtn = document.getElementById('forward-to-dashboard');

        if (saveBtn) saveBtn.addEventListener('click', () => this.saveCurrentTemplate());
        if (previewBtn) previewBtn.addEventListener('click', () => this.showPreviewModal());
        if (generateBtn) generateBtn.addEventListener('click', () => this.generateContent());
        if (forwardBtn) forwardBtn.addEventListener('click', () => this.forwardToDashboard());

        // Hashtag suggestions
        const suggestBtn = document.getElementById('hashtag-suggestions');
        if (suggestBtn) {
            suggestBtn.addEventListener('click', () => this.showHashtagSuggestions());
        }
    }

    showLabelsManager() {
        const modal = this.createModal('Manage Content Labels', `
            <div class="labels-manager">
                <div class="current-labels">
                    <h4>Current Labels:</h4>
                    <div class="labels-list">
                        ${this.customLabels.map(label => `
                            <div class="label-item">
                                <span>${this.formatFieldName(label)}</span>
                                <button onclick="templateEngine.removeLabel('${label}')" class="remove-btn">×</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="add-label">
                    <h4>Add New Label:</h4>
                    <div class="add-label-form">
                        <input type="text" id="new-label" placeholder="e.g. motivation, news, blog, challenge" />
                        <button onclick="templateEngine.addLabel()" class="btn btn-primary">Add Label</button>
                    </div>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    showAudienceManager() {
        const modal = this.createModal('Manage Target Audiences', `
            <div class="audience-manager">
                <div class="current-audiences">
                    <h4>Current Audiences:</h4>
                    <div class="audiences-list">
                        ${this.customAudiences.map(audience => `
                            <div class="audience-item">
                                <span>${this.formatFieldName(audience)}</span>
                                <button onclick="templateEngine.removeAudience('${audience}')" class="remove-btn">×</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="add-audience">
                    <h4>Add New Audience:</h4>
                    <div class="add-audience-form">
                        <input type="text" id="new-audience" placeholder="e.g. persona, young_professionals, entrepreneurs" />
                        <button onclick="templateEngine.addAudience()" class="btn btn-primary">Add Audience</button>
                    </div>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    addLabel() {
        const input = document.getElementById('new-label');
        const label = input.value.trim().toLowerCase().replace(/\s+/g, '_');
        
        if (!label || this.customLabels.includes(label)) {
            this.showWarning('Label already exists or is invalid');
            return;
        }
        
        this.customLabels.push(label);
        this.saveLabelsToStorage();
        input.value = '';
        
        // Refresh the modal
        document.querySelector('.modal').remove();
        this.showLabelsManager();
        this.showSuccess('Label added successfully');
    }

    removeLabel(label) {
        this.customLabels = this.customLabels.filter(l => l !== label);
        this.saveLabelsToStorage();
        
        // Refresh the modal
        document.querySelector('.modal').remove();
        this.showLabelsManager();
        this.showSuccess('Label removed successfully');
    }

    addAudience() {
        const input = document.getElementById('new-audience');
        const audience = input.value.trim().toLowerCase().replace(/\s+/g, '_');
        
        if (!audience || this.customAudiences.includes(audience)) {
            this.showWarning('Audience already exists or is invalid');
            return;
        }
        
        this.customAudiences.push(audience);
        this.saveAudiencesToStorage();
        input.value = '';
        
        // Refresh the modal
        document.querySelector('.modal').remove();
        this.showAudienceManager();
        this.showSuccess('Audience added successfully');
    }

    removeAudience(audience) {
        this.customAudiences = this.customAudiences.filter(a => a !== audience);
        this.saveAudiencesToStorage();
        
        // Refresh the modal
        document.querySelector('.modal').remove();
        this.showAudienceManager();
        this.showSuccess('Audience removed successfully');
    }

    forwardToDashboard() {
        const templateData = this.collectTemplateData();
        
        if (!templateData || !this.currentPlatform) {
            this.showError('Please complete the template form before forwarding');
            return;
        }

        // Validate required fields
        if (!templateData.meta.theme || !templateData.meta.sender) {
            this.showError('Theme and Sender are required fields');
            return;
        }

        // Show forward options modal
        const modal = this.createModal('Forward to Dashboard', `
            <div class="forward-options">
                <h4>Select Team Member Dashboard:</h4>
                <div class="team-members">
                    <button onclick="templateEngine.forwardToMember('anica')" class="btn btn-primary member-btn">
                        Forward to Anica
                    </button>
                    <button onclick="templateEngine.forwardToMember('caelum')" class="btn btn-primary member-btn">
                        Forward to Caelum  
                    </button>
                    <button onclick="templateEngine.forwardToMember('aurion')" class="btn btn-primary member-btn">
                        Forward to Aurion
                    </button>
                </div>
                <div class="template-summary">
                    <h5>Template Summary:</h5>
                    <p><strong>Platform:</strong> ${this.platforms[templateData.platform].name}</p>
                    <p><strong>Theme:</strong> ${this.formatFieldName(templateData.meta.theme)}</p>
                    <p><strong>Sender:</strong> ${this.formatFieldName(templateData.meta.sender)}</p>
                    <p><strong>Media Type:</strong> ${this.formatFieldName(templateData.meta.media_type)}</p>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    forwardToMember(member) {
        const templateData = this.collectTemplateData();
        
        // Save template data with member assignment
        templateData.assignedTo = member;
        templateData.forwardedAt = new Date().toISOString();
        
        // Store for dashboard pickup
        const forwardedTemplates = this.getForwardedTemplates();
        const forwardId = 'forward_' + Date.now();
        forwardedTemplates[forwardId] = templateData;
        localStorage.setItem('3c-forwarded-templates', JSON.stringify(forwardedTemplates));
        
        // Open dashboard in new tab
        window.open(`${this.dashboardUrl}?member=${member}&template=${forwardId}`, '_blank');
        
        // Close modal and show success
        document.querySelector('.modal').remove();
        this.showSuccess(`Template forwarded to ${this.formatFieldName(member)}'s dashboard`);
    }

    getForwardedTemplates() {
        try {
            const stored = localStorage.getItem('3c-forwarded-templates');
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        return modal;
    }

    getStoredLabels() {
        try {
            const stored = localStorage.getItem('3c-custom-labels');
            return stored ? JSON.parse(stored) : ['motivation', 'news', 'blog', 'challenge', 'quiz', 'workshop', 'announcement'];
        } catch {
            return ['motivation', 'news', 'blog', 'challenge', 'quiz', 'workshop', 'announcement'];
        }
    }

    getStoredAudiences() {
        try {
            const stored = localStorage.getItem('3c-custom-audiences');
            return stored ? JSON.parse(stored) : ['persona', 'entrepreneurs', 'young_professionals', 'creatives', 'coaches', 'general'];
        } catch {
            return ['persona', 'entrepreneurs', 'young_professionals', 'creatives', 'coaches', 'general'];
        }
    }

    saveLabelsToStorage() {
        localStorage.setItem('3c-custom-labels', JSON.stringify(this.customLabels));
    }

    saveAudiencesToStorage() {
        localStorage.setItem('3c-custom-audiences', JSON.stringify(this.customAudiences));
    }

    createNewTemplate() {
        if (!this.currentPlatform) {
            this.showWarning('Please select a platform first');
            return;
        }
        
        // Clear current form
        document.querySelectorAll('.template-field').forEach(field => {
            if (field.type === 'checkbox') {
                field.checked = false;
            } else {
                field.value = '';
            }
        });
        
        // Clear hashtags
        const hashtagList = document.getElementById('hashtag-list');
        if (hashtagList) hashtagList.innerHTML = '';
        
        this.updateHashtagCount();
        this.showSuccess('New template ready - fill in the fields');
    }

    updateCharacterCount(input) {
        const limit = parseInt(input.dataset.limit) || 1000;
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
        const maxHashtags = platform?.hashtag_limits?.max_hashtags || 10;
        
        const hashtagList = document.getElementById('hashtag-list');
        if (!hashtagList) return;
        
        const currentTags = hashtagList.querySelectorAll('.hashtag-tag').length;
        
        if (currentTags >= maxHashtags) {
            this.showWarning(`Maximum ${maxHashtags} hashtags allowed`);
            return;
        }

        // Clean and format hashtag
        const cleanTag = tag.replace(/^#/, '').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
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
            <button type="button" class="remove-hashtag" onclick="this.parentElement.remove(); templateEngine.updateHashtagCount()">×</button>
        `;
        
        hashtagList.appendChild(tagElement);
        this.updateHashtagCount();
        this.updatePreview();
    }

    updateHashtagCount() {
        const count = document.querySelectorAll('.hashtag-tag').length;
        const platform = this.platforms[this.currentPlatform];
        const max = platform?.hashtag_limits?.max_hashtags || 10;
        
        const counter = document.querySelector('.hashtag-count');
        if (counter) {
            counter.textContent = `${count}/${max}`;
        }
    }

    showHashtagSuggestions() {
        const theme = document.querySelector('[data-field="theme"]')?.value;
        const audience = document.querySelector('[data-field="audience"]')?.value;
        
        let suggestions = [];
        
        // Generate contextual suggestions
        if (theme === 'motivation') {
            suggestions = ['motivation', 'inspiration', 'mindset', 'growth', 'success', 'goals'];
        } else if (theme === 'challenge') {
            suggestions = ['challenge', 'growth', 'transformation', 'breakthrough', 'journey'];
        } else if (theme === 'blog') {
            suggestions = ['blog', 'insights', 'tips', 'advice', 'knowledge', 'learning'];
        } else {
            suggestions = ['3c', 'innergrowth', 'personal_development', 'mindset', 'growth'];
        }
        
        // Show suggestions modal
        const modal = this.createModal('Hashtag Suggestions', `
            <div class="hashtag-suggestions">
                <p>Click to add suggested hashtags:</p>
                <div class="suggestions-list">
                    ${suggestions.map(tag => `
                        <button class="suggestion-tag" onclick="templateEngine.addHashtag('${tag}'); this.disabled=true; this.textContent='Added'">#${tag}</button>
                    `).join('')}
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    generateContent() {
        const templateData = this.collectTemplateData();
        
        if (!templateData || !this.currentPlatform) {
            this.showError('Please complete the template form');
            return;
        }

        // Validate required fields
        if (!templateData.meta.theme || !templateData.meta.sender) {
            this.showError('Theme and Sender are required fields');
            return;
        }

        // Show generation success and provide next steps
        this.showGenerationSuccess(templateData);
    }

    showGenerationSuccess(templateData) {
        const modal = this.createModal('Content Generated Successfully', `
            <div class="generation-success">
                <div class="success-icon">✅</div>
                <h4>Template Ready for Dashboard</h4>
                <div class="template-summary">
                    <p><strong>Platform:</strong> ${this.platforms[templateData.platform].name}</p>
                    <p><strong>Theme:</strong> ${this.formatFieldName(templateData.meta.theme)}</p>
                    <p><strong>Sender:</strong> ${this.formatFieldName(templateData.meta.sender)}</p>
                    <p><strong>Media Type:</strong> ${this.formatFieldName(templateData.meta.media_type)}</p>
                </div>
                <div class="next-steps">
                    <p>This template is now ready to be sent to your dashboard for Jan AI to process and schedule.</p>
                    <button onclick="templateEngine.sendToDashboard()" class="btn btn-primary">Send to Dashboard</button>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    sendToDashboard() {
        // Simulate sending to dashboard
        console.log('Sending template to dashboard...', this.collectTemplateData());
        this.showSuccess('Template sent to dashboard successfully!');
        document.querySelector('.modal').remove();
    }

    collectTemplateData() {
        if (!this.currentPlatform) return null;
        
        const data = {
            platform: this.currentPlatform,
            timestamp: new Date().toISOString(),
            meta: {},
            content: {},
            hashtags: [],
            options: {}
        };

        // Collect meta information
        const metaFields = ['theme', 'sender', 'media_type', 'audience'];
        metaFields.forEach(field => {
            const element = document.querySelector(`[data-field="${field}"]`);
            if (element && element.value) {
                data.meta[field] = element.value;
            }
        });

        // Collect content fields
        const contentFields = ['title', 'description', 'keywords', 'tags', 'credits', 'referrals'];
        contentFields.forEach(field => {
            const element = document.querySelector(`[data-field="${field}"]`);
            if (element && element.value.trim()) {
                data.content[field] = element.value.trim();
            }
        });

        // Collect hashtags
        document.querySelectorAll('.hashtag-tag').forEach(tag => {
            data.hashtags.push(tag.dataset.tag);
        });

        // Add brand voice based on sender
        if (data.meta.sender && this.brandVoices[data.meta.sender]) {
            data.meta.brand_voice = this.brandVoices[data.meta.sender];
        }

        return data;
    }

    showPreviewModal() {
        const templateData = this.collectTemplateData();
        if (!templateData) {
            this.showError('No content to preview');
            return;
        }

        const modal = this.createModal('Template Preview', `
            <div class="template-preview">
                ${this.renderTemplatePreview(templateData)}
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    renderTemplatePreview(data) {
        const platform = this.platforms[data.platform];
        
        return `
            <div class="preview-header">
                <h4>${platform.name} Content Preview</h4>
                <div class="preview-meta">
                    <span class="meta-tag">Theme: ${this.formatFieldName(data.meta.theme || 'None')}</span>
                    <span class="meta-tag">From: ${this.formatFieldName(data.meta.sender || 'None')}</span>
                    <span class="meta-tag">Type: ${this.formatFieldName(data.meta.media_type || 'all_types')}</span>
                </div>
            </div>

            <div class="preview-content">
                ${Object.entries(data.content).map(([field, content]) => `
                    <div class="preview-section">
                        <strong>${this.formatFieldName(field)}:</strong>
                        <div class="preview-text">${this.formatPreviewContent(content)}</div>
                    </div>
                `).join('')}

                ${data.hashtags.length > 0 ? `
                    <div class="preview-section">
                        <strong>Hashtags:</strong>
                        <div class="preview-hashtags">
                            ${data.hashtags.map(tag => `<span class="preview-hashtag">#${tag}</span>`).join(' ')}
                        </div>
                    </div>
                ` : ''}

                ${data.meta.brand_voice ? `
                    <div class="preview-section">
                        <strong>Brand Voice:</strong>
                        <div class="brand-voice-note">${data.meta.brand_voice}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    saveCurrentTemplate() {
        const templateData = this.collectTemplateData();
        if (!templateData) {
            this.showError('No template data to save');
            return;
        }

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

    showTemplateLoader() {
        const savedTemplates = Array.from(this.templates.values());
        
        if (savedTemplates.length === 0) {
            this.showWarning('No saved templates found');
            return;
        }

        const modal = this.createModal('Load Template', `
            <div class="template-loader">
                <div class="templates-list">
                    ${savedTemplates.map(template => `
                        <div class="template-item" data-template-id="${template.id}">
                            <div class="template-info">
                                <h4>${template.name}</h4>
                                <div class="template-details">
                                    <span>Platform: ${this.platforms[template.data.platform]?.name}</span>
                                    <span>Theme: ${this.formatFieldName(template.data.meta.theme || 'None')}</span>
                                    <span>Created: ${new Date(template.created).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div class="template-actions">
                                <button onclick="templateEngine.loadTemplate('${template.id}')" class="btn btn-primary">Load</button>
                                <button onclick="templateEngine.deleteTemplate('${template.id}')" class="btn btn-danger">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    loadTemplate(templateId) {
        const template = this.templates.get(templateId);
        if (!template) {
            this.showError('Template not found');
            return;
        }

        // Set platform first
        this.selectPlatform(template.data.platform);
        document.getElementById('platform-selector').value = template.data.platform;

        // Wait a bit for form to render
        setTimeout(() => {
            this.populateFormWithTemplate(template.data);
            this.showSuccess(`Template "${template.name}" loaded successfully`);
        }, 100);

        // Close modal
        document.querySelector('.modal').remove();
    }

    populateFormWithTemplate(templateData) {
        // Populate meta fields
        Object.entries(templateData.meta).forEach(([field, value]) => {
            const element = document.querySelector(`[data-field="${field}"]`);
            if (element) {
                element.value = value;
            }
        });

        // Populate content fields
        Object.entries(templateData.content).forEach(([field, value]) => {
            const element = document.querySelector(`[data-field="${field}"]`);
            if (element) {
                element.value = value;
                // Update character count if applicable
                if (element.classList.contains('content-input')) {
                    this.updateCharacterCount(element);
                }
            }
        });

        // Populate hashtags
        const hashtagList = document.getElementById('hashtag-list');
        if (hashtagList) {
            hashtagList.innerHTML = '';
            templateData.hashtags.forEach(tag => {
                this.addHashtag(tag);
            });
        }

        this.updatePreview();
    }

    deleteTemplate(templateId) {
        if (!confirm('Are you sure you want to delete this template?')) return;

        this.templates.delete(templateId);
        this.saveTemplatesToStorage();
        
        // Refresh the loader
        document.querySelector('.modal').remove();
        this.showTemplateLoader();
        this.showSuccess('Template deleted successfully');
    }

    exportTemplate() {
        const templateData = this.collectTemplateData();
        if (!templateData) {
            this.showError('No template data to export');
            return;
        }

        const exportData = {
            version: '1.0',
            exported: new Date().toISOString(),
            template: templateData
        };

        // Create download
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `3c-template-${templateData.platform}-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showSuccess('Template exported successfully');
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
        container.innerHTML = this.renderTemplatePreview(data);
    }

    formatPreviewContent(content) {
        return content.replace(/\n/g, '<br>');
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
            title: 'Create a compelling, attention-grabbing headline',
            description: 'Provide engaging content that matches your theme and brand voice',
            hashtags: 'Use relevant hashtags to increase discoverability',
            keywords: 'Add SEO keywords for better reach',
            tags: 'Include relevant topic tags',
            credits: 'Credit any sources, collaborators, or inspirations',
            referrals: 'Add links to related content or resources'
        };
        return tips[field] || 'Fill in this field with relevant content';
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
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 4000);
    }

    autoSave() {
        // Debounced auto-save functionality
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            const data = this.collectTemplateData();
            if (data) {
                localStorage.setItem('3c-autosave', JSON.stringify(data));
            }
        }, 2000);
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
