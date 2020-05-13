import startCase from 'lodash.startcase';
import camelCase from 'lodash.camelcase';
import { array, object, string, record, Infer } from 'myzod';

export function getTemplateText(
  templates: { [key: string]: string } = {},
  s: string,
): string {
  return templates[s] || '';
}

export function domainsMatched(host: string, domains: string[]): boolean {
  return domains.some((d) => host.match(new RegExp(d, 'i'))?.length);
}

export function indexesOf(
  text: string,
  regex: RegExp,
): { [key: string]: number[] } {
  let match: RegExpExecArray | null;
  let indexes = {} as { [key: string]: number[] };

  regex = new RegExp(regex);

  while ((match = regex.exec(text))) {
    const key = match[0];

    if (!indexes[key]) {
      indexes[key] = [];
    }

    indexes[key].push(match.index);
  }

  return indexes;
}

export function mapObjectKeysToSelectOptions(keys: string[]): SelectOption[] {
  if (!keys) {
    return [];
  }

  return keys.sort().map((key) => {
    return { label: startCase(key), value: key };
  });
}

export function mapProjectCodeToSelectOptions(
  values: string[],
): SelectOption[] {
  if (!values) {
    return [];
  }

  return values.sort().map((value) => {
    const val = value.toUpperCase();

    return { label: val, value, val };
  });
}

export function mapTicketTypeToSelectOptions(values: string[]): SelectOption[] {
  if (!values) {
    return [];
  }

  return values.sort().map((value) => {
    return { label: startCase(value), value: camelCase(value) };
  });
}

const optionsSchema = object({
  domains: array(string()).optional(),
  projectCodes: array(
    object({
      label: string(),
      value: string(),
    }),
  ).optional(),
}).and(record(record(string())));

type Options = Infer<typeof optionsSchema>;

export async function validateOptionInput(
  options: string,
): Promise<OptionsImport | undefined> {
  if (!options) {
    return;
  }

  let optionsObject = {} as Options;

  try {
    optionsObject = optionsSchema.parse(JSON.parse(options));

    const keys = Object.keys(optionsObject).filter(
      (key) => !['domains', 'projectCodes'].includes(key),
    );

    keys.forEach((key) => {
      if (key !== key.toUpperCase()) {
        throw new Error('Project key is not uppercased.');
      }

      if (typeof optionsObject[key] !== 'object') {
        throw new Error(`Project '${key}' does not contain templates.`);
      }
    });
  } catch {
    return;
  }

  return optionsObject;
}
