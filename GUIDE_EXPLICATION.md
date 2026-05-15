# Guide d'Explication du Projet - Event Finder

## 📋 Vue d'ensemble du projet

**Event Finder** est une application web qui permet de rechercher et gérer des événements (concerts, festivals, sports) via l'API Ticketmaster.

### Technologies utilisées
- **HTML5** : Structure de la page
- **CSS3** : Styles et animations
- **JavaScript ES6** : Logique de l'application
- **API REST** : Ticketmaster Discovery API
- **Leaflet.js** : Carte interactive
- **localStorage & sessionStorage** : Stockage des données

---

## 🏗️ Architecture du projet

```
projetfront/
├── index.html          # Page principale
├── css/
│   └── style.css       # Styles de l'application
└── js/
    ├── app.js          # Point d'entrée et orchestration
    ├── api.js          # Communication avec l'API Ticketmaster
    ├── ui.js           # Gestion de l'interface utilisateur
    ├── storage.js      # Gestion du stockage local
    ├── modal.js        # Gestion de la modale de détails
    ├── countdown.js    # Compte à rebours pour les événements
    └── map.js          # Carte interactive avec Leaflet
```

---

## 📚 Explication détaillée par fichier

### 1. **app.js** - Le chef d'orchestre

**Rôle** : Initialise l'application et coordonne tous les modules.

**Classe principale** : `App`

**Propriétés importantes** :
- `page` : Numéro de page actuel (pagination)
- `totalPages` : Nombre total de pages disponibles
- `lastQuery` : Dernière recherche effectuée

**Méthodes clés** :

```javascript
init()                  // Initialise l'application au chargement
applyTheme()           // Applique le thème (clair/sombre)
setupEventListeners()  // Configure tous les écouteurs d'événements
handleSearch()         // Gère la recherche d'événements
loadMore()             // Charge plus d'événements (pagination)
```

**Points à expliquer** :
- ✅ **Manipulation du DOM** : `document.getElementById()`, `querySelector()`
- ✅ **Gestion des événements** : `addEventListener()` sur les boutons et inputs
- ✅ **Asynchrone** : `async/await` pour les appels API
- ✅ **Modularité** : Séparation des responsabilités entre modules

---

### 2. **api.js** - Communication avec l'API

**Rôle** : Gère toutes les communications avec l'API Ticketmaster.

**Méthodes principales** :

```javascript
searchEvents(params)    // Recherche des événements avec filtres
getEvent(id)           // Récupère un événement spécifique
getFeaturedEvents()    // Récupère les événements en vedette
transformEvent(raw)    // Transforme les données brutes en format simplifié
isCoordValid(lat, lng) // Valide les coordonnées GPS
```

**Points à expliquer** :
- ✅ **fetch()** : Appels HTTP vers l'API REST
- ✅ **Promises** : Gestion asynchrone avec `async/await`
- ✅ **URLSearchParams** : Construction des paramètres d'URL
- ✅ **Validation des données** : Vérification des coordonnées GPS
- ✅ **Transformation des données** : Extraction et formatage des données JSON

**Exemple de flux** :
```
1. Utilisateur clique sur "Search"
2. app.js appelle API.searchEvents()
3. fetch() envoie la requête HTTP
4. API retourne les données JSON
5. transformEvent() formate chaque événement
6. Les données sont retournées à app.js
```

---

### 3. **storage.js** - Gestion du stockage

**Rôle** : Gère le stockage des données dans le navigateur.

**Deux types de stockage** :
- **localStorage** : Données persistantes (favoris, thème)
- **sessionStorage** : Données temporaires (planning, recherche)

**Méthodes par catégorie** :

**Favoris (localStorage)** :
```javascript
getFavorites()          // Récupère tous les favoris
addFavorite(event)      // Ajoute un événement aux favoris
removeFavorite(id)      // Supprime un favori
isFavorite(id)          // Vérifie si un événement est favori
```

**Planning (sessionStorage)** :
```javascript
getSchedule()           // Récupère le planning
addToSchedule(event)    // Ajoute au planning
removeFromSchedule(id)  // Supprime du planning
isScheduled(id)         // Vérifie si un événement est planifié
```

**Points à expliquer** :
- ✅ **Web Storage API** : localStorage vs sessionStorage
- ✅ **JSON.parse() / JSON.stringify()** : Sérialisation des données
- ✅ **Gestion des erreurs** : try/catch pour éviter les crashs
- ✅ **Structures de données** : Tableaux d'objets JavaScript

**Différence localStorage vs sessionStorage** :
- localStorage : Persiste même après fermeture du navigateur
- sessionStorage : Supprimé à la fermeture de l'onglet

---

