export type Token = {
  type: 'Hex' | 'Identifier' | 'Keyword' | 'Numeric' | 'Punctuator' | 'String';
  value: string;
};
