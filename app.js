
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
    if (!KEYS.meteo || KEYS.meteo === "TA_CLE_METEO_ICI") return null;
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {timeout: 5000});
    });
    const url = "https://api.openweathermap.org/data/2.5/weather?lat=" + pos.coords.latitude + "&lon=" + pos.coords.longitude + "&appid=" + KEYS.meteo + "&units=metric&lang=fr";
    const res = await fetch(url);
    const data = await res.json();
    if (data.cod && data.cod !== 200) return null;
    return data;
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
'<div class="name">' + "Solène" + ' ✨</div>' +
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
  seances.slice(0, 5).map(function(s, i) {
    return '<div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);cursor:pointer;user-select:none" ' +
      'oncontextmenu="event.preventDefault();afficherMenuSeance(' + i + ')" ' +
      'ontouchstart="startLongPress(\'seance\',' + i + ')" ' +
      'ontouchend="cancelLongPress()" ' +
      'ontouchmove="cancelLongPress()">' +
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
// APPUI LONG + MENUS CONTEXTUELS
// ============================================
var longPressTimer = null;

function startLongPress(type, index) {
  cancelLongPress();
  longPressTimer = setTimeout(function() {
    if (type === "programme") afficherMenuProgramme(index);
    else if (type === "seance") afficherMenuSeance(index);
    else if (type === "idee") afficherMenuIdee(index);
    else if (type.startsWith("projetcreatif_")) {
      var pratId = type.replace("projetcreatif_", "");
      var pratiques = [
        {id:"peinture", nom:"Peinture", emoji:"🖌️"},
        {id:"aquarelle", nom:"Aquarelle", emoji:"💧"},
        {id:"argile", nom:"Argile", emoji:"🏺"},
        {id:"bijoux", nom:"Bijoux", emoji:"💍"}
      ].concat(getPratiquesPerso());
      var prat = pratiques.find(function(p) { return p.id === pratId; });
      if (prat) afficherMenuProjetCreatif(pratId, index, prat.nom, prat.emoji);
    }
    else if (type === "moodboard") supprimerMoodboardItem(index);
  }, 600);
}

function cancelLongPress() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

function afficherMenuProgramme(index) {
  const programme = getProgrammes()[index];
  if (!programme) return;
  afficherMenuContextuel(
    programme.nom,
    [
      { label: "⚡ Lancer ce programme", action: function() { lancerProgramme(index); } },
      { label: "✏️ Renommer", action: function() { renommerProgramme(index); } },
      { label: "🗑️ Supprimer", action: function() { supprimerProgramme(index); }, danger: true }
    ]
  );
}

function afficherMenuSeance(index) {
  const seance = getSeances()[index];
  if (!seance) return;
  afficherMenuContextuel(
    seance.nom,
    [
      { label: "👁️ Voir le détail", action: function() { voirDetailSeance(index); } },
      { label: "✏️ Renommer", action: function() { renommerSeance(index); } },
      { label: "🗑️ Supprimer", action: function() { supprimerSeance(index); }, danger: true }
    ]
  );
}

function afficherMenuContextuel(titre, actions) {
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:500;backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;";

  const panel = document.createElement("div");
  panel.style.cssText = "width:100%;max-width:430px;background:rgba(20,16,50,0.97);border-radius:28px 28px 0 0;padding:20px;border:1px solid rgba(255,255,255,0.15);padding-bottom:calc(20px + env(safe-area-inset-bottom));";

  panel.innerHTML =
    '<div style="font-size:13px;opacity:0.5;text-align:center;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.1)">' + titre + '</div>' +
    actions.map(function(a, i) {
      return '<button id="ctx_action_' + i + '" style="width:100%;background:' + (a.danger ? 'rgba(255,80,80,0.15)' : 'rgba(255,255,255,0.08)') + ';border:none;color:' + (a.danger ? '#ff6b6b' : 'white') + ';padding:15px;border-radius:14px;font-size:15px;cursor:pointer;margin-bottom:8px;text-align:left;font-family:var(--font)">' + a.label + '</button>';
    }).join("") +
    '<button id="ctx_cancel" style="width:100%;background:rgba(255,255,255,0.05);border:none;color:rgba(255,255,255,0.5);padding:15px;border-radius:14px;font-size:15px;cursor:pointer;font-family:var(--font)">Annuler</button>';

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  actions.forEach(function(a, i) {
    document.getElementById("ctx_action_" + i).onclick = function() {
      document.body.removeChild(overlay);
      a.action();
    };
  });

  document.getElementById("ctx_cancel").onclick = function() {
    document.body.removeChild(overlay);
  };

  overlay.onclick = function(e) {
    if (e.target === overlay) document.body.removeChild(overlay);
  };
}

function afficherInput(titre, placeholder, valeurDefaut, callback) {
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:500;backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;";

  const panel = document.createElement("div");
  panel.style.cssText = "width:100%;max-width:430px;background:rgba(20,16,50,0.97);border-radius:28px 28px 0 0;padding:24px;border:1px solid rgba(255,255,255,0.15);padding-bottom:calc(24px + env(safe-area-inset-bottom));";

  panel.innerHTML =
    '<div style="font-size:17px;font-weight:700;margin-bottom:16px">' + titre + '</div>' +
    '<input id="modal-input" type="text" placeholder="' + placeholder + '" value="' + (valeurDefaut || "") + '" style="width:100%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:16px;padding:14px 16px;color:white;font-size:15px;outline:none;font-family:var(--font);margin-bottom:12px;" />' +
    '<div style="display:flex;gap:10px">' +
      '<button id="modal-cancel" style="flex:1;background:rgba(255,255,255,0.08);border:none;color:white;padding:14px;border-radius:14px;font-size:15px;cursor:pointer;font-family:var(--font)">Annuler</button>' +
      '<button id="modal-confirm" style="flex:1;background:linear-gradient(135deg,#7c6af7,#f953c6);border:none;color:white;padding:14px;border-radius:14px;font-size:15px;font-weight:600;cursor:pointer;font-family:var(--font)">Confirmer</button>' +
    '</div>';

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  const input = document.getElementById("modal-input");
  setTimeout(function() { input.focus(); }, 100);

  document.getElementById("modal-confirm").onclick = function() {
    const valeur = input.value.trim();
    document.body.removeChild(overlay);
    if (valeur) callback(valeur);
  };

  document.getElementById("modal-cancel").onclick = function() {
    document.body.removeChild(overlay);
  };

  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      const valeur = input.value.trim();
      document.body.removeChild(overlay);
      if (valeur) callback(valeur);
    }
  });
}

