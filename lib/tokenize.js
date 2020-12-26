/**
 * @typedef {import('./types').Token} Token
 */

import { AST, BinaryOperatorPrecedence as Precedence } from '@robinblomberg/sqlite-ast';
import * as Tokens from './tokens.js';

/*
 * Helpers
 * -------------------------------------------------------------------------------------------------
 */

/**
 * @param {string} keywords
 * @return {Token[]}
 */
const _ = (keywords) => {
  return keywords.split(/\s+/).map(Tokens.Keyword);
};

/**
 * @param {(
 *   | AST._FunctionInvocation
 *   | AST.AggregateFunctionInvocation
 *   | AST.SimpleFunctionInvocation
 *   | AST.WindowFunctionInvocation
 * )} node
 * @return {Token[]}
 */
const __FunctionInvocation = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._Identifier(node.name));
  t.push(Tokens.Punctuator('('));

  if (node.args === '*') {
    t.push(Tokens.Punctuator('*'));
  } else if (Array.isArray(node.args)) {
    t.push(...__List(node.args, Expr));
  } else if (node.args !== null) {
    t.push(..._Args(node.args));
  }

  t.push(Tokens.Punctuator(')'));

  if ('filter' in node && node.filter !== null) {
    t.push(...FilterClause(node.filter));
  }

  if ('over' in node && node.over !== null) {
    t.push(...OverClause(node.over));
  }

  return t;
};

/**
 * @param {AST.Expr} node
 * @param {AST._BinaryExpression} parent
 * @return {Token[]}
 */
const __ChildExpression = (node, parent) => {
  /** @type {Token[]} */
  const t = [];
  const childHasLowerPrecedence = node.type === '_BinaryExpression' &&
    Precedence[node.operator] < Precedence[parent.operator];

  if (childHasLowerPrecedence) {
    t.push(Tokens.Punctuator('('));
  }

  t.push(...Expr(node));

  if (childHasLowerPrecedence) {
    t.push(Tokens.Punctuator(')'));
  }

  return t;
};

/**
 * @template T
 * @param {T[]} nodes
 * @param {(node: T) => Token[]} Node
 * @param {string} [delimiter]
 * @return {Token[]}
 */
const __List = (nodes, Node, delimiter = ',') => {
  /** @type {Token[]} */
  const t = [];

  for (let i = 0; i < nodes.length; i++) {
    if (delimiter && i > 0) {
      t.push(Tokens.Punctuator(delimiter));
    }

    t.push(...Node(nodes[i]));
  }

  return t;
};

/**
 * @param {string} operator
 * @return {Token[]}
 */
const __Operator = (operator) => {
  return /^[A-Z ]+$/.test(operator)
    ? _(operator)
    : [Tokens.Punctuator(operator)];
};

/**
 * @param {AST._Path | AST._Identifier} node
 * @return {Token[]}
 */
const __PathLike = (node) => {
  return node.type === '_Path'
    ? _Path(node)
    : _Identifier(node);
};

/*
 * Internal nodes
 * -------------------------------------------------------------------------------------------------
 */

/**
 * @param {AST._AddClause} node
 * @return {Token[]}
 */
export const _AddClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('ADD'));
  t.push(...ColumnDef(node.columnDef));

  return t;
};

/**
 * @param {AST._AllColumnsClause} node
 * @return {Token[]}
 */
export const _AllColumnsClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.tableName !== null) {
    t.push(..._Identifier(node.tableName));
    t.push(Tokens.Punctuator('.'));
  }

  t.push(Tokens.Punctuator('*'));

  return t;
};

/**
 * @param {AST._Args} node
 * @return {Token[]}
 */
export const _Args = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.distinct) {
    t.push(..._('DISTINCT'));
  }

  t.push(...__List(node.args, Expr));

  return t;
};

/**
 * @param {AST._AsClause} node
 * @return {Token[]}
 */
export const _AsClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.generatedAlways) {
    t.push(..._('GENERATED ALWAYS'));
  }

  t.push(..._('AS'));
  t.push(Tokens.Punctuator('('));
  t.push(...Expr(node.as));
  t.push(Tokens.Punctuator(')'));

  if (node.mode !== null) {
    t.push(..._(node.mode));
  }

  return t;
};

/**
 * @param {AST._BetweenExpression} node
 * @return {Token[]}
 */
export const _BetweenExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...Expr(node.argument));

  if (node.negated) {
    t.push(..._('NOT'));
  }

  t.push(..._('BETWEEN'));
  t.push(...Expr(node.lower));
  t.push(..._('AND'));
  t.push(...Expr(node.upper));

  return t;
};

/**
 * @param {AST._BinaryExpression} node
 * @return {Token[]}
 */
export const _BinaryExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...__ChildExpression(node.left, node));
  t.push(...__Operator(node.operator));
  t.push(...__ChildExpression(node.right, node));

  return t;
};

/**
 * @param {AST._BinaryKeywordExpression} node
 * @return {Token[]}
 */
export const _BinaryKeywordExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...Expr(node.left));

  if (node.negated) {
    t.push(..._('NOT'));
  }

  t.push(..._(node.operator));
  t.push(...Expr(node.right));

  if (node.escape !== null) {
    t.push(..._('ESCAPE'));
    t.push(...Expr(node.escape));
  }

  return t;
};

/**
 * @param {AST._BlobLiteral} node
 * @return {Token[]}
 */
export const _BlobLiteral = (node) => {
  return node.value.map((chunk) => {
    return Tokens.Hex(`x'${chunk}'`);
  });
};

/**
 * @param {AST._CaseExpression} node
 * @return {Token[]}
 */
export const _CaseExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('CASE'));

  if (node.discriminant !== null) {
    t.push(...Expr(node.discriminant));
  }

  t.push(...__List(node.cases, _CaseClause, ''));

  if (node.alternate !== null) {
    t.push(..._('ELSE'));
    t.push(...Expr(node.alternate));
  }

  t.push(..._('END'));

  return t;
};

/**
 * @param {AST._CaseClause} node
 * @return {Token[]}
 */
export const _CaseClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('WHEN'));
  t.push(...Expr(node.when));
  t.push(..._('THEN'));
  t.push(...Expr(node.then));

  return t;
};

/**
 * @param {AST._CastExpression} node
 * @return {Token[]}
 */
export const _CastExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('CAST'));
  t.push(Tokens.Punctuator('('));
  t.push(...Expr(node.cast));
  t.push(..._('AS'));
  t.push(...TypeName(node.as));
  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST._CheckClause} node
 * @return {Token[]}
 */
export const _CheckClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('CHECK'));
  t.push(Tokens.Punctuator('('));
  t.push(...Expr(node.expr));
  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST._CheckConstraint} node
 * @return {Token[]}
 */
export const _CheckConstraint = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('CHECK'));
  t.push(Tokens.Punctuator('('));
  t.push(...Expr(node.check));
  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST._CollateClause} node
 * @return {Token[]}
 */
export const _CollateClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('COLLATE'));
  t.push(..._Identifier(node.collationName));

  return t;
};

/**
 * @param {AST._CollateExpression} node
 * @return {Token[]}
 */
export const _CollateExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...Expr(node.expr));
  t.push(..._('COLLATE'));
  t.push(..._Identifier(node.collationName));

  return t;
};

/**
 * @param {AST._ColumnAliasClause} node
 * @return {Token[]}
 */
export const _ColumnAliasClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...Expr(node.expr));
  t.push(..._Identifier(node.as));

  return t;
};

