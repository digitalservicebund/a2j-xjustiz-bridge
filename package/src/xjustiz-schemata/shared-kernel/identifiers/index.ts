import { type DistinctiveMarker } from "./generation";
import { type IdentifierDeclaration } from "./occurrences";
import { type VerifyReferentialIntegrity } from "./referential-integrity";
import { type VerifyUniquenessOfIdentifierDeclarations } from "./uniqueness";
import { type WithScope } from "~/xjustiz-schemata/shared-kernel/scoping";

export interface WithIdentifierCapabilities<
  Value,
  Scope,
  Ordinal extends number,
> extends IdentifierDeclaration,
    DistinctiveMarker<Value, Ordinal>,
    WithScope<Scope> {}

export type VerifyIdentityConstraints<Document> =
  | VerifyUniquenessOfIdentifierDeclarations<Document>
  | VerifyReferentialIntegrity<Document>;

export {
  type NonDistinctiveGenerator,
  memorizeAsGenerator,
} from "./generation";

export { type Reference, reference } from "./occurrences";
