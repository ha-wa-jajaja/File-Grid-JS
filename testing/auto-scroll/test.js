import { AutoScrollSensor } from "../../dist/index.mjs";

// const scroller = document.querySelector(".custom-scroller");
const sensor = new AutoScrollSensor(window);
// sensor.doObserveMouseMove = true;

const drag = document.querySelector(".draggabale");

drag.addEventListener("dragstart", (e) => {
    sensor.doObserveMouseMove = true;
});

drag.addEventListener("dragend", (e) => {
    sensor.doObserveMouseMove = false;
});
