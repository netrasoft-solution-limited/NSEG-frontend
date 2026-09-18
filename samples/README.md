Written for: the client team preparing the onboarding lists.

# Onboarding sheets

`buyer-onboarding-100.csv` — 100 buyer organisations.
`exporter-onboarding-100.csv` — 100 Nigerian service exporters.

One organisation per row, in the fields the Gateway asks for at onboarding.

**These are invented organisations.** Names, people, emails and every identifier — registry
numbers, CAC and TIN numbers, NINs, credential numbers — are made up for testing and
demonstration. None refer to a real company, a real person or a real registration, and no email
address in these files should be written to. Replace the rows with real organisations before
anything is sent anywhere.

## Buyers — columns

| Column | What goes in it |
|---|---|
| `company_name` | The organisation's registered name, including its legal form (Ltd, BV, GmbH, Inc.). |
| `country_of_registration` | Where the company is registered. One of the 16 countries the buyer sign-up offers. |
| `region` | Filled from the country — Western Europe, North America, Asia-Pacific, Gulf States, West Africa, East Africa, Southern Africa. |
| `contact_full_name` | The person who will sign in and act for the organisation. |
| `job_title` | Their role, as they would give it. |
| `work_email` | Must be on the company's own domain — the Gateway uses it to confirm who they work for, and rejects free email domains. |
| `sectors_of_interest` | What they intend to source, separated by `;`. Use the Gateway's eight service families exactly as written. |
| `registry_type` | How the company will be checked: `lei`, `companies-house`, `vies`, or `other` for a national registry. |
| `registry_identifier` | The number for that registry — LEI (20 characters), UK company number (8 digits), EU VAT number, or the national registration number. |
| `target_tier` | Where onboarding should land them: `registered` (email confirmed only), `registry-verified` (company found in its home registry), `payment-verified` (registry check plus a verified payment instrument). |
| `notes` | Free text for your team. Left empty. |

## What the tiers mean

A buyer can explore and draft on `registered`. They are asked to verify only when they send a
requirement for qualification — that check is what moves them to `registry-verified`.
`payment-verified` additionally confirms a payment instrument for escrow funding, and is what
unlocks escrow-backed milestones.

In this sheet: 40 or so are `registered`, around 35 `registry-verified`, the rest
`payment-verified` — a realistic spread for a first cohort rather than an all-verified list.

## Exporters — columns

| Column | What goes in it |
|---|---|
| `display_name` | The registered business name for a firm; the professional's own name on the individual track. |
| `track` | `firm` — a CAC-registered company or business name. `individual` — a professional working in their own name, without CAC registration. |
| `contact_full_name` | The person who signs in. On the individual track this is the same as `display_name`. |
| `email` | Contact address for the account. |
| `base_city` | Where they operate from. Context for the desk officer; onboarding does not ask for it. |
| `main_service` | One of the Gateway's eight service families, exactly as written. |
| `delivery_modes` | How they deliver, separated by `;` — Mode 1 cross-border supply, Mode 2 consumption abroad, Mode 3 commercial presence, Mode 4 natural persons. |
| `target_markets` | Markets they serve or want to serve, separated by `;` — United Kingdom, European Union, United States, ECOWAS region, Gulf states (GCC). |
| `team_size` | Just me · 2–10 people · 11–50 people · More than 50 people. |
| `cac_number` | Firms only. As shown on the CAC certificate, e.g. `RC 1234567`. |
| `tin` | Firms only. Tax identification number, `12345678-0001`. |
| `nin` | Individuals only. 11 digits. Officers see only the last four. |
| `professional_credential` | Individuals only. The body and membership number, e.g. `ICAN membership 12345`. |
| `target_tier` | `registered` (account only), `identity-verified` (identifiers confirmed against the registries), `delivery-verified` (identity plus a confirmed cross-border delivery). |
| `notes` | Free text for your team. Left empty. |

### The two tracks

The ladder is one ladder with two evidence routes. A firm proves identity with **CAC + TIN**; an
individual, who has no CAC, proves it with **NIN + a professional credential**. So the identifier
columns are filled by track: firms carry CAC and TIN, individuals carry NIN and a credential,
and neither carries the other's. In this sheet 76 are firms and 24 individuals.

Tiers state what was verified — never a judgement of the quality of anyone's work. A tier also
needs a readiness diagnostic score, which exporters complete themselves after onboarding, so
`delivery-verified` rows still need that step before the tier holds.

## Using them

Each row maps onto the sign-up it belongs to. For buyers: account (name, work email, job title),
organisation (company, country, sectors), then verification. For exporters: account, how they
export, identity, then what they offer. Neither sheet sets a password — people set their own.
