const controllers = [
  'AccountOrderController',
  'AccountTracker',
  'AccountsController',
  'AddressBookController',
  'AlertController',
  'AnnouncementController',
  'AppMetadataController',
  'AppStateController',
  'ApprovalController',
  'AuthenticationController',
  'BridgeController',
  'BridgeStatusController',
  'CronjobController',
  'CurrencyController',
  'DecryptMessageController',
  'EncryptionPublicKeyController',
  'EnsController',
  'GasFeeController',
  'KeyringController',
  'LoggingController',
  'MetaMetricsController',
  'MetaMetricsDataDeletionController',
  'MultichainBalancesController',
  'MultichainRatesController',
  'NameController',
  'NetworkController',
  'NetworkOrderController',
  'NftController',
  'NotificationServicesController',
  'NotificationServicesPushController',
  'OnboardingController',
  'PPOMController',
  'PermissionController',
  'PermissionLogController',
  'PhishingController',
  'PreferencesController',
  'SelectedNetworkController',
  'SignatureController',
  'SmartTransactionsController',
  'SnapController',
  'SnapInsightsController',
  'SnapInterfaceController',
  'SnapsRegistry',
  'SubjectMetadataController',
  'SwapsController',
  'TokenBalancesController',
  'TokenListController',
  'TokenRatesController',
  'TokensController',
  'TransactionController',
  'UserOperationController',
  'UserStorageController'
];

function showDiff() {
  const input1 = document.getElementById('input1').value;
  const input2 = document.getElementById('input2').value;

  let stateA, stateB;

  try {
    stateA = JSON.parse(input1);
    stateB = JSON.parse(input2);
  } catch (e) {
    alert('Invalid JSON input');
    return;
  }

  const diffOutput1 = document.getElementById('diffOutput1');
  const diffOutput2 = document.getElementById('diffOutput2');

  diffOutput1.innerHTML = '';
  diffOutput2.innerHTML = '';

  displayControllers(stateA, stateB, diffOutput1, 'A');
  displayControllers(stateB, stateA, diffOutput2, 'B');
}

function displayControllers(state, otherState, outputElement, column) {
  if (!state.data) {
    outputElement.textContent = 'No data available';
    return;
  }

  controllers.forEach(controller => {
    const controllerDiv = document.createElement('div');
    const title = document.createElement('h4');
    title.textContent = controller;
    title.classList.add('controller-title');
    title.dataset.controller = controller;
    title.dataset.column = column;
    title.addEventListener('click', () => toggleController(controller));

    const icon = document.createElement('span');
    icon.textContent = '+';
    icon.classList.add('toggle-icon');
    title.prepend(icon);

    const content = document.createElement('pre');
    const controllerData = state.data[controller];
    const otherControllerData = otherState.data ? otherState.data[controller] : undefined;

    content.innerHTML = highlightDifferences(controllerData, otherControllerData, column);

    if (JSON.stringify(controllerData) !== JSON.stringify(otherControllerData)) {
      title.classList.add('updated'); // Highlight the title if there are differences
    }

    content.classList.add('controller-content', 'hidden');
    content.dataset.controller = controller;

    controllerDiv.appendChild(title);
    controllerDiv.appendChild(content);

    outputElement.appendChild(controllerDiv);
  });
}

function toggleController(controller) {
  const titles = document.querySelectorAll(`.controller-title[data-controller="${controller}"]`);
  const contents = document.querySelectorAll(`.controller-content[data-controller="${controller}"]`);

  contents.forEach(content => {
    content.classList.toggle('hidden');
  });

  titles.forEach(title => {
    const icon = title.querySelector('.toggle-icon');
    const content = document.querySelector(`.controller-content[data-controller="${controller}"]`);
    icon.textContent = content.classList.contains('hidden') ? '+' : '-';
  });
}

function highlightDifferences(obj1, obj2, column) {
  const diff = compareObjects(obj1, obj2, column);
  return formatDiff(diff);
}

function compareObjects(obj1, obj2, column) {
  const result = {};

  for (const key in obj1) {
    if (!(key in obj2)) {
      result[key] = { value: obj1[key], type: 'extra' };
    } else if (typeof obj1[key] === 'object' && obj1[key] !== null && typeof obj2[key] === 'object' && obj2[key] !== null) {
      const nestedDiff = compareObjects(obj1[key], obj2[key], column);
      result[key] = { value: nestedDiff, type: Object.keys(nestedDiff).some(k => nestedDiff[k].type !== 'equal') ? 'updated' : 'equal' };
    } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
      result[key] = { value: obj1[key], type: 'updated' };
    } else {
      result[key] = { value: obj1[key], type: 'equal' };
    }
  }

  if (column === 'A') {
    for (const key in obj2) {
      if (!(key in obj1)) {
        result[key] = { value: obj2[key], type: 'extra' };
      }
    }
  }

  return result;
}

function formatDiff(diff) {
  const formatted = [];

  for (const key in diff) {
    const value = diff[key].value;
    const type = diff[key].type;
    let formattedValue;

    if (typeof value === 'object' && value !== null) {
      formattedValue = Object.keys(value).length === 0 ? (Array.isArray(value) ? '[]' : '{}') : formatDiff(value);
    } else {
      formattedValue = JSON.stringify(value, null, 2);
    }

    formatted.push(`<div class="${type}">${key}: ${formattedValue}</div>`);
  }

  return formatted.join('');
}

function copyCommand(event) {
  const command = document.getElementById('exportCommand').textContent;
  navigator.clipboard.writeText(command).then(() => {
    showTooltip(event);
  }).catch(err => {
    console.error('Failed to copy command: ', err);
  });
}

function showTooltip(event) {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = 'Copied';
  document.body.appendChild(tooltip);

  const rect = event.target.getBoundingClientRect();
  tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
  tooltip.style.top = `${rect.top + window.scrollY - rect.height}px`;

  setTimeout(() => {
    tooltip.remove();
  }, 1000);
}