/**
 * @param {AST._ColumnConstraintClause} node
 * @return {Token[]}
 */
export const _ColumnConstraintClause = (node) => {
  switch (node.type) {
    case '_PrimaryKeyClause':
      return _PrimaryKeyClause(node);
    case '_NotNullClause':
      return _NotNullClause(node);
    case '_UniqueClause':
      return _UniqueClause(node);
    case '_CheckClause':
      return _CheckClause(node);
    case '_DefaultClause':
      return _DefaultClause(node);
    case '_CollateClause':
      return _CollateClause(node);
    case 'ForeignKeyClause':
      return ForeignKeyClause(node);
    case '_AsClause':
      return _AsClause(node);
    default:
      throw new TypeError(
        `Unexpected column constraint clause type: ${/** @type {any} */ (node).type}`
      );
  }
};

/**
 * @param {AST._ColumnSelectorClause} node
 * @return {Token[]}
 */
export const _ColumnSelectorClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(Tokens.Punctuator('('));
  t.push(...__List(node.indexedColumns, IndexedColumn));
  t.push(Tokens.Punctuator(')'));

  if (node.where !== null) {
    t.push(..._WhereClause(node.where));
  }

  return t;
};

/**
 * @param {AST._DefaultClause} node
 * @return {Token[]}
 */
export const _DefaultClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('DEFAULT'));

  switch (node.expr.type) {
    case '_NumericLiteral':
    case '_StringLiteral':
    case '_BlobLiteral':
      t.push(...Expr(node.expr));
      break;
    default:
      t.push(Tokens.Punctuator('('));
      t.push(...Expr(node.expr));
      t.push(Tokens.Punctuator(')'));
      break;
  }

  return t;
};

/**
 * @param {AST._DeferrableClause} node
 * @return {Token[]}
 */
export const _DeferrableClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.negated) {
    t.push(..._('NOT'));
  }

  t.push(..._('DEFERRABLE'));

  if (node.initially) {
    t.push(..._('INITIALLY'));
    t.push(..._(node.initially));
  }

  return t;
};

/**
 * @param {AST._ExistsExpression} node
 * @return {Token[]}
 */
export const _ExistsExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.negated) {
    t.push(..._('NOT'));
  }

  t.push(..._('EXISTS'));
  t.push(Tokens.Punctuator('('));
  t.push(...SelectStmt(node.select));
  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST._ForeignKeyConstraint} node
 * @return {Token[]}
 */
export const _ForeignKeyConstraint = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('FOREIGN KEY'));
  t.push(Tokens.Punctuator('('));
  t.push(...__List(node.columnNames, _Identifier));
  t.push(Tokens.Punctuator(')'));
  t.push(...ForeignKeyClause(node.foreignKey));

  return t;
};

/**
 * @param {AST._FrameSpecBetweenClause} node
 * @return {Token[]}
 */
export const _FrameSpecBetweenClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('BETWEEN'));

  if (typeof node.between === 'string') {
    t.push(..._(node.between));
  } else {
    t.push(..._FrameSpecExprClause(node.between));
  }

  t.push(..._('AND'));

  if (typeof node.and === 'string') {
    t.push(..._(node.and));
  } else {
    t.push(..._FrameSpecExprClause(node.and));
  }

  return t;
};

/**
 * @param {AST._FrameSpecExprClause} node
 * @return {Token[]}
 */
export const _FrameSpecExprClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...Expr(node.expr));
  t.push(..._(node.position));

  return t;
};

/**
 * @param {AST._FunctionInvocation} node
 * @return {Token[]}
 */
export const _FunctionInvocation = (node) => {
  return __FunctionInvocation(node);
};

/**
 * @param {AST._GroupByClause} node
 * @return {Token[]}
 */
export const _GroupByClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('GROUP BY'));
  t.push(...__List(node.expressions, Expr));

  if (node.having !== null) {
    t.push(..._('HAVING'));
    t.push(...Expr(node.having));
  }

  return t;
};

/**
 * @param {AST._Identifier} node
 * @return {Token[]}
 */
export const _Identifier = (node) => {
  return [Tokens.Identifier(node.name)];
};

/**
 * @param {AST._InExpression} node
 * @return {Token[]}
 */
export const _InExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...Expr(node.argument));

  if (node.negated) {
    t.push(..._('NOT'));
  }

  t.push(..._('IN'));

  if (node.selector.type === '_SelectorClause') {
    t.push(..._SelectorClause(node.selector));
  } else {
    t.push(..._TableSelectorClause(node.selector));
  }

  return t;
};

/**
 * @param {AST._InsertSelectClause} node
 * @return {Token[]}
 */
export const _InsertSelectClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...SelectStmt(node.select));

  if (node.upsert !== null) {
    t.push(...UpsertClause(node.upsert));
  }

  return t;
};

/**
 * @param {AST._InsertValuesClause} node
 * @return {Token[]}
 */
export const _InsertValuesClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._ValuesClause(node.values));

  if (node.upsert !== null) {
    t.push(...UpsertClause(node.upsert));
  }

  return t;
};

/**
 * @param {AST._IsExpression} node
 * @return {Token[]}
 */
export const _IsExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...Expr(node.left));
  t.push(..._('IS'));

  if (node.negated) {
    t.push(..._('NOT'));
  }

  t.push(...Expr(node.right));

  return t;
};

/**
 * @param {AST._JoinCompound} node
 * @return {Token[]}
 */
export const _JoinCompound = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...__Operator(node.operator));
  t.push(...TableOrSubquery(node.query));

  if (node.constraint !== null) {
    t.push(...JoinConstraint(node.constraint));
  }

  return t;
};

/**
 * @param {AST._JoinOnClause} node
 * @return {Token[]}
 */
export const _JoinOnClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('ON'));
  t.push(...Expr(node.on));

  return t;
};

/**
 * @param {AST._JoinUsingClause} node
 * @return {Token[]}
 */
export const _JoinUsingClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('USING'));
  t.push(Tokens.Punctuator('('));
  t.push(...__List(node.columnNames, _Identifier));
  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST._KeywordLiteral} node
 * @return {Token[]}
 */
export const _KeywordLiteral = (node) => {
  return _(node.value);
};

/**
 * @param {AST._LimitClause} node
 * @return {Token[]}
 */
export const _LimitClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('LIMIT'));
  t.push(...Expr(node.left));

  if (node.right !== null) {
    t.push(..._LimitTailClause(node.right));
  }

  return t;
};

/**
 * @param {AST._LimiterClause} node
 * @return {Token[]}
 */
export const _LimiterClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.orderBy.length > 0) {
    t.push(..._('ORDER BY'));
    t.push(...__List(node.orderBy, OrderingTerm));
  }

  if (node.limit !== null) {
    t.push(..._LimitClause(node.limit));
  }

  return t;
};

/**
 * @param {AST._LimitTailClause} node
 * @return {Token[]}
 */
export const _LimitTailClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.offset) {
    t.push(..._('OFFSET'));
  } else {
    t.push(Tokens.Punctuator(','));
  }

  t.push(...Expr(node.expr));

  return t;
};

/**
 * @param {AST._MatchClause} node
 * @return {Token[]}
 */
export const _MatchClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('MATCH'));
  t.push(..._Identifier(node.name));

  return t;
};

/**
 * @param {AST._NotNullClause} node
 * @return {Token[]}
 */
export const _NotNullClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('NOT NULL'));

  if (node.onConflict !== null) {
    t.push(...ConflictClause(node.onConflict));
  }

  return t;
};

