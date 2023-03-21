"use strict";

class Entry {
	constructor(name, tel, email) {
		this.name = name;
		this.tel = tel;
		this.email = email;
	}
}

const contactList = [];
const fontList = ["Verdana", "Tahoma", "Georgia", "Garamond", "Courier New"];
const fontSizeTranslation = ["70%", "100%", "130%"];
const colorList = ["white", "lightcoral", "lightgreen", "lightyellow", "lightseagreen", "lightblue", "lightslategrey"];
const arrayMaps = [x => x.name.toLowerCase(), x => x.tel, x => x.email.toLowerCase()];

window.onload = () => {
	for (const entry of [
		new Entry("Geirhild Giæver", "+47 59 02 32 34", "geirhild.g@online.no"),
		new Entry("Adriën Dijkstra", "+31 0512-148012", "neirda@dijkstra.nl"),
		new Entry("Snæfríður Þórisdóttir", "+354 139 2348", "sn.th@ruv.is"),
		new Entry("Jean-Jeaques Azaïs", "+33 01 80 71 19 44", "jjazais@free.fr"),
		new Entry("Antonio Hernández Muñoz", "+34 719 904 435", "hma@hotmail.es")
	]) addListEntry(entry, contactList);

	for (const font of fontList)
		document.getElementById("font-select").insertAdjacentHTML("beforeend",
			`<option>${font}</option>`);

	for (const color of colorList)
		document.getElementById("color-select").insertAdjacentHTML("beforeend",
			`<option>${color}</option>`);


	document.querySelector("button .fa-plus").parentElement.addEventListener("click", () => {
		document.getElementById("settings").style.display = "none";
		quitModifyMode();
		document.getElementById("add-entry").style.display = null; // event loop ensures this is fine
	});

	document.querySelector("#add-entry .fa-times").addEventListener("click", quitModifyMode);

	document.querySelector("button .fa-cog").parentElement.addEventListener("click", () => {
		document.getElementById("settings").style.display = null;
		quitModifyMode();
	});

	document.querySelector("#settings .fa-times").addEventListener("click", () =>
		document.getElementById("settings").style.display = "none");

	document.querySelector("#settings-button").addEventListener("click", () =>
		document.getElementById("custom-style").innerHTML = `
			.list-entry {
	    		background-color: ${document.querySelector("#color-select :checked").innerText};
	    		font-size: ${fontSizeTranslation[document.querySelector("input[name='size']:checked").value]};
	    	}
	    	.list-entry span, .list-entry a {
	    		font-family: "${document.querySelector("#font-select :checked").innerText}";
	    	}`);

	document.querySelector("#top-bar select").addEventListener("change", sortFunction); // split off because it will be used in add/modify
	
	// code for searching
	document.getElementById("search-input").addEventListener("input", evt => {
		const re = new RegExp(evt.target.value);
		for (const [id, {name, tel, email}] of contactList.entries()) {
			document.querySelector(`[data-entry-id='${id}']`).style.display =
				[name, tel, email].some(detail => re.test(detail)) ? null : "none";
		}
	});

	document.querySelector("#add-entry-button").addEventListener("click", () => {
		const newName = document.getElementById("add-entry-name").value.trim();
		const newTel = document.getElementById("add-entry-tel").value.trim();
		const newEmail = document.getElementById("add-entry-email").value.trim();	
		if (!newName) return alert("Empty name!"); // field checks, common for both add and modify
		if (!newTel && !newEmail) return alert("Fill in either telephone or email!");
		const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (newEmail && !re.test(newEmail)) return alert("Invalid email!");
		if (newTel && !/^[0-9\ +\-()]+$/.test(newTel)) return alert("Invalid telephone number!");

		if (!document.getElementById("add-entry").hasAttribute("data-modifying")) { // if not modifying
			addListEntry(new Entry(newName, newTel, newEmail), contactList);
		}
		else { // code for modifying
			const modifyingIndex = document.getElementById("add-entry").getAttribute("data-modifying");
			contactList[modifyingIndex].name = newName;
			contactList[modifyingIndex].tel = newTel;
			contactList[modifyingIndex].email = newEmail;
			document.querySelector(`[data-entry-id="${modifyingIndex}"] > div`).innerHTML = nameTelEmailHTML(contactList[modifyingIndex]);
			quitModifyMode();
		}
		sortFunction();
	});
}

function addListEntry(entry, cList) {
	const newEntryId = cList.length;
	cList.push(entry);
	document.getElementById("list-container").insertAdjacentHTML("beforeend", `
		<div class="list-entry" data-entry-id="${newEntryId}">
			<div>
				${nameTelEmailHTML(entry)}
			</div>
			<div>
				<i class="far fa-edit"></i>
				<i class="far fa-trash-alt"></i>
			</div>
		</div>`);
	document.querySelector(`[data-entry-id='${newEntryId}'] .fa-trash-alt`).addEventListener("click", evt => {
 		if (!confirm("Are you sure you want to delete this entry?")) return;
 		const parentEntry = evt.target.closest(".list-entry");
 		let deletedIndex = parentEntry.getAttribute("data-entry-id");
 		if (deletedIndex === document.getElementById("add-entry").getAttribute("data-modifying"))
 			quitModifyMode();
 		parentEntry.remove();
 		for (let j = parseInt(deletedIndex) + 1; j < contactList.length; j++)
 			document.querySelector(`[data-entry-id='${j}']`).setAttribute("data-entry-id", j - 1);
 		contactList.splice(deletedIndex, 1);
 	});
	document.querySelector(`[data-entry-id='${newEntryId}'] .fa-edit`).addEventListener("click", evt => {
			const currentEntryId = evt.target.closest(".list-entry").getAttribute("data-entry-id");
			// change add --> modify
			document.getElementById("add-entry-heading").innerText = "Modify entry";
			document.getElementById("add-entry-button").innerText = "Modify";
			document.getElementById("add-entry").style.display = null;
			document.getElementById("settings").style.display = "none";
			document.getElementById("add-entry").setAttribute("data-modifying", currentEntryId);
			document.getElementById("add-entry-name").value = contactList[currentEntryId].name;
			document.getElementById("add-entry-tel").value = contactList[currentEntryId].tel;
			document.getElementById("add-entry-email").value = contactList[currentEntryId].email;
	});
}

function nameTelEmailHTML({name, tel, email}) {
	return `
		<span class="entry-name">${name}</span>
		<span class="entry-telephone">${tel}</span>
		<a href="mailto:${email}" class="entry-email">${email}</a>
	`;
}

function quitModifyMode() {
	document.getElementById("add-entry-heading").innerText = "Add entry";
	document.getElementById("add-entry-button").innerText = "Add";
	document.getElementById("add-entry").removeAttribute("data-modifying");
	document.getElementById("add-entry-name").value = "";
	document.getElementById("add-entry-tel").value = "";
	document.getElementById("add-entry-email").value = "";
	document.getElementById("add-entry").style.display = "none";
}

function sortFunction() {
	if (isNaN(document.querySelector("#top-bar select :checked").value)) return; 
	const sortArray = Array.from(contactList.map(arrayMaps[document.querySelector("#top-bar select :checked").value]).entries());
	sortArray.sort((left, right) => left[1] < right[1] ? -1 : 1);
	const sortIndices = sortArray.map(x => x[0]);
	for (const [orderIdx, id] of sortIndices.entries())
		document.querySelector(`[data-entry-id='${id}']`).style.order = orderIdx;
}