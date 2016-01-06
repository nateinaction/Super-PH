/*
 * Name: Super PH
 * Developer: Nate Gay (rngay@ncsu.edu)
 * URL: github.com/nateinaction/Super-PH
 *
 * TODO:
 * !! 1. count packages logged
 * 2. clean and organize code
 *
 */

function initializeSuperPH() {
	var regex = new RegExp('https://cs9prd.acs.ncsu.edu/');
	if (window.location.href === 'https://housing.ncsu.edu/apps/packtrack/new.php') {
		setupPacktrackHTML();
		chromeGetValue();
		chromeWatchForChange();
		packtrackOtherLocation();
		packtrackSubmit()
		displaySortCountHMTL();
	} else if (window.location.href === 'https://housing.ncsu.edu/apps/packtrack/done.php') {
		setupDeliveryHTML();
	} else if (window.location.href.match(regex) !== null) {
		mypackMutationObserver();
	};
};
initializeSuperPH();

// Watch all html mutations on MyPack 24-hour Desk Log search page, grab student info and store in chrome creeper object
// find out more here: stackoverflow.com/questions/2844565/is-there-a-jquery-dom-change-listener
function mypackMutationObserver() {
	var str = '',
		observer = new MutationObserver(function(mutations, observer) {
		// fired when a mutation occurs
		mutations.forEach(function(mutation) {
			if (mutation.type === 'childList') {
				if (mutation.addedNodes.length > 0) {
					// when searching a student, copy info to creeper obj
					if (mutation.target.id === 'win0divPAGECONTAINER') {
						filterMutationObject(mutation);
					};
					// when user clicks forward or backward in living history, update creeper obj
					if (mutation.target.id === 'win0div$ICField2$0' || mutation.target.id === 'win0divPSPAGECONTAINER') {
						filterMutationObject(mutation);
					};
					// this shows all html nodes added to page
					//console.log(mutation);
				};
			};
		});
	});
	observer.observe(document, {
		subtree: true,
		childList: true
	});
};

function filterMutationObject(mutation) {
	var creeper = {},
		str = '';

	chrome.storage.local.get('creeper', function(obj) {
		if (obj['creeper']) {
			creeper = obj['creeper'];
		};
		str = mutation.addedNodes[0].innerHTML;
		if (str.includes('NC_HIS_24HR_VW_NC_NAME_PRI')) {
			creeper['name'] = $(str).find('#NC_HIS_24HR_VW_NC_NAME_PRI')[0].textContent;
			creeper['last'] = creeper['name'].split(',')[0];
			creeper['first'] = creeper['name'].split(',')[1];
		};
		if (str.includes('NC_HIS_24HR_VW_EMPLID')) {
			creeper['id'] = $(str).find('#NC_HIS_24HR_VW_EMPLID')[0].textContent;
		};
		if (str.includes('NC_HIS_24HR_VW_EMAIL_ADDR')) {
			creeper['email'] = $(str).find('#NC_HIS_24HR_VW_EMAIL_ADDR')[0].textContent;
		};
		if (str.includes('NC_HIS_24HR_VW_NC_ADDRESS1_LOCL')) {
			creeper['unit'] = $(str).find('#NC_HIS_24HR_VW_NC_ADDRESS1_LOCL')[0].textContent;
			creeper['unitNumber'] = creeper['unit'].split(' ')[1];
		};
		if (str.includes('NC_HIS_24HR_VW_BUILDING')) {
			creeper['building'] = $(str).find('#NC_HIS_24HR_VW_BUILDING\\$0')[0].textContent;
		};
		if (str.includes('NC_HIS_24HR_VW_NC_HIS_UNIT_NUM')) {
			creeper['suite'] = $(str).find('#NC_HIS_24HR_VW_NC_HIS_UNIT_NUM\\$0')[0].textContent;
		};
		if (str.includes('NC_HIS_24HR_VW_NC_HIS_UNIT_BED')) {
			creeper['bed'] = $(str).find('#NC_HIS_24HR_VW_NC_HIS_UNIT_BED\\$0')[0].textContent;
		};

		chrome.storage.local.set({'creeper': creeper});
	});
};

