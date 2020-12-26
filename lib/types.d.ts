import { AST, Nodes } from '@robinblomberg/sqlite-ast';

declare function compile(node: AST.Node): string;

export type Token = {
  type: 'Hex' | 'Identifier' | 'Keyword' | 'Numeric' | 'Punctuator' | 'String';
  value: string;
};

export { AST, Nodes };
