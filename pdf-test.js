test = function () {
	var doc = new jsPDF('p', 'pt'),
		columns = ["Package ID", "Last Name", "First Name", "Student ID", "Unit Number", "Date Logged", "PH-Initials", "Tracking Number", "Carrier", "Storage Location/Notes", "Signature", "Date Delivered", "Deliverer Initials"],
		rows = [["32222", "Knapp-Smith", "Danielle", "000000000", "#29384", "12/25/15", "DLKS", "X0937324027372034BB", "UPS", "K cabinet, please tell resident to use full name", " ", " ", " "]];

// row span for multi row in single package ID
// col span for space between entries

	doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFontStyle('bold');
    
    doc.autoTable(columns, rows);
	doc.save('table.pdf');
}