/**
 * @param {AST._NullComparisonExpression} node
 * @return {Token[]}
 */
export const _NullComparisonExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...Expr(node.expr));

  if (node.negated) {
    t.push(..._('NOTNULL'));
  } else {
    t.push(..._('ISNULL'));
  }

  return t;
};

/**
 * @param {AST._NumericLiteral} node
 * @return {Token[]}
 */
export const _NumericLiteral = (node) => {
  return [Tokens.Numeric(String(node.value))];
};

/**
 * @param {AST._OnClause} node
 * @return {Token[]}
 */
export const _OnClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('ON'));
  t.push(..._(node.on));
  t.push(..._(node.action));

  return t;
};

/**
 * @param {AST._Path} node
 * @return {Token[]}
 */
export const _Path = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.object !== null) {
    t.push(..._Identifier(node.object));
    t.push(Tokens.Punctuator('.'));
  }

  t.push(..._Identifier(node.property));

  return t;
};

/**
 * @param {AST._PragmaGetter} node
 * @return {Token[]}
 */
export const _PragmaGetter = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(Tokens.Punctuator('('));
  t.push(...PragmaValue(node.value));
  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST._PragmaSetter} node
 * @return {Token[]}
 */
export const _PragmaSetter = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(Tokens.Punctuator('='));
  t.push(...PragmaValue(node.value));

  return t;
};

/**
 * @param {AST._PrimaryKeyClause} node
 * @return {Token[]}
 */
export const _PrimaryKeyClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('PRIMARY KEY'));

  if (node.orderBy !== null) {
    t.push(..._(node.orderBy));
  }

  if (node.onConflict !== null) {
    t.push(...ConflictClause(node.onConflict));
  }

  if (node.autoincrement) {
    t.push(..._('AUTOINCREMENT'));
  }

  return t;
};

/**
 * @param {AST._PrimaryKeyConstraint} node
 * @return {Token[]}
 */
export const _PrimaryKeyConstraint = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('PRIMARY KEY'));
  t.push(Tokens.Punctuator('('));
  t.push(...__List(node.indexedColumns, IndexedColumn));
  t.push(Tokens.Punctuator(')'));

  if (node.onConflict !== null) {
    t.push(...ConflictClause(node.onConflict));
  }

  return t;
};

/**
 * @param {AST._QualifiedPath} node
 * @return {Token[]}
 */
export const _QualifiedPath = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._Identifier(node.schemaName));
  t.push(Tokens.Punctuator('.'));
  t.push(...__PathLike(node.path));

  return t;
};

/**
 * @param {AST._RenameClause} node
 * @return {Token[]}
 */
export const _RenameClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('RENAME'));

  if (node.from !== null) {
    t.push(..._Identifier(node.from));
  }

  t.push(..._('TO'));
  t.push(..._Identifier(node.to));

  return t;
};

/**
 * @param {AST._SelectClause} node
 * @return {Token[]}
 */
export const _SelectClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('SELECT'));

  if (node.modifier !== null) {
    t.push(..._(node.modifier));
  }

  t.push(...__List(node.resultColumns, ResultColumn));

  if (node.from.length > 0) {
    t.push(..._('FROM'));
    t.push(...__List(node.from, TableOrSubquery));
  }

  if (node.where !== null) {
    t.push(..._WhereClause(node.where));
  }

  if (node.groupBy !== null) {
    t.push(..._GroupByClause(node.groupBy));
  }

  if (node.window.length > 0) {
    t.push(..._('WINDOW'));
    t.push(...__List(node.window, _WindowAsClause));
  }

  return t;
};

/**
 * @param {AST._SelectCompound} node
 * @return {Token[]}
 */
export const _SelectCompound = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._(node.operator));
  t.push(...SelectCore(node.selector));

  return t;
};

/**
 * @param {AST._SelectorClause} node
 * @return {Token[]}
 */
export const _SelectorClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(Tokens.Punctuator('('));

  if (Array.isArray(node.selector)) {
    t.push(...__List(node.selector, Expr));
  } else {
    t.push(...SelectStmt(node.selector));
  }

  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST._SequenceExpression} node
 * @return {Token[]}
 */
export const _SequenceExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(Tokens.Punctuator('('));
  t.push(...__List(node.expressions, Expr));
  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST._SetClause} node
 * @return {Token[]}
 */
export const _SetClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('SET'));

  if (node.columns.type === '_Identifier') {
    t.push(..._Identifier(node.columns));
  } else {
    t.push(...ColumnNameList(node.columns));
  }

  t.push(Tokens.Punctuator('='));
  t.push(...Expr(node.expr));

  return t;
};

/**
 * @param {AST._Stmt} node
 * @return {Token[]}
 */
export const _Stmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  switch (node.type) {
    case 'AlterTableStmt':
      t.push(...AlterTableStmt(node));
      break;
    case 'AnalyzeStmt':
      t.push(...AnalyzeStmt(node));
      break;
    case 'AttachStmt':
      t.push(...AttachStmt(node));
      break;
    case 'BeginStmt':
      t.push(...BeginStmt(node));
      break;
    case 'CommitStmt':
      t.push(...CommitStmt());
      break;
    case 'CreateIndexStmt':
      t.push(...CreateIndexStmt(node));
      break;
    case 'CreateTableStmt':
      t.push(...CreateTableStmt(node));
      break;
    case 'CreateTriggerStmt':
      t.push(...CreateTriggerStmt(node));
      break;
    case 'CreateViewStmt':
      t.push(...CreateViewStmt(node));
      break;
    case 'CreateVirtualTableStmt':
      t.push(...CreateVirtualTableStmt(node));
      break;
    case 'DeleteStmt':
      t.push(...DeleteStmt(node));
      break;
    case 'DetachStmt':
      t.push(...DetachStmt(node));
      break;
    case 'DropIndexStmt':
      t.push(...DropIndexStmt(node));
      break;
    case 'DropTableStmt':
      t.push(...DropTableStmt(node));
      break;
    case 'DropTriggerStmt':
      t.push(...DropTriggerStmt(node));
      break;
    case 'DropViewStmt':
      t.push(...DropViewStmt(node));
      break;
    case 'InsertStmt':
      t.push(...InsertStmt(node));
      break;
    case 'PragmaStmt':
      t.push(...PragmaStmt(node));
      break;
    case 'ReindexStmt':
      t.push(...ReindexStmt(node));
      break;
    case 'ReleaseStmt':
      t.push(...ReleaseStmt(node));
      break;
    case 'RollbackStmt':
      t.push(...RollbackStmt(node));
      break;
    case 'SavepointStmt':
      t.push(...SavepointStmt(node));
      break;
    case 'SelectStmt':
      t.push(...SelectStmt(node));
      break;
    case 'UpdateStmt':
      t.push(...UpdateStmt(node));
      break;
    case 'VacuumStmt':
      t.push(...VacuumStmt(node));
      break;
    default:
      throw new TypeError(`Unexpected node type: ${/** @type {any} */ (node).type}`);
  }

  return t;
};

/**
 * @param {AST._StringLiteral} node
 * @return {Token[]}
 */
export const _StringLiteral = (node) => {
  return [Tokens.String(`'${node.value.replace(/([\\'])/g, '\\$1')}'`)];
};

/**
 * @param {AST._TableCallClause} node
 * @return {Token[]}
 */
export const _TableCallClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...__PathLike(node.path));
  t.push(Tokens.Punctuator('('));
  t.push(...__List(node.args, Expr));
  t.push(Tokens.Punctuator(')'));

  if (node.tableAlias !== null) {
    t.push(..._Identifier(node.tableAlias));
  }

  return t;
};

