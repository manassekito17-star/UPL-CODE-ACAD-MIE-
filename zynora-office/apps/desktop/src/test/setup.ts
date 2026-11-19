import { configure } from "@testing-library/react";

// Machines de CI chargées : les attentes asynchrones (findBy…, waitFor) disposent de 3 s au lieu de 1 s.
configure({ asyncUtilTimeout: 3000 });
