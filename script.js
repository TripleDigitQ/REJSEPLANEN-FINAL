const illustrationImg = document.querySelector('.illustration img');
const originalIllustrationSrc = illustrationImg ? illustrationImg.src : null;

const slider = document.getElementById('slider');
const sliderFill = document.getElementById('sliderFill');
const handle = document.getElementById('handle');
const timerEl = document.getElementById('timer');
const labelEl = document.getElementById('label');
const sound = document.getElementById('sound');

const userInfo = document.getElementById('userInfo');
const usernameText = document.getElementById('usernameText');
const locationContainer = document.querySelector('.location');
const placeText = document.getElementById('placeText');
const subText = document.getElementById('subText');
const editLocationBtn = document.getElementById('editLocationBtn');
const quickSwitchBtn = document.getElementById('quickSwitchBtn');

const nameModal = document.getElementById('nameModal');
const nameBackdrop = document.getElementById('nameBackdrop');
const nameList = document.getElementById('nameList');
const locationModal = document.getElementById('locationModal');
const locationBackdrop = document.getElementById('locationBackdrop');
const locationList = document.getElementById('locationList');

const STORAGE_ACTIVE_NAME_KEY = 'rejsekort.activeName.v1';
const STORAGE_ACTIVE_LOCATION_KEY = 'rejsekort.activeLocation.v2';
const STORAGE_NAMES_KEY = 'rejsekort.customNames.v1';
const STORAGE_LOCATIONS_KEY = 'rejsekort.customLocations.v2';
const TICKET_ENTRY_KEY = 'rejsekort.ticketEntry.v1';
const LEGACY_NAME_KEY = 'rk_name';
const LEGACY_LOCATION_KEY = 'rk_location';
const LOCATION_HELP_TEXT = 'Check ind f\u00f8r du st\u00e5r p\u00e5';

const names = [
  'Alexander Kristiansen',
  'Søren Asp-Nielsen',
  'Marcus Bilskov',
  'Magnus Mølskov',
  'Madshugo Adelborg Nørgaard',
  'Simon Holland',
  'Frederik Møller',
  'Juliane Andrea Kjær Steffensen'
];

const locations = [
  'Aars Svømmehal (Himmerlandsgade)',
  'Aars Busterminal (Vesthimmerlands Komm.)',
  'Hobro Station (bus)',
  'Løgstør Busterminal (Vesthimm. Komm.)',
  'Aalborg St. /Busterminal',
  'Farsø Busterminal (Vesthimm. Komm.)',
  'Haverslev Kirke (Rebild Kommune)',
  'Aars Svømmehal (Himmerlandsgade / Aars)',
  'Tokesvej (Himmerlandsgade / Aars)',
  'Peder Stubsvej (Himmerlandsgade / Aars)',
  'HEG Aars (Øster Boulevard / Aars)',
  'Østermarkskolen (Ø.Boulevard / Aars)',
  'Vestermarkskolen (Løgstørvej / Aars)',
  'Danpo / Aars Vest (Løgstørvej / Vesthim. Komm)',
  'Skarp Salling (Aarsvej / Vesthimm. Komm.)',
  'Kornum (Aalborgvej / Vesthimm. Komm.)',
  'Himmerlandsstien (Bredgade / Løgstør)',
  'Østerbrogade (Bredgade / Løgstør)',
  'Michael Simonsensvej (Sønderport / Vesthim. komm)',
  'Løgstør Skole (Sønderport / Løgstør)',
  'Løgstør Øst (Aalborgvej / Vesthimmerlands Komm.)',
  'Raunstrup (Viborgvej / Vesthimm. Komm.)',
  'Malle (Viborgvej / Vesthimm. Komm.)',
  'Ranum skole (Ranumvej / Vesthimmerland Komm.)',
  'Sygehuset (Nørregade / Farsø / Vesthimmerland)',
  'Tulipanvej (Nørregade / Farsø / Vesthimmerland)',
  'Industrivej (Søndergade / Farsø)',
  'Svingelbjerg (Klovenhøjvej / Vesthimm. Komm.)',
  'Gatten (Stationvej / Vesthimm. Komm.)',
  'Ullits (Nibevej / Vesthimm. Komm.)',
  'Ullits Skole (Foulumvej / Vesthimm. Komm.)',
  'Hvalpsund (Sundvej / Vesthimm. Komm.)',
  'Hvalpsund Havn (Vesthimm. Komm.)',
  'Haverslev Pendlerparkering (Rebild Kommune)',
  'Ravnkilde Skole (Skolegade / Rebild Kommune)',
  'Nørager Station (Rebild Kommune)'
];

let visBilletBtn = null;
let dragging = false;
let checked = false;
let currentX = 0;
let startTime = 0;
let interval = null;
let validityStart = null;
let currentNameIndex = 0;
let currentLocationIndex = 0;

const TRACK_PADDING = 6;

function clamp(num, min, max) {
  return Math.max(min, Math.min(num, max));
}

