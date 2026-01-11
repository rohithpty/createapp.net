import Mustache from "mustache";
import { mapType } from "./typeMapper";
import { ModelDefinition } from "./model";
import { templates } from "./templates";

export type GenerationResult = {
  model: ModelDefinition;
  files: Record<string, string>;
};

export const defaultModelJson = `{
  "EntityName": "Product",
  "Properties": [
    { "Name": "Id", "Type": "int" },
    { "Name": "Name", "Type": "string" },
    { "Name": "Price", "Type": "decimal" },
    { "Name": "IsActive", "Type": "bool" }
  ]
}`;

const ensureValidModel = (model: ModelDefinition) => {
  if (!model.EntityName?.trim()) {
    throw new Error("EntityName is required.");
  }
  if (!model.Properties?.length) {
    throw new Error("At least one property is required.");
  }
};

const addMappedTypes = (model: ModelDefinition) => {
  return {
    ...model,
    Properties: model.Properties.map((property) => ({
      ...property,
      CSharpType: mapType(property.Type)
    }))
  };
};

export const generateFiles = (json: string): GenerationResult => {
  const model = JSON.parse(json) as ModelDefinition;
  ensureValidModel(model);
  const viewModel = addMappedTypes(model);

  const files: Record<string, string> = {
    [`Output/Domain/Entities/${model.EntityName}.cs`]: Mustache.render(
      templates.entity,
      viewModel
    ),
    "Output/Infrastructure/Persistence/AppDbContext.cs": Mustache.render(
      templates.dbContext,
      viewModel
    ),
    [`Output/Application/Repositories/I${model.EntityName}Repository.cs`]:
      Mustache.render(templates.repositoryInterface, viewModel),
    [`Output/Infrastructure/Repositories/${model.EntityName}Repository.cs`]:
      Mustache.render(templates.repositoryImplementation, viewModel),
    [`Output/Api/Controllers/${model.EntityName}Controller.cs`]: Mustache.render(
      templates.controller,
      viewModel
    ),
    "Output/Api/Program.cs": Mustache.render(templates.program, viewModel)
  };

  return { model, files };
};