function supprimerProgramme(index) {
  const programmes = getProgrammes();
  const nom = programmes[index].nom;
  programmes.splice(index, 1);
  localStorage.setItem("programmes", JSON.stringify(programmes));
  showToast("🗑️ \"" + nom + "\" supprimé");
  renderSport();
}

function renommerProgramme(index) {
  const programmes = getProgrammes();
  afficherInput("Renommer le programme", "Nouveau nom...", programmes[index].nom, function(nouveau) {
    programmes[index].nom = nouveau;
    localStorage.setItem("programmes", JSON.stringify(programmes));
    showToast("✅ Renommé !");
    renderSport();
  });
}

function supprimerSeance(index) {
  const seances = getSeances();
  const nom = seances[index].nom;
  seances.splice(index, 1);
  localStorage.setItem("seances", JSON.stringify(seances));
  showToast("🗑️ \"" + nom + "\" supprimée");
  renderSport();
}

function renommerSeance(index) {
  const seances = getSeances();
  afficherInput("Renommer la séance", "Nouveau nom...", seances[index].nom, function(nouveau) {
    seances[index].nom = nouveau;
    localStorage.setItem("seances", JSON.stringify(seances));
    showToast("✅ Renommée !");
    renderSport();
  });
}

function voirDetailSeance(index) {
  const seance = getSeances()[index];
  if (!seance) return;
  const app = document.getElementById("app");
  app.innerHTML =
    '<div class="header">' +
      '<button onclick="renderSport()" style="background:rgba(255,255,255,0.15);border:none;color:white;padding:8px 16px;border-radius:20px;font-size:14px;cursor:pointer;margin-bottom:12px;">← Retour</button>' +
      '<div class="name" style="font-size:24px">' + seance.nom + '</div>' +
      '<div class="date">' + seance.date + ' · ' + (seance.duree || "--") + ' min</div>' +
    '</div>' +
    '<div class="card">' +
      '<div class="summary-grid">' +
        '<div class="summary-item"><div class="value">' + seance.exercices.length + '</div><div class="label">Exercices</div></div>' +
        '<div class="summary-item"><div class="value">' + getTotalSeriesSeance(seance) + '</div><div class="label">Séries</div></div>' +
        '<div class="summary-item"><div class="value">' + (seance.duree || "--") + '</div><div class="label">Minutes</div></div>' +
        '<div class="summary-item"><div class="value">' + getRPEMoyen(seance) + '</div><div class="label">RPE moyen</div></div>' +
      '</div>' +
    '</div>' +
    seance.exercices.map(function(ex) {
      return '<div class="card">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:8px">' +
          '<div style="font-size:15px;font-weight:700">' + ex.nom + '</div>' +
          '<div style="font-size:11px;background:rgba(124,106,247,0.3);padding:4px 10px;border-radius:10px">' + (ex.muscle || "") + '</div>' +
        '</div>' +
        ex.series.map(function(s, si) {
          return '<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.08);font-size:13px">' +
            'Série ' + (si+1) + ' : ' +
            (s.duree ? s.duree + 's' : s.reps + ' reps' + (s.poids ? ' · ' + s.poids + 'kg' : '')) +
            (s.rpe ? ' · RPE ' + s.rpe : '') +
          '</div>';
        }).join("") +
      '</div>';
    }).join("") +
    (seance.analyseIA ?
      '<div class="card">' +
        '<div class="word-title"><i data-lucide="brain"></i> Analyse IA</div>' +
        '<div style="font-size:14px;line-height:1.6;margin-top:8px">' + seance.analyseIA + '</div>' +
      '</div>' : ""
    ) +
    buildNav("sport");
  lucide.createIcons();
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
    return '<div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);cursor:pointer;user-select:none" ' +
      'onclick="lancerProgramme(' + i + ')" ' +
      'oncontextmenu="event.preventDefault();afficherMenuProgramme(' + i + ')" ' +
      'ontouchstart="startLongPress(\'programme\',' + i + ')" ' +
      'ontouchend="cancelLongPress()" ' +
      'ontouchmove="cancelLongPress()">' +
      '<div style="font-size:14px;font-weight:600">' + p.nom + '</div>' +
      '<div style="font-size:12px;opacity:0.6">' + p.jours.length + ' jours · ' + p.objectif + '</div>' +
    '</div>';
  }).join("");
}

