# Books API Specification (Version 2)

## 1. Purpose
Build a read-only RESTful Books API in Node.js using Express and MongoDB. The API enables client applications to retrieve the complete catalog of books or query details for an individual book using a custom identifier.

---

## 2. Environment & Configuration
The application reads configuration from local environment variables via `--env-file=.env` during development, or through platform environment settings in production (Render).

* `PORT`: The network port on which the Express server listens (default: `3000`).
* `MONGODB_URI`: The authenticated connection string to access the MongoDB cluster.

**Validation Rule:** The application must validate the presence of these environment variables upon boot and terminate immediately with a clear error message if either is missing.

---

## 3. Data Model

* **Target Database:** `cse341-books-db`
* **Target Collection:** `books`

### Document Schema
| Field | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Unique business identifier assigned to each book | `"b1"` |
| `author` | `string` | Yes | Full name of the book's author | `"Maya Rivera"` |
| `title` | `string` | Yes | Full title of the book | `"Patterns of Light"` |
| `publicationDate` | `string` | Yes | ISO 8601 calendar date format (`YYYY-MM-DD`) | `"2021-08-17"` |

> **Note on Storage & Projections:** MongoDB automatically stores an internal `_id` field (`ObjectId`). Responses must exclude `_id` using projection (`{ _id: 0 }`), exposing only `id`, `author`, `title`, and `publicationDate`.

---

## 4. Endpoints

### 4.1. Retrieve All Books
Retrieves an array containing all book documents present in the `books` collection.

* **Method:** `GET`
* **Path:** `/books`
* **Headers:** `Accept: application/json`
* **Request Body:** None

#### Responses
* **`200 OK`**: Successfully retrieved book collection.
  ```json
  [
    {
      "id": "b1",
      "author": "Maya Rivera",
      "title": "Patterns of Light",
      "publicationDate": "2021-08-17"
    },
    {
      "id": "b2",
      "author": "Liam Chen",
      "title": "Echoes in the Code",
      "publicationDate": "2023-01-10"
    }
  ]
  ```
  *(Note: If the collection contains zero books, returns `200 OK` with an empty array `[]`).*

* **`500 Internal Server Error`**: Database query failure or unexpected server crash.
  ```json
  {
    "message": "Internal server error"
  }
  ```

---

### 4.2. Retrieve a Book by ID
Retrieves details for a single book matching the path parameter `id`.

* **Method:** `GET`
* **Path:** `/books/:id`
* **Headers:** `Accept: application/json`
* **Path Parameters:**
  * `id` (`string`, required): The custom identifier of the book (e.g., `b1`).
* **Request Body:** None

#### Responses
* **`200 OK`**: Successfully retrieved matching book record.
  ```json
  {
    "id": "b1",
    "author": "Maya Rivera",
    "title": "Patterns of Light",
    "publicationDate": "2021-08-17"
  }
  ```

* **`404 Not Found`**: No book exists matching the provided `id`.
  ```json
  {
    "message": "Book not found"
  }
  ```

* **`500 Internal Server Error`**: Database query failure or unexpected server crash.
  ```json
  {
    "message": "Internal server error"
  }
  ```

---

## 5. Error Handling & Security Guidelines
1. **Sanitized Output:** Internal server details, stack traces, and raw database driver errors must never be returned to the client in HTTP responses.
2. **Server Logging:** All unexpected internal errors must be logged to the server terminal (`console.error(error)`) for debugging purposes before dispatching the response.
3. **Explicit Return:** Handlers must terminate execution immediately upon sending an HTTP response by prepending the call with `return` (e.g., `return res.status(404).json(...)`).

---

## 6. Out of Scope (Week 1)
* Mutation endpoints (`POST /books`, `PUT /books/:id`, `DELETE /books/:id`).
* Authentication, API keys, or role-based authorization.
* Filtering, search query strings (e.g., `?author=...`), and pagination.