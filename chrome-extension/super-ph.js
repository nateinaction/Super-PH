/*
 * Name: Super PH
 * Developer: Nate Gay (rngay@ncsu.edu)
 *
 * Version: Beta 1
 *
 * TODO:
 * 1. More notes?
 * 2. previous selections?
 *
 */

// global vars
creeper = {};

// found answer here:
// stackoverflow.com/questions/2844565/is-there-a-jquery-dom-change-listener
var observer = new MutationObserver(function(mutations, observer) {
	var str = '';
	// fired when a mutation occurs
	mutations.forEach(function(mutation) {
		if (mutation.type === 'childList') {
			if (mutation.addedNodes.length > 0) {
				// when searching a student, copy info to creeper obj
				if (mutation.target.id === 'win0divPAGECONTAINER') {
					str = mutation.addedNodes[0].innerHTML;
					if (str.includes('NC_HIS_24HR_VW_NC_NAME_PRI')) {
						creeper.studentName = $(str).find('#NC_HIS_24HR_VW_NC_NAME_PRI')[0].textContent;
					};
					if (str.includes('NC_HIS_24HR_VW_EMPLID')) {
						creeper.studentID = $(str).find('#NC_HIS_24HR_VW_EMPLID')[0].textContent;
					};
					if (str.includes('NC_HIS_24HR_VW_EMAIL_ADDR')) {
						creeper.studentEmail = $(str).find('#NC_HIS_24HR_VW_EMAIL_ADDR')[0].textContent;
					};
					if (str.includes('NC_HIS_24HR_VW_BUILDING')) {
						creeper.studentBuilding = $(str).find('#NC_HIS_24HR_VW_BUILDING\\$0')[0].textContent;
					};
					if (str.includes('NC_HIS_24HR_VW_NC_HIS_UNIT_NUM')) {
						creeper.studentSuite = $(str).find('#NC_HIS_24HR_VW_NC_HIS_UNIT_NUM\\$0')[0].textContent;
					};
					if (str.includes('NC_HIS_24HR_VW_NC_HIS_UNIT_BED')) {
						creeper.studentBed = $(str).find('#NC_HIS_24HR_VW_NC_HIS_UNIT_BED\\$0')[0].textContent;
					};
					chrome.storage.local.set({'creeper': creeper});

					console.log(creeper);
				};
				// when user clicks forward or backward in living history, update creeper obj
				if (mutation.target.id === 'win0div$ICField2$0' || mutation.target.id === 'win0divPSPAGECONTAINER') {
					str = mutation.addedNodes[0].innerHTML;
					if (str.includes('NC_HIS_24HR_VW_BUILDING')) {
						creeper.studentBuilding = $(str).find('#NC_HIS_24HR_VW_BUILDING\\$0')[0].textContent;
					};
					if (str.includes('NC_HIS_24HR_VW_NC_HIS_UNIT_NUM')) {
						creeper.studentSuite = $(str).find('#NC_HIS_24HR_VW_NC_HIS_UNIT_NUM\\$0')[0].textContent;
					};
					if (str.includes('NC_HIS_24HR_VW_NC_HIS_UNIT_BED')) {
						creeper.studentBed = $(str).find('#NC_HIS_24HR_VW_NC_HIS_UNIT_BED\\$0')[0].textContent;
					};
					chrome.storage.local.set({'creeper': creeper});

					//console.log(creeper);
				};
				// this shows all html nodes added to page
				//console.log(mutation);
			};
		};
	});
});
observer.observe( document, {
	subtree: true,
	childList: true
});


// for every update to creeper object, update chrome var
// for every chrome var update... hmmm no... when button is clicked get chrome var and fill in blanks

if ($('h1').text() == "Enter New Package") {
	$('#table_new_package > tbody > tr:nth-child(7) > td > h2').append('<button type="button" style="margin-left:15px;" id="super-ph-button">Super PH</button>');
	$('#hub > [value="Gray Hall Service Desk"]').prop('selected', true);
	$('#table_new_package > tbody > tr:nth-child(5)').after('<tr id="location-selector"></tr>');
	$('#location-selector').append('<td>Storage Location</td><td id="location-radio"></td>');
	$('#location-radio').append('<input type="radio" name="storage-location" value="spc">Small Package Cabinet');
	$('#location-radio').append('<br><input type="radio" name="storage-location" value="cab" checked>Cabinet');
	$('#location-radio').append('<br><input type="radio" name="storage-location" value="back">Back');
	$('#location-radio').append('<br><input type="radio" name="storage-location" value="other">Other <input type="text" name="other-location" id="other-location">');
};

// Enter New Package 'Super PH' button
$('body').on('click', '#super-ph-button', function () {
	//console.log('click');
	chrome.storage.local.get(null, function(obj) {
		creeper = obj.creeper;
		//console.log(obj.creeper);
		$('#last').val(creeper.studentName.split(',')[0]);
		$('#first').val(creeper.studentName.split(',')[1]);
		switch (creeper.studentBuilding) {
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
		$('#room').val(creeper.studentSuite + creeper.studentBed);
		$('#email').val(creeper.studentEmail);
	});
});

// on form submission this puts location in notes field
$('form#new_package').submit(function (evt) {
	var notes = $('#notes').val(),
		charLastName = $('#last').val().charAt(0),
		storageLocation = $('input[name="storage-location"]:checked').val(),
		otherLocation = $('#other-location').val();
	switch (storageLocation) {
	case 'spc':
		$('#notes').val('Small Package Cabinet, ' + notes);
		break;
	case 'cab':
		$('#notes').val(charLastName + ' Cabinet, ' + notes);
		break;
	case 'back':
		$('#notes').val('Back, ' + notes);
		break;
	case 'other':
		$('#notes').val(otherLocation + ', ' + notes);
		break;
	};
});
