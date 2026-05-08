// ============================================
// CONFIG
// ============================================
const CONFIG = {
prenom: "Solène",
meteoApiKey: "REMPLACE_PAR_TA_CLE_METEO",
geminiApiKey: "AIzaSyD7H0PDSy5rvNCwSaD1twYqQutIKee2E9o"
};

let currentPage = "accueil";

// ============================================
// AMBIANCE
// ============================================
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

// ============================================
// MÉTÉO
// ============================================
async function fetchMeteo() {
try {
if (CONFIG.meteoApiKey === "REMPLACE_PAR_TA_CLE_METEO") return null;
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
if (!meteo) return "Belle journée en perspective ! 💪";
const id = meteo.weather[0].id;
const temp = Math.round(meteo.main.temp);
if (id === 800 && temp > 15 && heure >= 7 && heure < 20) return "Temps idéal pour une sortie course ! 🏃‍♀️";
if (id === 800 && heure >= 7 && heure < 10) return "Parfait pour du sport en extérieur ! ☀️";
if (id >= 500 && id < 600) return "Journée parfaite pour la muscu en salle ! 💪";
if (id >= 200 && id < 300) return "Reste au chaud, parfait pour lire ou créer 🎨";
if (temp < 5) return "Il fait froid, parfait pour la salle ! 🏋️‍♀️";
return "Belle journée en perspective Solène ! 🌟";
}

// ============================================
// MOTS DU JOUR
// ============================================
const motsDuJour = [
{ mot: "Sérendipité", type: "nom féminin", def: "Fait de faire une découverte inattendue et heureuse par hasard.", etymo: "Du persan Serendip" },
{ mot: "Kaïros", type: "nom masculin", def: "Moment opportun, instant favorable qu'il faut saisir.", etymo: "Du grec ancien kairos" },
{ mot: "Fringant", type: "adjectif", def: "Plein de vivacité et d'ardeur, vif et élégant.", etymo: "Du vieux français fringuer" },
{ mot: "Acrimonie", type: "nom féminin", def: "Mauvaise humeur qui se manifeste par des paroles acides.", etymo: "Du latin acrimonia" },
{ mot: "Velléitaire", type: "adjectif", def: "Qui n'a que des intentions sans jamais les réaliser.", etymo: "Du latin velle, vouloir" },
{ mot: "Épiphanie", type: "nom féminin", def: "Moment de révélation soudaine, prise de conscience illuminante.", etymo: "Du grec epiphaneia" },
{ mot: "Méandre", type: "nom masculin", def: "Sinuosité d'un chemin ou d'une rivière, détour complexe.", etymo: "Du grec Maiandros" },
{ mot: "Ineffable", type: "adjectif", def: "Qui ne peut être exprimé par des paroles, trop grand pour être dit.", etymo: "Du latin ineffabilis" },
{ mot: "Sibyllin", type: "adjectif", def: "Qui est obscur et mystérieux, difficile à comprendre.", etymo: "Du latin sibylla, prophétesse" },
{ mot: "Confluent", type: "nom masculin", def: "Point de rencontre de deux cours d'eau ou de deux idées.", etymo: "Du latin confluere, couler ensemble" },
];

function getMotDuJour() {
const today = new Date();
const index = (today.getDate() + today.getMonth() * 3) % motsDuJour.length;
return motsDuJour[index];
}

function sauvegarderMotDuJour(mot) {
const biblio = getBibliotheque();
const today = new Date().toLocaleDateString("fr-FR");
if (!biblio.find(function(m) { return m.mot === mot.mot; })) {
biblio.unshift(Object.assign({}, mot, { date: today, favori: false }));
localStorage.setItem("bibliotheque_mots", JSON.stringify(biblio));
}
}

function getBibliotheque() {
const data = localStorage.getItem("bibliotheque_mots");
return data ? JSON.parse(data) : [];
}

function toggleFavoriMot(motNom) {
const biblio = getBibliotheque();
const mot = biblio.find(function(m) { return m.mot === motNom; });
if (mot) {
mot.favori = !mot.favori;
localStorage.setItem("bibliotheque_mots", JSON.stringify(biblio));
renderAccueil();
}
}

// ============================================
// HUMEUR
// ============================================
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
return localStorage.getItem("humeur_" + moment + "_" + new Date().toDateString());
}

function buildMoodButtons(moment, saved) {
var html = "";
for (var i = 0; i < humeurs.length; i++) {
html += '<button class="mood-btn ' + (saved == i ? "selected" : "") + '" data-moment="' + moment + '" onclick="sauvegarderHumeur(\'' + moment + '\', ' + i + ')" title="' + humeursLabels[i] + '">' + humeurs[i] + '</button>';
}
return html;
}

// ============================================
// CITATIONS PERSO
// ============================================
function getCitations() {
const data = localStorage.getItem("citations");
return data ? JSON.parse(data) : [];
}

function getCitationAleatoire() {
const citations = getCitations().filter(function(c) { return c.favori; });
const toutes = getCitations();
const liste = citations.length > 0 ? citations : toutes;
if (liste.length === 0) return null;
return liste[Math.floor(Math.random() * liste.length)];
}

// ============================================
// NAVIGATION
// ============================================
function buildNav(active) {
return '<nav class="nav">' +
'<button class="nav-btn ' + (active === "accueil" ? "active" : "") + '" onclick="renderAccueil()">' +
'<i data-lucide="home"></i><span>Accueil</span>' +
'</button>' +
'<button class="nav-btn ' + (active === "sport" ? "active" : "") + '" onclick="renderSport()">' +
'<i data-lucide="dumbbell"></i><span>Sport</span>' +
'</button>' +
'<button class="nav-btn nav-add" onclick="openQuickAdd()">' +
'<i data-lucide="plus"></i>' +
'</button>' +
'<button class="nav-btn ' + (active === "creatif" ? "active" : "") + '" onclick="renderCreatif()">' +
'<i data-lucide="palette"></i><span>Créatif</span>' +
'</button>' +
'<button class="nav-btn ' + (active === "plus" ? "active" : "") + '" onclick="renderMenu()">' +
'<i data-lucide="grid"></i><span>Menu</span>' +
'</button>' +
'</nav>';
}

