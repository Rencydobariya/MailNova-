function makeDraggable(element) {

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    element.addEventListener("mousedown", (e) => {
        isDragging = true;

        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;

        element.style.transition = "none";

        e.preventDefault();

    });
    document.addEventListener("mousemove", (e) => {

        if (!isDragging) return;

        let left = e.clientX - offsetX;
        let top = e.clientY - offsetY;
        const maxLeft = window.innerWidth - element.offsetWidth;
        const maxTop = window.innerHeight - element.offsetHeight;

        if (left < 0) left = 0;
        if (top < 0) top = 0;

        if (left > maxLeft) left = maxLeft;
        if (top > maxTop) top = maxTop;

        element.style.left = left + "px";
        element.style.top = top + "px";

        element.style.right = "auto";
        element.style.bottom = "auto";

    });
    document.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        element.style.transition = ".25s";
        localStorage.setItem(
            "mailnova-position",
            JSON.stringify({
                left: element.style.left,
                top: element.style.top
            })
        );

    });

}