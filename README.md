# Express JSON Server

This project is a simple REST API based on Express.js, allowing you to manage collections of data stored in JSON files. It handles authentication, authorization, file uploads, and data persistence.

## Features

- CRUD operations on collections (Create, Read, Update, Delete)
- Authentication and authorization via token
- Ownership assignment for each resource
- File upload (images) associated with a resource using Multer
- Automatic persistence in JSON files (`data/db.json`, `data/auth.json`)

## Usage

1. Create a folder:

   ```sh
   npx json-express-crud
   ```

### Main Endpoints

- `POST /<collection>`: Create a resource
- `GET /<collection>`: List all resources
- `GET /<collection>/<id>`: Read a resource
- `PUT /<collection>/<id>`: Update a resource
- `DELETE /<collection>/<id>`: Delete a resource
- `POST /<collection>/<id>/upload`: Upload an image for a resource (field `file` in a `multipart/form-data` form)

### Authentication

- `POST /auth/login`: Authenticate with `email` and `password`
  - Returns a JWT token to use in the `Authorization` header
- `POST /auth/register`: Register a new user with `email`, `password`, and `role` (optional, default is `user`)
  Note: more user information can be added during registration

## Customization

- Edit `data/db.json` to add or modify collections
- Edit `data/auth.json` to manage users and roles

## Main Dependencies

- express
- multer

## License

MIT