async function genererProgrammeIA() {
  afficherInput("Quel est ton objectif ?", "Ex: prise de masse, remise en forme...", "", function(objectif) {
    afficherInput("Séances par semaine ?", "Ex: 3", "3", function(seances) {
      afficherInput("Ton niveau ?", "débutante, intermédiaire, avancée", "intermédiaire", function(niveau) {
        afficherInput("Quel matériel as-tu ?", "Ex: haltères, barre, poids du corps...", "", function(materiel) {
          afficherInput("Quels poids disponibles ?", "Ex: 5kg, 8kg, 10kg ou aucun", "", function(poids) {
            _lancerGenerationProgramme(objectif, seances, niveau, materiel, poids);
          });
        });
      });
    });
  });
}

async function _lancerGenerationProgramme(objectif, seances, niveau, materiel, poids) {
  showToast("✨ L'IA génère ton programme...");
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + KEYS.gemini, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: "Génère un programme de musculation en JSON uniquement, sans markdown. Format: {\"nom\":\"string\",\"objectif\":\"string\",\"materiel\":\"string\",\"poidsDisponibles\":\"string\",\"jours\":[{\"nom\":\"string\",\"exercices\":[{\"nom\":\"string\",\"muscle\":\"string\",\"secondaires\":\"string\",\"series\":3,\"repetitions\":\"10-12\",\"repos\":90,\"poidsSuggere\":\"string\",\"conseils\":\"string\"}]}]}. Objectif: " + objectif + ", " + seances + " séances/semaine, niveau " + niveau + ", matériel: " + materiel + ", poids disponibles: " + poids + ". Adapte TOUS les exercices au matériel disponible. Réponds UNIQUEMENT avec le JSON." }]
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
  afficherInput("Nom de l'exercice", "Ex: Planche, Squat...", "", function(nom) {
    afficherInput("Muscle ciblé", "Ex: Abdominaux, Jambes...", "", function(muscle) {
      seanceEnCours.exercices.push({ nom: nom, muscle: muscle, series: [] });
      renderSeanceActive();
    });
  });
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

    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + KEYS.gemini, {
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
        '<button onclick="ajouterSport()" style="width:100%;background:linear-gradient(135deg,#7c6af7,#f953c6);border:none;color:white;padding:16px;border-radius:16px;font-size:15px;font-weight:700;cursor:pointer;">Retour au dashboard</button>' +
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

function ajouterSport() {
  afficherInput("Ajouter un sport", "Ex: Yoga, Natation, Vélo...", "", function(nom) {
    showToast("🏃 " + nom + " ajouté !");
  });
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
  const idees = JSON.parse(localStorage.getItem("idees_creatives") || "[]");

  app.innerHTML =
    '<div class="header">' +
      '<div class="greeting">Espace</div>' +
      '<div class="name">Créatif 🎨</div>' +
    '</div>' +

    '<div class="card">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
        '<div class="word-title" style="margin:0"><i data-lucide="layers"></i> Mes pratiques</div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        pratiquCard("🖌️", "Peinture", "peinture") +
        pratiquCard("💧", "Aquarelle", "aquarelle") +
        pratiquCard("🏺", "Argile", "argile") +
        pratiquCard("💍", "Bijoux", "bijoux") +
        getPratiquesPerso().map(function(p) { return pratiquCard(p.emoji, p.nom, p.id); }).join("") +
        '<div onclick="ajouterPratique()" style="background:rgba(255,255,255,0.08);border:1px dashed rgba(255,255,255,0.3);border-radius:16px;padding:16px;text-align:center;cursor:pointer;">' +
          '<div style="font-size:24px;margin-bottom:4px">+</div>' +
          '<div style="font-size:12px;opacity:0.6">Ajouter</div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px">' +
      actionCard("pencil", "Croquis rapide", "renderCroquis()") +
      actionCard("droplets", "Palettes", "renderPalettes()") +
      actionCard("image", "Moodboard", "renderMoodboard()") +
      actionCard("sparkles", "Idée IA", "genererIdeeCreativeIA()") +
    '</div>' +

    '<div class="card" style="cursor:pointer" onclick="window.open(\'https://pinterest.com/solenelebaudy177/\',\'_blank\')">' +
      '<div style="display:flex;align-items:center;gap:12px">' +
        '<div style="background:#e60023;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">📌</div>' +
        '<div>' +
          '<div style="font-size:15px;font-weight:600">Mes tableaux Pinterest</div>' +
          '<div style="font-size:12px;opacity:0.6">Ouvrir mes inspirations →</div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="card">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
        '<div class="word-title" style="margin:0"><i data-lucide="lightbulb"></i> Idées récentes</div>' +
        '<button onclick="ajouterIdeeCreative()" style="background:rgba(255,255,255,0.15);border:none;color:white;padding:6px 12px;border-radius:12px;font-size:12px;cursor:pointer;">+ Idée</button>' +
      '</div>' +
      (idees.length === 0 ?
        '<div style="opacity:0.6;font-size:14px">Aucune idée pour l\'instant 🎨</div>' :
        idees.slice(0, 3).map(function(id, i) {
          return '<div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);cursor:pointer;user-select:none" ' +
            'oncontextmenu="event.preventDefault();afficherMenuIdee(' + i + ')" ' +
            'ontouchstart="startLongPress(\'idee\',' + i + ')" ' +
            'ontouchend="cancelLongPress()" ' +
            'ontouchmove="cancelLongPress()">' +
            '<div style="font-size:14px">' + id.texte + '</div>' +
            '<div style="font-size:11px;opacity:0.5;margin-top:2px">' + id.date + (id.pratique ? ' · ' + id.pratique : '') + '</div>' +
          '</div>';
        }).join("")
      ) +
    '</div>' +

    buildNav("creatif");
  lucide.createIcons();
}

function pratiquCard(emoji, nom, id) {
  return '<div onclick="renderPratique(\'' + id + '\',\'' + nom + '\',\'' + emoji + '\')" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);border-radius:16px;padding:16px;text-align:center;cursor:pointer;">' +
    '<div style="font-size:28px;margin-bottom:6px">' + emoji + '</div>' +
    '<div style="font-size:13px;font-weight:600">' + nom + '</div>' +
  '</div>';
}

function actionCard(icon, label, fn) {
  return '<div onclick="' + fn + '" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);border-radius:16px;padding:16px;text-align:center;cursor:pointer;">' +
    '<i data-lucide="' + icon + '" style="width:28px;height:28px;margin-bottom:6px"></i>' +
    '<div style="font-size:13px;font-weight:600">' + label + '</div>' +
  '</div>';
}

function getPratiquesPerso() {
  return JSON.parse(localStorage.getItem("pratiques_perso") || "[]");
}

function ajouterPratique() {
  afficherInput("Nouvelle pratique", "Ex: Broderie, Sculpture...", "", function(nom) {
    afficherInput("Emoji pour " + nom, "Ex: 🧵", "🎨", function(emoji) {
      const pratiques = getPratiquesPerso();
      const id = "pratique_" + Date.now();
      pratiques.push({ nom: nom, emoji: emoji, id: id });
      localStorage.setItem("pratiques_perso", JSON.stringify(pratiques));
      showToast(emoji + " " + nom + " ajouté !");
      renderCreatif();
    });
  });
}

function ajouterIdeeCreative() {
  afficherInput("Nouvelle idée créative", "Décris ton idée...", "", function(idee) {
    const idees = JSON.parse(localStorage.getItem("idees_creatives") || "[]");
    idees.unshift({ texte: idee, date: new Date().toLocaleDateString("fr-FR"), pratique: "" });
    localStorage.setItem("idees_creatives", JSON.stringify(idees));
    showToast("💡 Idée sauvegardée !");
    renderCreatif();
  });
}

function afficherMenuIdee(index) {
  const idees = JSON.parse(localStorage.getItem("idees_creatives") || "[]");
  afficherMenuContextuel(idees[index].texte, [
    { label: "🗑️ Supprimer", action: function() {
      idees.splice(index, 1);
      localStorage.setItem("idees_creatives", JSON.stringify(idees));
      showToast("🗑️ Idée supprimée");
      renderCreatif();
    }, danger: true }
  ]);
}

async function genererIdeeCreativeIA() {
  showToast("✨ L'IA cherche l'inspiration...");
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + KEYS.gemini, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Génère une idée créative originale et inspirante pour Solène qui pratique la peinture, l'aquarelle, l'argile et la bijouterie. Réponds avec UNE seule idée courte et concrète en français, sans introduction ni explication." }] }]
      })
    });
    const data = await res.json();
    const idee = data.candidates[0].content.parts[0].text.trim();
    afficherMenuContextuel("💡 " + idee, [
      { label: "💾 Sauvegarder cette idée", action: function() {
        const idees = JSON.parse(localStorage.getItem("idees_creatives") || "[]");
        idees.unshift({ texte: idee, date: new Date().toLocaleDateString("fr-FR"), pratique: "IA" });
        localStorage.setItem("idees_creatives", JSON.stringify(idees));
        showToast("💡 Idée sauvegardée !");
        renderCreatif();
      }},
      { label: "🔄 Nouvelle idée", action: function() { genererIdeeCreativeIA(); } }
    ]);
  } catch(e) {
    showToast("❌ Erreur, réessaie !");
  }
}

