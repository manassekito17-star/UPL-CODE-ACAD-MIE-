import assert from "node:assert/strict";
import { test } from "node:test";

import { spdxAllowed } from "./check-licenses.mjs";

test("accepte les licences permissives et les choix multiples", () => {
  for (const ok of ["MIT", "MIT OR Apache-2.0", "(MIT OR Apache-2.0) AND Unicode-3.0", "Apache-2.0 WITH LLVM-exception", "MIT/Apache-2.0", "MPL-2.0", "Apache-2.0 OR GPL-3.0"]) {
    assert.equal(spdxAllowed(ok), true, ok);
  }
});

test("refuse le copyleft fort, les licences commerciales et les expressions inconnues", () => {
  for (const bad of ["GPL-3.0", "AGPL-3.0-only", "MIT AND GPL-2.0", "SSPL-1.0", "BUSL-1.1", "LicenseRef-Proprietary", "Apache-2.0 WITH Commons-Clause"]) {
    assert.equal(spdxAllowed(bad), false, bad);
  }
  assert.throws(() => spdxAllowed("(MIT"));
  assert.throws(() => spdxAllowed("MIT Apache-2.0"));
});
