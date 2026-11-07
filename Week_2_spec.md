# Books API Week 02 Spec (`spec-week02.md`)

Below is the complete document containing **Version 1** (with Feature 2 completed to match the required level of detail), the **Evaluation & Analysis** covering bugs, security, efficiency, and clarity, and the final **Version 2 Implementation Checklist**.

---

## Version 1 Specification

```markdown
# Books API Week 02 Spec - Version 1

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the existing Week 01 book API so book documents include a reference to an author and the API supports all CRUD operations for books. Every book route must be documented and testable in Swagger.

### Data Model
Book documents will be stored in the `books` collection.

Required book fields:
- `id`: string, required, custom id such as `b1`
- `authorId`: string, required, references the `id` field of an author document
- `title`: string, required
- `publicationDate`: string, required

Books will continue to use custom string ids instead of MongoDB `_id` values for route parameters.

### Relationship to Authors
Each book will identify its author with an `authorId` field. The value of `authorId` must match the custom `id` value of an existing author document.

When creating or updating a book, the API should reject the request with a `400` status code if the submitted `authorId` does not match an existing author.

### Routes

#### GET /books
Purpose: Return all books.

Success:
- Status code: `200`
- Response body: an array of book objects

Errors:
- `500` if an unexpected server or database error occurs

#### GET /books/:id
Purpose: Return one book by its custom id.

Success:
- Status code: `200`
- Response body: the matching book object

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### POST /books
Purpose: Create a new book.

Request body:
```json
{
  "id": "b4",
  "authorId": "a1",
  "title": "Example Book Title",
  "publicationDate": "2026-01-15"
}

```

Success:

* Status code: `201`
* Response body: the newly created book object

Errors:

* `400` if a required field is missing
* `400` if the `id` already exists
* `400` if the `authorId` does not match an existing author
* `500` if an unexpected server or database error occurs

#### PUT /books/:id

Purpose: Update an existing book.

Request body:

```json
{
  "authorId": "a2",
  "title": "Updated Book Title",
  "publicationDate": "2026-02-20"
}

```

Success:

* Status code: `200`
* Response body: the updated book object

Errors:

* `400` if a required field is missing
* `400` if the `authorId` does not match an existing author
* `404` if no book exists with that id
* `500` if an unexpected server or database error occurs

#### DELETE /books/:id

Purpose: Delete an existing book.

Success:

* Status code: `204`
* Response body: none

Errors:

* `404` if no book exists with that id
* `500` if an unexpected server or database error occurs

### Swagger Documentation

Swagger must document every book route.

### Deployment Expectations

After implementation, the book routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every book route from the browser.

## Feature 2: Author CRUD Operations

### Goal

Add an authors collection and implement all CRUD operations for authors. Every author route must be documented and testable in Swagger.

### Data Model

Author documents will be stored in the `authors` collection.

Required author fields:

* `id`: string, required, custom id such as `a1`
* `firstName`: string, required
* `lastName`: string, required
* `birthYear`: number, required (e.g., 1965)

Authors will use custom string ids instead of MongoDB `_id` values for route parameters.

### Relationship to Books

Authors are referenced by books via the book's `authorId` field.

When deleting an author, the API must verify whether any book currently references that author's `id`. If one or more books still reference the author, the request must be rejected with a `400 Bad Request` status code to prevent orphaned records.

### Routes

#### GET /authors

Purpose: Return all authors.

Success:

* Status code: `200`
* Response body: an array of author objects

Errors:

* `500` if an unexpected server or database error occurs

#### GET /authors/:id

Purpose: Return one author by their custom id.

Success:

* Status code: `200`
* Response body: the matching author object

Errors:

* `404` if no author exists with that id
* `500` if an unexpected server or database error occurs

#### POST /authors

Purpose: Create a new author.

Request body:

```json
{
  "id": "a3",
  "firstName": "Mary",
  "lastName": "Shelley",
  "birthYear": 1797
}

```

Success:

* Status code: `201`
* Response body: the newly created author object

Errors:

* `400` if a required field is missing or invalid type (e.g., `birthYear` is not a number)
* `400` if the `id` already exists
* `500` if an unexpected server or database error occurs

#### PUT /authors/:id

Purpose: Update an existing author.

Request body:

```json
{
  "firstName": "Mary",
  "lastName": "Wollstonecraft Shelley",
  "birthYear": 1797
}

