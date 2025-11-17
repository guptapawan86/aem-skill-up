import { moveInstrumentation } from '../../scripts/scripts.js';
import { createElement } from '../../scripts/blocks-utils.js';

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
  const container = createElement('div', 'service-journey-container');
  
  // Process each row as a service item
  [...block.children].forEach((row) => {
    const serviceItem = decorateServiceItem(row);
    container.appendChild(serviceItem);
  });
  
  // Replace block content
  block.textContent = '';
  block.appendChild(container);
}