/**
 * @param {AST._TableDef} node
 * @return {Token[]}
 */
export const _TableDef = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(Tokens.Punctuator('('));
  t.push(...__List(node.columnDefs, ColumnDef));

  if (node.tableConstraints.length > 0) {
    t.push(Tokens.Punctuator(','));
    t.push(...__List(node.tableConstraints, TableConstraint));
  }

  t.push(Tokens.Punctuator(')'));

  if (node.withoutRowId) {
    t.push(..._('WITHOUT ROWID'));
  }

  return t;
};

/**
 * @param {AST._TableQueryClause} node
 * @return {Token[]}
 */
export const _TableQueryClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(Tokens.Punctuator('('));

  if (Array.isArray(node.query)) {
    t.push(...__List(node.query, TableOrSubquery));
  } else {
    t.push(...JoinClause(node.query));
  }

  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST._TableSelectClause} node
 * @return {Token[]}
 */
export const _TableSelectClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(Tokens.Punctuator('('));
  t.push(...SelectStmt(node.select));
  t.push(Tokens.Punctuator(')'));

  if (node.tableAlias !== null) {
    t.push(..._Identifier(node.tableAlias));
  }

  return t;
};

/**
 * @param {AST._TableSelectorClause} node
 * @return {Token[]}
 */
export const _TableSelectorClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...__PathLike(node.path));

  if (node.args.length > 0) {
    t.push(Tokens.Punctuator('('));
    t.push(...__List(node.args, Expr));
    t.push(Tokens.Punctuator(')'));
  }

  return t;
};

/**
 * @param {AST._UnaryExpression} node
 * @return {Token[]}
 */
export const _UnaryExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...__Operator(node.operator));
  t.push(...Expr(node.argument));

  return t;
};

/**
 * @param {AST._UniqueClause} node
 * @return {Token[]}
 */
export const _UniqueClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('UNIQUE'));

  if (node.onConflict !== null) {
    t.push(...ConflictClause(node.onConflict));
  }

  return t;
};

/**
 * @param {AST._UniqueConstraint} node
 * @return {Token[]}
 */
export const _UniqueConstraint = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('UNIQUE'));
  t.push(Tokens.Punctuator('('));
  t.push(...__List(node.indexedColumns, IndexedColumn));
  t.push(Tokens.Punctuator(')'));

  if (node.onConflict !== null) {
    t.push(...ConflictClause(node.onConflict));
  }

  return t;
};

/**
 * @param {AST._UpdateSetClause} node
 * @return {Token[]}
 */
export const _UpdateSetClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('UPDATE'));
  t.push(...__List(node.set, _SetClause));

  if (node.where !== null) {
    t.push(..._WhereClause(node.where));
  }

  return t;
};

/**
 * @param {AST._ValueClause} node
 * @return {Token[]}
 */
export const _ValueClause = (node) => {
  return __List(node.values, Expr);
};

/**
 * @param {AST._ValuesClause} node
 * @return {Token[]}
 */
export const _ValuesClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('VALUES'));

  for (let i = 0; i < node.rows.length; i++) {
    if (i > 0) {
      t.push(Tokens.Punctuator(','));
    }

    t.push(Tokens.Punctuator('('));
    t.push(..._ValueClause(node.rows[i]));
    t.push(Tokens.Punctuator(')'));
  }

  return t;
};

/**
 * @param {AST._WhereClause} node
 * @return {Token[]}
 */
export const _WhereClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('WHERE'));
  t.push(...Expr(node.expr));

  return t;
};

/**
 * @param {AST._WindowAsClause} node
 * @return {Token[]}
 */
export const _WindowAsClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._Identifier(node.windowName));
  t.push(..._('AS'));
  t.push(..._Identifier(node.windowDefn));

  return t;
};

/*
 * External nodes
 * -------------------------------------------------------------------------------------------------
 */

/**
 * @param {AST.AggregateFunctionInvocation} node
 * @return {Token[]}
 */
export const AggregateFunctionInvocation = (node) => {
  return __FunctionInvocation(node);
};

/**
 * @param {AST.AlterTableStmt} node
 * @return {Token[]}
 */
export const AlterTableStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('ALTER TABLE'));
  t.push(...__PathLike(node.path));

  if (node.action.type === '_RenameClause') {
    t.push(..._RenameClause(node.action));
  } else {
    t.push(..._AddClause(node.action));
  }

  return t;
};

/**
 * @param {AST.AnalyzeStmt} node
 * @return {Token[]}
 */
export const AnalyzeStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('ANALYZE'));

  if (node.path !== null) {
    t.push(...__PathLike(node.path));
  }

  return t;
};

/**
 * @param {AST.AttachStmt} node
 * @return {Token[]}
 */
export const AttachStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('ATTACH'));
  t.push(...Expr(node.expr));
  t.push(..._('AS'));
  t.push(..._Identifier(node.schemaName));

  return t;
};

/**
 * @param {AST.BeginStmt} node
 * @return {Token[]}
 */
export const BeginStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('BEGIN'));

  if (node.mode !== null) {
    t.push(..._(node.mode));
  }

  return t;
};

/**
 * @param {AST.ColumnConstraint} node
 * @return {Token[]}
 */
export const ColumnConstraint = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.name !== null) {
    t.push(..._('CONSTRAINT'));
    t.push(..._Identifier(node.name));
  }

  t.push(..._ColumnConstraintClause(node.constraint));

  return t;
};

/**
 * @param {AST.ColumnDef} node
 * @return {Token[]}
 */
export const ColumnDef = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._Identifier(node.columnName));

  if (node.typeName !== null) {
    t.push(...TypeName(node.typeName));
  }

  t.push(...__List(node.columnConstraints, ColumnConstraint, ''));

  return t;
};

/**
 * @param {AST.ColumnNameList} node
 * @return {Token[]}
 */
export const ColumnNameList = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(Tokens.Punctuator('('));
  t.push(...__List(
    node.columnNames,
    (columnName) => [Tokens.Identifier(columnName.name)]
  ));
  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @return {Token[]}
 */
export const CommitStmt = () => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('COMMIT'));

  return t;
};

/**
 * @param {AST.CommonTableExpression} node
 * @return {Token[]}
 */
export const CommonTableExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...CteTableName(node.tableName));
  t.push(..._('AS'));
  t.push(Tokens.Punctuator('('));
  t.push(...SelectStmt(node.as));
  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST.ConflictClause} node
 * @return {Token[]}
 */
export const ConflictClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('ON CONFLICT'));
  t.push(..._(node.onConflict));

  return t;
};

/**
 * @param {AST.CreateIndexStmt} node
 * @return {Token[]}
 */
export const CreateIndexStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('CREATE'));

  if (node.unique) {
    t.push(..._('UNIQUE'));
  }

  t.push(..._('INDEX'));

  if (node.ifNotExists) {
    t.push(..._('IF NOT EXISTS'));
  }

  t.push(...__PathLike(node.path));
  t.push(..._('ON'));
  t.push(..._Identifier(node.tableName));
  t.push(..._ColumnSelectorClause(node.selector));

  return t;
};

/**
 * @param {AST.CreateTableStmt} node
 * @return {Token[]}
 */
export const CreateTableStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('CREATE'));

  if (node.temporary) {
    t.push(..._('TEMP'));
  }

  t.push(..._('TABLE'));

  if (node.ifNotExists) {
    t.push(..._('IF NOT EXISTS'));
  }

  t.push(...__PathLike(node.path));

  if (node.target.type === 'SelectStmt') {
    t.push(..._('AS'));
    t.push(...SelectStmt(node.target));
  } else {
    t.push(..._TableDef(node.target));
  }

  return t;
};

