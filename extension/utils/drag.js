function makeDraggable(element) {

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    element.addEventListener("mousedown", (e) => {

        isDragging = true;

        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;

        element.style.transition = "none";
    });

    document.addEventListener("mousemove", (e) => {

        if (!isDragging) return;

        element.style.left = (e.clientX - offsetX) + "px";
        element.style.top = (e.clientY - offsetY) + "px";

        element.style.right = "auto";
        element.style.bottom = "auto";
    });

    document.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;

        element.style.transition = ".25s";

          
    });

}