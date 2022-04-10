// @ts-nocheck
import { mathClamp } from './util.js';

const PREVIEW_SCALE_STEP = 25;
const PREVIEW_MIN_SCALE = 25;
const PREVIEW_MAX_SCALE = 100;
const PREVIEW_DEFAULT_SCALE = 100;
const CssFilter = {
  NONE: '',
  GRAYSCALE: 'grayscale',
  SEPIA: 'sepia',
  INVERT: 'invert',
  BLUR: 'blur',
  BRIGHTNESS: 'brightness'
};
const ImageEffect = {
  NONE: 'none',
  CHROME: 'chrome',
  SEPIA: 'sepia',
  MARVIN: 'marvin',
  PHOBOS: 'phobos',
  HEAT: 'heat'
};
const ImageEffectFilter = {
  [ImageEffect.NONE]: CssFilter.NONE,
  [ImageEffect.CHROME]: CssFilter.GRAYSCALE,
  [ImageEffect.SEPIA]: CssFilter.SEPIA,
  [ImageEffect.MARVIN]: CssFilter.INVERT,
  [ImageEffect.PHOBOS]: CssFilter.BLUR,
  [ImageEffect.HEAT]: CssFilter.BRIGHTNESS
};
const effectLevelSliderContainer = document.querySelector('.effect-level__slider');
const effectLevelInput = document.querySelector('.effect-level__value');
const previewImgElement = document.querySelector('.img-upload__preview img');
const scaleValueInput = document.querySelector('.scale__control--value');
const imgEffectsFieldset = document.querySelector('.img-upload__effects');
const uploadForm = document.querySelector('.img-upload__form');
let effectValueSlider = null;

const sliderFilterSettings = {
  [ImageEffect.CHROME]: {
    range: { min: 0, max: 1 },
    start: 1,
    step: 0.1,
    format: {
      to(value) { return value.toFixed(1); },
      from(value) { return parseFloat(value); }
    }
  },
  [ImageEffect.SEPIA]: {
    range: { min: 0, max: 1 },
    start: 1,
    step: 0.1,
    format: {
      to(value) { return value.toFixed(1); },
      from(value) { return parseFloat(value); }
    }
  },
  [ImageEffect.MARVIN]: {
    range: { min: 0, max: 100 },
    start: 100,
    step: 1,
    format: {
      to(value) { return `${value}%`; },
      from(value) { return parseFloat(value); }
    }
  },
  [ImageEffect.PHOBOS]: {
    range: { min: 0, max: 3 },
    start: 3,
    step: 0.1,
    format: {
      to(value) { return `${value.toFixed(1)}px`; },
      from(value) { return parseFloat(value); }
    }
  },
  [ImageEffect.HEAT]: {
    range: { min: 1, max: 3 },
    start: 3,
    step: 0.1,
    format: {
      to(value) { return value.toFixed(1); },
      from(value) { return parseFloat(value); }
    }
  }
};

const showEffectSlider = () => {
  effectLevelSliderContainer.removeAttribute('hidden', true);
};
const hideEffectSlider = () => {
  effectLevelSliderContainer.setAttribute('hidden', true);
};

const updatePreviewImgClass = (filterName) => {
  previewImgElement.className = (filterName) ?
    `effects__preview--${filterName}` : '';
};
const updatePreviewImgEffect = (effectName, effectValue) => {
  previewImgElement.style.filter = (effectName) ?
    `${ImageEffectFilter[effectName]}(${effectValue})` : '';
};

function onFilterChange(evt) {
  const filterName = evt.target.value;
  hideEffectSlider();
  updatePreviewImgClass(filterName);
  updatePreviewImgEffect();
  const sliderSettings = sliderFilterSettings[filterName];
  if (sliderSettings) {
    effectValueSlider.updateOptions(sliderSettings);
    effectValueSlider.set(sliderSettings.max);
    showEffectSlider();
  }
}

function enableFilters() {
  effectLevelInput.value = 1;
  hideEffectSlider();
  effectValueSlider = noUiSlider.create(
    effectLevelSliderContainer,
    {
      range: { min: 0, max: 1, },
      start: 1,
      step: 0.1,
      connect: 'lower',
      format: {
        to(value) { return value; },
        from(value) { return value; }
      }
    }
  );

  effectValueSlider.on('update', () => {
    const effectValue = effectValueSlider.get();
    const effectName = uploadForm.effect.value;
    effectLevelInput.value = effectValue;
    if (uploadForm.effect.value === ImageEffect.NONE) {
      return;
    }
    updatePreviewImgEffect(effectName, effectValue);
  });
  imgEffectsFieldset.addEventListener('change', onFilterChange);
}

function disableFilters() {
  imgEffectsFieldset.removeEventListener('change', onFilterChange);
  updatePreviewImgClass();
  updatePreviewImgEffect();
  uploadForm.effect.value = ImageEffect.NONE;
  effectValueSlider.destroy();
}

function getCurrentScale() {
  return parseFloat(scaleValueInput.value);
}

function setPreviewScale(scale) {
  scale = mathClamp(scale, PREVIEW_MIN_SCALE, PREVIEW_MAX_SCALE);
  scaleValueInput.value = `${scale}%`;
  previewImgElement.style.transform = `scale(${scale/100})`;
}

function onScaleButtonClick(evt) {
  const currentScale = getCurrentScale();
  if (evt.target.classList.contains('scale__control--smaller')) {
    return setPreviewScale(currentScale + (PREVIEW_SCALE_STEP * -1));
  }
  if (evt.target.classList.contains('scale__control--bigger')) {
    return setPreviewScale(currentScale + (PREVIEW_SCALE_STEP));
  }
}

function makeScalable() {
  setPreviewScale(PREVIEW_DEFAULT_SCALE);
  document.querySelector('.img-upload__scale').addEventListener('click', onScaleButtonClick);
}

function makeUnscalable() {
  setPreviewScale(PREVIEW_DEFAULT_SCALE);
  document.querySelector('.img-upload__scale').removeEventListener('click', onScaleButtonClick);
}

export { enableFilters, disableFilters, makeScalable, makeUnscalable };
