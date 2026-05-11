import "./ui/style.css";
import {
  erLoglegurFlokkur,
  gjaldFyrirFlokk,
  gjaldFyrirThyngd,
} from "./funcs/gjaldskra";
import {
  Manudur,
  formatNumber,
  formatCurrency,
  dagsetningIDag,
} from "./funcs/manudur";
import {
  vistaSogu,
  lesaSogu,
  hreinsaSoguStorage,
} from "./storage/localStorage";

function $<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id) as T | null;
  if (!el) {
    throw new Error(`Element with id "${id}" not found`);
  }
  return el;
}

// --- DOM Elements ---
const flokkurInput = $<HTMLInputElement>("flokkurInput");
const thyngdInput = $<HTMLInputElement>("thyngdInput");
const upphafsInput = $<HTMLInputElement>("upphafsInput");
const lokKmInput = $<HTMLInputElement>("lokKmInput");

const manKmOutput = $<HTMLOutputElement>("manKmOutput");
const heildKmOutput = $<HTMLOutputElement>("heildKmOutput");
const fjoldiManadaOutput = $<HTMLOutputElement>("fjoldiManadaOutput");
const gjaldPerKmOutput = $<HTMLOutputElement>("gjaldPerKmOutput");

const skraBtn = $<HTMLButtonElement>("skraBtn");
const hreinsaBtn = $<HTMLButtonElement>("hreinsaBtn");
const eydaBtn = $<HTMLButtonElement>("eydaBtn");
const hreinsaSoguBtn = $<HTMLButtonElement>("hreinsaSoguBtn");

const soguListi = $<HTMLUListElement>("soguListi");

// ---
let manadurSaga: Manudur[] = lesaSogu();
let validId: string | null = null;

// --- Error ---
function villa(skilabod: string): void {
  alert(skilabod);
}

// --- Reiknivel logics ---
interface Results {
  heildKm: number;
  heildGjald: number;
  fjoldiManada: number;
}

function CalculateResults(): Results {
  let heildKm = 0;
  let heildGjald = 0;
  for (const m of manadurSaga) {
    heildKm += m.eknirKm;
    heildGjald += m.gjald;
  }
  return {
    heildKm,
    heildGjald,
    fjoldiManada: manadurSaga.length,
  };
}

// --- UI logics ---
function updateUI(): void {
  const { heildKm, heildGjald, fjoldiManada } = CalculateResults();
  fjoldiManadaOutput.value = fjoldiManada.toString();
  heildKmOutput.textContent = `${formatNumber(heildKm)} km / ${formatCurrency(heildGjald)}`;

  if (heildKm > 0) {
    gjaldPerKmOutput.textContent = formatCurrency(heildGjald / heildKm);
  } else {
    gjaldPerKmOutput.textContent = formatCurrency(0);
  }
}

function renderSogu(): void {
  soguListi.innerHTML = "";

  if (manadurSaga.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.textContent = "Engar færslur skráðar";
    soguListi.appendChild(li);
    return;
  }

  for (const m of manadurSaga) {
    const li = document.createElement("li");
    li.dataset.id = m.id;

    if (m.id === validId) {
      li.classList.add("selected");
    }

    const flokkurTexti =
      m.flokkur === "C" ? `C (${formatNumber(m.thyngd)} kg)` : m.flokkur;

    const dateRow = document.createElement("div");
    dateRow.className = "entry-date";
    dateRow.textContent = `${m.dagsetning} · ${flokkurTexti}`;

    const detailRow = document.createElement("div");
    detailRow.className = "entry-detail";
    detailRow.textContent = `${formatNumber(m.upphaf)} → ${formatNumber(m.lokKm)} (${formatNumber(m.eknirKm)} km)`;

    const amountRow = document.createElement("div");
    amountRow.className = "entry-amount";
    amountRow.textContent = formatCurrency(m.gjald);

    li.appendChild(dateRow);
    li.appendChild(detailRow);
    li.appendChild(amountRow);

    li.addEventListener("click", () => {
      validId = validId === m.id ? null : m.id;
      renderSogu();
    });

    soguListi.appendChild(li);
  }
}

// -- Event listeners
flokkurInput.addEventListener("input", () => {
  const flokkur = flokkurInput.value.trim().toUpperCase();
  if (flokkur === "C") {
    thyngdInput.disabled = false;
    thyngdInput.required = true;
    thyngdInput.placeholder = "t.d. 3500+ kg";
  } else {
    thyngdInput.disabled = true;
    thyngdInput.value = "";
    thyngdInput.placeholder = "Aðeins fyrir C-flokk";
  }
});