/**
 * @param {AST.CreateTriggerStmt} node
 * @return {Token[]}
 */
export const CreateTriggerStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('CREATE'));

  if (node.temporary) {
    t.push(..._('TEMP'));
  }

  t.push(..._('TRIGGER'));

  if (node.ifNotExists) {
    t.push(..._('IF NOT EXISTS'));
  }

  t.push(...__PathLike(node.path));

  if (node.position !== null) {
    t.push(..._(node.position));
  }

  if (Array.isArray(node.event)) {
    t.push(..._('UPDATE OF'));
    t.push(...__List(node.event, _Identifier));
  } else {
    t.push(..._(node.event));
  }

  t.push(..._('ON'));
  t.push(..._Identifier(node.tableName));

  if (node.forEachRow) {
    t.push(..._('FOR EACH ROW'));
  }

  if (node.when) {
    t.push(..._('WHEN'));
    t.push(...Expr(node.when));
  }

  t.push(..._('BEGIN'));

  for (const stmt of node.begin) {
    switch (stmt.type) {
      case 'UpdateStmt':
        t.push(...UpdateStmt(stmt));
        break;
      case 'InsertStmt':
        t.push(...InsertStmt(stmt));
        break;
      case 'DeleteStmt':
        t.push(...DeleteStmt(stmt));
        break;
      case 'SelectStmt':
        t.push(...SelectStmt(stmt));
        break;
      default:
        throw new TypeError(`Unexpected node type: ${/** @type {any} */ (stmt).type}`);
    }

    t.push(Tokens.Punctuator(';'));
  }

  t.push(..._('END'));

  return t;
};

/**
 * @param {AST.CreateViewStmt} node
 * @return {Token[]}
 */
export const CreateViewStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('CREATE'));

  if (node.temporary) {
    t.push(..._('TEMP'));
  }

  t.push(..._('VIEW'));

  if (node.ifNotExists) {
    t.push(..._('IF NOT EXISTS'));
  }

  t.push(...__PathLike(node.path));

  if (node.columns.length > 0) {
    t.push(Tokens.Punctuator('('));
    t.push(...__List(node.columns, _Identifier));
    t.push(Tokens.Punctuator(')'));
  }

  t.push(..._('AS'));
  t.push(...SelectStmt(node.select));

  return t;
};

/**
 * @param {AST.CreateVirtualTableStmt} node
 * @return {Token[]}
 */
export const CreateVirtualTableStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('CREATE VIRTUAL TABLE'));

  if (node.ifNotExists) {
    t.push(..._('IF NOT EXISTS'));
  }

  t.push(...__PathLike(node.path));
  t.push(..._('USING'));
  t.push(..._Identifier(node.moduleName));

  if (node.moduleArguments.length > 0) {
    t.push(Tokens.Punctuator('('));
    t.push(...__List(node.moduleArguments, _Identifier));
    t.push(Tokens.Punctuator(')'));
  }

  return t;
};

/**
 * @param {AST.CteTableName} node
 * @return {Token[]}
 */
export const CteTableName = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._Identifier(node.tableName));

  if (node.columnNames.length > 0) {
    t.push(Tokens.Punctuator('('));
    t.push(...__List(node.columnNames, _Identifier));
    t.push(Tokens.Punctuator(')'));
  }

  return t;
};

/**
 * @param {AST.DeleteStmt} node
 * @return {Token[]}
 */
export const DeleteStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.withClause !== null) {
    t.push(...WithClause(node.withClause));
  }

  t.push(..._('DELETE FROM'));
  t.push(...QualifiedTableName(node.name));

  if (node.where !== null) {
    t.push(..._WhereClause(node.where));
  }

  if (node.limiter !== null) {
    t.push(..._LimiterClause(node.limiter));
  }

  return t;
};

/**
 * @param {AST.DetachStmt} node
 * @return {Token[]}
 */
export const DetachStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('DETACH'));
  t.push(..._Identifier(node.schemaName));

  return t;
};

/**
 * @param {AST.DropIndexStmt} node
 * @return {Token[]}
 */
export const DropIndexStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('DROP'));
  t.push(..._('INDEX'));

  if (node.ifExists) {
    t.push(..._('IF EXISTS'));
  }

  t.push(...__PathLike(node.path));

  return t;
};

/**
 * @param {AST.DropTableStmt} node
 * @return {Token[]}
 */
export const DropTableStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('DROP'));
  t.push(..._('TABLE'));

  if (node.ifExists) {
    t.push(..._('IF EXISTS'));
  }

  t.push(...__PathLike(node.path));

  return t;
};

/**
 * @param {AST.DropTriggerStmt} node
 * @return {Token[]}
 */
export const DropTriggerStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('DROP'));
  t.push(..._('TRIGGER'));

  if (node.ifExists) {
    t.push(..._('IF EXISTS'));
  }

  t.push(...__PathLike(node.path));

  return t;
};

/**
 * @param {AST.DropViewStmt} node
 * @return {Token[]}
 */
export const DropViewStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('DROP'));
  t.push(..._('VIEW'));

  if (node.ifExists) {
    t.push(..._('IF EXISTS'));
  }

  t.push(...__PathLike(node.path));

  return t;
};

/**
 * @param {AST.Expr} node
 * @return {Token[]}
 */
export const Expr = (node) => {
  switch (node.type) {
    case '_NumericLiteral':
    case '_StringLiteral':
    case '_BlobLiteral':
    case '_KeywordLiteral':
      return LiteralValue(node);
    case '_QualifiedPath':
      return _QualifiedPath(node);
    case '_Path':
      return _Path(node);
    case '_Identifier':
      return _Identifier(node);
    case '_BinaryExpression':
      return _BinaryExpression(node);
    case '_FunctionInvocation':
      return _FunctionInvocation(node);
    case '_SequenceExpression':
      return _SequenceExpression(node);
    case '_CastExpression':
      return _CastExpression(node);
    case '_CollateExpression':
      return _CollateExpression(node);
    case '_BinaryKeywordExpression':
      return _BinaryKeywordExpression(node);
    case '_NullComparisonExpression':
      return _NullComparisonExpression(node);
    case '_IsExpression':
      return _IsExpression(node);
    case '_BetweenExpression':
      return _BetweenExpression(node);
    case '_InExpression':
      return _InExpression(node);
    case '_ExistsExpression':
      return _ExistsExpression(node);
    case 'SelectStmt':
      return [
        Tokens.Punctuator('('),
        ...SelectStmt(node),
        Tokens.Punctuator(')')
      ];
    case '_CaseExpression':
      return _CaseExpression(node);
    case 'RaiseFunction':
      return RaiseFunction(node);
    default:
      throw new TypeError(`Unexpected node type: ${/** @type {any} */ (node).type}`);
  }
};

/**
 * @param {AST.FactoredSelectStmt} node
 * @return {Token[]}
 */
export const FactoredSelectStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.withClause !== null) {
    t.push(...WithClause(node.withClause));
  }

  t.push(...SelectCore(node.selectors[0]));

  for (let i = 1; i < node.selectors.length; i++) {
    t.push(..._SelectCompound(/** @type {AST._SelectCompound} */ (node.selectors[i])));
  }

  if (node.limiter !== null) {
    t.push(..._LimiterClause(node.limiter));
  }

  return t;
};

/**
 * @param {AST.FilterClause} node
 * @return {Token[]}
 */