### 4. **ui.js** - Interface utilisateur

**Rôle** : Gère l'affichage et la création des éléments visuels.

**Méthodes principales** :

```javascript
createEventCard(event)      // Crée une carte d'événement
renderEvents(events, id)    // Affiche une liste d'événements
renderFavorites()           // Affiche les favoris
renderSchedule()            // Affiche le planning
showToast(message, type)    // Affiche une notification
formatDate(date, time)      // Formate les dates
updateStats()               // Met à jour les statistiques
```

**Points à expliquer** :
- ✅ **Manipulation du DOM** : `createElement()`, `appendChild()`, `innerHTML`
- ✅ **Gestion des événements** : Écouteurs sur les boutons dynamiques
- ✅ **Template strings** : Utilisation des backticks pour le HTML
- ✅ **Formatage des dates** : `toLocaleDateString()`, `toLocaleTimeString()`
- ✅ **Conditions** : Affichage conditionnel selon l'état

**Exemple de création d'une carte** :
```javascript
1. createEventCard() crée un élément <div>
2. Ajoute le HTML avec innerHTML (image, titre, infos)
3. Attache les écouteurs d'événements (boutons)
4. Retourne l'élément créé
5. L'élément est ajouté au DOM par appendChild()
```

---

### 5. **modal.js** - Fenêtre de détails

**Rôle** : Gère la modale (popup) qui affiche les détails d'un événement.

**Méthodes** :

```javascript
init()              // Initialise la modale et ses écouteurs
show(eventId)       // Affiche la modale avec un événement
render(event)       // Génère le contenu de la modale
close()             // Ferme la modale
```

**Points à expliquer** :
- ✅ **Gestion asynchrone** : Chargement des données avec async/await
- ✅ **Manipulation du DOM** : Affichage/masquage avec classes CSS
- ✅ **Gestion des événements** : Fermeture au clic sur le fond
- ✅ **Intégration** : Utilise Countdown pour le compte à rebours

---

### 6. **countdown.js** - Compte à rebours

**Rôle** : Calcule et affiche le temps restant avant un événement.

**Méthodes** :

```javascript
calculate(targetDate)       // Calcule le temps restant
render(targetDate, id)      // Affiche le compte à rebours
```

**Points à expliquer** :
- ✅ **Date et temps** : Manipulation avec `new Date()`
- ✅ **Calculs mathématiques** : Conversion millisecondes → jours/heures/minutes
- ✅ **setInterval()** : Mise à jour toutes les secondes
- ✅ **Gestion de la mémoire** : clearInterval() pour éviter les fuites

**Logique du calcul** :
```javascript
1. Récupère la date actuelle (now)
2. Récupère la date cible (target)
3. Calcule la différence en millisecondes
4. Convertit en jours, heures, minutes, secondes
5. Met à jour l'affichage chaque seconde
```

---

### 7. **map.js** - Carte interactive

**Rôle** : Affiche les événements sur une carte interactive avec Leaflet.

**Méthodes** :

```javascript
init()                  // Initialise la carte Leaflet
clearMarkers()          // Supprime tous les marqueurs
plotEvents(events)      // Affiche les événements sur la carte
loadAndPlot(query)      // Charge et affiche les événements
```

**Points à expliquer** :
- ✅ **API externe** : Utilisation de Leaflet.js
- ✅ **Géolocalisation** : Utilisation de latitude/longitude
- ✅ **Promise.all()** : Chargement parallèle de plusieurs pages
- ✅ **Filtrage de données** : Suppression des doublons avec Set
- ✅ **Manipulation du DOM** : Création de marqueurs personnalisés

**Flux de données** :
```
1. loadAndPlot() charge 4 pages d'événements en parallèle
2. Supprime les doublons avec Set
3. Transforme les données avec API.transformEvent()
4. Filtre les événements avec coordonnées valides
5. Crée un marqueur pour chaque événement
6. Ajuste la vue pour afficher tous les marqueurs
```

---

## 🎯 Concepts JavaScript importants

### 1. Manipulation du DOM
```javascript
// Sélection d'éléments
document.getElementById('id')
document.querySelector('.class')

// Création d'éléments
const div = document.createElement('div')
div.innerHTML = '<p>Contenu</p>'
container.appendChild(div)
```

### 2. Gestion des événements
```javascript
button.addEventListener('click', () => {
    console.log('Bouton cliqué')
})

input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        // Action
    }
})
```

### 3. Asynchrone (Promises, async/await)
```javascript
// Avec async/await
async function loadData() {
    try {
        const response = await fetch(url)
        const data = await response.json()
        return data
    } catch (error) {
        console.error(error)
    }
}

// Promise.all pour paralléliser
const results = await Promise.all([
    fetch(url1),
    fetch(url2),
    fetch(url3)
])
```