function setNameByIndex(index, shouldPersist = true) {
  currentNameIndex = clamp(index, 0, names.length - 1);
  const selectedName = names[currentNameIndex];

  if (usernameText) {
    usernameText.textContent = selectedName;
  }

  if (shouldPersist) {
    localStorage.setItem(LEGACY_NAME_KEY, selectedName);
    localStorage.setItem(STORAGE_ACTIVE_NAME_KEY, String(currentNameIndex));
  }
}

function setLocationByIndex(index, shouldPersist = true) {
  currentLocationIndex = clamp(index, 0, locations.length - 1);
  const selectedLocation = locations[currentLocationIndex];

  if (placeText) {
    placeText.textContent = selectedLocation;
  }
  if (subText) {
    subText.textContent = LOCATION_HELP_TEXT;
  }

  if (shouldPersist) {
    localStorage.setItem(LEGACY_LOCATION_KEY, selectedLocation);
    localStorage.setItem(STORAGE_ACTIVE_LOCATION_KEY, String(currentLocationIndex));
  }
}

function closeModal(modal) {
  if (!modal) {
    return;
  }
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function openModal(modal) {
  closeModal(nameModal);
  closeModal(locationModal);
  if (!modal) {
    return;
  }
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function renderPicker(listElement, items, activeIndex, onSelect) {
  if (!listElement) {
    return;
  }

  listElement.innerHTML = '';

  items.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'picker-item';
    if (index === activeIndex) {
      button.classList.add('active');
    }
    button.textContent = item;

    button.addEventListener('click', () => {
      onSelect(index);
    });

    listElement.append(button);
  });
}

function renderPickers() {
  renderPicker(nameList, names, currentNameIndex, index => {
    setNameByIndex(index, true);
    renderPickers();
    closeModal(nameModal);
  });

  renderPicker(locationList, locations, currentLocationIndex, index => {
    setLocationByIndex(index, true);
    renderPickers();
    closeModal(locationModal);
  });
}

function initNameAndLocation() {
  const legacySavedName = localStorage.getItem(LEGACY_NAME_KEY);
  const indexSavedName = Number.parseInt(localStorage.getItem(STORAGE_ACTIVE_NAME_KEY) || '-1', 10);

  if (legacySavedName && names.includes(legacySavedName)) {
    setNameByIndex(names.indexOf(legacySavedName), false);
  } else if (!Number.isNaN(indexSavedName) && names[indexSavedName]) {
    setNameByIndex(indexSavedName, false);
  } else {
    setNameByIndex(0, false);
  }

  const legacySavedLocation = localStorage.getItem(LEGACY_LOCATION_KEY);
  const indexSavedLocation = Number.parseInt(localStorage.getItem(STORAGE_ACTIVE_LOCATION_KEY) || '-1', 10);

  if (legacySavedLocation && locations.includes(legacySavedLocation)) {
    setLocationByIndex(locations.indexOf(legacySavedLocation), false);
  } else if (!Number.isNaN(indexSavedLocation) && locations[indexSavedLocation]) {
    setLocationByIndex(indexSavedLocation, false);
  } else {
    setLocationByIndex(0, false);
  }

  const profilesForTicket = names.map(name => ({ name, type: 'Standard • Voksen' }));
  const stopsForTicket = locations.map(place => ({ place, sub: LOCATION_HELP_TEXT }));
  localStorage.setItem(STORAGE_NAMES_KEY, JSON.stringify(profilesForTicket));
  localStorage.setItem(STORAGE_LOCATIONS_KEY, JSON.stringify(stopsForTicket));

  renderPickers();

  if (userInfo) {
    userInfo.addEventListener('click', () => openModal(nameModal));
  }

  if (quickSwitchBtn) {
    quickSwitchBtn.addEventListener('click', event => {
      event.stopPropagation();
      openModal(nameModal);
    });
  }

  if (locationContainer) {
    locationContainer.addEventListener('click', () => openModal(locationModal));
  }

  if (editLocationBtn) {
    editLocationBtn.addEventListener('click', event => {
      event.stopPropagation();
      openModal(locationModal);
    });
  }

  if (nameBackdrop) {
    nameBackdrop.addEventListener('click', () => closeModal(nameModal));
  }

  if (locationBackdrop) {
    locationBackdrop.addEventListener('click', () => closeModal(locationModal));
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeModal(nameModal);
      closeModal(locationModal);
    }
  });
}

function showVisBillet() {
  if (visBilletBtn) {
    return;
  }

  const illustration = document.querySelector('.illustration');
  if (!illustration) {
    return;
  }

  visBilletBtn = document.createElement('div');
  visBilletBtn.className = 'vis-billet';
  visBilletBtn.textContent = 'Vis billet';
  visBilletBtn.style.cursor = 'pointer';
  visBilletBtn.onclick = () => {
    sessionStorage.setItem(TICKET_ENTRY_KEY, '1');
    window.location.href = 'ticket.html';
  };

  illustration.after(visBilletBtn);
}