function renderPratique(id, nom, emoji) {
  currentPage = "creatif";
  const app = document.getElementById("app");
  const key = "projets_creatifs_" + id;
  const projets = JSON.parse(localStorage.getItem(key) || "[]");

  app.innerHTML =
    '<div class="header">' +
      '<button onclick="renderCreatif()" style="background:rgba(255,255,255,0.15);border:none;color:white;padding:8px 16px;border-radius:20px;font-size:14px;cursor:pointer;margin-bottom:12px;">← Retour</button>' +
      '<div class="name" style="font-size:28px">' + emoji + ' ' + nom + '</div>' +
    '</div>' +

    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px">' +
      '<button onclick="ajouterProjetCreatif(\'' + id + '\',\'' + nom + '\',\'' + emoji + '\')" style="background:linear-gradient(135deg,#7c6af7,#f953c6);border:none;color:white;padding:14px;border-radius:16px;font-size:14px;font-weight:600;cursor:pointer;">+ Projet</button>' +
      '<button onclick="genererIdeeIA(\'' + nom + '\')" style="background:rgba(255,255,255,0.15);border:none;color:white;padding:14px;border-radius:16px;font-size:14px;cursor:pointer;">✨ Idée IA</button>' +
    '</div>' +

    '<div class="card">' +
      '<div class="word-title"><i data-lucide="folder"></i> Mes projets</div>' +
      (projets.length === 0 ?
        '<div style="opacity:0.6;font-size:14px;margin-top:8px">Aucun projet — commence quelque chose ! 🎨</div>' :
        projets.map(function(p, i) {
          return '<div style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.1);cursor:pointer;user-select:none" ' +
            'oncontextmenu="event.preventDefault();afficherMenuProjetCreatif(\'' + id + '\',' + i + ',\'' + nom + '\',\'' + emoji + '\')" ' +
            'ontouchstart="startLongPress(\'projetcreatif_' + id + '\',' + i + ')" ' +
            'ontouchend="cancelLongPress()" ' +
            'ontouchmove="cancelLongPress()">' +
            '<div style="display:flex;justify-content:space-between;align-items:center">' +
              '<div style="font-size:14px;font-weight:600">' + p.nom + '</div>' +
              '<div style="font-size:11px;padding:3px 10px;border-radius:10px;background:' + statutCouleur(p.statut) + '">' + (p.statut || "idée") + '</div>' +
            '</div>' +
            (p.description ? '<div style="font-size:12px;opacity:0.6;margin-top:3px">' + p.description + '</div>' : '') +
          '</div>';
        }).join("")
      ) +
    '</div>' +

    buildNav("creatif");
  lucide.createIcons();
}

