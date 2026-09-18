#!/usr/bin/env node
/**
 * Fails the build when an event schema would put personal data on the bus.
 *
 * AD-03 keeps events thin: identifiers, versions, states and amounts. A consumer that needs a
 * name or a credential fetches it through the gateway, where its own authorisation and the
 * subject's consent are checked. An event cannot be unpublished, so this is checked before it
 * can be written rather than in review.
 *
 * The deny-list is derived from the field catalogue's classifications, so adding a personal
 * field to the catalogue protects the bus without anyone remembering to update this script.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const eventsDir = join(here, '..', 'events');

const catalogue = JSON.parse(readFileSync(join(eventsDir, 'field-catalogue.json'), 'utf8'));

/** Flattened catalogue paths for every personal or sensitive field: identifier.nin -> identifiernin. */
const fromCatalogue = catalogue.fields.
filter((entry) => entry.classification === 'personal' || entry.classification === 'sensitive').
map((entry) => entry.field.toLowerCase().replace(/[^a-z0-9]/g, ''));

/** Whole names that mean personal data however they are spelled. */
const deniedNames = new Set([
...fromCatalogue,
'bvn', 'passport', 'passportnumber', 'dateofbirth', 'dob',
'address', 'residentialaddress', 'addressline', 'postaladdress',
'iban', 'accountnumber', 'accountname', 'sortcode', 'cardnumber', 'bankaccount',
'firstname', 'lastname', 'fullname', 'surname', 'contactname', 'legalname',
'emailaddress', 'phonenumber', 'msisdn', 'originatingip', 'ipaddress',
'cacnumber', 'rcnumber', 'tinnumber', 'ninnumber']);


/**
 * Words that carry personal data wherever they appear, so contactEmail and ownerNin are caught
 * as well as email and nin. Only distinctive words belong here — "name" does not, or every
 * fileName and displayName would fail the build.
 */
const deniedWords = new Set([
'nin', 'tin', 'bvn', 'rc', 'email', 'phone', 'msisdn', 'passport',
'iban', 'dob', 'dateofbirth', 'address', 'bankaccount']);


/** Identifier-shaped names that are allowed to travel — they name a record, not a person. */
const allowed = new Set(['uaid', 'natepid', 'correlationid', 'causationid', 'traceparent']);

/** contactEmail -> ['contact', 'email']; owner_nin -> ['owner', 'nin']. */
const words = (name) =>
name.
replace(/([a-z0-9])([A-Z])/g, '$1 $2').
split(/[^a-zA-Z0-9]+/).
filter(Boolean).
map((word) => word.toLowerCase());

const normalise = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

const findings = [];

/** Walk every property name at any depth, including inside arrays and composed schemas. */
function walk(node, path, file) {
  if (!node || typeof node !== 'object') return;

  if (node.properties && typeof node.properties === 'object') {
    for (const [name, child] of Object.entries(node.properties)) {
      const flat = normalise(name);
      const parts = words(name);
      const offending = deniedNames.has(flat) ? flat : parts.find((word) => deniedWords.has(word));
      if (offending && !allowed.has(flat)) {
        findings.push({ file, path: `${path}.${name}`, offending });
      }
      walk(child, `${path}.${name}`, file);
    }
  }

  for (const key of ['items', 'additionalProperties', 'not', 'if', 'then', 'else']) {
    if (node[key] && typeof node[key] === 'object') walk(node[key], `${path}.${key}`, file);
  }
  for (const key of ['allOf', 'anyOf', 'oneOf', 'prefixItems']) {
    if (Array.isArray(node[key])) node[key].forEach((child, index) => walk(child, `${path}.${key}[${index}]`, file));
  }
  if (node.$defs && typeof node.$defs === 'object') {
    for (const [name, child] of Object.entries(node.$defs)) walk(child, `${path}.$defs.${name}`, file);
  }
}

const files = readdirSync(eventsDir).filter(
  (name) => name.endsWith('.json') && name !== 'envelope.schema.json' && name !== 'field-catalogue.json'
);

for (const file of files) {
  const schema = JSON.parse(readFileSync(join(eventsDir, file), 'utf8'));
  // Only `data` is the payload; the envelope's own actor block is allowed its identifiers.
  const data = schema.properties?.data ?? schema;
  walk(data, 'data', file);
}

if (findings.length > 0) {
  console.error(`\nEvents may not carry personal data. ${findings.length} field(s) must be removed:\n`);
  for (const finding of findings) {
    console.error(`  ${finding.file}  ${finding.path}   (${finding.offending})`);
  }
  console.error(
    '\nSend the identifier instead. The consumer fetches the detail through the gateway,\n' +
    'where its authorisation and the subject’s consent are checked (AD-03).\n'
  );
  process.exit(1);
}

console.log(`Event lint: ${files.length} schema(s) checked, no personal data on the bus.`);
