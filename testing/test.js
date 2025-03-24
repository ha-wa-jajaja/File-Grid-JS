import { FileGrid } from "../dist/index.mjs";

const allIds = Array.from({ length: 100 }, (_, i) => i + 1);

const container = document.querySelector(".file-grid__container");
allIds.forEach((id) => {
    const file = document.createElement("div");
    file.classList.add("file-grid__item");
    file.draggable = true;
    file.innerHTML = `
        <div class="file__thumbnail" >
            <img src="https://placehold.co/400x400?text=File+${id}" alt="File ${id}">
        </div>
    `;
    container.appendChild(file);
});

let disableUpload = false;
document.addEventListener("DOMContentLoaded", () => {
    const fileGrid = new FileGrid(".file-grid", {
        allIds,
        droppedFilesEvent: (files, folders) => {
            console.log(files, folders);
        },
    });

    const btn = document.querySelector(".logger");
    btn.addEventListener("click", () => {
        console.log(fileGrid.selectedIds);
    });

    const btn2 = document.querySelector(".logger2");
    btn2.addEventListener("click", () => {
        console.log("should be toggling to", disableUpload);

        disableUpload = !disableUpload;

        fileGrid.disableUpload(disableUpload);

        console.log(fileGrid);
    });
});
