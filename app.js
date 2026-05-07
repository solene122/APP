const CONFIG = { prenom: "Solène", meteoApiKey: "edbecc7598d9551509ce39e12d428b02" };

function getAmbiance(heure, meteo) {
const body = document.body;
body.className = "";
let moment;
if (heure >= 6 && heure < 12) moment = "matin";
else if (heure >= 12 && heure < 19) moment = "journee";
else if (heure >= 19 && heure < 22) moment = "soir";
else moment = "nuit";
if (moment === "nuit") { body.classList.add("nuit"); return moment; }
let temps = "beau";
if (meteo) {
const id = meteo.weather[0].id;
if (id >= 200 && id < 700) temps = "pluie";
else if (id >= 700 && id < 800) temps = "nuageux";
else if (id > 800) temps = "nuageux";
}
body.classList.add(moment + "-" + temps);
return moment;
}

function getSalutation(heure) {
if (heure >= 6 && heure < 12) return "Bonjour";
if (heure >= 12 && heure < 18) return "Bon après-midi";
if (heure >= 18 && heure < 22) return "Bonsoir";
return "Bonne nuit";
}

async function fetchMeteo() {
try {
if (CONFIG.meteoApiKey === "REMPLACE_PAR_TA_CLE_API") return null;
const pos = await new Promise((resolve, reject) => {
navigator.geolocation.getCurrentPosition(resolve, reject, {timeout: 5000});
});
const url = "https://api.openweathermap.org/data/2.5/weather?lat=" + pos.coords.latitude + "&lon=" + pos.coords.longitude + "&appid=" + CONFIG.meteoApiKey + "&units=metric&lang=fr";
const res = await fetch(url);
return await res.json();
} catch (e) { return null; }
}

function getMeteoIcon(meteo) {
if (!meteo) return "🌤️";
const id = meteo.weather[0].id;
if (id >= 200 && id < 300) return "⛈️";
if (id >= 300 && id < 600) return "🌧️";
if (id >= 600 && id < 700) return "❄️";
if (id >= 700 && id < 800) return "🌫️";
if (id === 800) return "☀️";
if (id === 801) return "🌤️";
return "☁️";
}

function getSuggestion(meteo, heure) {
if (!meteo) return "Bonne journée Solène ! 💪";
const id = meteo.weather[0].id;
const temp = Math.round(meteo.main.temp);
if (id === 800 && temp > 15 && heure >= 7 && heure < 20) return "Temps idéal pour une sortie course ! 🏃‍♀️";
if (id === 800 && heure >= 7 && heure < 10) return "Parfait pour du sport en extérieur ! ☀️";
if (id >= 500 && id < 600) return "Journée parfaite pour la muscu en salle ! 💪";
if (id >= 200 && id < 300) return "Reste au chaud, parfait pour lire ou jouer 📚";
if (temp < 5) return "Il fait froid, parfait pour la salle ! 🏋️‍♀️";
return "Belle journée en perspective Solène ! 🌟";
}

const motsDuJour = [
{ mot: "Sérendipité", type: "nom féminin", def: "Fait de faire une découverte inattendue et heureuse par hasard.", etymo: "Du persan Serendip" },
{ mot: "Kaïros", type: "nom masculin", def: "Moment opportun, instant favorable qu'il faut saisir.", etymo: "Du grec ancien kairos" },
{ mot: "Fringant", type: "adjectif", def: "Plein de vivacité et d'ardeur, vif et élégant.", etymo: "Du vieux français fringuer" },
{ mot: "Acrimonie", type: "nom féminin", def: "Mauvaise humeur qui se manifeste par des paroles acides.", etymo: "Du latin acrimonia" },
{ mot: "Velléitaire", type: "adjectif", def: "Qui n'a que des intentions sans jamais les réaliser.", etymo: "Du latin velle, vouloir" },
{ mot: "Épiphanie", type: "nom féminin", def: "Moment de révélation soudaine, prise de conscience illuminante.", etymo: "Du grec epiphaneia" },
{ mot: "Méandre", type: "nom masculin", def: "Sinuosité d'un chemin ou d'une rivière, détour complexe.", etymo: "Du grec Maiandros" },
];

function getMotDuJour() {
const today = new Date();
const index = (today.getDate() + today.getMonth()) % motsDuJour.length;
return motsDuJour[index];
}