function statutCouleur(statut) {
  if (statut === "en cours") return "rgba(255,200,0,0.3)";
  if (statut === "terminé") return "rgba(100,200,100,0.3)";
  return "rgba(255,255,255,0.15)";
}

function ajouterProjetCreatif(pratId, nom, emoji) {
  afficherInput("Nom du projet", "Ex: Portrait au fusain...", "", function(nomProjet) {
    afficherInput("Description (optionnel)", "Une courte description...", "", function(desc) {
      const key = "projets_creatifs_" + pratId;
      const projets = JSON.parse(localStorage.getItem(key) || "[]");
      projets.unshift({ nom: nomProjet, description: desc, statut: "idée", date: new Date().toLocaleDateString("fr-FR") });
      localStorage.setItem(key, JSON.stringify(projets));
      showToast("🎨 Projet ajouté !");
      renderPratique(pratId, nom, emoji);
    });
  });
}

function afficherMenuProjetCreatif(pratId, index, nom, emoji) {
  const key = "projets_creatifs_" + pratId;
  const projets = JSON.parse(localStorage.getItem(key) || "[]");
  const projet = projets[index];
  afficherMenuContextuel(projet.nom, [
    { label: "💡 Marquer comme idée", action: function() { changerStatutProjet(pratId, index, "idée", nom, emoji); } },
    { label: "⚡ En cours", action: function() { changerStatutProjet(pratId, index, "en cours", nom, emoji); } },
    { label: "✅ Terminé", action: function() { changerStatutProjet(pratId, index, "terminé", nom, emoji); } },
    { label: "🗑️ Supprimer", action: function() { supprimerProjetCreatif(pratId, index, nom, emoji); }, danger: true }
  ]);
}