function hideVisBillet() {
  if (!visBilletBtn) {
    return;
  }

  visBilletBtn.remove();
  visBilletBtn = null;
}

function getMaxPosition() {
  if (!slider || !handle) {
    return TRACK_PADDING;
  }
  return Math.max(TRACK_PADDING, slider.clientWidth - handle.offsetWidth - TRACK_PADDING);
}

function getProgress() {
  const max = getMaxPosition();
  const travel = Math.max(1, max - TRACK_PADDING);
  return clamp((currentX - TRACK_PADDING) / travel, 0, 1);
}

function setHandlePosition(x) {
  if (!handle || !sliderFill) {
    return;
  }

  const max = getMaxPosition();
  currentX = clamp(x, TRACK_PADDING, max);
  handle.style.left = `${currentX}px`;
}

function startTimer() {
  if (!timerEl) {
    return;
  }

  clearInterval(interval);
  startTime = Date.now();

  interval = setInterval(() => {
    const elapsedMs = Date.now() - startTime;
    const minutes = String(Math.floor(elapsedMs / 60000)).padStart(2, '0');
    const seconds = String(Math.floor(elapsedMs / 1000) % 60).padStart(2, '0');
    timerEl.textContent = `${minutes}.${seconds}`;
  }, 1000);
}

function stopTimer() {
  if (!timerEl) {
    return;
  }

  clearInterval(interval);
  interval = null;
  timerEl.textContent = '00.00';
}

function setValidityStart() {
  if (validityStart) {
    return;
  }

  validityStart = new Date();
  const end = new Date(validityStart.getTime() + 60 * 60 * 1000);
  const format = d => d.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });

  const el = document.getElementById('validPeriod');
  if (el) {
    el.textContent = `${format(validityStart)} - ${format(end)}`;
  }
}

function setCheckedState(nextChecked, animate = true) {
  if (!slider || !handle) {
    return;
  }

  const stateChanged = checked !== nextChecked;
  checked = nextChecked;
  slider.classList.toggle('checked', checked);

  handle.classList.toggle('green', !checked);
  handle.classList.toggle('red', checked);
  handle.innerHTML = checked ? '<span>&lt;</span>' : '<span>&gt;</span>';
  if (quickSwitchBtn) {
    quickSwitchBtn.style.visibility = checked ? 'hidden' : 'visible';
    quickSwitchBtn.style.pointerEvents = checked ? 'none' : 'auto';
  }
  if (labelEl) {
    labelEl.textContent = 'Check ind';
  }

  if (!animate) {
    slider.classList.add('dragging');
  }

  setHandlePosition(checked ? getMaxPosition() : TRACK_PADDING);
  sliderFill.style.width = checked ? '100%' : '0';

  if (!animate) {
    requestAnimationFrame(() => slider.classList.remove('dragging'));
  }

  if (!stateChanged) {
    return;
  }

  handle.classList.remove('pulse');
  requestAnimationFrame(() => {
    handle.classList.add('pulse');
  });

  if (checked) {
    if (illustrationImg) {
      illustrationImg.src = 'ticket.png';
    }
    showVisBillet();
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
    startTimer();
    validityStart = null;
    document.dispatchEvent(new CustomEvent('swipeCompleted'));
  } else {
    if (illustrationImg && originalIllustrationSrc) {
      illustrationImg.src = originalIllustrationSrc;
    }
    hideVisBillet();
    stopTimer();
    validityStart = null;
  }
}

function move(clientX) {
  if (!slider || !handle) {
    return;
  }

  const rect = slider.getBoundingClientRect();
  const x = clientX - rect.left - handle.offsetWidth / 2;
  setHandlePosition(x);
}

function startDrag() {
  if (!slider) {
    return;
  }

  dragging = true;
  slider.classList.add('dragging');
  slider.classList.remove('hint');
}

function endDrag() {
  if (!dragging || !slider) {
    return;
  }

  dragging = false;
  slider.classList.remove('dragging');

  const progress = getProgress();
  const nextChecked = checked ? progress > 0.35 : progress >= 0.65;
  setCheckedState(nextChecked, true);
}

if (slider && handle && sliderFill) {
  setHandlePosition(TRACK_PADDING);
  slider.classList.add('hint');

  handle.addEventListener('pointerdown', event => {
    event.preventDefault();
    startDrag();
    move(event.clientX);
  });

  document.addEventListener('pointermove', event => {
    if (dragging) {
      move(event.clientX);
    }
  });

  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);

  window.addEventListener('resize', () => {
    setHandlePosition(checked ? getMaxPosition() : TRACK_PADDING);
  });

  setTimeout(() => {
    if (!dragging && !checked) {
      slider.classList.remove('hint');
    }
  }, 5000);
}

document.addEventListener('swipeCompleted', setValidityStart);
sessionStorage.removeItem(TICKET_ENTRY_KEY);
initNameAndLocation();
