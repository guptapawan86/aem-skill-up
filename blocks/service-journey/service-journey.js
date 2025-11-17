import { moveInstrumentation } from '../../scripts/scripts.js';
import { createElement } from '../../scripts/blocks-utils.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Creates the header section with banner image and text
 * @param {Array} cells - Array of header cells [bannerImage, bannerImageAlt, title, description]
 * @returns {Element|null} - Header element or null
 */
function createHeader(cells) {
  if (!cells || cells.length !== 4) {
    return null;
  }
  
  const [bannerImageCell, bannerImageAltCell, titleCell, descriptionCell] = cells;
  
  const header = createElement('div', 'service-journey-header');
  
  // Text section
  const textSection = createElement('div', 'header-text');
  
  // Add title
  const titleText = titleCell?.textContent?.trim();
  if (titleText) {
    const title = createElement('h2', 'header-title');
    title.textContent = titleText;
    textSection.appendChild(title);
  }
  
  // Add description
  const descContent = descriptionCell?.innerHTML?.trim();
  if (descContent && descContent !== '<p><br></p>' && descContent !== '<br>') {
    const description = createElement('div', 'header-description');
    description.innerHTML = descContent;
    textSection.appendChild(description);
  }
  
  // Image section
  const imageSection = createElement('div', 'header-image');
  const picture = bannerImageCell?.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      const altText = bannerImageAltCell?.textContent?.trim() || img.alt || '';
      const optimizedPicture = createOptimizedPicture(img.src, altText, false, [{ width: '600' }]);
      imageSection.appendChild(optimizedPicture);
    }
  }
  
  // Add both sections to header
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
  // Extract fields from row (icon, iconAlt, title, description, link1, link2, link3)
  const [iconContainer, iconAltContainer, titleContainer, descriptionContainer, link1Container, link2Container, link3Container] = [...row.children];
  
  const serviceItem = createElement('div', 'service-item');
  
  // Icon section
  const iconSection = createElement('div', 'service-icon');
  const icon = iconContainer?.querySelector('picture') || iconContainer?.querySelector('img');
  if (icon) {
    const iconClone = icon.cloneNode(true);
    // Apply alt text if provided
    const altText = iconAltContainer?.textContent.trim();
    if (altText && iconClone.tagName === 'IMG') {
      iconClone.alt = altText;
    } else if (altText && iconClone.querySelector('img')) {
      iconClone.querySelector('img').alt = altText;
    }
    iconSection.appendChild(iconClone);
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
  
  if (rows.length === 0) {
    return;
  }
  
  // Get all cells from the first row
  const firstRow = rows[0];
  const cells = [...firstRow.children];
  
  let header = null;
  let serviceRows = [];
  
  // Check if this is a header row (has 4 cells) or service item row (has 7 cells)
  if (cells.length === 4) {
    // First row is header
    header = createHeader(cells);
    serviceRows = rows.slice(1);
  } else {
    // No header, all rows are service items
    serviceRows = rows;
  }
  
  // Create service items container
  const container = createElement('div', 'service-journey-container');
  
  // Process each service item row
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