const humeurs = ["😴", "😔", "😐", "🙂", "😄"];
const humeursLabels = ["Épuisée", "Pas top", "Neutre", "Bien", "Super !"];

function sauvegarderHumeur(moment, index) {
const today = new Date().toDateString();
localStorage.setItem("humeur_" + moment + "_" + today, index);
document.querySelectorAll('.mood-btn[data-moment="' + moment + '"]').forEach(function(btn, i) {
btn.classList.toggle("selected", i === index);
});
}

function getHumeurSauvegardee(moment) {
const today = new Date().toDateString();
return localStorage.getItem("humeur_" + moment + "_" + today);
}

function buildMoodButtons(moment, saved) {
var html = "";
for (var i = 0; i < humeurs.length; i++) {
var sel = saved == i ? "selected" : "";
html += '<button class="mood-btn ' + sel + '" data-moment="' + moment + '" onclick="sauvegarderHumeur(\'' + moment + '\', ' + i + ')" title="' + humeursLabels[i] + '">' + humeurs[i] + '</button>';
}
return html;
}

async function renderAccueil() {
const app = document.getElementById("app");
app.innerHTML = "<p style='color:white;padding:40px'>Chargement...</p>";
const now = new Date();
const heure = now.getHours();
const meteo = await fetchMeteo();
getAmbiance(heure, meteo);
const motDuJour = getMotDuJour();
const dateStr = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const humeurMatinSaved = getHumeurSauvegardee("matin");
const humeurSoirSaved = getHumeurSauvegardee("soir");

app.innerHTML =
'<div class="header">' +
'<div class="greeting">' + getSalutation(heure) + '</div>' +
'<div class="name">' + CONFIG.prenom + ' ✨</div>' +
'<div class="date">' + dateStr + '</div>' +
'</div>' +

'<div class="card weather-card">' +
'<div class="weather-icon">' + getMeteoIcon(meteo) + '</div>' +
'<div class="weather-info">' +
'<div class="temp">' + (meteo ? Math.round(meteo.main.temp) + "°C" : "--°C") + '</div>' +
'<div class="desc">' + (meteo ? meteo.weather[0].description : "Météo indisponible") + '</div>' +
'<div class="weather-suggestion">' + getSuggestion(meteo, heure) + '</div>' +
'</div>' +
'</div>' +

'<div class="card">' +
'<div class="word-title">✨ Mot du jour</div>' +
'<div class="word-main">' + motDuJour.mot + '</div>' +
'<div class="word-type">' + motDuJour.type + ' — ' + motDuJour.etymo + '</div>' +
'<div class="word-def">' + motDuJour.def + '</div>' +
'</div>' +

'<div class="card">' +
'<div class="mood-title">🌅 Comment tu te sens ce matin ?</div>' +
'<div class="mood-options">' + buildMoodButtons("matin", humeurMatinSaved) + '</div>' +
'</div>' +

'<div class="card">' +
'<div class="mood-title">🌙 Comment s\'est passée ta journée ?</div>' +
'<div class="mood-options">' + buildMoodButtons("soir", humeurSoirSaved) + '</div>' +
'</div>' +

'<div class="card">' +
'<div class="word-title">📊 Résumé du jour</div>' +
'<div class="summary-grid">' +
'<div class="summary-item"><div class="value">--</div><div class="label">Pas aujourd\'hui</div></div>' +
'<div class="summary-item"><div class="value">--</div><div class="label">Calories</div></div>' +
'<div class="summary-item"><div class="value">--</div><div class="label">Séances sport</div></div>' +
'<div class="summary-item"><div class="value">--</div><div class="label">Tâches faites</div></div>' +
'</div>' +
'</div>' +

'<nav class="nav">' +
'<button class="nav-btn active" onclick="renderAccueil()"><span class="icon">🏠</span><span>Accueil</span></button>' +
'<button class="nav-btn"><span class="icon">🏃</span><span>Sport</span></button>' +
'<button class="nav-btn"><span class="icon">🧠</span><span>Mental</span></button>' +
'<button class="nav-btn"><span class="icon">🌍</span><span>Voyages</span></button>' +
'<button class="nav-btn"><span class="icon">✅</span><span>Projets</span></button>' +
'</nav>';
}

renderAccueil();