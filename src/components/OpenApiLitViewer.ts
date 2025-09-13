import { html, css, LitElement, unsafeCSS } from 'lit';
import { property, state, customElement } from 'lit/decorators.js';
import baseStyles from '../styles/openapi-base.css?inline';

interface OpenApiInfo {
  title: string;
  description?: string;
  version: string;
}

interface OpenApiServer {
  url: string;
  description?: string;
}

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head' | 'trace';

interface OpenApiParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required?: boolean;
  description?: string;
  schema?: Record<string, unknown>;
}

interface OpenApiResponse {
  description: string;
  content?: Record<string, {
    schema?: Record<string, unknown>;
    example?: unknown;
  }>;
}

type OpenApiPath = {
  [M in HttpMethod]?: {
    summary?: string;
    description?: string;
    parameters?: OpenApiParameter[];
    requestBody?: unknown;
    responses: Record<string, OpenApiResponse>;
    operationId: string;
  };
};

interface OpenApiComponents {
  schemas?: Record<string, unknown>;
  responses?: Record<string, OpenApiResponse>;
  parameters?: Record<string, OpenApiParameter>;
  [key: string]: unknown;
}

interface OpenAPI {
  openapi: string;
  info: OpenApiInfo;
  servers?: OpenApiServer[];
  paths: Record<string, OpenApiPath>;
  components?: OpenApiComponents;
  [key: string]: unknown;
}

@customElement('openapi-viewer')
export class OpenApiLitViewer extends LitElement {
  static styles = css`${unsafeCSS(baseStyles)}`;
  
  @property({ type: String }) 
  jsonLocation = '/swagger.json';
  @property({ type: String, reflect: true })
  theme: 'light' | 'dark' = 'dark';
  @state()
  private _openapiData: OpenAPI | null = null;
  @state()
  private _loading: boolean = false;

  override async firstUpdated(): Promise<void> {
    this._loading = true;

    try {
      if (!this.jsonLocation.toLowerCase().endsWith(".json")){
        throw Error("Invalid file format, expected json!")
      }

      const response = await fetch(this.jsonLocation);
      this._openapiData = await response.json();

      const expectedObjects: string[] = ["openapi", "paths"];
      for (const expectedKey of expectedObjects) {
        if (this._openapiData && !this._openapiData[expectedKey]) {
          this._openapiData = null;
          throw Error(`Invalid JSON format received, expecting key: ${expectedKey}`);
        }
      }
    } catch (err) {
      console.error('Failed to load JSON:', err);
    }
    finally{
      this._loading = false;
    }
  }

  private _infoWithHeader(headerText: string, infoText?: string, showIfMissing: boolean = false) {
    if (!infoText && !showIfMissing) {
      return null;
    }

    return html`
      <div class="openapi-info-block">
        <div class="openapi-info-header"><strong>${headerText}</strong></div>
        <div class="openapi-info-text">
          ${infoText || `No ${headerText}`}
        </div>
      </div>
    `;
  }


  private _genMethod(method: string, details: any) {
    return html`
      <li class="openapi-method ${method}">
        <strong>${method.toUpperCase()}</strong>
        ${this._infoWithHeader("Summary", details.summary)}
        ${this._infoWithHeader("Description", details.description)}
        ${this._infoWithHeader("Operation ID", details.operationId)}
      </li>
    `;
  }

  private _genPathDetails(methods: OpenApiPath) {
    return Object.entries(methods).map(([method, details]: [string, any]) =>
      this._genMethod(method, details)
    );
  }

  private _genPath(path: string, methods: OpenApiPath) {
    return html`
      <div class="openapi-path">
        <div class="openapi-path-header">${path}</div>
        <ul>
          ${this._genPathDetails(methods)}
        </ul>
      </div>
    `;
  }

  private _genPaths() {
    if (!this._openapiData) return html``;

    return html`
      <div class="paths">
        ${Object.entries(this._openapiData.paths).map(([path, methods]) =>
          this._genPath(path, methods)
        )}
      </div>
    `;
  }

  override render() {
    return html`
      ${this._loading
        ? html`<p>Loading...</p>`
        : this._genPaths()}
    `;
  }
}
