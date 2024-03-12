function toggleCommentForm(button, action) {
	const comment = button.closest(".Comment");
	const already_active = comment.classList.contains(`s${action}Mode`);
	
	resetComments();
	if (!already_active) { comment.classList.toggle(`s${action}Mode`); };

	const input = comment.querySelector(`.${action.toLowerCase()}Form textarea`);
	input.selectionStart = input.selectionEnd = input.value.length;
	autosize.update(input);
	input.focus();
}

function resetComments() {
	Array.from(document.getElementsByClassName("Comment")).forEach(element => {
		element.classList.remove("sReplyMode", "sEditMode");
	});
}