/**
 * @typedef {import('./types').Token} Token
 */

import { AST } from '@robinblomberg/sqlite-ast';
import { tokenize } from './tokenize.js';

/**
 * @param {Token} left
 * @param {Token} right
 * @return {boolean}
 */
const _shouldAddSpaceBetween = (left, right) => {
  switch (left.type) {
    case 'Identifier':
    case 'Keyword': {
      switch (right.type) {
        case 'Identifier':
        case 'Keyword':
          return true;
        case 'Punctuator':
          switch (right.value) {
            case '(':
              return left.type === 'Keyword';
            case '||':
            case '*':
            case '/':
            case '%':
            case '+':
            case '-':
            case '<<':
            case '>>':
            case '&':
            case '|':
            case '<':
            case '<=':
            case '>':
            case '>=':
            case '=':
            case '==':
            case '!=':
            case '<>':
              return true;
            default:
              return false;
          }
        default:
          return false;
      }
    }
    case 'Punctuator': {
      switch (left.value) {
        case '||':
        case '*':
        case '/':
        case '%':
        case '+':
        case '-':
        case '<<':
        case '>>':
        case '&':
        case '|':
        case '<':
        case '<=':
        case '>':
        case '>=':
        case '=':
        case '==':
        case '!=':
        case '<>':
        case ',': {
          return true;
        }
        default: {
          return false;
        }
      }
    }
    default: {
      return false;
    }
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
