import { describe, expect, it } from "vitest";

import { cellName, columnName, normalize, parseCell, parseRange, rangeName } from "./refs";

describe("références de cellules", () => {
  it("nomme les colonnes comme les tableurs", () => {
    expect([1, 26, 27, 52, 702, 703, 16384].map(columnName)).toEqual(["A", "Z", "AA", "AZ", "ZZ", "AAA", "XFD"]);
    expect(cellName({ row: 12, column: 28 })).toBe("AB12");
  });

  it("lit les références, absolues comprises, et refuse le reste", () => {
    expect(parseCell("b12")).toEqual({ row: 12, column: 2 });
    expect(parseCell("$XFD$1048576")).toEqual({ row: 1048576, column: 16384 });
    for (const bad of ["", "12", "A0", "XFE1", "A1048577", "AAAA1", "A-1", "A1B"]) expect(parseCell(bad)).toBeNull();
  });

  it("normalise les plages dans n'importe quel sens", () => {
    expect(parseRange("C3:A1", 0)).toEqual({ sheet: 0, top: 1, left: 1, bottom: 3, right: 3 });
    expect(parseRange("B2", 1)).toEqual({ sheet: 1, top: 2, left: 2, bottom: 2, right: 2 });
    expect(parseRange("A1:B2:C3", 0)).toBeNull();
    expect(rangeName(normalize(0, { row: 5, column: 4 }, { row: 2, column: 1 }))).toBe("A2:D5");
    expect(rangeName(normalize(0, { row: 2, column: 2 }, { row: 2, column: 2 }))).toBe("B2");
  });
});
