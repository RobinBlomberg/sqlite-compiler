/**
 * @typedef {import('./types.js').Token} Token
 */

import { AST } from '@robinblomberg/sqlite-ast';
import { tokenize } from './tokenize.js';

const BinaryOperators = new Set([
  '||',
  '*',
  '/',
  '%',
  '+',
  '-',
  '<<',
  '>>',
  '&',
  '|',
  '<',
  '<=',
  '>',
  '>=',
  '=',
  '==',
  '!=',
  '<>',
]);

/**
 * @param {Token} left
 * @param {Token} right
 * @return {boolean}
 */
const _shouldAddSpaceBetween = (left, right) => {
  switch (left.type) {
    case 'Hex':
    case 'Numeric':
    case 'String': {
      switch (right.type) {
        case 'Hex':
        case 'Keyword':
        case 'Identifier':
        case 'Numeric':
        case 'String':
          return true;
        default:
          return BinaryOperators.has(right.value);
      }
    }
    case 'Identifier':
    case 'Keyword': {
      switch (right.type) {
        case 'Punctuator':
          switch (right.value) {
            case '(':
              return left.type === 'Keyword';
            default:
              return BinaryOperators.has(right.value);
          }
        default:
          return true;
      }
    }
    case 'Punctuator':
      switch (left.value) {
        case ',':
          return true;
        default:
          return BinaryOperators.has(left.value);
      }
    default:
      return false;
  }
};

/**
 * @param {Token[]} tokens
 * @return {string}
 */
export const compileTokens = (tokens) => {
  let sql = tokens[0].value;

  for (let i = 1, left = tokens[0]; i < tokens.length; left = tokens[i++]) {
    const right = tokens[i];

    if (_shouldAddSpaceBetween(left, right)) {
      sql += ' ';
    }

    sql += right.value;
  }

  return sql;
};

/**
 * @param {AST._Node} node
 * @return {string}
 */
export const compile = (node) => {
  return compileTokens(tokenize(node));
};
