const typeMap: Record<string, string> = {
  string: "string",
  int: "int",
  decimal: "decimal",
  bool: "bool",
  datetime: "DateTime",
  guid: "Guid"
};

export const mapType = (input: string): string => {
  const key = input.trim().toLowerCase();
  return typeMap[key] ?? "string";
};