```

Success:

* Status code: `200`
* Response body: the updated author object

Errors:

* `400` if a required field is missing or invalid type
* `404` if no author exists with that id
* `500` if an unexpected server or database error occurs

#### DELETE /authors/:id

Purpose: Delete an existing author.

Success:

* Status code: `204`
* Response body: none

Errors:

* `400` if the author cannot be deleted because one or more books reference this `authorId`
* `404` if no author exists with that id
* `500` if an unexpected server or database error occurs

### Swagger Documentation

Swagger must document every author route.

### Deployment Expectations

After implementation, the author routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every author route from the browser.

```

---

## Evaluation of Version 1 Specification

### 1. Are there any bugs or short-sighted decisions?
* **Unvalidated Parameters:** `PUT /books/:id` allows changing `authorId`, but does not restrict changing the book's custom `id` in the body, which could cause body vs. route parameter mismatches.
* **Date Format Ambiguity:** `publicationDate` in books is listed as a string without specifying ISO 8601 formatting (`YYYY-MM-DD`).
* **Type Validation for `birthYear`:** `birthYear` is specified as a number, but does not enforce logical limits (e.g., must be a positive integer, not in the future).
* **Missing JSON Body Content-Type Handling:** Express middleware (`express.json()`) must be explicitly required for parsing request bodies; missing or malformed JSON payloads will throw unhandled server errors if not specified.

### 2. Are there any security considerations that are missing?
* **Input Sanitization & Injection:** No validation/sanitization is specified for user strings (`title`, `firstName`, `lastName`). Malicious HTML or scripts could lead to stored XSS if rendered in frontends.
* **CORS Settings:** Missing specification for Cross-Origin Resource Sharing (CORS) header configuration, which is required when accessing the API from browser environments or Swagger UI hosted on external domains.
* **Environment Variable Protection:** Database connection strings, credentials, and ports are not explicitly shielded via `.env` specifications.

### 3. Are there any efficiency concerns with the current endpoint design?
* **N+1 Fetching Problem:** `GET /books` returns raw `authorId` strings rather than option for population/embedding or side-loading author details, forcing client-side multi-fetching.
* **Unindexed Lookups:** Queries rely on custom `id` fields (`b1`, `a1`) rather than MongoDB's native `_id`. Without explicit unique indexes on `id` in both MongoDB collections, lookups require full collection scans ($O(N)$ execution time).

### 4. Are any response examples or error behaviors unclear?
* **Error Response Format:** Error responses specify HTTP status codes (`400`, `404`, `500`), but do not specify a standardized JSON error structure (e.g., `{ "error": "Author with ID 'a99' not found." }`).
* **Delete Dependent Response Body:** `204 No Content` must strictly return an empty body (no JSON).

---

## Version 2 Specification (Implementation Checklist)