// select Gray Hall as hub, add location selection radio buttons, add 'Super PH' button
//#table_new_package > tbody > tr:nth-child(1) > td > h2
function setupPacktrackHTML() {
	$('head').append('<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL('css/super-ph.css') + '">');
	$('#hub > [value="Gray Hall Service Desk"]').prop('selected', true);
	$('#table_new_package').before('<div id="super-ph"><h2>Super PH</h2></div>');
	$('#table_new_package > tbody > tr:nth-child(5)').after('<tr id="location-selector"></tr>');
	$('#location-selector').append('<td>Storage Location</td><td id="location-radio"></td>');
	$('#location-radio').append('<input type="radio" name="storage-location" value="spc">Small Package Cabinet');
	$('#location-radio').append('<br><input type="radio" name="storage-location" value="cab" checked>Cabinet');
	$('#location-radio').append('<br><input type="radio" name="storage-location" value="back">Back');
	$('#location-radio').append('<br><input type="radio" name="storage-location" id="other-location-radio" value="other">Other <input type="text" name="other-location" id="other-location">');
};

function setupDeliveryHTML() {
	var packageID = $('body > p:nth-child(10) > strong:nth-child(1)').text(),
		today = getToday();

	$('head').append('<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL('css/super-ph.css') + '">');
	$('body > h1').after('<div id="super-ph"><h3>Super PH</h3></div>');
	$('#super-ph').append('<p class="large">Package ID: <span id="package-id">' + packageID + '</span></p>');
	$('#super-ph').append('<p class="large">Last Name: <span id="last-name"></span></p>');
	$('#super-ph').append('<p class="large">First Name: <span id="first-name"></span></p>');
	$('#super-ph').append('<p class="large">Student ID: <span id="student-id"></span></p>');
	$('#super-ph').append('<p class="large">Unit #: <span id="unit-number"></span></p>');
	$('#super-ph').append('<p class="large">Date: <span id="date">' + today + '</span></p>');
	$('#super-ph').append('<p class="large">Location: <span id="location"></span></p>');
	$('#super-ph').append('<p class="large">Tracking #: <span id="tracking-number"></span></p>');
	$('#super-ph').append('<p class="large">Carrier: <span id="carrier"></span></p>');

	displaySortCountHMTL();

	chrome.storage.local.get('deliveryInfo', function(obj) {
		if (obj['deliveryInfo']) {
			var deliveryInfo = obj['deliveryInfo'],
				trackingNumberHTML = colorize(deliveryInfo['trackingNumber']);
			$('#tracking-number').html(trackingNumberHTML);
			$('#location').text(deliveryInfo['storageLocation']);
			$('#carrier').text(deliveryInfo['carrier']);
		} else {
			console.log('deliveryInfo object does not exist');
		};
	});

	chrome.storage.local.get('creeper', function(obj) {
		if (obj['creeper']) {
			var creeper = obj['creeper'];

			$('#last-name').text(creeper['last']);
			$('#first-name').text(creeper['first']);
			$('#student-id').text(creeper['id']);
			$('#unit-number').text(creeper['unitNumber']);
		} else {
			console.log('creeper object does not exist');
		};
	});
};

function chromeGetValue() {
	chrome.storage.local.get('creeper', function(obj) {
		if (obj['creeper']) {
			var creeper = obj['creeper'];
			packtrackModifyForm(creeper);
		} else {
			console.log('creeper object does not exist');
		};
	});
};

function chromeWatchForChange() {
	chrome.storage.onChanged.addListener(function(changes, namespace) {
		for (key in changes) {
			if (key === 'creeper') {
				var creeper = changes[key].newValue;
				packtrackModifyForm(creeper);
			};
		};
	});
};

// on form submission this puts location in notes field
function packtrackSubmit() {
	$('form#new_package').submit(function (evt) {
		var notes = $('#notes').val(),
			charLastName = $('#last').val().charAt(0),
			storageLocation = $('input[name="storage-location"]:checked').val(),
			otherLocation = $('#other-location').val(),
			trackingNumber = $('#trackingNumber').val(),
			carrier = $('#carrier').val();

		// if notes are not blank preceed them with a comma and a space
		if (notes) {
			notes = ', ' + notes;
		};

		// place storage location at the beginning of notes field
		switch (storageLocation) {
		case 'spc':
			storageLocation = 'Small Package Cabinet';
			break;
		case 'cab':
			storageLocation = charLastName + ' Cabinet';
			break;
		case 'back':
			storageLocation = 'Back';
			break;
		case 'other':
			storageLocation = otherLocation;
			break;
		};
		$('#notes').val(storageLocation + notes);

		addToSortCount();
		chrome.storage.local.set({'deliveryInfo': {'trackingNumber': trackingNumber, 'storageLocation': storageLocation, 'carrier': carrier}});
	});
};

function packtrackModifyForm(creeper) {
	$('#last').val(creeper['last']);
	$('#first').val(creeper['first']);
	switch (creeper['building']) {
	case 'Wolf Vlg A':
		$('#building > [value="Wolf Vlg A"]').prop('selected', true);
		break;
	case 'Wolf Vlg B':
		$('#building > [value="Wolf Vlg B"]').prop('selected', true);
		break;
	case 'Wolf Vlg C':
		$('#building > [value="Wolf Vlg C"]').prop('selected', true);
		break;
	case 'Wolf Vlg D':
		$('#building > [value="Wolf Vlg D"]').prop('selected', true);
		break;
	case 'Wolf Vlg E':
		$('#building > [value="Wolf Vlg E"]').prop('selected', true);
		break;
	case 'Wolf Vlg F':
		$('#building > [value="Wolf Vlg F"]').prop('selected', true);
		break;
	case 'Wolf Vlg G':
		$('#building > [value="Wolf Vlg G"]').prop('selected', true);
		break;
	case 'Wolf Vlg H':
		$('#building > [value="Wolf Vlg H"]').prop('selected', true);
		break;
	};
	$('#room').val(creeper['suite'] + creeper['bed']);
	$('#email').val(creeper['email']);
};

// When "other location" textbox is selected, update radio button to match
function packtrackOtherLocation() {
	$('body').on('click', '#other-location', function () {
		$("#other-location-radio").prop("checked", true);
	});
};

function colorize(str) {
	var html = '';
	for (character in str) {
		if ($.isNumeric(str[character])) {
			html = html + '<span class="number">' + str[character] + '</span>';
		} else {
			html = html + '<span class="letter">' + str[character] + '</span>';
		};
	};
	return html;
};

function getToday() {
	var d = new Date(),
		month = d.getMonth() + 1,
		day = d.getDate(),
		year = d.getFullYear(),
		today = month + '-' + day + '-' + year;
	return today;
};

function addToSortCount() {
	var today = getToday(),
		countObj = {};

	countObj['sortCount'] = {};
	chrome.storage.local.get('sortCount', function(obj) {
		if (obj['sortCount']) {
			if (obj['sortCount'][today]) {
				countObj['sortCount'][today] = obj['sortCount'][today] + 1;
				console.log(countObj['sortCount'][today]);
			} else {
				countObj['sortCount'][today] = 1;
			};
		} else {
			countObj['sortCount'][today] = 1;
		};
		chrome.storage.local.set(countObj);
	});
};

function displaySortCountHMTL() {
	var today = getToday(),
		count = 0;

	chrome.storage.local.get('sortCount', function(obj) {
		if (obj['sortCount']) {
			if (obj['sortCount'][today]) {
				count = obj['sortCount'][today];
				if (count < 1 || count > 1) {
					$('#super-ph').append('<p>You have delivered <span id="sort-count">' + count + '</span> packages today.</p>');
				} else {
					$('#super-ph').append('<p>You have delivered <span id="sort-count">1</span> package today.</p>');
				};
			} else {
				$('#super-ph').append('<p>You have delivered <span id="sort-count">0</span> packages today.</p>');
			};
		} else {
			$('#super-ph').append('<p>You have delivered <span id="sort-count">0</span> packages today.</p>');
		};
	});
};