// ============================================
// PAGE D'ACCUEIL
// ============================================
async function renderAccueil() {
currentPage = "accueil";
updateAIContext();
const app = document.getElementById("app");
app.innerHTML = '<p style="color:white;padding:60px 24px">Chargement...</p>';
const now = new Date();
const heure = now.getHours();
const meteo = await fetchMeteo();
getAmbiance(heure, meteo);
const motDuJour = getMotDuJour();
sauvegarderMotDuJour(motDuJour);
const dateStr = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const humeurMatinSaved = getHumeurSauvegardee("matin");
const humeurSoirSaved = getHumeurSauvegardee("soir");
const citationPerso = getCitationAleatoire();
const isFavori = getBibliotheque().find(function(m) { return m.mot === motDuJour.mot && m.favori; });

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

'<div class="card" style="position:relative;cursor:pointer" onclick="renderBibliotheque()">' +
'<button onclick="event.stopPropagation();toggleFavoriMot(\'' + motDuJour.mot + '\')" style="position:absolute;top:16px;right:16px;background:none;border:none;font-size:20px;cursor:pointer;">' +
(isFavori ? "⭐" : "☆") +
'</button>' +
'<div class="word-title"><i data-lucide="sparkles"></i> Mot du jour</div>' +
'<div class="word-main" style="padding-right:36px">' + motDuJour.mot + '</div>' +
'<div class="word-type">' + motDuJour.type + ' — ' + motDuJour.etymo + '</div>' +
'<div class="word-def">' + motDuJour.def + '</div>' +
'<div style="font-size:11px;opacity:0.4;margin-top:8px">Appuie pour voir la bibliothèque →</div>' +
'</div>' +

(citationPerso ?
'<div class="card">' +
'<div class="word-title"><i data-lucide="quote"></i> Ta citation du moment</div>' +
'<div style="font-size:15px;line-height:1.6;font-style:italic;opacity:0.95">"' + citationPerso.texte + '"</div>' +
'<div style="font-size:12px;opacity:0.55;margin-top:8px;text-align:right">— ' + citationPerso.livre + '</div>' +
'</div>' : "") +

'<div class="card">' +
'<div class="mood-title"><i data-lucide="sunrise"></i> Comment tu te sens ce matin ?</div>' +
'<div class="mood-options">' + buildMoodButtons("matin", humeurMatinSaved) + '</div>' +
'</div>' +

'<div class="card">' +
'<div class="mood-title"><i data-lucide="moon"></i> Comment s\'est passée ta journée ?</div>' +
'<div class="mood-options">' + buildMoodButtons("soir", humeurSoirSaved) + '</div>' +
'</div>' +

'<div class="card">' +
'<div class="word-title"><i data-lucide="bar-chart-2"></i> Résumé du jour</div>' +
'<div class="summary-grid">' +
'<div class="summary-item"><div class="value">--</div><div class="label">Pas</div></div>' +
'<div class="summary-item"><div class="value">--</div><div class="label">Calories</div></div>' +
'<div class="summary-item"><div class="value">--</div><div class="label">Séances</div></div>' +
'<div class="summary-item"><div class="value">--</div><div class="label">Tâches</div></div>' +
'</div>' +
'</div>' +

buildNav("accueil");

lucide.createIcons();
}

// ============================================
// BIBLIOTHÈQUE MOTS
// ============================================
function renderBibliotheque(filtre) {
filtre = filtre || "tous";
currentPage = "accueil";
const app = document.getElementById("app");
const biblio = getBibliotheque();
const favoris = biblio.filter(function(m) { return m.favori; });
const liste = filtre === "favoris" ? favoris : biblio;

app.innerHTML =
'<div class="header">' +
'<button onclick="renderAccueil()" style="background:rgba(255,255,255,0.15);border:none;color:white;padding:8px 16px;border-radius:20px;font-size:14px;cursor:pointer;margin-bottom:12px;">← Retour</button>' +
'<div class="name" style="font-size:28px">Bibliothèque</div>' +
'<div class="date">' + biblio.length + ' mots · ' + favoris.length + ' favoris</div>' +
'</div>' +
'<div style="display:flex;gap:8px;padding:8px 16px 4px">' +
'<button onclick="renderBibliotheque(\'tous\')" class="filtre-btn ' + (filtre === "tous" ? "actif" : "") + '">Tous</button>' +
'<button onclick="renderBibliotheque(\'favoris\')" class="filtre-btn ' + (filtre === "favoris" ? "actif" : "") + '">⭐ Favoris</button>' +
'</div>' +
(liste.length === 0 ?
'<div class="card" style="text-align:center;opacity:0.6;margin-top:20px">' +
(filtre === "favoris" ? "Aucun favori pour l'instant" : "Aucun mot encore") +
'</div>' :
liste.map(function(m) {
return '<div class="card" style="position:relative">' +
'<button onclick="toggleFavoriMotBiblio(\'' + m.mot + '\')" style="position:absolute;top:14px;right:14px;background:none;border:none;font-size:20px;cursor:pointer;">' + (m.favori ? "⭐" : "☆") + '</button>' +
'<div class="word-main" style="padding-right:36px">' + m.mot + '</div>' +
'<div class="word-type">' + m.type + ' — ' + m.etymo + '</div>' +
'<div class="word-def" style="margin-top:6px">' + m.def + '</div>' +
'<div style="font-size:11px;opacity:0.4;margin-top:8px">Découvert le ' + m.date + '</div>' +
'</div>';
}).join("")
) +
buildNav("accueil");

lucide.createIcons();
}

function toggleFavoriMotBiblio(motNom) {
const biblio = getBibliotheque();
const mot = biblio.find(function(m) { return m.mot === motNom; });
if (mot) {
mot.favori = !mot.favori;
localStorage.setItem("bibliotheque_mots", JSON.stringify(biblio));
renderBibliotheque();
}
}

// ============================================
// SPORT - DASHBOARD
// ============================================
function renderSport() {
  currentPage = "sport";
  updateAIContext();
  const app = document.getElementById("app");
  const seances = getSeances();
  const semaine = seancesDeСetteSemaine(seances);

  app.innerHTML =
    '<div class="header">' +
      '<div class="greeting">Tableau de bord</div>' +
      '<div class="name">Sport 💪</div>' +
    '</div>' +

    // Onglets sports
    '<div style="display:flex;gap:8px;padding:0 16px 4px;overflow-x:auto">' +
      '<button onclick="renderMuscu()" class="filtre-btn actif">🏋️ Muscu</button>' +
      '<button onclick="renderCourse()" class="filtre-btn">🏃 Course</button>' +
      '<button onclick="ajouterSport()" class="filtre-btn">+ Sport</button>' +
    '</div>' +

    // Stats semaine
    '<div class="card">' +
      '<div class="word-title"><i data-lucide="bar-chart-2"></i> Cette semaine</div>' +
      '<div class="summary-grid">' +
        '<div class="summary-item"><div class="value">' + semaine.length + '</div><div class="label">Séances</div></div>' +
        '<div class="summary-item"><div class="value">' + getTotalSeries(semaine) + '</div><div class="label">Séries</div></div>' +
        '<div class="summary-item"><div class="value">' + getMusclePrincipal(semaine) + '</div><div class="label">Muscle phare</div></div>' +
        '<div class="summary-item"><div class="value">' + getStreakJours() + 'j</div><div class="label">Streak</div></div>' +
      '</div>' +
    '</div>' +

    // Bouton lancer séance
    '<div style="padding:4px 16px">' +
      '<button onclick="renderNouvelleSeance()" style="width:100%;background:linear-gradient(135deg,#7c6af7,#f953c6);border:none;color:white;padding:18px;border-radius:20px;font-size:17px;font-weight:700;cursor:pointer;box-shadow:0 4px 20px rgba(124,106,247,0.4);">⚡ Lancer une séance</button>' +
    '</div>' +

    // Programmes
    '<div class="card">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
        '<div class="word-title" style="margin:0"><i data-lucide="layout-list"></i> Mes programmes</div>' +
        '<button onclick="genererProgrammeIA()" style="background:rgba(255,255,255,0.15);border:none;color:white;padding:6px 12px;border-radius:12px;font-size:12px;cursor:pointer;">✨ Générer avec IA</button>' +
      '</div>' +
      getProgrammesHTML() +
    '</div>' +

    // Dernières séances
    '<div class="card">' +
      '<div class="word-title"><i data-lucide="clock"></i> Dernières séances</div>' +
      (seances.length === 0 ?
        '<div style="opacity:0.6;font-size:14px;margin-top:8px">Aucune séance encore — lance-toi ! 💪</div>' :
        seances.slice(0, 3).map(function(s) {
          return '<div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1)">' +
            '<div style="font-size:14px;font-weight:600">' + s.nom + '</div>' +
            '<div style="font-size:12px;opacity:0.6">' + s.date + ' · ' + s.exercices.length + ' exercices · ' + getTotalSeriesSeance(s) + ' séries</div>' +
          '</div>';
        }).join("")
      ) +
    '</div>' +

    // Bibliothèque exercices
    '<div class="card" style="cursor:pointer" onclick="renderBiblioExercices()">' +
      '<div class="word-title"><i data-lucide="book-open"></i> Bibliothèque d\'exercices</div>' +
      '<div style="font-size:14px;opacity:0.7;margin-top:6px">Fiches, schémas et conseils →</div>' +
    '</div>' +

    buildNav("sport");
  lucide.createIcons();
}

