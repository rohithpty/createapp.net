export type PropertyDefinition = {
  Name: string;
  Type: string;
};

export type ModelDefinition = {
  EntityName: string;
  Properties: PropertyDefinition[];
};
