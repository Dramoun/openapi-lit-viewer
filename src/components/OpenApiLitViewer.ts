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

  private _genPaths() {
    if (!this._openapiData) {
      return html``;
    }

    const paths = Object.entries(this._openapiData.paths);

    return html`
      <div class="paths">
        ${paths.map(([path, methods]) => html`
          <div class="openapi-path">
            <div class="openapi-path-header">${path}</div>
            <ul>
              ${Object.entries(methods).map(([method, details]: [string, any]) => html`
                <li class="openapi-method ${method}">
                  <strong>${method.toUpperCase()}</strong>
                  <p class="openapi-method-summary">
                    ${details.summary || 'No summary'}
                  </p>
                  ${details.description ? html`
                    <p class="openapi-method-description">
                      ${details.description}
                    </p>
                  ` : 'No Description'}
                </li>
              `)}
            </ul>
          </div>
        `)}
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
