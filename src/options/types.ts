interface SelectOption {
  [key: string]: any;
  label: string;
  value: string | number;
}

interface Templates {
  [key: string]: string;
}

interface Project {
  [key: string]: Templates;
}

interface OptionsImport {
  [key: string]: string[] | SelectOption[] | { [k: string]: string };
}