// ============================================
// DONNÉES SÉANCES
// ============================================
function getSeances() {
  return JSON.parse(localStorage.getItem("seances") || "[]");
}

function sauvegarderSeance(seance) {
  const seances = getSeances();
  seances.unshift(seance);
  localStorage.setItem("seances", JSON.stringify(seances));
}

function seancesDeСetteSemaine(seances) {
  const maintenant = new Date();
  const debutSemaine = new Date(maintenant);
  debutSemaine.setDate(maintenant.getDate() - maintenant.getDay());
  debutSemaine.setHours(0,0,0,0);
  return seances.filter(function(s) {
    return new Date(s.dateISO) >= debutSemaine;
  });
}

function getTotalSeries(seances) {
  return seances.reduce(function(total, s) {
    return total + getTotalSeriesSeance(s);
  }, 0);
}

function getTotalSeriesSeance(seance) {
  return seance.exercices.reduce(function(t, e) { return t + e.series.length; }, 0);
}

function getMusclePrincipal(seances) {
  if (seances.length === 0) return "--";
  const compteur = {};
  seances.forEach(function(s) {
    s.exercices.forEach(function(e) {
      // Seulement les exercices avec au moins une série réellement faite
      if (e.series && e.series.length > 0 && e.muscle) {
        compteur[e.muscle] = (compteur[e.muscle] || 0) + e.series.length;
      }
    });
  });
  const top = Object.keys(compteur).sort(function(a,b) { return compteur[b] - compteur[a]; });
  return top[0] || "--";
}

function getStreakJours() {
  const seances = getSeances();
  if (seances.length === 0) return 0;
  let streak = 0;
  const aujourd = new Date(); aujourd.setHours(0,0,0,0);
  for (var i = 0; i < 30; i++) {
    const jour = new Date(aujourd); jour.setDate(aujourd.getDate() - i);
    const trouve = seances.find(function(s) {
      const d = new Date(s.dateISO); d.setHours(0,0,0,0);
      return d.getTime() === jour.getTime();
    });
    if (trouve) streak++;
    else if (i > 0) break;
  }
  return streak;
}

// ============================================
// PROGRAMMES
// ============================================
function getProgrammes() {
  return JSON.parse(localStorage.getItem("programmes") || "[]");
}

function getProgrammesHTML() {
  const programmes = getProgrammes();
  if (programmes.length === 0) {
    return '<div style="opacity:0.6;font-size:14px">Aucun programme — génère-en un avec l\'IA ! ✨</div>';
  }
  return programmes.map(function(p, i) {
    return '<div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);cursor:pointer" onclick="lancerProgramme(' + i + ')">' +
      '<div style="font-size:14px;font-weight:600">' + p.nom + '</div>' +
      '<div style="font-size:12px;opacity:0.6">' + p.jours.length + ' jours · ' + p.objectif + '</div>' +
    '</div>';
  }).join("");
}

async function genererProgrammeIA() {
  const objectif = prompt("Quel est ton objectif ? (ex: prise de masse, force, remise en forme...)");
  if (!objectif) return;
  const seances = prompt("Combien de séances par semaine ?") || "3";
  const niveau = prompt("Ton niveau ? (débutante, intermédiaire, avancée)") || "intermédiaire";
  const materiel = prompt("Quel matériel as-tu ? (ex: haltères, barre, machines, élastiques, poids du corps...)") || "poids du corps";
  const poids = prompt("Quels poids as-tu disponibles ? (ex: 5kg, 8kg, 10kg, 12kg ou 'aucun')") || "aucun";

  showToast("✨ L'IA génère ton programme...");

  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + CONFIG.geminiApiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: "Génère un programme de musculation en JSON uniquement, sans markdown. Format: {\"nom\":\"string\",\"objectif\":\"string\",\"materiel\":\"string\",\"poidsDisponibles\":\"string\",\"jours\":[{\"nom\":\"string\",\"exercices\":[{\"nom\":\"string\",\"muscle\":\"string\",\"secondaires\":\"string\",\"series\":3,\"repetitions\":\"10-12\",\"repos\":90,\"poidsSuggere\":\"string\",\"conseils\":\"string\"}]}]}. Objectif: " + objectif + ", " + seances + " séances/semaine, niveau " + niveau + ", matériel: " + materiel + ", poids disponibles: " + poids + ". Adapte TOUS les exercices au matériel disponible. Pour chaque exercice suggère un poids de départ adapté au matériel. Réponds UNIQUEMENT avec le JSON." }]
        }]
      })
    });
    const data = await res.json();
    const raw = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
    const programme = JSON.parse(raw);
    const programmes = getProgrammes();
    programmes.unshift(programme);
    localStorage.setItem("programmes", JSON.stringify(programmes));
    showToast("✅ Programme \"" + programme.nom + "\" créé !");
    renderSport();
  } catch(e) {
    showToast("❌ Erreur, réessaie !");
  }
}

function lancerProgramme(index) {
  const programme = getProgrammes()[index];
  if (!programme) return;
  const app = document.getElementById("app");
  app.innerHTML =
    '<div class="header">' +
      '<button onclick="renderSport()" style="background:rgba(255,255,255,0.15);border:none;color:white;padding:8px 16px;border-radius:20px;font-size:14px;cursor:pointer;margin-bottom:12px;">← Retour</button>' +
      '<div class="name" style="font-size:24px">' + programme.nom + '</div>' +
      '<div class="date">' + programme.objectif + '</div>' +
    '</div>' +
    programme.jours.map(function(jour, ji) {
      return '<div class="card">' +
        '<div style="font-size:15px;font-weight:700;margin-bottom:10px">' + jour.nom + '</div>' +
        jour.exercices.map(function(ex) {
          return '<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1)">' +
            '<div style="font-size:14px;font-weight:600">' + ex.nom + '</div>' +
            '<div style="font-size:12px;opacity:0.7">' + ex.series + ' séries · ' + ex.repetitions + ' reps · ' + ex.repos + 's repos</div>' +
            '<div style="font-size:12px;opacity:0.5;margin-top:2px">' + ex.conseils + '</div>' +
          '</div>';
        }).join("") +
        '<button onclick="lancerSeanceJour(' + index + ',' + ji + ')" style="width:100%;background:linear-gradient(135deg,#7c6af7,#f953c6);border:none;color:white;padding:12px;border-radius:14px;font-size:14px;font-weight:600;cursor:pointer;margin-top:12px;">⚡ Faire cette séance</button>' +
      '</div>';
    }).join("") +
    buildNav("sport");
  lucide.createIcons();
}

// ============================================
// NOUVELLE SÉANCE LIBRE
// ============================================
var seanceEnCours = null;

function renderNouvelleSeance() {
  seanceEnCours = {
    nom: "Séance du " + new Date().toLocaleDateString("fr-FR"),
    date: new Date().toLocaleDateString("fr-FR"),
    dateISO: new Date().toISOString(),
    exercices: [],
    debut: Date.now()
  };
  renderSeanceActive();
}

function lancerSeanceJour(progIndex, jourIndex) {
  const jour = getProgrammes()[progIndex].jours[jourIndex];
  seanceEnCours = {
    nom: jour.nom,
    date: new Date().toLocaleDateString("fr-FR"),
    dateISO: new Date().toISOString(),
    exercices: jour.exercices.map(function(ex) {
      return { nom: ex.nom, muscle: ex.muscle, series: [], cible: { series: ex.series, repetitions: ex.repetitions, repos: ex.repos }, conseils: ex.conseils };
    }),
    debut: Date.now()
  };
  renderSeanceActive();
}

