import {
  type DatatypeD,
  datatypeD,
  join,
} from "~/xjustiz-schemata/din-91379/datatypeD";
import {
  type Gerichte,
  Geschlecht,
} from "~/xjustiz-schemata/grunddatensatz/codelisten";
import {
  type Klaeger,
  type NachrichtenkopfFuerZahlungsklage,
} from "~/nachricht/zahlungsklage/message-profile";
import { type DatatypeC } from "~/xjustiz-schemata/din-91379/datatypeC";
import { type NatuerlichePerson } from "~/xjustiz-schemata/grunddatensatz/composites";
import { type ScopeToken } from "~/xjustiz-schemata/shared-kernel/scoping";
import { type UUID } from "~/xjustiz-schemata/grunddatensatz/uuid";
import { herstellerinformation } from "~/xjustiz-schemata/grunddatensatz/ergonomics";

/**
 * Constructs a {@link NachrichtenkopfFuerZahlungsklage} with the `klaeger` as
 * Absender and `gericht` as Empfänger.
 *
 * The `erstellungszeitpunkt` will be current date-time at the call.
 *
 * The `klaeger` will be formatted based on their Geschlecht, Titel, Vorname and
 * Nachname. For example: `"Frau Dr. Erika Musterfrau"`. A Titel which can't be
 * parsed from {@link DatatypeC} to {@link DatatypeD} will be discarded. Any
 * Geschlecht but männlich or weiblich will also be discarded for the Anrede.
 */
export function nachrichtenkopf<
  NachrichtenScope,
  const EigeneNachrichtenID extends UUID<NachrichtenScope>,
  // oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- included by return satisfies
  const Gericht extends Gerichte,
>(
  _scope: ScopeToken<NachrichtenScope>,
  eigeneNachrichtenID: EigeneNachrichtenID,
  klaeger: Klaeger<NachrichtenScope>, // oxlint-disable-line typescript/prefer-readonly-parameter-types -- false positive
  gericht: Gericht,
) {
  return {
    xjustizVersion: "3.6.2",
    erstellungszeitpunkt: Temporal.Now.instant(),
    absender: {
      informationen: {
        auswahlKommunikationspartner: {
          sonstige: formatKlaegerAsAbsender(
            klaeger.beteiligter.auswahlBeteiligter.natuerlichePerson,
          ),
        },
      },
      eigeneNachrichtenID,
    },
    empfaenger: {
      informationen: {
        auswahlKommunikationspartner: { gericht },
      },
      auswahlAktenzeichen: { aktenzeichenNeu: true },
    },
    herstellerinformation: herstellerinformation(),
  } satisfies NachrichtenkopfFuerZahlungsklage<NachrichtenScope>;
}

function formatKlaegerAsAbsender(
  klaeger: NatuerlichePerson, // oxlint-disable-line typescript/prefer-readonly-parameter-types -- false positive
): DatatypeD {
  return join(
    datatypeD(" ").value,
    mapGeschlechtToAndrede(klaeger.geschlecht),
    tryToParseTitelAsDatatypeD(klaeger.vollerName.titel),
    klaeger.vollerName.vorname,
    klaeger.vollerName.nachname,
  );
}

function tryToParseTitelAsDatatypeD(titel?: DatatypeC): DatatypeD | undefined {
  const maybeResult = titel ? datatypeD(titel) : { issues: [] };
  return maybeResult.issues === undefined ? maybeResult.value : undefined;
}

function mapGeschlechtToAndrede(
  geschlecht?: Geschlecht,
): DatatypeD | undefined {
  switch (geschlecht) {
    case undefined:
    case Geschlecht.Unbekannt:
    case Geschlecht.Divers:
    case Geschlecht.Saechlich: {
      return undefined;
    }
    case Geschlecht.Maennlich: {
      return datatypeD("Herr").value;
    }
    case Geschlecht.Weiblich: {
      return datatypeD("Frau").value;
    }
    default: {
      return undefined;
    }
  }
}

