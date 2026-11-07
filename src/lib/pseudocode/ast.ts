export type BaseType = "ENTIER" | "REEL" | "CHAINE" | "CARACTERE" | "BOOLEEN";

export interface TypeSpec {
  base: BaseType;
  /** Bornes des dimensions pour un tableau (expressions évaluées à la déclaration). */
  dims?: Array<{ lo: Expr; hi: Expr }>;
  /** Tableau sans bornes (paramètre « T : TABLEAU DE ENTIER »). */
  isArray?: boolean;
}

export type Expr =
  | { kind: "num"; value: number; line: number }
  | { kind: "str"; value: string; line: number }
  | { kind: "bool"; value: boolean; line: number }
  | { kind: "var"; name: string; display: string; line: number }
  | { kind: "index"; name: string; display: string; indices: Expr[]; line: number }
  | { kind: "call"; name: string; display: string; args: Expr[]; line: number }
  | { kind: "unary"; op: "-" | "+" | "NON"; operand: Expr; line: number }
  | { kind: "binary"; op: string; left: Expr; right: Expr; line: number };

export type LValue =
  | { kind: "var"; name: string; display: string; line: number }
  | { kind: "index"; name: string; display: string; indices: Expr[]; line: number };

export type Stmt =
  | { kind: "assign"; target: LValue; value: Expr; line: number }
  | { kind: "write"; args: Expr[]; newline: boolean; line: number }
  | { kind: "read"; targets: LValue[]; line: number }
  | { kind: "if"; branches: Array<{ cond: Expr; body: Stmt[] }>; elseBody: Stmt[] | null; line: number }
  | {
      kind: "for";
      variable: LValue;
      from: Expr;
      to: Expr;
      step: Expr | null;
      body: Stmt[];
      line: number;
    }
  | { kind: "while"; cond: Expr; body: Stmt[]; line: number }
  | { kind: "repeat"; body: Stmt[]; cond: Expr; line: number }
  | {
      kind: "switch";
      subject: Expr;
      cases: Array<{ values: Expr[]; body: Stmt[] }>;
      defaultBody: Stmt[] | null;
      line: number;
    }
  | { kind: "return"; value: Expr | null; line: number }
  | { kind: "call"; name: string; display: string; args: Expr[]; line: number };

export interface VarDecl {
  name: string;
  display: string;
  type: TypeSpec;
  line: number;
}

export interface ConstDecl {
  name: string;
  display: string;
  value: Expr;
  type?: TypeSpec;
  line: number;
}

export interface Param {
  name: string;
  display: string;
  type: TypeSpec;
  byRef: boolean;
}

export interface Routine {
  kind: "fonction" | "procedure";
  name: string;
  display: string;
  params: Param[];
  returnType: TypeSpec | null;
  vars: VarDecl[];
  consts: ConstDecl[];
  body: Stmt[];
  line: number;
}

export interface Program {
  name: string | null;
  consts: ConstDecl[];
  vars: VarDecl[];
  routines: Routine[];
  body: Stmt[];
}