function changerStatutProjet(pratId, index, statut, nom, emoji) {
  const key = "projets_creatifs_" + pratId;
  const projets = JSON.parse(localStorage.getItem(key) || "[]");
  projets[index].statut = statut;
  localStorage.setItem(key, JSON.stringify(projets));
  renderPratique(pratId, nom, emoji);
}

function supprimerProjetCreatif(pratId, index, nom, emoji) {
  const key = "projets_creatifs_" + pratId;
  const projets = JSON.parse(localStorage.getItem(key) || "[]");
  projets.splice(index, 1);
  localStorage.setItem(key, JSON.stringify(projets));
  showToast("🗑️ Projet supprimé");
  renderPratique(pratId, nom, emoji);
}

async function genererIdeeIA(pratique) {
  showToast("✨ L'IA s'inspire...");
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + KEYS.gemini, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Génère une idée créative originale pour un projet de " + pratique + ". Réponds avec UNE seule idée courte et concrète en français, sans introduction." }] }]
      })
    });
    const data = await res.json();
    const idee = data.candidates[0].content.parts[0].text.trim();
    afficherMenuContextuel("💡 Idée pour " + pratique, [
      { label: "💾 Sauvegarder", action: function() {
        const idees = JSON.parse(localStorage.getItem("idees_creatives") || "[]");
        idees.unshift({ texte: idee, date: new Date().toLocaleDateString("fr-FR"), pratique: pratique });
        localStorage.setItem("idees_creatives", JSON.stringify(idees));
        showToast("💡 Idée sauvegardée !");
      }},
      { label: "🔄 Autre idée", action: function() { genererIdeeIA(pratique); } }
    ]);
  } catch(e) {
    showToast("❌ Erreur, réessaie !");
  }
}

