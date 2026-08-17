import ky from "ky";

/**
 * Sends a JSON-serialized XJustiz message payload to the XJustiz-Tools service
 * to transform it into a standardized XJustiz XML document.
 *
 * @param serializedMessagePayload - The XJustiz message payload serialized as a JSON string.
 * @param xjustizToolsConnectionParameter - Connection settings containing the service `baseUrl`.
 *
 */
export async function generateXjustizMessageXml(
  serializedMessagePayload: string,
  xjustizToolsConnectionParameter: XjustizToolsConnectionParameter,
): Promise<XjustizMessageXmlResult> {
  try {
    const response = await ky.post(
      "xjustiz-tools/create/nachrichtKlaverKlageverfahren3500001",
      {
        prefix: xjustizToolsConnectionParameter.baseUrl,
        timeout: 60_000,
        retry: {
          limit: 5,
          statusCodes: [408, 500, 502, 503, 504],
          retryOnTimeout: true,
        },
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: serializedMessagePayload,
      },
    );
    const { xjustizNachricht: xjustizMessageXml } =
      await response.json<XjustizToolsSuccessPayload>();

    return { ok: true, xjustizMessageXml };
  } catch {
    return { ok: false };
  }
}

export type XjustizToolsConnectionParameter = {
  readonly baseUrl: string;
};

type XjustizToolsSuccessPayload = {
  readonly xjustizNachricht: string;
};

export type XjustizMessageXmlResult =
  | { readonly ok: true; readonly xjustizMessageXml: string }
  | { readonly ok: false };

if (import.meta.vitest) {
  const { describe, it, expect, vi, beforeEach } = import.meta.vitest;

  const MOCK_XML =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<tns:nachricht.klaver.klageverfahren.3500001 xmlns:tns="http://www.xjustiz.de"/>';

  describe("generateXjustizMessageXml", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("returns XML string when request succeeds", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(Response.json({ xjustizNachricht: MOCK_XML }));

      const result = await generateXjustizMessageXml('{"some":"payload"}', {
        baseUrl: "http://localhost:8888",
      });

      expect(result).toEqual({ ok: true, xjustizMessageXml: MOCK_XML });
      const request = fetchMock.mock.calls[0]?.[0];

      expect(request).toBeInstanceOf(Request);
      expect(request).toHaveProperty(
        "url",
        new URL(
          "xjustiz-tools/create/nachrichtKlaverKlageverfahren3500001",
          "http://localhost:8888",
        ).href,
      );
      expect(request).toHaveProperty("method", "POST");
    });

    it("swallows error when the request fails", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(
        new Error("Service Unavailable"),
      );

      await expect(
        generateXjustizMessageXml("{}", {
          baseUrl: "http://localhost:8888",
        }),
      ).resolves.toEqual({
        ok: false,
      });
    });
  });
}