function renderSeanceActive() {
  const app = document.getElementById("app");
  const duree = Math.floor((Date.now() - seanceEnCours.debut) / 60000);

  app.innerHTML =
    '<div class="header">' +
      '<div class="greeting">Séance en cours ⚡</div>' +
      '<div class="name" style="font-size:22px">' + seanceEnCours.nom + '</div>' +
      '<div class="date">Durée : ' + duree + ' min</div>' +
    '</div>' +

    seanceEnCours.exercices.map(function(ex, ei) {
      return '<div class="card">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<div style="font-size:15px;font-weight:700">' + ex.nom + '</div>' +
          '<div style="font-size:11px;opacity:0.6;background:rgba(255,255,255,0.1);padding:4px 10px;border-radius:10px">' + (ex.muscle || "") + '</div>' +
        '</div>' +
        (ex.cible ? '<div style="font-size:12px;opacity:0.6;margin:4px 0">' + ex.cible.series + ' séries · ' + ex.cible.repetitions + ' reps · ' + ex.cible.repos + 's repos</div>' : "") +
        (ex.conseils ? '<div style="font-size:12px;opacity:0.5;font-style:italic;margin-bottom:8px">' + ex.conseils + '</div>' : "") +
ex.series.map(function(s, si) {
  var resultat = s.duree ? s.duree + "s" : (s.reps + " reps" + (s.poids ? " · " + s.poids + "kg" : ""));
  return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.08)">' +
    '<div style="font-size:12px;opacity:0.6;width:20px">S' + (si+1) + '</div>' +
    '<div style="font-size:14px;font-weight:600">' + resultat + '</div>' +
    (s.rpe ? '<div style="font-size:11px;background:rgba(255,255,255,0.15);padding:2px 8px;border-radius:8px">RPE ' + s.rpe + '</div>' : '') +
    '<button onclick="supprimerSerie(' + ei + ',' + si + ')" style="background:none;border:none;color:rgba(255,100,100,0.7);font-size:16px;cursor:pointer;margin-left:auto">×</button>' +
  '</div>';
}).join("") +
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">' +
  '<input id="reps_' + ei + '" type="number" placeholder="Reps" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:10px;padding:8px;color:white;font-size:14px;text-align:center;width:100%" />' +
  '<input id="poids_' + ei + '" type="number" placeholder="kg" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:10px;padding:8px;color:white;font-size:14px;text-align:center;width:100%" />' +
'</div>' +
'<div style="margin-top:8px">' +
  '<div style="font-size:12px;opacity:0.6;margin-bottom:6px">Perception d\'effort (RPE 1-10)</div>' +
  '<div style="display:flex;gap:4px">' +
    [1,2,3,4,5,6,7,8,9,10].map(function(n) {
      var couleur = n <= 3 ? "rgba(100,200,100,0.4)" : n <= 6 ? "rgba(255,200,0,0.4)" : "rgba(255,100,100,0.4)";
      return '<button onclick="setRPE(' + ei + ',' + n + ')" id="rpe_btn_' + ei + '_' + n + '" style="flex:1;background:' + couleur + ';border:none;color:white;padding:6px 2px;border-radius:8px;font-size:12px;cursor:pointer;">' + n + '</button>';
    }).join("") +
  '</div>' +
  '<input type="hidden" id="rpe_' + ei + '" value="" />' +
'</div>' +
'<div style="display:flex;align-items:center;gap:8px;margin-top:8px">' +
  '<input id="duree_' + ei + '" type="number" placeholder="Durée (sec)" style="flex:1;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:10px;padding:8px;color:white;font-size:14px;text-align:center;width:100%" />' +
  '<button onclick="lancerMinuteurExo(' + ei + ')" style="flex:1;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border:none;color:white;padding:8px;border-radius:10px;font-size:13px;cursor:pointer;">⏱️ Lancer et enregistrer</button>' +
'</div>' +
'<button onclick="ajouterSerie(' + ei + ')" style="width:100%;background:rgba(124,106,247,0.5);border:none;color:white;padding:10px;border-radius:10px;font-size:13px;cursor:pointer;margin-top:8px;">+ Ajouter cette série</button>' +
'<button onclick="lancerMinuteur(' + (ex.cible ? ex.cible.repos : 90) + ',' + ei + ')" style="width:100%;background:rgba(255,255,255,0.08);border:none;color:white;padding:8px;border-radius:10px;font-size:12px;cursor:pointer;margin-top:8px;">⏸️ Minuteur repos (' + (ex.cible ? ex.cible.repos : 90) + 's)</button>' +
'</div>';
    }).join("") +

    '<div style="padding:0 16px;display:flex;gap:10px">' +
      '<button onclick="ajouterExerciceLibre()" style="flex:1;background:rgba(255,255,255,0.1);border:1px dashed rgba(255,255,255,0.3);color:white;padding:14px;border-radius:16px;font-size:14px;cursor:pointer;">+ Exercice</button>' +
      '<button onclick="terminerSeance()" style="flex:1;background:linear-gradient(135deg,#7c6af7,#f953c6);border:none;color:white;padding:14px;border-radius:16px;font-size:14px;font-weight:700;cursor:pointer;">✅ Terminer</button>' +
    '</div>' +

'<div id="minuteur-container" style="display:none"></div>' +

    '<div style="height:20px"></div>' +
    buildNav("sport");
  lucide.createIcons();
}

function ajouterSerie(exIndex) {
  const reps = document.getElementById("reps_" + exIndex).value;
  const poids = document.getElementById("poids_" + exIndex).value;
  const rpe = document.getElementById("rpe_" + exIndex).value;
  const duree = document.getElementById("duree_" + exIndex) ? document.getElementById("duree_" + exIndex).value : null;
  if (!reps && !duree) return;
  seanceEnCours.exercices[exIndex].series.push({
    reps: reps ? parseInt(reps) : null,
    poids: parseFloat(poids) || 0,
    rpe: parseInt(rpe) || null,
    duree: duree ? parseInt(duree) : null
  });
  renderSeanceActive();
}

function setRPE(exIndex, valeur) {
  document.getElementById("rpe_" + exIndex).value = valeur;
  for (var i = 1; i <= 10; i++) {
    var btn = document.getElementById("rpe_btn_" + exIndex + "_" + i);
    if (btn) btn.style.opacity = i === valeur ? "1" : "0.4";
  }
}

function lancerMinuteurExo(exIndex) {
  clearInterval(minuteurInterval);
  var container = document.getElementById("minuteur-container");
  if (!container) return;

  // Place sous la card de l'exercice
  var cards = document.querySelectorAll(".card");
  if (cards[exIndex]) cards[exIndex].after(container);

  container.style.display = "block";
  container.innerHTML =
    '<div class="card" style="text-align:center;margin:0 16px">' +
      '<div style="font-size:13px;opacity:0.6;margin-bottom:6px">💪 Temps de travail</div>' +
      '<div id="minuteur-display" style="font-size:48px;font-weight:700">00:00</div>' +
      '<button id="stop-travail-btn" style="background:rgba(100,200,100,0.3);border:none;color:white;padding:8px 20px;border-radius:12px;cursor:pointer;margin-top:10px;">Arrêter et enregistrer</button>' +
    '</div>';

  let secondes = 0;
  minuteurInterval = setInterval(function() {
    secondes++;
    const m = Math.floor(secondes / 60);
    const s = secondes % 60;
    const el = document.getElementById("minuteur-display");
    if (el) el.textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }, 1000);

  document.getElementById("stop-travail-btn").onclick = function() {
    clearInterval(minuteurInterval);
    container.style.display = "none";
    const dureeInput = document.getElementById("duree_" + exIndex);
    if (dureeInput) {
      dureeInput.value = secondes;
      showToast("⏱️ " + secondes + "s enregistrés !");
    }
  };
}