### 4. Structures de données
```javascript
// Tableaux
const events = []
events.push(event)              // Ajouter
events.filter(e => e.id !== id) // Filtrer
events.map(e => transform(e))   // Transformer
events.some(e => e.id === id)   // Vérifier existence

// Objets
const event = {
    id: '123',
    name: 'Concert',
    date: '2024-12-31'
}

// Set (pour les doublons)
const seen = new Set()
seen.add(id)
seen.has(id) // true/false
```

### 5. Web Storage
```javascript
// localStorage (persistant)
localStorage.setItem('key', JSON.stringify(data))
const data = JSON.parse(localStorage.getItem('key'))

// sessionStorage (temporaire)
sessionStorage.setItem('key', JSON.stringify(data))
const data = JSON.parse(sessionStorage.getItem('key'))
```

### 6. Fetch et API REST
```javascript
// GET request
const response = await fetch(url)
const data = await response.json()

// Avec paramètres
const params = new URLSearchParams({
    keyword: 'music',
    city: 'Paris'
})
const url = `${baseUrl}?${params}`
```

---

## 🔄 Flux de l'application

### Au chargement de la page :
```
1. DOMContentLoaded déclenche new App()
2. App.init() initialise tous les modules
3. Charge les événements par défaut (musique)
4. Restaure la session (dernière recherche)
5. Met à jour les statistiques
```

### Lors d'une recherche :
```
1. Utilisateur entre des critères et clique "Search"
2. handleSearch() récupère les valeurs des inputs
3. API.searchEvents() appelle l'API Ticketmaster
4. Les données sont transformées par transformEvent()
5. UI.renderEvents() affiche les cartes d'événements
6. EventMap.loadAndPlot() affiche sur la carte
7. La recherche est sauvegardée dans sessionStorage
```

### Ajout aux favoris :
```
1. Utilisateur clique sur le bouton ❤️
2. L'écouteur d'événement est déclenché
3. Storage.addFavorite() ajoute dans localStorage
4. UI.updateStats() met à jour le compteur
5. UI.renderFavorites() rafraîchit la section favoris
6. UI.showToast() affiche une notification
```

---

## ✅ Points forts à mentionner

1. **Modularité** : Code organisé en modules séparés
2. **Asynchrone** : Utilisation correcte de async/await
3. **Validation** : Contrôle des données (coordonnées, dates)
4. **Stockage** : Utilisation appropriée de localStorage et sessionStorage
5. **API REST** : Communication avec service externe (Ticketmaster)
6. **UX** : Notifications, loading spinners, gestion des erreurs
7. **Performance** : Chargement parallèle avec Promise.all()
8. **Responsive** : Menu mobile, design adaptatif

---

## 🎤 Questions probables et réponses

### Q: Quelle est la différence entre localStorage et sessionStorage ?
**R:** localStorage persiste même après fermeture du navigateur, tandis que sessionStorage est supprimé à la fermeture de l'onglet. J'utilise localStorage pour les favoris (données importantes) et sessionStorage pour le planning temporaire.

### Q: Comment gérez-vous l'asynchrone ?
**R:** J'utilise async/await pour rendre le code plus lisible. Par exemple, dans handleSearch(), j'attends la réponse de l'API avec await avant d'afficher les résultats.

### Q: Comment évitez-vous les doublons sur la carte ?
**R:** J'utilise un Set pour stocker les IDs déjà vus. Le Set ne permet pas de doublons, donc je filtre les événements en vérifiant si leur ID est déjà dans le Set.

### Q: Comment validez-vous les données de l'API ?
**R:** Dans transformEvent(), je vérifie que les coordonnées GPS sont valides (non nulles, dans les limites -90/90 et -180/180). Si invalides, je mets lat/lng à null.

### Q: Expliquez le système de pagination
**R:** Je garde en mémoire la page actuelle (this.page) et le total de pages. Quand l'utilisateur clique "Load More", j'incrémente la page et j'appelle l'API avec le nouveau numéro de page, puis j'ajoute les résultats aux événements existants.

---

## 💡 Conseils pour la présentation

1. **Commencez par la vue d'ensemble** : Expliquez le but du projet
2. **Montrez l'architecture** : Expliquez la séparation des fichiers
3. **Démontrez les fonctionnalités** : Recherche, favoris, carte
4. **Expliquez un flux complet** : De la recherche à l'affichage
5. **Montrez le code** : Prenez un exemple simple (ex: addFavorite)
6. **Soyez prêt pour les questions** : Relisez ce guide

**Bonne chance pour votre validation ! 🚀**
