import { useEffect, useMemo, useState } from "react";
import JSZip from "jszip";
import Editor, { useMonaco } from "@monaco-editor/react";
import {
  defaultModelJson,
  generateFiles,
  GenerationResult
} from "./generator/generateFiles";

const containerStyle: React.CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  padding: "2rem",
  maxWidth: 1100,
  margin: "0 auto"
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "1.5rem"
};

const cardStyle: React.CSSProperties = {
  background: "#f8fafc",
  borderRadius: 12,
  padding: "1rem",
  border: "1px solid #e2e8f0"
};

const codeStyle: React.CSSProperties = {
  whiteSpace: "pre-wrap",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "0.85rem",
  background: "#0f172a",
  color: "#f8fafc",
  padding: "1rem",
  borderRadius: 8,
  overflowX: "auto"
};

const modelSchema = {
  $id: "https://createapp.net/schemas/model.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  required: ["EntityName", "Properties"],
  properties: {
    EntityName: {
      type: "string",
      minLength: 1
    },
    Properties: {
      type: "array",
      minItems: 1,
      items: {
        $ref: "#/definitions/property"
      }
    }
  },
  definitions: {
    property: {
      type: "object",
      required: ["Name", "Type"],
      properties: {
        Name: {
          type: "string",
          minLength: 1
        },
        Type: {
          type: "string",
          enum: ["int", "string", "decimal", "bool", "datetime", "guid"]
        }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false
} as const;

export default function App() {
  const [modelJson, setModelJson] = useState(defaultModelJson);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const monaco = useMonaco();

  const fileEntries = useMemo(() => {
    return result ? Object.entries(result.files) : [];
  }, [result]);

  const handleGenerate = () => {
    setError(null);
    try {
      const generation = generateFiles(modelJson);
      setResult(generation);
    } catch (err) {
      setResult(null);
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    }
  };

  const handleDownloadAll = async () => {
    if (!result) {
      return;
    }
    const zip = new JSZip();
    Object.entries(result.files).forEach(([path, content]) => {
      zip.file(path, content);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "output.zip";
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!monaco) {
      return;
    }
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [
        {
          uri: modelSchema.$id,
          fileMatch: ["*"],
          schema: modelSchema
        }
      ]
    });
  }, [monaco]);

  return (
    <main style={containerStyle}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ marginBottom: "0.35rem" }}>CreateApp Code Generator</h1>
        <p style={{ marginTop: 0, color: "#475569" }}>
          Paste a model.json definition, generate a layered .NET 10 CRUD API, and
          review the output files below.
        </p>
      </header>

      <section style={gridStyle}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Model Definition</h2>
          <div style={{ borderRadius: 8, overflow: "hidden" }}>
            <Editor
              height={260}
              defaultLanguage="json"
              value={modelJson}
              onChange={(value) => setModelJson(value ?? "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button type="button" onClick={handleGenerate}>
              Generate
            </button>
            <button
              type="button"
              onClick={handleDownloadAll}
              disabled={!result}
            >
              Download Output
            </button>
          </div>
          {error && (
            <p style={{ color: "#dc2626", marginTop: "1rem" }}>{error}</p>
          )}
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Generation Summary</h2>
          {result ? (
            <ul>
              <li>Entity: {result.model.EntityName}</li>
              <li>Properties: {result.model.Properties.length}</li>
              <li>Output files: {Object.keys(result.files).length}</li>
            </ul>
          ) : (
            <p>No output yet. Generate to see details.</p>
          )}
        </div>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Generated Output</h2>
        {fileEntries.length === 0 && <p>No files generated yet.</p>}
        {fileEntries.map(([path, content]) => (
          <article key={path} style={{ marginBottom: "1.5rem" }}>
            <h3>{path}</h3>
            <pre style={codeStyle}>{content}</pre>
          </article>
        ))}
      </section>
    </main>
  );
}