function supprimerSerie(exIndex, serieIndex) {
  seanceEnCours.exercices[exIndex].series.splice(serieIndex, 1);
  renderSeanceActive();
}

function ajouterExerciceLibre() {
  const nom = prompt("Nom de l'exercice :");
  if (!nom) return;
  const muscle = prompt("Muscle ciblé (ex: Pectoraux, Dos, Jambes...) :") || "";
  seanceEnCours.exercices.push({ nom: nom, muscle: muscle, series: [] });
  renderSeanceActive();
}

async function terminerSeance() {
  if (seanceEnCours.exercices.length === 0) {
    showToast("Ajoute au moins un exercice !");
    return;
  }
  seanceEnCours.duree = Math.floor((Date.now() - seanceEnCours.debut) / 60000);
  sauvegarderSeance(seanceEnCours);

  // Analyse IA de la séance
  showToast("🧠 L'IA analyse ta séance...");

  try {
    const resume = seanceEnCours.exercices.map(function(ex) {
      return ex.nom + " : " + ex.series.map(function(s) {
        return s.reps + " reps à " + s.poids + "kg" + (s.rpe ? " (RPE " + s.rpe + ")" : "");
      }).join(", ");
    }).join(" | ");

    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + CONFIG.geminiApiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: "Tu es un coach sportif. Analyse cette séance de musculation et donne des recommandations courtes pour la prochaine séance. Séance : " + resume + ". Durée : " + seanceEnCours.duree + " min. Réponds en 3-4 phrases max en français, de façon encourageante et précise. Suggère des ajustements de poids ou de répétitions basés sur les RPE." }]
        }]
      })
    });
    const data = await res.json();
    const analyse = data.candidates[0].content.parts[0].text;
    seanceEnCours.analyseIA = analyse;
    sauvegarderSeance(seanceEnCours);

    // Afficher le bilan
    const app = document.getElementById("app");
    app.innerHTML =
      '<div class="header">' +
        '<div class="greeting">Séance terminée ! 🎉</div>' +
        '<div class="name" style="font-size:22px">' + seanceEnCours.nom + '</div>' +
        '<div class="date">Durée : ' + seanceEnCours.duree + ' min</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="word-title"><i data-lucide="bar-chart-2"></i> Résumé</div>' +
        '<div class="summary-grid">' +
          '<div class="summary-item"><div class="value">' + seanceEnCours.exercices.length + '</div><div class="label">Exercices</div></div>' +
          '<div class="summary-item"><div class="value">' + getTotalSeriesSeance(seanceEnCours) + '</div><div class="label">Séries</div></div>' +
          '<div class="summary-item"><div class="value">' + seanceEnCours.duree + '</div><div class="label">Minutes</div></div>' +
          '<div class="summary-item"><div class="value">' + getRPEMoyen(seanceEnCours) + '</div><div class="label">RPE moyen</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="word-title"><i data-lucide="brain"></i> Analyse de ton coach IA</div>' +
        '<div style="font-size:14px;line-height:1.6;margin-top:8px;opacity:0.9">' + analyse + '</div>' +
      '</div>' +
      '<div style="padding:0 16px">' +
        '<button onclick="renderSport()" style="width:100%;background:linear-gradient(135deg,#7c6af7,#f953c6);border:none;color:white;padding:16px;border-radius:16px;font-size:15px;font-weight:700;cursor:pointer;">Retour au dashboard</button>' +
      '</div>' +
      buildNav("sport");
    lucide.createIcons();
    seanceEnCours = null;

  } catch(e) {
    showToast("🎉 Séance sauvegardée !");
    seanceEnCours = null;
    renderSport();
  }
}

function getRPEMoyen(seance) {
  var total = 0, count = 0;
  seance.exercices.forEach(function(ex) {
    ex.series.forEach(function(s) {
      if (s.rpe) { total += s.rpe; count++; }
    });
  });
  return count > 0 ? (total/count).toFixed(1) : "--";
}

// ============================================
// MINUTEUR
// ============================================
var minuteurInterval = null;

function lancerMinuteur(secondes, exIndex) {
  clearInterval(minuteurInterval);
  var container = document.getElementById("minuteur-container");
  if (!container) return;

  // Place le minuteur sous la card de l'exercice si exIndex fourni
  if (exIndex !== undefined) {
    var cards = document.querySelectorAll(".card");
    if (cards[exIndex]) cards[exIndex].after(container);
  }

  container.style.display = "block";
  container.innerHTML =
    '<div class="card" style="text-align:center;margin:0 16px">' +
      '<div style="font-size:13px;opacity:0.6;margin-bottom:6px">⏸️ Temps de repos</div>' +
      '<div id="minuteur-display" style="font-size:48px;font-weight:700">00:00</div>' +
      '<button onclick="stopMinuteur()" style="background:rgba(255,100,100,0.3);border:none;color:white;padding:8px 20px;border-radius:12px;cursor:pointer;margin-top:10px;">Arrêter</button>' +
    '</div>';

  let restant = secondes;
  function updateDisplay() {
    const m = Math.floor(restant / 60);
    const s = restant % 60;
    const el = document.getElementById("minuteur-display");
    if (el) el.textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }
  updateDisplay();
  minuteurInterval = setInterval(function() {
    restant--;
    updateDisplay();
    if (restant <= 0) {
      clearInterval(minuteurInterval);
      showToast("⏱️ Repos terminé ! C'est reparti 💪");
      container.style.display = "none";
    }
  }, 1000);
}

function stopMinuteur() {
  clearInterval(minuteurInterval);
  const container = document.getElementById("minuteur-container");
  if (container) container.style.display = "none";
}

// ============================================
// BIBLIOTHÈQUE EXERCICES
// ============================================
const exercicesBiblio = [
  { nom: "Développé couché", muscle: "Pectoraux", secondaires: "Triceps, Épaules", desc: "Allongé sur un banc, descends la barre jusqu'à la poitrine puis pousse vers le haut.", erreurs: "Ne pas rebondir la barre sur la poitrine. Garder les pieds au sol.", icon: "🏋️" },
  { nom: "Squat", muscle: "Quadriceps", secondaires: "Fessiers, Ischio-jambiers", desc: "Pieds largeur d'épaules, descends les hanches vers le bas en gardant le dos droit.", erreurs: "Ne pas laisser les genoux rentrer vers l'intérieur. Talons au sol.", icon: "🦵" },
  { nom: "Soulevé de terre", muscle: "Dos", secondaires: "Fessiers, Jambes, Trapèzes", desc: "Barre au sol, dos droit, pousse avec les jambes en gardant la barre proche du corps.", erreurs: "Ne jamais arrondir le dos. Garder la barre contre les tibias.", icon: "💪" },
  { nom: "Traction", muscle: "Dos", secondaires: "Biceps, Épaules", desc: "Suspendu à la barre, tire ton corps vers le haut jusqu'au menton.", erreurs: "Ne pas balancer le corps. Contrôler la descente.", icon: "🔝" },
  { nom: "Développé militaire", muscle: "Épaules", secondaires: "Triceps, Trapèzes", desc: "Debout ou assis, pousse la barre au-dessus de la tête bras tendus.", erreurs: "Ne pas creuser les lombaires. Rentrer le menton.", icon: "🙌" },
  { nom: "Curl biceps", muscle: "Biceps", secondaires: "Avant-bras", desc: "Coudes fixes le long du corps, fléchis les avant-bras vers les épaules.", erreurs: "Ne pas balancer le buste. Garder les coudes stables.", icon: "💪" },
  { nom: "Dips", muscle: "Triceps", secondaires: "Pectoraux, Épaules", desc: "Suspendu entre deux barres parallèles, descends le corps puis pousse vers le haut.", erreurs: "Ne pas descendre trop bas. Garder les coudes proches du corps.", icon: "⬇️" },
  { nom: "Fentes", muscle: "Quadriceps", secondaires: "Fessiers, Ischio-jambiers", desc: "Un pied en avant, descends le genou arrière vers le sol puis remonte.", erreurs: "Le genou avant ne doit pas dépasser le pied. Dos droit.", icon: "🦵" },
  { nom: "Hip thrust", muscle: "Fessiers", secondaires: "Ischio-jambiers, Abdos", desc: "Dos sur un banc, barre sur les hanches, pousse les hanches vers le haut.", erreurs: "Ne pas cambrer excessivement. Contracter les fessiers en haut.", icon: "🍑" },
  { nom: "Gainage", muscle: "Abdominaux", secondaires: "Dos, Épaules", desc: "Position pompe sur les avant-bras, corps aligné, tiens la position.", erreurs: "Ne pas laisser les hanches monter ou descendre. Respire normalement.", icon: "🧱" },
];