function onSkra(): void {
  const flokkurRaw = flokkurInput.value.trim().toUpperCase();
  const upphaf = parseInt(upphafsInput.value.trim(), 10);
  const lokKm = parseInt(lokKmInput.value.trim(), 10);

  if (!erLoglegurFlokkur(flokkurRaw)) {
    villa("Vinsamlegast veldu gilt flokk (A, B eða C)");
    return;
  }

  const flokkur = flokkurRaw;

  if (Number.isNaN(upphaf) || Number.isNaN(lokKm)) {
    villa("Vinsamlegast sláðu inn gilt upphafs- og lokakílómetra");
    return;
  }

	if (upphaf < 0 || lokKm < 0) {
		villa("Kílómetrar geta ekki verið neikvæðir");
		return;
	}

	if (lokKm < upphaf) {
		villa("Lokakílómetrar geta ekki verið minni en upphafskílómetrar");
		return;
	}

	if (lokKm === upphaf) {
		villa("Lokakílómetrar geta ekki verið jafnir upphafskílómetrum");
		return;
	}

	let gjaldPerKm: number;
	let thyngd = 0;
	if (flokkur === "C") {
		const thyngdRaw = thyngdInput.value.trim();
		if (thyngdRaw === "") {
			villa("Sláðu inn þyngd fyrir C-flokk bíla");
			return;
		}
		thyngd = parseInt(thyngdRaw, 10);
		if (Number.isNaN(thyngd)) {
			villa(("Ógild þyngd - sláðu inn tölu í kg"));
			return;
		}
		if (thyngd <= 3500) {
			villa("Þyngd fyrir C-flokk bíla verður að vera yfir 3500 kg");
			return;
		}
		if (thyngd > 10000) {
			villa("Þyng er utan taxtans (hámark 10.000kg)");
			return;
		}
		gjaldPerKm = gjaldFyrirThyngd(thyngd);
	} else {
		gjaldPerKm = gjaldFyrirFlokk(flokkur);
	}

	const ny = new Manudur(dagsetningIDag(), flokkur, thyngd, upphaf, lokKm, gjaldPerKm);
	manadurSaga.unshift(ny);

	vistaSogu(manadurSaga);

	const manKm = lokKm - upphaf;
	const manGjald = manKm * gjaldPerKm;
	manKmOutput.textContent = `${formatNumber(manKm)} km / ${formatCurrency(manGjald)}`;

	updateUI();
	renderSogu();

	flokkurInput.value = "";
	thyngdInput.value = "";
	thyngdInput.disabled = true;
	thyngdInput.placeholder = "Aðeins fyrir C-flokk";
	upphafsInput.value = "0";
	lokKmInput.value = "0";

	flokkurInput.focus();
}

function onHreinsa(): void {
	flokkurInput.value = "";
	thyngdInput.value = "";
	thyngdInput.disabled = true;
	thyngdInput.placeholder = "Aðeins fyrir C-flokk";
	upphafsInput.value = "0";
	lokKmInput.value = "0";
	manKmOutput.textContent = `0 km / ${formatCurrency(0)}`;
	flokkurInput.focus();

}

function onEyda(): void {
	if (validId === null) {
		villa("Vinsamlegast veldu færslu til að eyða");
		return;
	}
	manadurSaga = manadurSaga.filter((m) => m.id !== validId);
	vistaSogu(manadurSaga);
	updateUI();
	renderSogu();
	manKmOutput.textContent = `0 km / ${formatCurrency(0)}`;
}

function onHreinsaSogu(): void {
	if (manadurSaga.length === 0) return;
	if (confirm("Ertu viss um að þú viljir hreinsa alla söguna? Það er ekki hægt að afturkalla.")) {
		manadurSaga = [];
		validId = null;
		hreinsaSoguStorage();
		updateUI();
		renderSogu();
		manKmOutput.textContent = `0 km / ${formatCurrency(0)}`;
	}
}

skraBtn.addEventListener("click", onSkra);
hreinsaBtn.addEventListener("click", onHreinsa);
eydaBtn.addEventListener("click", onEyda);
hreinsaSoguBtn.addEventListener("click", onHreinsaSogu);

[flokkurInput, thyngdInput, upphafsInput, lokKmInput].forEach((input) => {
	input.addEventListener("keydown", (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			onSkra();
		}
	});
});

// --- Initial render ---
updateUI();
renderSogu();
