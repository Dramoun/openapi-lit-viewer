# OpenAPI Lit Viewer

A lightweight, framework-agnostic web component for rendering [OpenAPI](https://www.openapis.org/) (`openapi.json`) documentation in the browser.

## ✨ Features

* No React, no heavy dependencies – just Lit + your OpenAPI JSON.
* Works with any valid `openapi:x.x.x` JSON spec.
* Base styles with theming support (light/dark out of the box).
* Easy to extend and customize.

## 📂 Project Structure

```
public/
  openapi-example.json     # Example OpenAPI spec
src/
  components/
    OpenApiLitViewer.ts  # The web component
  styles/
    openapi-base.css       # Base + theme CSS
README.md
```

## 🚀 Usage

### 1. Install dependencies & run dev

```bash
pnpm install
pnpm dev
```

### 2. Include in your project

```ts
import './components/OpenApiLitViewer.ts';
```

Use it in HTML:

```html
<openapi-viewer jsonLocation="/openapi-example.json" theme="dark"></openapi-viewer>
```

### 3. Themes

Switch themes by setting the `theme` attribute:

```html
<openapi-viewer jsonLocation="/openapi-example.json" theme="light"></openapi-viewer>
<openapi-viewer jsonLocation="/openapi-example.json" theme="dark"></openapi-viewer>
```

Custom themes can be added later by overriding CSS variables.

## 🧪 Example Swagger JSON

Here’s a small `openapi-example.json` you can place in `/public`:

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Example API",
    "version": "1.0.0"
  },
  "paths": {
    "/users": {
      "get": {
        "summary": "List all users",
        "description": "Returns a list of users in the system.",
        "responses": {
          "200": {
            "description": "A JSON array of user names"
          }
        }
      },
      "post": {
        "summary": "Create a new user",
        "description": "Adds a user to the system.",
        "responses": {
          "201": {
            "description": "User created successfully"
          }
        }
      }
    }
  }
}
```

## 📦 Future Plans

* Expand support for `parameters`, `requestBody`, and `responses`.
* Multiple themes and external theme packs.
* Prebuilt `dist/` bundle for CDN use.
* Collapsible sections for large APIs.
* Search & filter.

## 📝 License

MIT – free to use, modify, and distribute.
