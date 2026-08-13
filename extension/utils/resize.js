

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

        if(width > 1000){

            width = 1000;

        }

        workspace.style.width = width + "px";

    });

    document.addEventListener("mouseup",()=>{

        resizing = false;

    });

}