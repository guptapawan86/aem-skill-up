import { fetchPlaceholders } from '../../scripts/aem.js';
import registerTouchHandlers from './touch.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// the id of the currently sliding carousel can be used to cancel the timeout
let intervalId = 0;

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

function setSlideInterval(block) {
  if (window.location.host.indexOf('adobeaemcloud') !== -1) {
    return;
  }

  intervalId = setTimeout(() => {
    const indicators = [...block.querySelectorAll('.carousel-slide-indicator')];
    const button = indicators.find((indicator) => indicator.querySelector('button').hasAttribute('disabled'));
    if (button) {
      const nextButton = indicators[(indicators.indexOf(button) + 1)
      % indicators.length].querySelector('button');
      nextButton.click();
    }
  }, 5000);
}

function changeSlide(block, slideIndex = 0) {
  if (window.location.host.indexOf('adobeaemcloud') !== -1) {
    return;
  }

  if (intervalId !== 0) {
    clearTimeout(intervalId);
    setSlideInterval(block);
  }

  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: window.location.host.indexOf('adobeaemcloud') === -1 ? 'smooth' : 'instant',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      changeSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  // combine row[1] and row[2] into a single div
  const contentContainer = document.createElement('div');
  contentContainer.classList.add('carousel-slide-container');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    if (colIdx === 0) {
      column.classList.add('carousel-slide-image');
    }

    if (colIdx >= 1) {
      contentContainer.appendChild(column);
      if (colIdx === 2) slide.append(contentContainer);
    } else {
      slide.append(column);
    }
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  block.prepend(slidesWrapper);

  if (window.location.host.indexOf('adobeaemcloud') !== -1) {
    registerTouchHandlers(
      slidesWrapper,
      () => changeSlide(block, parseInt(block.dataset.activeSlide, 10) - 1),
      () => changeSlide(block, parseInt(block.dataset.activeSlide, 10) + 1),
    );
  }

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);
    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = '<button type="button"></button>';
      slideIndicators.append(indicator);
    }

    moveInstrumentation(row, slide);
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }

  if (window.location.host.indexOf('adobeaemcloud') === -1) {
    setSlideInterval(block);
  }
}