function renderBiblioExercices(filtreMusc) {
  filtreMusc = filtreMusc || "tous";
  currentPage = "sport";
  const app = document.getElementById("app");
  const muscles = ["tous", "Pectoraux", "Dos", "Épaules", "Biceps", "Triceps", "Quadriceps", "Fessiers", "Abdominaux"];
  const liste = filtreMusc === "tous" ? exercicesBiblio : exercicesBiblio.filter(function(e) { return e.muscle === filtreMusc; });

  app.innerHTML =
    '<div class="header">' +
      '<button onclick="renderSport()" style="background:rgba(255,255,255,0.15);border:none;color:white;padding:8px 16px;border-radius:20px;font-size:14px;cursor:pointer;margin-bottom:12px;">← Retour</button>' +
      '<div class="name" style="font-size:26px">Bibliothèque 📚</div>' +
    '</div>' +
    '<div style="display:flex;gap:8px;padding:0 16px 8px;overflow-x:auto;-webkit-overflow-scrolling:touch">' +
      muscles.map(function(m) {
        return '<button onclick="renderBiblioExercices(\'' + m + '\')" class="filtre-btn ' + (filtreMusc === m ? "actif" : "") + '" style="white-space:nowrap">' + m + '</button>';
      }).join("") +
    '</div>' +
    liste.map(function(ex) {
      return '<div class="card">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
          '<div style="font-size:16px;font-weight:700">' + ex.icon + ' ' + ex.nom + '</div>' +
          '<div style="font-size:11px;background:rgba(124,106,247,0.3);padding:4px 10px;border-radius:10px">' + ex.muscle + '</div>' +
        '</div>' +
        '<div style="font-size:12px;opacity:0.6;margin-bottom:6px">+ ' + ex.secondaires + '</div>' +
        '<div style="font-size:14px;line-height:1.5;margin-bottom:8px">' + ex.desc + '</div>' +
        '<div style="font-size:12px;background:rgba(255,100,100,0.15);padding:8px 12px;border-radius:10px;opacity:0.9">⚠️ ' + ex.erreurs + '</div>' +
      '</div>';
    }).join("") +
    buildNav("sport");
  lucide.createIcons();
}

// ============================================
// COURSE
// ============================================
function renderCourse() {
  currentPage = "sport";
  updateAIContext();
  renderStub("Course 🏃‍♀️", "Suivi de tes sorties course — bientôt !", "renderSport()");
}

// ============================================
// CRÉATIF
// ============================================
function renderCreatif() {
currentPage = "creatif";
updateAIContext();
const app = document.getElementById("app");
app.innerHTML =
'<div class="header">' +
'<div class="greeting">Espace</div>' +
'<div class="name">Créatif 🎨</div>' +
'</div>' +
'<div class="card">' +
'<div class="word-title"><i data-lucide="layers"></i> Mes pratiques</div>' +
'<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">' +
creatifBtn("🖌️", "Peinture") +
creatifBtn("💧", "Aquarelle") +
creatifBtn("🏺", "Argile") +
creatifBtn("💍", "Bijoux") +
'<button style="background:rgba(255,255,255,0.1);border:1px dashed rgba(255,255,255,0.3);color:white;padding:10px 16px;border-radius:14px;font-size:13px;cursor:pointer;">+ Ajouter</button>' +
'</div>' +
'</div>' +
'<div class="card" style="cursor:pointer" onclick="renderPalettes()">' +
'<div class="word-title"><i data-lucide="droplets"></i> Palettes de couleurs</div>' +
'<div style="display:flex;gap:6px;margin-top:10px">' +
palettePreview() +
'</div>' +
'<div style="font-size:12px;opacity:0.5;margin-top:8px">Appuie pour explorer →</div>' +
'</div>' +
'<div class="card">' +
'<div class="word-title"><i data-lucide="lightbulb"></i> Idées créatives</div>' +
'<button onclick="ajouterIdeeCreative()" style="width:100%;background:rgba(255,255,255,0.1);border:1px dashed rgba(255,255,255,0.3);color:white;padding:12px;border-radius:14px;font-size:14px;cursor:pointer;margin-top:8px;">+ Nouvelle idée</button>' +
'</div>' +
'<div class="card" style="cursor:pointer" onclick="renderCroquis()">' +
'<div class="word-title"><i data-lucide="pencil"></i> Croquis rapide</div>' +
'<div style="font-size:14px;opacity:0.7;margin-top:6px">Ouvrir le carnet de croquis →</div>' +
'</div>' +
buildNav("creatif");
lucide.createIcons();
}

function creatifBtn(emoji, nom) {
return '<button style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.2);color:white;padding:10px 16px;border-radius:14px;font-size:13px;cursor:pointer;">' + emoji + ' ' + nom + '</button>';
}

function palettePreview() {
const couleurs = genererPalette();
return couleurs.map(function(c) {
return '<div style="flex:1;height:36px;border-radius:8px;background:' + c + '"></div>';
}).join("");
}

function genererPalette() {
const palettes = [
["#F8B4B4","#F4A0A0","#D48B8B","#B87575","#8B5555"],
["#B4D4F8","#A0C4F4","#8BB4D4","#758EB8","#55688B"],
["#B4F8D4","#A0F4C4","#8BD4A4","#75B888","#558B68"],
["#F8F4B4","#F4E8A0","#D4C88B","#B8A875","#8B7D55"],
["#E8B4F8","#DCA0F4","#BC8BD4","#A075B8","#78558B"],
["#F8D4B4","#F4C4A0","#D4A48B","#B88875","#8B6255"],
];
return palettes[Math.floor(Math.random() * palettes.length)];
}

function renderPalettes() {
currentPage = "creatif";
const app = document.getElementById("app");
const data = localStorage.getItem("palettes_favoris");
const favoris = data ? JSON.parse(data) : [];

var palettesHTML = "";
for (var i = 0; i < 8; i++) {
const couleurs = genererPalette();
const id = "palette_" + i;
palettesHTML += '<div class="card" style="position:relative">' +
'<div style="display:flex;gap:6px;margin-bottom:10px">' +
couleurs.map(function(c) {
return '<div style="flex:1;height:48px;border-radius:10px;background:' + c + '"></div>';
}).join("") +
'</div>' +
'<div style="display:flex;justify-content:space-between;align-items:center">' +
'<span style="font-size:12px;opacity:0.5">' + couleurs.join(" · ") + '</span>' +
'<button onclick="togglePaletteFavori(this, \'' + couleurs.join(",") + '\')" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;">☆</button>' +
'</div>' +
'</div>';
}

app.innerHTML =
'<div class="header">' +
'<button onclick="renderCreatif()" style="background:rgba(255,255,255,0.15);border:none;color:white;padding:8px 16px;border-radius:20px;font-size:14px;cursor:pointer;margin-bottom:12px;">← Retour</button>' +
'<div class="name" style="font-size:28px">Palettes</div>' +
'</div>' +
'<div style="padding:0 16px 8px">' +
'<button onclick="renderPalettes()" class="filtre-btn actif" style="margin-right:8px">🎲 Nouvelles palettes</button>' +
'</div>' +
palettesHTML +
buildNav("creatif");
lucide.createIcons();
}

