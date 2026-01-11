import { describe, expect, it } from "vitest";
import { generateFiles } from "../generateFiles";

const modelJson = JSON.stringify({
  EntityName: "Widget",
  Properties: [
    { Name: "Id", Type: "int" },
    { Name: "Name", Type: "string" }
  ]
});

describe("generateFiles", () => {
  it("creates output files for a simple model", () => {
    const result = generateFiles(modelJson);

    expect(result.files["Output/Api/Program.cs"]).toContain(
      "IWidgetRepository"
    );
    expect(
      result.files["Output/Domain/Entities/Widget.cs"]
    ).toContain("public int Id");
    expect(
      result.files["Output/Infrastructure/Repositories/WidgetRepository.cs"]
    ).toContain("GetAllAsync");
  });
});
