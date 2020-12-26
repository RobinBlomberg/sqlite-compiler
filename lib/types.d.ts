import { AST, Nodes } from '@robinblomberg/sqlite-ast';

export type Token = {
  type: 'Hex' | 'Identifier' | 'Keyword' | 'Numeric' | 'Punctuator' | 'String';
  value: string;
};

export function compile(node: AST._Node): string;

export { AST, Nodes };
