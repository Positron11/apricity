Array.from(document.querySelectorAll(".jPatternMatchRequired")).forEach(function(element) { element.disabled = true; });

Array.from(document.querySelectorAll(".jPatternInput")).forEach(function(element) {
	element.addEventListener("input", function() { 
		document.getElementById(element.dataset.for).disabled = !(element.value === element.pattern); 
	});
});

document.addEventListener("submit", function(e) {
	e.target.submit(function() { return false; })
	e.target.querySelector("button[type='submit']").disabled = true; 
	e.target.querySelector("button[type='submit']").classList.add("sLoading"); 
}, true);