if (import.meta.vitest) {
  const { describe, test, it, expect, vi } = import.meta.vitest;

  // oxlint-disable-next-line max-lines-per-function
  describe("Nachrichtenkopf ergonomics", async () => {
    const { datatypeA } = await import(
      "~/xjustiz-schemata/din-91379/datatypeA"
    );
    const { datatypeC } = await import(
      "~/xjustiz-schemata/din-91379/datatypeC"
    );
    const { withScope } = await import(
      "~/xjustiz-schemata/shared-kernel/scoping"
    );
    const { createUuidGenerator } = await import(
      "~/xjustiz-schemata/grunddatensatz/uuid"
    );
    const { createRollennummerGenerator } = await import(
      "~/xjustiz-schemata/grunddatensatz/rollennummer"
    );
    const { Rollenbezeichnung, Gerichte } = await import(
      "~/xjustiz-schemata/grunddatensatz/codelisten"
    );

    // oxlint-disable-next-line max-lines-per-function
    it("constructs a correctly structured Nachrichtenkopf with the current date-time", () => {
      const fakeNow = Temporal.Instant.from("2026-09-04T00:00:00Z");
      vi.spyOn(Temporal.Now, "instant").mockReturnValue(fakeNow);

      // oxlint-disable-next-line max-lines-per-function
      withScope(<NachrichtenScope>(scope: ScopeToken<NachrichtenScope>) => {
        const uuid = createUuidGenerator(scope);
        const eigeneNachrichtenID = uuid.first();
        const rollennummer = createRollennummerGenerator(scope);
        const rollennummerDesKlaegers = rollennummer.first(
          Rollenbezeichnung.Klaeger,
        );
        const klaeger = {
          rolle: [
            {
              rollennummer: rollennummerDesKlaegers,
              rollenbezeichnung: Rollenbezeichnung.Klaeger,
            },
          ],
          beteiligter: {
            auswahlBeteiligter: {
              natuerlichePerson: {
                vollerName: {
                  vorname: datatypeA("Erika").value,
                  nachname: datatypeA("Musterfrau").value,
                },
              },
            },
          },
        } satisfies Klaeger<NachrichtenScope>;

        const output = nachrichtenkopf(
          scope,
          eigeneNachrichtenID,
          klaeger,
          Gerichte["ZZ Test-Bund"],
        );

        expect(output).toStrictEqual({
          xjustizVersion: "3.6.2",
          erstellungszeitpunkt: fakeNow,
          absender: {
            informationen: {
              auswahlKommunikationspartner: {
                sonstige: datatypeD("Erika Musterfrau").value,
              },
            },
            eigeneNachrichtenID,
          },
          empfaenger: {
            informationen: {
              auswahlKommunikationspartner: {
                gericht: Gerichte["ZZ Test-Bund"],
              },
            },
            auswahlAktenzeichen: { aktenzeichenNeu: true },
          },
          herstellerinformation: herstellerinformation(),
        });
      });
    });

    // oxlint-disable-next-line max-lines-per-function
    describe("format Klaeger as Absender", () => {
      test.each<{ klaeger: NatuerlichePerson; absender: DatatypeD }>([
        {
          klaeger: { vollerName: { nachname: datatypeA("Musterfrau").value } },
          absender: datatypeD("Musterfrau").value,
        },
        {
          klaeger: {
            geschlecht: Geschlecht.Divers,
            vollerName: {
              vorname: datatypeA("Charlie").value,
              nachname: datatypeA("Musterperson").value,
            },
          },
          absender: datatypeD("Charlie Musterperson").value,
        },
        {
          klaeger: {
            geschlecht: Geschlecht.Weiblich,
            vollerName: {
              vorname: datatypeA("Erika").value,
              nachname: datatypeA("Musterfrau").value,
            },
          },
          absender: datatypeD("Frau Erika Musterfrau").value,
        },
        {
          klaeger: {
            geschlecht: Geschlecht.Maennlich,
            vollerName: {
              titel: datatypeC("Dr.").value,
              vorname: datatypeA("Max").value,
              nachname: datatypeA("Mustermann").value,
            },
          },
          absender: datatypeD("Herr Dr. Max Mustermann").value,
        },
        {
          klaeger: {
            geschlecht: Geschlecht.Maennlich,
            vollerName: {
              titel: datatypeC("\u000D").value,
              nachname: datatypeA("Mustermann").value,
            },
          },
          absender: datatypeD("Herr Mustermann").value,
        },
      ])(
        "correctly formats Klaeger as Absender for case %i",
        ({ klaeger, absender }) => {
          expect(formatKlaegerAsAbsender(klaeger)).toStrictEqual(absender);
        },
      );
    });
  });
}