export const FilterClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('FILTER'));
  t.push(Tokens.Punctuator('('));
  t.push(..._WhereClause(node.where));
  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST.ForeignKeyClause} node
 * @return {Token[]}
 */
export const ForeignKeyClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('REFERENCES'));
  t.push(..._Identifier(node.foreignTable));

  if (node.columnNames.length > 0) {
    t.push(Tokens.Punctuator('('));
    t.push(...__List(node.columnNames, _Identifier));
    t.push(Tokens.Punctuator(')'));
  }

  for (const event of node.events) {
    if (event.type === '_OnClause') {
      t.push(..._OnClause(event));
    } else {
      t.push(..._MatchClause(event));
    }
  }

  if (node.deferrable) {
    t.push(..._DeferrableClause(node.deferrable));
  }

  return t;
};

/**
 * @param {AST.FrameSpec} node
 * @return {Token[]}
 */
export const FrameSpec = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._(node.frame));

  if (typeof node.target === 'string') {
    t.push(..._(node.target));
  } else if (node.target.type === '_FrameSpecBetweenClause') {
    t.push(..._FrameSpecBetweenClause(node.target));
  } else {
    t.push(...Expr(node.target));
    t.push(..._('PRECEDING'));
  }

  if (node.exclude !== null) {
    t.push(..._('EXCLUDE'));
    t.push(..._(node.exclude));
  }

  return t;
};

/**
 * @param {AST.IndexedColumn} node
 * @return {Token[]}
 */
export const IndexedColumn = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...Expr(node.target));

  if (node.collationName !== null) {
    t.push(..._('COLLATE'));
    t.push(..._Identifier(node.collationName));
  }

  if (node.orderBy !== null) {
    t.push(..._(node.orderBy));
  }

  return t;
};

/**
 * @param {AST.InsertStmt} node
 * @return {Token[]}
 */
export const InsertStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.withClause !== null) {
    t.push(...WithClause(node.withClause));
  }

  t.push(..._(node.operator));
  t.push(..._('INTO'));
  t.push(...__PathLike(node.path));

  if (node.alias !== null) {
    t.push(..._('AS'));
    t.push(..._Identifier(node.alias));
  }

  if (node.columns.length > 0) {
    t.push(Tokens.Punctuator('('));
    t.push(...__List(node.columns, _Identifier));
    t.push(Tokens.Punctuator(')'));
  }

  if (node.source === 'DEFAULT VALUES') {
    t.push(..._('DEFAULT VALUES'));
  } else if (node.source.type === '_InsertValuesClause') {
    t.push(..._InsertValuesClause(node.source));
  } else {
    t.push(..._InsertSelectClause(node.source));
  }

  return t;
};

/**
 * @param {AST.JoinClause} node
 * @return {Token[]}
 */
export const JoinClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...TableOrSubquery(node.joinees[0]));

  for (let i = 1; i < node.joinees.length; i++) {
    t.push(..._JoinCompound(/** @type {AST._JoinCompound} */ (node.joinees[i])));
  }

  return t;
};

/**
 * @param {AST.JoinConstraint} node
 * @return {Token[]}
 */
export const JoinConstraint = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.constraint.type === '_JoinOnClause') {
    t.push(..._JoinOnClause(node.constraint));
  } else if (node.constraint.type === '_JoinUsingClause') {
    t.push(..._JoinUsingClause(node.constraint));
  }

  return t;
};

/**
 * @param {AST.LiteralValue} node
 * @return {Token[]}
 */
export const LiteralValue = (node) => {
  switch (node.type) {
    case '_NumericLiteral':
      return _NumericLiteral(node);
    case '_StringLiteral':
      return _StringLiteral(node);
    case '_BlobLiteral':
      return _BlobLiteral(node);
    case '_KeywordLiteral':
      return _KeywordLiteral(node);
    default:
      throw new TypeError(`Unexpected node type: ${/** @type {any} */ (node).type}`);
  }
};

/**
 * @param {AST.OrderingTerm} node
 * @return {Token[]}
 */
export const OrderingTerm = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...IndexedColumn(node.indexedColumn));

  if (node.nulls !== null) {
    t.push(..._('NULLS'));
    t.push(..._(node.nulls));
  }

  return t;
};

/**
 * @param {AST.OverClause} node
 * @return {Token[]}
 */
export const OverClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('OVER'));

  if (node.over.type === '_Identifier') {
    t.push(..._Identifier(node.over));
  } else {
    t.push(...WindowDefn(node.over));
  }

  return t;
};

/**
 * @param {AST.PragmaStmt} node
 * @return {Token[]}
 */
export const PragmaStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('PRAGMA'));
  t.push(...__PathLike(node.path));

  if (node.right !== null) {
    if (node.right.type === '_PragmaSetter') {
      t.push(..._PragmaSetter(node.right));
    } else {
      t.push(..._PragmaGetter(node.right));
    }
  }

  return t;
};

/**
 * @param {AST.PragmaValue} node
 * @return {Token[]}
 */
export const PragmaValue = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.value.type === '_KeywordLiteral') {
    t.push(..._KeywordLiteral(node.value));
  } else {
    t.push(..._NumericLiteral(node.value));
  }

  return t;
};

/**
 * @param {AST.QualifiedTableName} node
 * @return {Token[]}
 */
export const QualifiedTableName = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...__PathLike(node.path));

  if (node.alias !== null) {
    t.push(..._('AS'));
    t.push(..._Identifier(node.alias));
  }

  if (node.indexedBy === false) {
    t.push(..._('NOT INDEXED'));
  } else if (node.indexedBy !== null) {
    t.push(..._('INDEXED BY'));
    t.push(..._Identifier(node.indexedBy));
  }

  return t;
};

/**
 * @param {AST.RaiseFunction} node
 * @return {Token[]}
 */
export const RaiseFunction = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('RAISE'));
  t.push(Tokens.Punctuator('('));

  if (node.onError === null) {
    t.push(..._('IGNORE'));
  } else {
    t.push(..._(node.onError[0]));
    t.push(Tokens.Punctuator(','));
    t.push(..._StringLiteral(node.onError[1]));
  }

  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST.RecursiveCte} node
 * @return {Token[]}
 */
export const RecursiveCte = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...CteTableName(node.cteTableName));
  t.push(..._('AS'));
  t.push(Tokens.Punctuator('('));
  t.push(..._Identifier(node.initialSelect));
  t.push(..._('UNION'));

  if (node.all) {
    t.push(..._('ALL'));
  }

  t.push(..._Identifier(node.recursiveSelect));
  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST.ReindexStmt} node
 * @return {Token[]}
 */
export const ReindexStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('REINDEX'));

  if (node.target !== null) {
    t.push(...__PathLike(node.target));
  }

  return t;
};

/**
 * @param {AST.ReleaseStmt} node
 * @return {Token[]}
 */
export const ReleaseStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('RELEASE'));
  t.push(..._Identifier(node.savepointName));

  return t;
};

/**
 * @param {AST.ResultColumn} node
 * @return {Token[]}
 */
export const ResultColumn = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.source.type === '_ColumnAliasClause') {
    t.push(..._ColumnAliasClause(node.source));
  } else if (node.source.type === '_AllColumnsClause') {
    t.push(..._AllColumnsClause(node.source));
  } else {
    t.push(...Expr(node.source));
  }

  return t;
};

/**
 * @param {AST.RollbackStmt} node
 * @return {Token[]}
 */
