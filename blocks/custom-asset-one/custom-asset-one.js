/**
 * Custom Asset One Block - EDS Block Implementation
 * Displays custom images based on JSON configuration
 */

class CustomAssetOneBlock {
    constructor(blockElement) {
        this.block = blockElement;
        this.imageElement = null;
        this.titleElement = null;
        this.descriptionElement = null;
        this.config = null;
        
        this.init();
    }

    async init() {
        try {
            await this.loadConfiguration();
            this.setupEventListeners();
            this.render();
        } catch (error) {
            console.error('Failed to initialize Custom Asset One Block:', error);
            this.showErrorState();
        }
    }

    async loadConfiguration() {
        try {
            // Load configuration from the JSON file
            const response = await fetch('_custom-asset-one.json');
            if (!response.ok) {
                throw new Error(`Failed to load configuration: ${response.status}`);
            }
            
            this.config = await response.json();
            console.log('Configuration loaded:', this.config);
        } catch (error) {
            console.error('Error loading configuration:', error);
            // Fallback to default configuration
            this.config = {
                models: [{
                    id: 'custom-asset-one',
                    fields: [{
                        name: 'image',
                        label: 'Image',
                        valueType: 'string'
                    }]
                }]
            };
        }
    }

    setupEventListeners() {
        // Image load events
        if (this.imageElement) {
            this.imageElement.addEventListener('load', () => {
                this.onImageLoad();
            });
            
            this.imageElement.addEventListener('error', () => {
                this.onImageError();
            });
        }

        // Hover effects
        const container = this.block.querySelector('.asset-container');
        if (container) {
            container.addEventListener('mouseenter', () => {
                this.onHoverStart();
            });
            
            container.addEventListener('mouseleave', () => {
                this.onHoverEnd();
            });
        }
    }

    render() {
        if (!this.config) {
            this.showErrorState();
            return;
        }

        // Get image field from configuration
        const imageField = this.config.models?.[0]?.fields?.find(field => field.name === 'image');
        
        if (imageField) {
            this.updateImage(imageField);
        }

        // Update title and description if available
        this.updateContent();
    }

    updateImage(imageField) {
        const imageElement = this.block.querySelector('.asset-image');
        if (!imageElement) return;

        this.imageElement = imageElement;
        
        // Set loading state
        imageElement.classList.add('loading');
        
        // Update image source
        if (imageField.valueType === 'string' && imageField.value) {
            imageElement.src = imageField.value;
            imageElement.alt = imageField.label || 'Custom Asset';
        } else {
            // Use placeholder image if no source provided
            imageElement.src = this.getPlaceholderImage();
            imageElement.alt = 'Placeholder Image';
        }
    }

    updateContent() {
        // Update title
        const titleElement = this.block.querySelector('.asset-title');
        if (titleElement) {
            this.titleElement = titleElement;
            const titleField = this.config.models?.[0]?.fields?.find(field => field.name === 'title');
            if (titleField && titleField.value) {
                titleElement.textContent = titleField.value;
            }
        }

        // Update description
        const descriptionElement = this.block.querySelector('.asset-description');
        if (descriptionElement) {
            this.descriptionElement = descriptionElement;
            const descriptionField = this.config.models?.[0]?.fields?.find(field => field.name === 'description');
            if (descriptionField && descriptionField.value) {
                descriptionElement.textContent = descriptionField.value;
            }
        }
    }

    onImageLoad() {
        if (this.imageElement) {
            this.imageElement.classList.remove('loading');
            this.imageElement.classList.remove('error');
        }
        
        // Trigger animation
        this.animateContent();
    }

    onImageError() {
        if (this.imageElement) {
            this.imageElement.classList.remove('loading');
            this.imageElement.classList.add('error');
        }
        
        // Show fallback content
        this.showFallbackContent();
    }

    onHoverStart() {
        // Additional hover effects can be added here
        console.log('Hover started');
    }

    onHoverEnd() {
        // Reset hover effects
        console.log('Hover ended');
    }

    animateContent() {
        const content = this.block.querySelector('.asset-content');
        if (content) {
            content.style.animation = 'none';
            content.offsetHeight; // Trigger reflow
            content.style.animation = 'fadeInUp 0.6s ease-out';
        }
    }

    showFallbackContent() {
        const titleElement = this.block.querySelector('.asset-title');
        const descriptionElement = this.block.querySelector('.asset-description');
        
        if (titleElement) {
            titleElement.textContent = 'Image Unavailable';
        }
        
        if (descriptionElement) {
            descriptionElement.textContent = 'The requested image could not be loaded.';
        }
    }

    showErrorState() {
        const container = this.block.querySelector('.asset-container');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-content">
                        <h3>Configuration Error</h3>
                        <p>Unable to load custom asset configuration.</p>
                    </div>
                </div>
            `;
        }
    }

    getPlaceholderImage() {
        // Return a placeholder image URL
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIFBsYWNlaG9sZGVyPC90ZXh0Pjwvc3ZnPg==';
    }

    // Public method to update image dynamically
    updateImageSource(newSource, newAlt = '') {
        if (this.imageElement) {
            this.imageElement.src = newSource;
            if (newAlt) {
                this.imageElement.alt = newAlt;
            }
        }
    }

    // Public method to update content dynamically
    updateContentText(title, description) {
        if (this.titleElement && title) {
            this.titleElement.textContent = title;
        }
        
        if (this.descriptionElement && description) {
            this.descriptionElement.textContent = description;
        }
    }
}

// Initialize the block when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const blockElement = document.querySelector('.custom-asset-one-block');
    if (blockElement) {
        new CustomAssetOneBlock(blockElement);
    }
});

// Export for use in other modules
export default CustomAssetOneBlock;
