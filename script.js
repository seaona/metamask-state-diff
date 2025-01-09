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
    
    // Always use the current state's data for display
    const controllerData = state.data[controller];
    const otherControllerData = otherState.data ? otherState.data[controller] : undefined;

    // Pass the states in the correct order for comparison
    content.innerHTML = highlightDifferences(
      controllerData,  // current state's data
      otherControllerData,  // other state's data for comparison
      column
    );

    if (JSON.stringify(controllerData) !== JSON.stringify(otherControllerData)) {
      title.classList.add('updated');
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
  if (!obj1 || !obj2) {
    return JSON.stringify(column === 'B' ? obj2 : obj1, null, 2);
  }
  const diff = compareObjects(obj1, obj2, column);
  return formatDiff(diff);
}

function compareObjects(obj1, obj2, column) {
  const result = {};
  const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

  for (const key of allKeys) {
    const val1 = obj1?.[key];
    const val2 = obj2?.[key];
    
    // Always use the first parameter's value (obj1)
    const currentValue = val1;
    
    // Key exists in both objects
    if (key in (obj1 || {}) && key in (obj2 || {})) {
      if (typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null) {
        // For arrays, handle them directly
        if (Array.isArray(val1) || Array.isArray(val2)) {
          if (JSON.stringify(val1) !== JSON.stringify(val2)) {
            result[key] = {
              value: currentValue,
              type: 'updated'
            };
          } else {
            result[key] = {
              value: currentValue,
              type: 'equal'
            };
          }
        } else {
          // For objects, recurse
          const nestedDiff = compareObjects(val1, val2, column);
          if (Object.keys(nestedDiff).length > 0) {
            result[key] = { value: nestedDiff, type: 'nested' };
          } else {
            result[key] = { value: currentValue, type: 'equal' };
          }
        }
      } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        result[key] = {
          value: currentValue,
          type: 'updated'
        };
      } else {
        result[key] = {
          value: currentValue,
          type: 'equal'
        };
      }
    }
    // Key only in current object
    else if (key in (obj1 || {})) {
      result[key] = { value: val1, type: 'updated' };
    }
  }

  return result;
}

function formatDiff(diff) {
  const formatted = [];

  for (const key in diff) {
    const { value, type, oldValue } = diff[key];
    let formattedValue;

    if (value === null) {
      formattedValue = 'null';
    } else if (typeof value === 'object' && type === 'nested') {
      formattedValue = formatDiff(value);
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        formattedValue = `[${value.map(v => JSON.stringify(v)).join(', ')}]`;
      } else if (Object.keys(value).length === 0) {
        formattedValue = '{}';
      } else {
        formattedValue = JSON.stringify(value, null, 2);
      }
    } else {
      formattedValue = JSON.stringify(value);
    }

    const className = type === 'updated' ? 'updated' : type === 'equal' ? 'equal' : '';
    formatted.push(`<div class="${className}">${key}: ${formattedValue}</div>`);
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

function clearInput(inputId) {
    document.getElementById(inputId).value = '';
}

function clearAll() {
    document.getElementById('input1').value = '';
    document.getElementById('input2').value = '';
    document.getElementById('diffOutput1').innerHTML = '';
    document.getElementById('diffOutput2').innerHTML = '';
}