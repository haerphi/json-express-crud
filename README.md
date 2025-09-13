# Express JSON Server

Ce projet est une API REST simple basée sur Express.js, permettant de manipuler des collections de données stockées dans des fichiers JSON. Il gère l’authentification, l’autorisation, l’upload de fichiers, et la persistance des données.

## Fonctionnalités

- CRUD sur les collections (Create, Read, Update, Delete)
- Authentification et autorisation par token
- Attribution d’un propriétaire à chaque ressource
- Upload de fichiers (images) associés à une ressource via Multer
- Persistance automatique dans les fichiers JSON (`data/db.json`, `data/auth.json`)

## Structure du projet

```
src/
	index.js                  // Point d’entrée du serveur Express
	factory/
		route-factory.js        // Générateur de routes CRUD + upload
		authentication-routes.js// Routes d’authentification
		authorize-factory.js    // Middleware d’autorisation
	json/
		save-db.js              // Sauvegarde des données
	middlewares/
		authenticate.js         // Middleware d’authentification
data/
	db.json                   // Données des collections
	auth.json                 // Utilisateurs et rôles
public/
	img/users/                // Dossier des images uploadées
```

## Installation

1. Clone le dépôt :

   ```sh
   git clone https://github.com/phil-bstorm/Express-json-server.git
   cd Express-json-server
   ```

2. Installe les dépendances :
   ```sh
   npm install
   ```

## Utilisation

1. Lance le serveur :

   ```sh
   npm start
   ```

   ou

   ```sh
   node src/index.js
   ```

2. Accède à l’API via `http://localhost:3000/`

### Endpoints principaux

- `POST /<collection>` : Créer une ressource
- `GET /<collection>` : Lister toutes les ressources
- `GET /<collection>/<id>` : Lire une ressource
- `PUT /<collection>/<id>` : Modifier une ressource
- `DELETE /<collection>/<id>` : Supprimer une ressource
- `POST /<collection>/<id>/upload` : Uploader une image pour une ressource (champ `file` dans le formulaire)

### Authentification

- Utilise un token JWT ou similaire (voir `middlewares/authenticate.js`)
- Les rôles et permissions sont définis dans `data/auth.json`

### Upload de fichiers

- Envoie une requête POST avec un champ `file` (type `multipart/form-data`) vers `/collection/:id/upload`
- Le fichier est sauvegardé dans `public/img/users/` et le chemin est associé à la ressource

## Personnalisation

- Modifie `data/db.json` pour ajouter ou éditer des collections
- Modifie `data/auth.json` pour gérer les utilisateurs et rôles

## Dépendances principales

- express
- multer

## Licence

MIT
