// src/main.ts

// --- DOM ---
const inp = document.getElementById("inp") as HTMLInputElement | null;
const add = document.getElementById("add") as HTMLButtonElement | null;
const list = document.getElementById("list") as HTMLUListElement | null;

if (!inp || !add || !list) {
    throw new Error("Missing #inp, #add or #list in HTML");
}

// --- State ---
let counter: number = 0;
let map: Map<number, string> = new Map<number, string>([]);

import { deserializeMap, serializeMap } from "./storage";

// --- Helpers ---
function saveMap(m: Map<number, string>): void {
    localStorage.setItem("map", serializeMap(m));
}

// --- Bootstrap ---
window.addEventListener("load", () => {
    const b = localStorage.getItem("counter");
    if (b) {
        const n = Number(b);
        if (!Number.isNaN(n)) counter = n;
    }

    map = deserializeMap(localStorage.getItem("map"));

    renderMap(map);
});

// --- Handlers ---
add.addEventListener("click", () => {
    const v = inp.value.trim();
    if (!v) return;

    map.set(counter, v);
    saveMap(map);

    counter += 1;
    localStorage.setItem("counter", String(counter));

    renderMap(map);

    inp.value = "";
    inp.focus();
});

// --- Functions (сохранены имена и сигнатуры) ---
function renderMap(m: Map<number, string>): void {
    list!.innerHTML = "";
    m.forEach((item, id) => {
        list!.appendChild(createItem(id, item));
    });
}

function createItem(id: number, text: string): HTMLLIElement {
    const li = document.createElement("li");
    li.id = String(id);

    const span = document.createElement("span");
    span.textContent = text;
    span.className = "text";
    span.addEventListener("click", () => span.classList.toggle("done"));

    const del = document.createElement("button");
    del.textContent = "x";
    del.className = "del";
    del.addEventListener("click", () => {
        li.remove();
        map.delete(id);
        saveMap(map);
    });

    li.appendChild(span);
    li.appendChild(del);
    return li;
}