function palettePreview() {
const couleurs = genererPalette();
return couleurs.map(function(c) {
return '<div style="flex:1;height:36px;border-radius:8px;background:' + c + '"></div>';
}).join("");
}

function genererPalette() {
  const modes = ["analogique", "complementaire", "triadique", "pastel", "sombre", "nature"];
  const mode = modes[Math.floor(Math.random() * modes.length)];
  const h = Math.floor(Math.random() * 360);

  function hsl(hue, sat, light) {
    hue = ((hue % 360) + 360) % 360;
    return "hsl(" + hue + "," + sat + "%," + light + "%)";
  }

  switch(mode) {
    case "analogique":
      return [
        hsl(h, 70, 45),
        hsl(h + 20, 65, 55),
        hsl(h + 40, 60, 65),
        hsl(h + 60, 55, 72),
        hsl(h + 80, 50, 80)
      ];
    case "complementaire":
      return [
        hsl(h, 75, 35),
        hsl(h, 65, 50),
        hsl(h, 45, 70),
        hsl(h + 180, 65, 50),
        hsl(h + 180, 75, 35)
      ];
    case "triadique":
      return [
        hsl(h, 70, 45),
        hsl(h, 50, 70),
        hsl(h + 120, 70, 45),
        hsl(h + 240, 70, 45),
        hsl(h + 240, 50, 70)
      ];
    case "pastel":
      return [
        hsl(h, 40, 80),
        hsl(h + 30, 35, 83),
        hsl(h + 60, 38, 86),
        hsl(h + 90, 32, 88),
        hsl(h + 120, 36, 85)
      ];
    case "sombre":
      return [
        hsl(h, 60, 15),
        hsl(h + 20, 55, 22),
        hsl(h + 40, 50, 30),
        hsl(h + 60, 45, 38),
        hsl(h + 80, 40, 45)
      ];
    case "nature":
      const bases = [
        [120, 45, 35], [30, 60, 40], [200, 40, 35],
        [45, 55, 45], [160, 35, 40]
      ];
      const base = bases[Math.floor(Math.random() * bases.length)];
      return [
        hsl(base[0], base[1], base[2]),
        hsl(base[0] + 15, base[1] - 10, base[2] + 15),
        hsl(base[0] - 10, base[1] + 5, base[2] + 25),
        hsl(base[0] + 25, base[1] - 15, base[2] + 35),
        hsl(base[0] - 20, base[1] - 20, base[2] + 45)
      ];
    default:
      return [
        hsl(h, 70, 45),
        hsl(h + 30, 65, 55),
        hsl(h + 60, 60, 65),
        hsl(h + 90, 55, 72),
        hsl(h + 120, 50, 80)
      ];
  }
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

function renderMoodboard() {
  currentPage = "creatif";
  const app = document.getElementById("app");
  const items = JSON.parse(localStorage.getItem("moodboard") || "[]");

  app.innerHTML =
    '<div class="header">' +
      '<button onclick="renderCreatif()" style="background:rgba(255,255,255,0.15);border:none;color:white;padding:8px 16px;border-radius:20px;font-size:14px;cursor:pointer;margin-bottom:12px;">← Retour</button>' +
      '<div class="name" style="font-size:28px">Moodboard 🖼️</div>' +
      '<div class="date">' + items.length + ' éléments</div>' +
    '</div>' +

    '<div style="display:flex;gap:8px;padding:0 16px 8px;overflow-x:auto">' +
      '<button onclick="ajouterLienMoodboard()" style="flex:1;background:rgba(255,255,255,0.15);border:none;color:white;padding:12px;border-radius:14px;font-size:13px;cursor:pointer;white-space:nowrap;">🔗 Lien</button>' +
      '<button onclick="ajouterNoteMoodboard()" style="flex:1;background:rgba(255,255,255,0.15);border:none;color:white;padding:12px;border-radius:14px;font-size:13px;cursor:pointer;white-space:nowrap;">📝 Note</button>' +
      '<button onclick="ajouterImageMoodboard()" style="flex:1;background:rgba(255,255,255,0.15);border:none;color:white;padding:12px;border-radius:14px;font-size:13px;cursor:pointer;white-space:nowrap;">📷 Photo</button>' +
      '<button onclick="ajouterCroquisDepuisMoodboard()" style="flex:1;background:rgba(255,255,255,0.15);border:none;color:white;padding:12px;border-radius:14px;font-size:13px;cursor:pointer;white-space:nowrap;">✏️ Croquis</button>' +
    '</div>' +

    (items.length === 0 ?
      '<div class="card" style="text-align:center;padding:40px;opacity:0.6">Ajoute des liens, photos et notes pour créer ton moodboard 🎨</div>' :
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px">' +
        items.map(function(item, i) {
          return '<div style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);border-radius:16px;overflow:hidden;cursor:pointer;user-select:none" ' +
            'oncontextmenu="event.preventDefault();supprimerMoodboardItem(' + i + ')" ' +
            'ontouchstart="startLongPress(\'moodboard\',' + i + ')" ' +
            'ontouchend="cancelLongPress()" ' +
            'ontouchmove="cancelLongPress()" ' +
            (item.url ? 'onclick="window.open(\'' + item.url + '\',\'_blank\')"' : '') + '>' +
            (item.image ?
              '<img src="' + item.image + '" style="width:100%;height:100px;object-fit:cover;display:block;background:white" />' : '') +
            '<div style="padding:10px">' +
              '<div style="font-size:16px;margin-bottom:4px">' + (item.type === "lien" ? "🔗" : item.type === "image" ? "🖼️" : item.type === "croquis" ? "✏️" : "📝") + '</div>' +
              '<div style="font-size:12px;line-height:1.4;opacity:0.9">' + item.texte + '</div>' +
            '</div>' +
          '</div>';
        }).join("") +
      '</div>'
    ) +
    '<div style="height:20px"></div>' +
    buildNav("creatif");
  lucide.createIcons();
}

function ajouterLienMoodboard() {
  afficherInput("Lien Pinterest ou autre", "https://pinterest.com/...", "", function(url) {
    afficherInput("Description", "Ex: Palette automnale...", "", function(desc) {
      const items = JSON.parse(localStorage.getItem("moodboard") || "[]");
      items.unshift({ type: "lien", texte: desc, url: url });
      localStorage.setItem("moodboard", JSON.stringify(items));
      showToast("🔗 Lien ajouté !");
      renderMoodboard();
    });
  });
}

function ajouterNoteMoodboard() {
  afficherInput("Note d'inspiration", "Une couleur, une texture, une idée...", "", function(note) {
    const items = JSON.parse(localStorage.getItem("moodboard") || "[]");
    items.unshift({ type: "note", texte: note });
    localStorage.setItem("moodboard", JSON.stringify(items));
    showToast("📝 Note ajoutée !");
    renderMoodboard();
  });
}

function ajouterImageMoodboard() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      afficherInput("Description de l'image", "Ex: Inspiration couleurs...", "", function(desc) {
        const items = JSON.parse(localStorage.getItem("moodboard") || "[]");
        items.unshift({ type: "image", texte: desc, image: ev.target.result });
        localStorage.setItem("moodboard", JSON.stringify(items));
        showToast("🖼️ Image ajoutée !");
        renderMoodboard();
      });
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function ajouterCroquisDepuisMoodboard() {
  afficherMenuContextuel("Ajouter un croquis", [
    { label: "✏️ Nouveau croquis", action: function() { renderCroquis(); } },
    { label: "📚 Depuis la bibliothèque", action: function() { renderBiblioCroquis("moodboard"); } }
  ]);
}

function supprimerMoodboardItem(index) {
  afficherMenuContextuel("Supprimer cet élément ?", [
    { label: "🗑️ Supprimer", action: function() {
      const items = JSON.parse(localStorage.getItem("moodboard") || "[]");
      items.splice(index, 1);
      localStorage.setItem("moodboard", JSON.stringify(items));
      showToast("🗑️ Supprimé");
      renderMoodboard();
    }, danger: true }
  ]);
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
const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + KEYS.gemini, {
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

const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + KEYS.gemini, {
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