export const RollbackStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('ROLLBACK'));

  if (node.savepointName !== null) {
    t.push(..._('TO'));
    t.push(..._Identifier(node.savepointName));
  }

  return t;
};

/**
 * @param {AST.SavepointStmt} node
 * @return {Token[]}
 */
export const SavepointStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('SAVEPOINT'));
  t.push(..._Identifier(node.savepointName));

  return t;
};

/**
 * @param {AST.SelectCore} node
 * @return {Token[]}
 */
export const SelectCore = (node) => {
  return node.type === '_SelectClause'
    ? _SelectClause(node)
    : _ValuesClause(node);
};

/**
 * @param {AST.SelectStmt} node
 * @return {Token[]}
 */
export const SelectStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.withClause !== null) {
    t.push(...WithClause(node.withClause));
  }

  t.push(...SelectCore(node.select[0]));

  for (let i = 1; i < node.select.length; i++) {
    t.push(..._SelectCompound(/** @type {AST._SelectCompound} */ (node.select[i])));
  }

  if (node.limiter !== null) {
    t.push(..._LimiterClause(node.limiter));
  }

  return t;
};

/**
 * @param {AST.SimpleFunctionInvocation} node
 * @return {Token[]}
 */
export const SimpleFunctionInvocation = (node) => {
  return __FunctionInvocation(node);
};

/**
 * @param {AST.SimpleSelectStmt} node
 * @return {Token[]}
 */
export const SimpleSelectStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.withClause !== null) {
    t.push(...WithClause(node.withClause));
  }

  t.push(...SelectCore(node.select));

  if (node.limiter !== null) {
    t.push(..._LimiterClause(node.limiter));
  }

  return t;
};

/**
 * @param {AST.SqlStmt} node
 * @return {Token[]}
 */
export const SqlStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('EXPLAIN'));
  t.push(..._Stmt(node.statement));

  return t;
};

/**
 * @param {AST.SqlStmtList} node
 * @return {Token[]}
 */
export const SqlStmtList = (node) => {
  /** @type {Token[]} */
  const t = [];

  for (let i = 0; i < node.statements.length; i++) {
    if (i > 0) {
      t.push(Tokens.Punctuator(';'));
    }

    const stmt = node.statements[i];

    if (stmt.type === 'SqlStmt') {
      t.push(...SqlStmt(stmt));
    } else {
      t.push(..._Stmt(stmt));
    }
  }

  return t;
};

/**
 * @param {AST.TableConstraint} node
 * @return {Token[]}
 */
export const TableConstraint = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.name !== null) {
    t.push(..._('CONSTRAINT'));
    t.push(..._Identifier(node.name));
  }

  switch (node.constraint.type) {
    case '_PrimaryKeyConstraint':
      t.push(..._PrimaryKeyConstraint(node.constraint));
      break;
    case '_UniqueConstraint':
      t.push(..._UniqueConstraint(node.constraint));
      break;
    case '_CheckConstraint':
      t.push(..._CheckConstraint(node.constraint));
      break;
    case '_ForeignKeyConstraint':
      t.push(..._ForeignKeyConstraint(node.constraint));
      break;
    default:
      throw new TypeError(`Unexpected node type: ${/** @type {any} */ (node).type}`);
  }

  return t;
};

/**
 * @param {AST.TableOrSubquery} node
 * @return {Token[]}
 */
export const TableOrSubquery = (node) => {
  switch (node.type) {
    case 'QualifiedTableName':
      return QualifiedTableName(node);
    case '_TableCallClause':
      return _TableCallClause(node);
    case '_TableSelectClause':
      return _TableSelectClause(node);
    case '_TableQueryClause':
      return _TableQueryClause(node);
    default:
      throw new TypeError(`Unexpected node type: ${/** @type {any} */ (node).type}`);
  }
};

/**
 * @param {AST.TypeName} node
 * @return {Token[]}
 */
export const TypeName = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...__List(node.names, _, ''));

  if (node.args[0] !== undefined) {
    t.push(Tokens.Punctuator('('));
    t.push(..._NumericLiteral(node.args[0]));

    if (node.args[1] !== undefined) {
      t.push(Tokens.Punctuator(','));
      t.push(..._NumericLiteral(node.args[1]));
    }

    t.push(Tokens.Punctuator(')'));
  }

  return t;
};

/**
 * @param {AST.UpdateStmt} node
 * @return {Token[]}
 */
export const UpdateStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.withClause !== null) {
    t.push(...WithClause(node.withClause));
  }

  t.push(..._('UPDATE'));

  if (node.alternate !== null) {
    t.push(..._('OR'));
    t.push(..._(node.alternate));
  }

  t.push(...QualifiedTableName(node.name));
  t.push(...__List(node.set, _SetClause));

  if (node.from !== null) {
    t.push(..._('FROM'));

    if (Array.isArray(node.from)) {
      t.push(...__List(node.from, TableOrSubquery));
    } else {
      t.push(...JoinClause(node.from));
    }
  }

  if (node.where !== null) {
    t.push(..._WhereClause(node.where));
  }

  return t;
};

/**
 * @param {AST.UpsertClause} node
 * @return {Token[]}
 */
export const UpsertClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('ON CONFLICT'));

  if (node.onConflict !== null) {
    t.push(..._ColumnSelectorClause(node.onConflict));
  }

  t.push(..._('DO'));

  if (node.action === null) {
    t.push(..._('NOTHING'));
  } else {
    t.push(..._UpdateSetClause(node.action));
  }

  return t;
};

/**
 * @param {AST.VacuumStmt} node
 * @return {Token[]}
 */
export const VacuumStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('VACUUM'));

  if (node.schemaName !== null) {
    t.push(..._Identifier(node.schemaName));
  }

  if (node.filename !== null) {
    t.push(..._('INTO'));
    t.push(..._Identifier(node.filename));
  }

  return t;
};

/**
 * @param {AST.WindowDefn} node
 * @return {Token[]}
 */
export const WindowDefn = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(Tokens.Punctuator('('));

  if (node.baseWindowName !== null) {
    t.push(..._Identifier(node.baseWindowName));
  }

  if (node.partitionBy.length > 0) {
    t.push(..._('PARTITION BY'));
    t.push(...__List(node.partitionBy, Expr));
  }

  if (node.orderBy.length > 0) {
    t.push(..._('ORDER BY'));
    t.push(...__List(node.orderBy, OrderingTerm));
  }

  if (node.frameSpec !== null) {
    t.push(...FrameSpec(node.frameSpec));
  }

  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST.WindowFunctionInvocation} node
 * @return {Token[]}
 */
export const WindowFunctionInvocation = (node) => {
  return __FunctionInvocation(node);
};

/**
 * @param {AST.WithClause} node
 * @return {Token[]}
 */
export const WithClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('WITH'));

  if (node.recursive) {
    t.push(..._('RECURSIVE'));
  }

  t.push(...__List(node.expressions, CommonTableExpression));

  return t;
};

/**
 * @param {AST._Node} node
 * @return {Token[]}
 */