function togglePaletteFavori(btn, couleurs) {
btn.textContent = btn.textContent === "☆" ? "⭐" : "☆";
}

function ajouterIdeeCreative() {
const idee = prompt("Quelle est ton idée créative ?");
if (idee) {
const idees = JSON.parse(localStorage.getItem("idees_creatives") || "[]");
idees.unshift({ texte: idee, date: new Date().toLocaleDateString("fr-FR"), pratique: "" });
localStorage.setItem("idees_creatives", JSON.stringify(idees));
alert("Idée sauvegardée ! 🎨");
}
}

function renderCroquis() {
currentPage = "creatif";
const app = document.getElementById("app");
app.innerHTML =
'<div class="header">' +
'<button onclick="renderCreatif()" style="background:rgba(255,255,255,0.15);border:none;color:white;padding:8px 16px;border-radius:20px;font-size:14px;cursor:pointer;margin-bottom:12px;">← Retour</button>' +
'<div class="name" style="font-size:28px">Croquis rapide ✏️</div>' +
'</div>' +
'<div class="card" style="padding:10px">' +
'<canvas id="sketchCanvas" style="width:100%;border-radius:14px;background:rgba(255,255,255,0.95);touch-action:none;display:block;" height="400"></canvas>' +
'</div>' +
'<div style="display:flex;gap:10px;padding:0 16px;flex-wrap:wrap">' +
'<button onclick="setCouleur(\'#1a1a2e\')" style="background:#1a1a2e;border:2px solid white;width:36px;height:36px;border-radius:50%;cursor:pointer;"></button>' +
'<button onclick="setCouleur(\'#e63946\')" style="background:#e63946;border:none;width:36px;height:36px;border-radius:50%;cursor:pointer;"></button>' +
'<button onclick="setCouleur(\'#2196F3\')" style="background:#2196F3;border:none;width:36px;height:36px;border-radius:50%;cursor:pointer;"></button>' +
'<button onclick="setCouleur(\'#4CAF50\')" style="background:#4CAF50;border:none;width:36px;height:36px;border-radius:50%;cursor:pointer;"></button>' +
'<button onclick="setCouleur(\'#FF9800\')" style="background:#FF9800;border:none;width:36px;height:36px;border-radius:50%;cursor:pointer;"></button>' +
'<button onclick="setTaille(3)" style="background:rgba(255,255,255,0.2);border:none;color:white;padding:8px 14px;border-radius:20px;cursor:pointer;font-size:12px;">Fin</button>' +
'<button onclick="setTaille(8)" style="background:rgba(255,255,255,0.2);border:none;color:white;padding:8px 14px;border-radius:20px;cursor:pointer;font-size:12px;">Moyen</button>' +
'<button onclick="setTaille(16)" style="background:rgba(255,255,255,0.2);border:none;color:white;padding:8px 14px;border-radius:20px;cursor:pointer;font-size:12px;">Épais</button>' +
'<button onclick="effacerCroquis()" style="background:rgba(255,100,100,0.3);border:none;color:white;padding:8px 14px;border-radius:20px;cursor:pointer;font-size:12px;">🗑️ Effacer</button>' +
'</div>' +
buildNav("creatif");

lucide.createIcons();
setTimeout(initCanvas, 100);
}

var sketchCtx, isDrawing = false, currentColor = "#1a1a2e", currentSize = 4;

function initCanvas() {
const canvas = document.getElementById("sketchCanvas");
if (!canvas) return;
canvas.width = canvas.offsetWidth;
sketchCtx = canvas.getContext("2d");
sketchCtx.strokeStyle = currentColor;
sketchCtx.lineWidth = currentSize;
sketchCtx.lineCap = "round";
sketchCtx.lineJoin = "round";

canvas.addEventListener("touchstart", function(e) {
e.preventDefault();
isDrawing = true;
const t = e.touches[0];
const r = canvas.getBoundingClientRect();
sketchCtx.beginPath();
sketchCtx.moveTo(t.clientX - r.left, t.clientY - r.top);
}, { passive: false });

canvas.addEventListener("touchmove", function(e) {
e.preventDefault();
if (!isDrawing) return;
const t = e.touches[0];
const r = canvas.getBoundingClientRect();
sketchCtx.lineTo(t.clientX - r.left, t.clientY - r.top);
sketchCtx.stroke();
}, { passive: false });

canvas.addEventListener("touchend", function() { isDrawing = false; });

canvas.addEventListener("mousedown", function(e) {
isDrawing = true;
const r = canvas.getBoundingClientRect();
sketchCtx.beginPath();
sketchCtx.moveTo(e.clientX - r.left, e.clientY - r.top);
});
canvas.addEventListener("mousemove", function(e) {
if (!isDrawing) return;
const r = canvas.getBoundingClientRect();
sketchCtx.lineTo(e.clientX - r.left, e.clientY - r.top);
sketchCtx.stroke();
});
canvas.addEventListener("mouseup", function() { isDrawing = false; });
}

function setCouleur(c) {
currentColor = c;
if (sketchCtx) sketchCtx.strokeStyle = c;
}

function setTaille(t) {
currentSize = t;
if (sketchCtx) sketchCtx.lineWidth = t;
}

function effacerCroquis() {
if (sketchCtx) sketchCtx.clearRect(0, 0, sketchCtx.canvas.width, sketchCtx.canvas.height);
}

// ============================================
// MENU PRINCIPAL
// ============================================
function renderMenu() {
currentPage = "menu";
const app = document.getElementById("app");
app.innerHTML =
'<div class="header">' +
'<div class="name">Menu 🗂️</div>' +
'</div>' +
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 16px">' +
menuCard("🧠", "Mental", "renderMental()") +
menuCard("🌍", "Voyages", "renderVoyages()") +
menuCard("📚", "Lectures", "renderLectures()") +
menuCard("✅", "Projets", "renderProjets()") +
menuCard("🏆", "Défis", "renderDefis()") +
menuCard("📓", "Journal", "renderJournal()") +
'</div>' +
buildNav("plus");
lucide.createIcons();
}

function menuCard(emoji, titre, fn) {
return '<div class="card" style="text-align:center;cursor:pointer;padding:24px 16px" onclick="' + fn + '">' +
'<div style="font-size:36px;margin-bottom:8px">' + emoji + '</div>' +
'<div style="font-size:15px;font-weight:600">' + titre + '</div>' +
'</div>';
}

// ============================================
// SECTIONS SECONDAIRES (stubs)
// ============================================
function renderMental() {
currentPage = "mental";
updateAIContext();
renderStub("Mental 🧠", "Tracker d'humeur, mini-jeux et espace écriture — bientôt !", "renderMenu()");
}
function renderVoyages() {
currentPage = "voyages";
updateAIContext();
renderStub("Voyages 🌍", "Planifie tes aventures — bientôt !", "renderMenu()");
}
function renderLectures() {
currentPage = "lectures";
updateAIContext();
renderStub("Lectures 📚", "Tes livres et citations — bientôt !", "renderMenu()");
}
function renderProjets() {
currentPage = "projets";
updateAIContext();
renderStub("Projets ✅", "Tes projets et tâches — bientôt !", "renderMenu()");
}
function renderDefis() {
currentPage = "defis";
updateAIContext();
renderStub("Défis 🏆", "Tes défis personnels — bientôt !", "renderMenu()");
}
function renderJournal() {
currentPage = "journal";
updateAIContext();
renderStub("Journal 📓", "Ton espace d'écriture — bientôt !", "renderMenu()");
}

