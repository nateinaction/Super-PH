/*
 * Name: Super PH
 * Developer: Nate Gay (rngay@ncsu.edu)
 * URL: github.com/nateinaction/Super-PH
 *
 * TODO:
 * 1. count packages logged
 * 2. get rid of Super PH button on Packtrack
 * 3. start to organize code
 *
 */

// global vars
packtrackLocation = '';

if (window.location.href === 'https://housing.ncsu.edu/apps/packtrack/new.php') {
	setupPacktrackHTML();
	chromeGetValue();
	chromeWatchForChange();
	packtrackOtherLocation();
} else {
	mypackMutationObserver();
};

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
	chrome.storage.local.get(null, function(obj) {
		var creeper = obj.creeper,
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
function setupPacktrackHTML() {
	if ($('h1').text() == "Enter New Package") {
		$('#hub > [value="Gray Hall Service Desk"]').prop('selected', true);
		$('#table_new_package > tbody > tr:nth-child(5)').after('<tr id="location-selector"></tr>');
		$('#location-selector').append('<td>Storage Location</td><td id="location-radio"></td>');
		$('#location-radio').append('<input type="radio" name="storage-location" value="spc">Small Package Cabinet');
		$('#location-radio').append('<br><input type="radio" name="storage-location" value="cab" checked>Cabinet');
		$('#location-radio').append('<br><input type="radio" name="storage-location" value="back">Back');
		$('#location-radio').append('<br><input type="radio" name="storage-location" id="other-location-radio" value="other">Other <input type="text" name="other-location" id="other-location">');
	};
};

function chromeGetValue() {
	chrome.storage.local.get(null, function(obj) {
		var creeper = obj.creeper;
		if (creeper !== null) {
			packtrackModifyForm(creeper);
		};
	});
};

function chromeWatchForChange() {
	chrome.storage.onChanged.addListener(function(changes, namespace) {
		for (key in changes) {
			var creeper = changes[key].newValue;
			packtrackModifyForm(creeper);
		};
	});
};

// on form submission this puts location in notes field
function packtrackSubmit() {
	$('form#new_package').submit(function (evt) {
		var notes = $('#notes').val(),
			charLastName = $('#last').val().charAt(0),
			storageLocation = $('input[name="storage-location"]:checked').val(),
			otherLocation = $('#other-location').val();

		// if notes are not blank preceed them with a comma and a space
		if (notes) {
			notes = ', ' + notes;
		};

		// place storage location at the beginning of notes field
		switch (storageLocation) {
		case 'spc':
			$('#notes').val('Small Package Cabinet' + notes);
			break;
		case 'cab':
			$('#notes').val(charLastName + ' Cabinet' + notes);
			break;
		case 'back':
			$('#notes').val('Back' + notes);
			break;
		case 'other':
			$('#notes').val(otherLocation + notes);
			break;
		};
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