export const tokenize = (node) => {
  switch (node.type) {
    case '_AddClause':
      return _AddClause(node);
    case '_Args':
      return _Args(node);
    case '_AsClause':
      return _AsClause(node);
    case '_BetweenExpression':
      return _BetweenExpression(node);
    case '_BinaryExpression':
      return _BinaryExpression(node);
    case '_BinaryKeywordExpression':
      return _BinaryKeywordExpression(node);
    case '_BlobLiteral':
      return _BlobLiteral(node);
    case '_CaseExpression':
      return _CaseExpression(node);
    case '_CaseClause':
      return _CaseClause(node);
    case '_CastExpression':
      return _CastExpression(node);
    case '_CheckClause':
      return _CheckClause(node);
    case '_CheckConstraint':
      return _CheckConstraint(node);
    case '_CollateClause':
      return _CollateClause(node);
    case '_CollateExpression':
      return _CollateExpression(node);
    case '_ColumnAliasClause':
      return _ColumnAliasClause(node);
    case '_ColumnSelectorClause':
      return _ColumnSelectorClause(node);
    case '_DefaultClause':
      return _DefaultClause(node);
    case '_DeferrableClause':
      return _DeferrableClause(node);
    case '_ExistsExpression':
      return _ExistsExpression(node);
    case '_ForeignKeyConstraint':
      return _ForeignKeyConstraint(node);
    case '_FrameSpecBetweenClause':
      return _FrameSpecBetweenClause(node);
    case '_FrameSpecExprClause':
      return _FrameSpecExprClause(node);
    case '_FunctionInvocation':
      return _FunctionInvocation(node);
    case '_GroupByClause':
      return _GroupByClause(node);
    case '_Identifier':
      return _Identifier(node);
    case '_InExpression':
      return _InExpression(node);
    case '_InsertSelectClause':
      return _InsertSelectClause(node);
    case '_InsertValuesClause':
      return _InsertValuesClause(node);
    case '_IsExpression':
      return _IsExpression(node);
    case '_JoinCompound':
      return _JoinCompound(node);
    case '_JoinOnClause':
      return _JoinOnClause(node);
    case '_JoinUsingClause':
      return _JoinUsingClause(node);
    case '_KeywordLiteral':
      return _KeywordLiteral(node);
    case '_LimitClause':
      return _LimitClause(node);
    case '_LimiterClause':
      return _LimiterClause(node);
    case '_LimitTailClause':
      return _LimitTailClause(node);
    case '_MatchClause':
      return _MatchClause(node);
    case '_NotNullClause':
      return _NotNullClause(node);
    case '_NullComparisonExpression':
      return _NullComparisonExpression(node);
    case '_NumericLiteral':
      return _NumericLiteral(node);
    case '_OnClause':
      return _OnClause(node);
    case '_Path':
      return _Path(node);
    case '_PragmaGetter':
      return _PragmaGetter(node);
    case '_PragmaSetter':
      return _PragmaSetter(node);
    case '_PrimaryKeyClause':
      return _PrimaryKeyClause(node);
    case '_PrimaryKeyConstraint':
      return _PrimaryKeyConstraint(node);
    case '_QualifiedPath':
      return _QualifiedPath(node);
    case '_RenameClause':
      return _RenameClause(node);
    case '_SelectClause':
      return _SelectClause(node);
    case '_SelectCompound':
      return _SelectCompound(node);
    case '_SelectorClause':
      return _SelectorClause(node);
    case '_SequenceExpression':
      return _SequenceExpression(node);
    case '_SetClause':
      return _SetClause(node);
    case '_StringLiteral':
      return _StringLiteral(node);
    case '_TableCallClause':
      return _TableCallClause(node);
    case '_TableDef':
      return _TableDef(node);
    case '_TableQueryClause':
      return _TableQueryClause(node);
    case '_TableSelectClause':
      return _TableSelectClause(node);
    case '_TableSelectorClause':
      return _TableSelectorClause(node);
    case '_UnaryExpression':
      return _UnaryExpression(node);
    case '_UniqueClause':
      return _UniqueClause(node);
    case '_UniqueConstraint':
      return _UniqueConstraint(node);
    case '_UpdateSetClause':
      return _UpdateSetClause(node);
    case '_ValueClause':
      return _ValueClause(node);
    case '_ValuesClause':
      return _ValuesClause(node);
    case '_WhereClause':
      return _WhereClause(node);
    case '_WindowAsClause':
      return _WindowAsClause(node);
    case 'AggregateFunctionInvocation':
      return AggregateFunctionInvocation(node);
    case 'AlterTableStmt':
      return AlterTableStmt(node);
    case 'AnalyzeStmt':
      return AnalyzeStmt(node);
    case 'AttachStmt':
      return AttachStmt(node);
    case 'BeginStmt':
      return BeginStmt(node);
    case 'ColumnConstraint':
      return ColumnConstraint(node);
    case 'ColumnDef':
      return ColumnDef(node);
    case 'ColumnNameList':
      return ColumnNameList(node);
    case 'CommitStmt':
      return CommitStmt();
    case 'CommonTableExpression':
      return CommonTableExpression(node);
    case 'ConflictClause':
      return ConflictClause(node);
    case 'CreateIndexStmt':
      return CreateIndexStmt(node);
    case 'CreateTableStmt':
      return CreateTableStmt(node);
    case 'CreateTriggerStmt':
      return CreateTriggerStmt(node);
    case 'CreateViewStmt':
      return CreateViewStmt(node);
    case 'CreateVirtualTableStmt':
      return CreateVirtualTableStmt(node);
    case 'CteTableName':
      return CteTableName(node);
    case 'DeleteStmt':
      return DeleteStmt(node);
    case 'DetachStmt':
      return DetachStmt(node);
    case 'DropIndexStmt':
      return DropIndexStmt(node);
    case 'DropTableStmt':
      return DropTableStmt(node);
    case 'DropTriggerStmt':
      return DropTriggerStmt(node);
    case 'DropViewStmt':
      return DropViewStmt(node);
    case 'FactoredSelectStmt':
      return FactoredSelectStmt(node);
    case 'FilterClause':
      return FilterClause(node);
    case 'ForeignKeyClause':
      return ForeignKeyClause(node);
    case 'FrameSpec':
      return FrameSpec(node);
    case 'IndexedColumn':
      return IndexedColumn(node);
    case 'InsertStmt':
      return InsertStmt(node);
    case 'JoinClause':
      return JoinClause(node);
    case 'JoinConstraint':
      return JoinConstraint(node);
    case 'OrderingTerm':
      return OrderingTerm(node);
    case 'OverClause':
      return OverClause(node);
    case 'PragmaStmt':
      return PragmaStmt(node);
    case 'PragmaValue':
      return PragmaValue(node);
    case 'QualifiedTableName':
      return QualifiedTableName(node);
    case 'RaiseFunction':
      return RaiseFunction(node);
    case 'RecursiveCte':
      return RecursiveCte(node);
    case 'ReindexStmt':
      return ReindexStmt(node);
    case 'ReleaseStmt':
      return ReleaseStmt(node);
    case 'ResultColumn':
      return ResultColumn(node);
    case 'RollbackStmt':
      return RollbackStmt(node);
    case 'SavepointStmt':
      return SavepointStmt(node);
    case 'SelectStmt':
      return SelectStmt(node);
    case 'SimpleFunctionInvocation':
      return SimpleFunctionInvocation(node);
    case 'SimpleSelectStmt':
      return SimpleSelectStmt(node);
    case 'SqlStmt':
      return SqlStmt(node);
    case 'SqlStmtList':
      return SqlStmtList(node);
    case 'TableConstraint':
      return TableConstraint(node);
    case 'TypeName':
      return TypeName(node);
    case 'UpdateStmt':
      return UpdateStmt(node);
    case 'UpsertClause':
      return UpsertClause(node);
    case 'VacuumStmt':
      return VacuumStmt(node);
    case 'WindowDefn':
      return WindowDefn(node);
    case 'WindowFunctionInvocation':
      return WindowFunctionInvocation(node);
    case 'WithClause':
      return WithClause(node);
    default:
      return Expr(node);
  }
};