function renderStub(titre, desc, retour) {
const app = document.getElementById("app");
app.innerHTML =
'<div class="header">' +
'<button onclick="' + retour + '" style="background:rgba(255,255,255,0.15);border:none;color:white;padding:8px 16px;border-radius:20px;font-size:14px;cursor:pointer;margin-bottom:12px;">← Retour</button>' +
'<div class="name" style="font-size:28px">' + titre + '</div>' +
'</div>' +
'<div class="card" style="text-align:center;padding:40px 20px">' +
'<div style="font-size:48px;margin-bottom:16px">🚧</div>' +
'<div style="font-size:15px;opacity:0.8">' + desc + '</div>' +
'</div>' +
buildNav("plus");
lucide.createIcons();
}

// ============================================
// AJOUT RAPIDE IA
// ============================================
function openQuickAdd() {
document.getElementById("quick-add-overlay").classList.add("open");
setTimeout(function() {
document.getElementById("quick-add-input").focus();
}, 300);
}

function closeQuickAdd() {
document.getElementById("quick-add-overlay").classList.remove("open");
}

async function classifierContenu() {
const input = document.getElementById("quick-add-input");
const texte = input.value.trim();
if (!texte) return;

const btn = document.querySelector(".btn-primary");
btn.textContent = "Analyse...";
btn.disabled = true;

try {
const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + CONFIG.geminiApiKey, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
contents: [{
parts: [{ text: "Tu es un assistant qui classe du contenu dans ces catégories : sport, creatif, lectures, voyages, projets, defis, journal. Réponds UNIQUEMENT avec un JSON : {\"categorie\": \"nom\", \"emoji\": \"emoji\", \"confirmation\": \"phrase courte en français\"}. Contenu à classer : " + texte }]
}]
})
});
const data = await res.json();
const raw = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
const result = JSON.parse(raw);

sauvegarderQuickAdd(texte, result.categorie);
closeQuickAdd();
input.value = "";
showToast(result.emoji + " Ajouté dans " + result.categorie + " !");
} catch(e) {
showToast("✅ Sauvegardé !");
closeQuickAdd();
input.value = "";
}

btn.textContent = "Ajouter";
btn.disabled = false;
}

function sauvegarderQuickAdd(texte, categorie) {
const key = "quickadd_" + categorie;
const items = JSON.parse(localStorage.getItem(key) || "[]");
items.unshift({ texte: texte, date: new Date().toLocaleDateString("fr-FR") });
localStorage.setItem(key, JSON.stringify(items));
}

function showToast(msg) {
const t = document.createElement("div");
t.textContent = msg;
t.style.cssText = "position:fixed;bottom:120px;left:50%;transform:translateX(-50%);background:rgba(20,16,50,0.95);color:white;padding:12px 24px;border-radius:20px;font-size:14px;z-index:999;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);";
document.body.appendChild(t);
setTimeout(function() { t.remove(); }, 3000);
}

// ============================================
// ASSISTANT IA GEMINI
// ============================================
const aiContextes = {
accueil: "Tu es un assistant personnel bienveillant pour Solène. Tu l'aides dans sa vie quotidienne, ses objectifs, sa motivation. Sois chaleureuse, encourageante et concise.",
sport: "Tu es le coach sportif personnel de Solène. Elle pratique la musculation et la course. Aide-la avec ses entraînements, sa progression, ses défis sportifs. Sois motivante et précise.",
creatif: "Tu es un assistant créatif pour Solène. Elle pratique la peinture, l'aquarelle, l'argile et la bijouterie. Inspire-la, propose des idées, des techniques, des palettes. Sois imaginative.",
mental: "Tu es un assistant bien-être pour Solène. Aide-la avec sa gestion des émotions, son journal, ses moments de réflexion. Sois douce et à l'écoute.",
voyages: "Tu es le conseiller voyage de Solène. Aide-la à planifier ses aventures, découvrir des destinations, organiser ses itinéraires. Sois enthousiaste.",
lectures: "Tu es l'assistant littéraire de Solène. Aide-la avec ses lectures, propose des livres, discute des œuvres. Sois cultivée et passionnée.",
projets: "Tu es l'assistant productivité de Solène. Aide-la à organiser ses projets, ses tâches, ses objectifs. Sois efficace et structurée.",
defis: "Tu es le coach défi de Solène. Motive-la dans ses défis personnels et sportifs. Sois dynamique et encourageante.",
journal: "Tu es l'assistant journal de Solène. Propose-lui des prompts d'écriture, aide-la à s'exprimer. Sois inspirante et bienveillante.",
};

const aiLabels = {
accueil: "✨ Assistant personnel",
sport: "🏃 Coach sportif",
creatif: "🎨 Assistant créatif",
mental: "🧠 Bien-être",
voyages: "🌍 Conseiller voyage",
lectures: "📚 Assistant littéraire",
projets: "✅ Productivité",
defis: "🏆 Coach défi",
journal: "📓 Journal",
};

var aiMessages = [];
var aiOpen = false;

function updateAIContext() {
const label = aiLabels[currentPage] || "✨ Assistant";
const el = document.getElementById("ai-context-label");
if (el) el.textContent = label;
aiMessages = [];
const msgs = document.getElementById("ai-messages");
if (msgs) msgs.innerHTML = '<div class="ai-msg assistant">Bonjour Solène ! Je suis ton ' + label + '. Comment puis-je t\'aider ?</div>';
}

function toggleAI() {
aiOpen = !aiOpen;
document.getElementById("ai-panel").classList.toggle("open", aiOpen);
document.getElementById("ai-overlay").style.display = aiOpen ? "block" : "none";
if (aiOpen && aiMessages.length === 0) updateAIContext();
if (aiOpen) setTimeout(function() { document.getElementById("ai-input").focus(); }, 400);
}

async function sendAIMessage() {
const input = document.getElementById("ai-input");
const texte = input.value.trim();
if (!texte) return;
input.value = "";

const msgs = document.getElementById("ai-messages");
msgs.innerHTML += '<div class="ai-msg user">' + texte + '</div>';
msgs.innerHTML += '<div class="ai-msg assistant" id="ai-typing">...</div>';
msgs.scrollTop = msgs.scrollHeight;

aiMessages.push({ role: "user", parts: [{ text: texte }] });

try {
const systemPrompt = aiContextes[currentPage] || aiContextes.accueil;
const contents = [
{ role: "user", parts: [{ text: systemPrompt + "\n\nRéponds en français, de façon concise (max 3 phrases)." }] },
{ role: "model", parts: [{ text: "Compris, je suis prête à aider Solène !" }] },
...aiMessages
];

const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + CONFIG.geminiApiKey, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ contents: contents })
});

const data = await res.json();
const reponse = data.candidates[0].content.parts[0].text;
aiMessages.push({ role: "model", parts: [{ text: reponse }] });

const typing = document.getElementById("ai-typing");
if (typing) typing.textContent = reponse;
} catch(e) {
const typing = document.getElementById("ai-typing");
if (typing) typing.textContent = "Désolée, une erreur est survenue. Réessaie !";
}

msgs.scrollTop = msgs.scrollHeight;
}

// Envoi avec Entrée
document.addEventListener("DOMContentLoaded", function() {
document.getElementById("ai-input").addEventListener("keydown", function(e) {
if (e.key === "Enter") sendAIMessage();
});
document.getElementById("quick-add-input") && document.getElementById("quick-add-input").addEventListener("keydown", function(e) {
if (e.key === "Enter") classifierContenu();
});
});


// ============================================
// LANCEMENT
// ============================================
renderAccueil();