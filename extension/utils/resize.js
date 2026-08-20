

function enableWorkspaceResize(workspace){

    const resizer = workspace.querySelector("#mailnova-resizer");

    let resizing = false;

    resizer.addEventListener("mousedown",(e)=>{

        resizing = true;

        e.preventDefault();

    });

    document.addEventListener("mousemove",(e)=>{

        if(!resizing) return;

        let width = window.innerWidth - e.clientX;

        if(width < 100){

            width = 100;

        }

        if(width > 1300){

            width = 1300;

        }

        workspace.style.width = width + "px";

    });

    document.addEventListener("mouseup",()=>{

        resizing = false;

    });

}
function increaseWidth() {

    if (!workspace) return;


    const currentWidth =
        workspace.offsetWidth;


    if (currentWidth >= 1300) {
        return;
    }


    workspace.style.width =
        Math.min(
            currentWidth + 40,
            1300
        ) + "px";

}



function decreaseWidth() {

    if (!workspace) return;


    const currentWidth =
        workspace.offsetWidth;


    if (currentWidth <= 300) {
        return;
    }


    workspace.style.width =
        Math.max(
            currentWidth - 40,
            300
        ) + "px";

}