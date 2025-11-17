import { moveInstrumentation } from '../../scripts/scripts.js';
import { createElement } from '../../scripts/blocks-utils.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Creates the header section with banner image and text
 * @param {Array} headerData - Array of header field containers [bannerImage, bannerImageAlt, title, description]
 * @returns {Element|null} - Header element or null
 */
function createHeader(headerData) {
  const [bannerImageContainer, bannerImageAltContainer, titleContainer, descriptionContainer] = headerData;
  
  // Check if we have at least a title
  if (!titleContainer?.textContent.trim()) {
    return null;
  }
  
  const header = createElement('div', 'service-journey-header');
  const textSection = createElement('div', 'header-text');
  const imageSection = createElement('div', 'header-image');
  
  // Add title
  const title = createElement('h2', 'header-title');
  title.textContent = titleContainer.textContent.trim();
  textSection.appendChild(title);
  
  // Add description if exists
  if (descriptionContainer?.innerHTML.trim()) {
    const description = createElement('div', 'header-description');
    description.innerHTML = descriptionContainer.innerHTML;
    textSection.appendChild(description);
  }
  
  // Add banner image if exists
  const picture = bannerImageContainer?.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      const optimizedPicture = createOptimizedPicture(img.src, img.alt || bannerImageAltContainer?.textContent.trim() || '', false, [{ width: '600' }]);
      imageSection.appendChild(optimizedPicture);
    }
  }
  
  header.appendChild(textSection);
  header.appendChild(imageSection);
  
  return header;
}

/**
 * Creates a link element with proper styling
 * @param {Element} linkContainer - Container with link
 * @param {string} className - CSS class for the link
 * @returns {Element|null} - Link element or null
 */
function createLink(linkContainer, className = 'service-link') {
  const anchor = linkContainer?.querySelector('a');
  if (anchor && anchor.href) {
    const linkWrapper = createElement('div', className);
    linkWrapper.innerHTML = `
      <a href="${anchor.href}" title="${anchor.textContent}">
        ${anchor.textContent}
        <span class="arrow">›</span>
      </a>
    `;
    return linkWrapper;
  }
  return null;
}

/**
 * Decorates a single service item
 * @param {Element} row - The row element containing service item data
 * @returns {Element} - Decorated service item element
 */
function decorateServiceItem(row) {
  // Extract fields from row (icon, title, description, link1, link2, link3)
  const [iconContainer, titleContainer, descriptionContainer, link1Container, link2Container, link3Container] = [...row.children];
  
  const serviceItem = createElement('div', 'service-item');
  
  // Icon section
  const iconSection = createElement('div', 'service-icon');
  const icon = iconContainer?.querySelector('picture') || iconContainer?.querySelector('img');
  if (icon) {
    iconSection.appendChild(icon.cloneNode(true));
  }
  
  // Title section
  const titleSection = createElement('div', 'service-title');
  if (titleContainer?.textContent.trim()) {
    const heading = createElement('h3');
    heading.textContent = titleContainer.textContent.trim();
    titleSection.appendChild(heading);
  }
  
  // Description section
  const descriptionSection = createElement('div', 'service-description');
  if (descriptionContainer?.innerHTML.trim()) {
    descriptionSection.innerHTML = descriptionContainer.innerHTML;
  }
  
  // Links section
  const linksSection = createElement('div', 'service-links');
  
  const link1 = createLink(link1Container);
  const link2 = createLink(link2Container);
  const link3 = createLink(link3Container);
  
  if (link1) linksSection.appendChild(link1);
  if (link2) linksSection.appendChild(link2);
  if (link3) linksSection.appendChild(link3);
  
  // Assemble service item
  serviceItem.appendChild(iconSection);
  serviceItem.appendChild(titleSection);
  serviceItem.appendChild(descriptionSection);
  if (linksSection.children.length > 0) {
    serviceItem.appendChild(linksSection);
  }
  
  // Move instrumentation for Universal Editor
  moveInstrumentation(row, serviceItem);
  
  return serviceItem;
}

/**
 * Main decoration function
 * @param {Element} block - The service-journey block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  
  // First 4 rows are header data (bannerImage, bannerImageAlt, title, description)
  const headerData = rows.slice(0, 4).map((row) => row.firstElementChild);
  const serviceRows = rows.slice(4); // Remaining rows are service items
  
  // Create header section
  const header = createHeader(headerData);
  
  // Create service items container
  const container = createElement('div', 'service-journey-container');
  
  // Process each remaining row as a service item
  serviceRows.forEach((row) => {
    const serviceItem = decorateServiceItem(row);
    container.appendChild(serviceItem);
  });
  
  // Replace block content
  block.textContent = '';
  
  if (header) {
    block.appendChild(header);
  }
  
  block.appendChild(container);
}