```markdown
# Books API Week 02 Spec - Version 2 (Final Implementation Checklist)

## Global API Rules & Standards
- [ ] **Environment Setup:** All configuration (MongoDB URI, PORT) must be stored in `.env` and loaded via `dotenv`.
- [ ] **Body Parser Middleware:** `app.use(express.json())` must be registered before route execution.
- [ ] **CORS Middleware:** `cors()` middleware must be enabled to support cross-origin API and Swagger UI calls.
- [ ] **Standardized Error Format:** All error responses must return JSON in the format: `{ "message": "Detailed error explanation" }`.
- [ ] **Database Indexes:** Unique indexes must be created in MongoDB on `books.id` and `authors.id`.

---

## Feature 1: Book CRUD Operations and Author References

### Data Model Constraints
- Collection: `books`
- Schema Validation Rules:
  - `id`: String, required, unique custom key (e.g., `"b1"`). Immutable once created.
  - `authorId`: String, required, must exist in `authors.id`.
  - `title`: String, required, non-empty, trimmed.
  - `publicationDate`: String, required, ISO 8601 format (`YYYY-MM-DD`).

### Endpoints

#### 1. `GET /books`
- [ ] Query database for all documents in `books` collection.
- [ ] Exclude native `_id` and `__v` fields from output JSON if necessary, keeping custom `id`.
- [ ] Return status `200 OK` with JSON array of books.
- [ ] Return status `500 Internal Server Error` on database failure.

#### 2. `GET /books/:id`
- [ ] Extract `id` from route parameters.
- [ ] Query `books` collection for `id === req.params.id`.
- [ ] If found, return status `200 OK` with book object JSON.
- [ ] If not found, return status `404 Not Found` with `{ "message": "Book not found" }`.
- [ ] Return status `500 Internal Server Error` on database failure.

#### 3. `POST /books`
- [ ] Parse request body: `{ id, authorId, title, publicationDate }`.
- [ ] **Validation Steps:**
  - Check missing fields $\rightarrow$ return `400 Bad Request` with `{ "message": "Missing required fields: id, authorId, title, publicationDate" }`.
  - Validate `publicationDate` matches `YYYY-MM-DD` regex $\rightarrow$ return `400 Bad Request`.
  - Check existing book `id` in `books` collection $\rightarrow$ return `400 Bad Request` with `{ "message": "Book ID already exists" }`.
  - Check existing author `authorId` in `authors` collection $\rightarrow$ return `400 Bad Request` with `{ "message": "Referenced authorId does not exist" }`.
- [ ] Insert document into `books` collection.
- [ ] Return status `201 Created` with newly created book object.

#### 4. `PUT /books/:id`
- [ ] Extract `id` from `req.params.id`.
- [ ] Parse request body: `{ authorId, title, publicationDate }`. (Reject any attempt to overwrite `id`).
- [ ] **Validation Steps:**
  - Verify book exists with `id === req.params.id` $\rightarrow$ return `404 Not Found` if missing.
  - Check missing required fields $\rightarrow$ return `400 Bad Request`.
  - Validate `publicationDate` format $\rightarrow$ return `400 Bad Request`.
  - Verify `authorId` exists in `authors` collection $\rightarrow$ return `400 Bad Request` if invalid.
- [ ] Update book document in database.
- [ ] Return status `200 OK` with updated book object JSON.

#### 5. `DELETE /books/:id`
- [ ] Extract `id` from `req.params.id`.
- [ ] Query `books` collection for `id === req.params.id`.
- [ ] If not found, return status `404 Not Found` with `{ "message": "Book not found" }`.
- [ ] If found, delete document.
- [ ] Return status `204 No Content` with empty body.

---

## Feature 2: Author CRUD Operations

### Data Model Constraints
- Collection: `authors`
- Schema Validation Rules:
  - `id`: String, required, unique custom key (e.g., `"a1"`). Immutable once created.
  - `firstName`: String, required, non-empty, trimmed.
  - `lastName`: String, required, non-empty, trimmed.
  - `birthYear`: Number, required, integer between `-2000` and `2026`.

### Endpoints

#### 1. `GET /authors`
- [ ] Query database for all documents in `authors` collection.
- [ ] Return status `200 OK` with JSON array of author objects.
- [ ] Return status `500 Internal Server Error` on database failure.

#### 2. `GET /authors/:id`
- [ ] Extract `id` from route parameters.
- [ ] Query `authors` collection for `id === req.params.id`.
- [ ] If found, return status `200 OK` with author object JSON.
- [ ] If not found, return status `404 Not Found` with `{ "message": "Author not found" }`.
- [ ] Return status `500 Internal Server Error` on database failure.

#### 3. `POST /authors`
- [ ] Parse request body: `{ id, firstName, lastName, birthYear }`.
- [ ] **Validation Steps:**
  - Check missing fields $\rightarrow$ return `400 Bad Request`.
  - Validate `birthYear` is an integer $\rightarrow$ return `400 Bad Request` with `{ "message": "birthYear must be an integer" }`.
  - Check existing author `id` in `authors` collection $\rightarrow$ return `400 Bad Request` with `{ "message": "Author ID already exists" }`.
- [ ] Insert document into `authors` collection.
- [ ] Return status `201 Created` with newly created author object.

#### 4. `PUT /authors/:id`
- [ ] Extract `id` from `req.params.id`.
- [ ] Parse request body: `{ firstName, lastName, birthYear }`.
- [ ] **Validation Steps:**
  - Verify author exists with `id === req.params.id` $\rightarrow$ return `404 Not Found` if missing.
  - Check missing fields or invalid `birthYear` type $\rightarrow$ return `400 Bad Request`.
- [ ] Update author document in database.
- [ ] Return status `200 OK` with updated author object JSON.

#### 5. `DELETE /authors/:id`
- [ ] Extract `id` from `req.params.id`.
- [ ] Check if author exists $\rightarrow$ return `404 Not Found` if missing.
- [ ] Query `books` collection to check if any book has `authorId === req.params.id`.
- [ ] If matching books exist $\rightarrow$ return `400 Bad Request` with `{ "message": "Cannot delete author with associated books. Remove or reassign books first." }`.
- [ ] If no matching books exist $\rightarrow$ delete author document from `authors` collection.
- [ ] Return status `204 No Content` with empty body.

---

## Swagger & Deployment Requirements
- [ ] Annotate all `/books` and `/authors` endpoints with `@openapi` JSDoc tags.
- [ ] Include request body schemas and component responses in Swagger configuration.
- [ ] Execute Swagger generation script to update `swagger.json`.
- [ ] Verify local Swagger UI interactive testing at `http://localhost:3000/api-docs`.
- [ ] Push to GitHub and verify deployment on Render.

```