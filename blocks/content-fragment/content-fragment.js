import { getMetadata } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const aemauthorurl = getMetadata('authorurl') || '';
  const aempublishurl = getMetadata('publishurl') || 'https://publish-p137117-e1400714.adobeaemcloud.com';
  const persistedquery = '/graphql/execute.json/AEM-Skill-Up/achievement?q=abc';
  const contentPath = block.querySelector(':scope div:nth-child(1) > div a')?.textContent?.trim();
  const variationname = block.querySelector(':scope div:nth-child(2) > div')?.textContent?.trim()?.toLowerCase()?.replace(' ', '_') || 'master';

  block.innerHTML = '';
  const isAuthor = document.querySelector('*[data-aue-resource]') !== null;
  const url = window?.location?.origin?.includes('author')
    ? `${aemauthorurl}${persistedquery};variation=${variationname};ts=${Math.random() * 1000}`
    : `${aempublishurl}${persistedquery};variation=${variationname};ts=${Math.random() * 1000}`;

  const options = { credentials: 'include' };

  const response = await fetch(url, options)
    .then((res) => res.json())
    .then((resJson) => resJson.data?.achievementModelList?.items);

  if (!response || response.length === 0) {
    block.innerHTML = '<p>No achievement data found.</p>';
    return;
  }

  // Create container for multiple achievements
  const achievementsContainer = document.createElement('div');
  achievementsContainer.className = 'achievements-container';

  // Iterate through all achievements
  response.forEach((data, index) => {
    if (!data) return;

    /* eslint no-underscore-dangle: 0 */
    const itemId = `urn:aemconnection:${contentPath}/jcr:content/data/${variationname}`;

    const achievementCard = document.createElement('div');
    achievementCard.className = 'achievement-card';
    achievementCard.setAttribute('data-aue-resource', `${itemId}[${index}]`);
    achievementCard.setAttribute('data-aue-label', `achievement content fragment ${index + 1}`);
    achievementCard.setAttribute('data-aue-type', 'reference');
    achievementCard.setAttribute('data-aue-filter', 'cf');

    achievementCard.innerHTML = `
      <div class="achievement-image" style="background-image: url('${aempublishurl}${data?.image?._dynamicUrl}');"></div>
      <div class="achievement-content">
        <span class="achievement-category" data-aue-prop="category" data-aue-label="category" data-aue-type="text">${data?.category || ''}</span>
        <h3 class="achievement-title" data-aue-prop="achievementTitle" data-aue-label="title" data-aue-type="text">${data?.achievementTitle || ''}</h3>
        <p class="achievement-description" data-aue-prop="description" data-aue-label="description" data-aue-type="richtext">${data?.description?.plaintext || ''}</p>
      </div>
    `;

    achievementsContainer.appendChild(achievementCard);
  });

  // Set container attributes for AEM Universal Editor
  block.setAttribute('data-aue-type', 'container');
  block.appendChild(achievementsContainer);

  if (!isAuthor) {
    moveInstrumentation(block, null);
    block.querySelectorAll('*').forEach((elem) => moveInstrumentation(elem, null));
  }
}