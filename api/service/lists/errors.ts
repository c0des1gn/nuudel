import {
  ASTNode,
  GraphQLError,
  GraphQLFormattedError,
  Source,
  SourceLocation,
  printError,
  formatError,
} from 'graphql';

function toGraphQLError(error: ApolloError): GraphQLError {
  return new GraphQLError(
    error.message,
    error.nodes,
    error.source,
    error.positions,
    error.path,
    error.originalError,
    error.extensions,
  );
}

class ApolloError extends Error implements GraphQLError {
  public extensions: Record<string, any>;
  override readonly name!: string;
  readonly locations: ReadonlyArray<SourceLocation> | undefined;
  readonly path: ReadonlyArray<string | number> | undefined;
  readonly source: Source | undefined;
  readonly positions: ReadonlyArray<number> | undefined;
  readonly nodes: ReadonlyArray<ASTNode> | undefined;
  public originalError: Error | undefined;

  [key: string]: any;

  constructor(
    message: string,
    code?: string,
    extensions?: Record<string, any>,
  ) {
    super(message);

    // if no name provided, use the default. defineProperty ensures that it stays non-enumerable
    if (!this.name) {
      Object.defineProperty(this, 'name', {value: 'ApolloError'});
    }

    if (extensions?.extensions) {
      throw Error(
        'Pass extensions directly as the third argument of the ApolloError constructor: `new ' +
          'ApolloError(message, code, {myExt: value})`, not `new ApolloError(message, code, ' +
          '{extensions: {myExt: value}})`',
      );
    }

    this.extensions = {...extensions, code};
  }

  toJSON(): GraphQLFormattedError {
    return formatError(toGraphQLError(this));
  }

  override toString(): string {
    return printError(toGraphQLError(this));
  }

  get [Symbol.toStringTag](): string {
    return this.name;
  }
}

export class AuthenticationError extends ApolloError {
  constructor(message: string, extensions?: Record<string, any>) {
    super(message, 'UNAUTHENTICATED', extensions);

    Object.defineProperty(this, 'name', {value: 'AuthenticationError'});
  }
}

export class ValidationError extends ApolloError {
  constructor(message: string) {
    super(message, 'GRAPHQL_VALIDATION_FAILED');

    Object.defineProperty(this, 'name', {value: 'ValidationError'});
  }
}

export class ForbiddenError extends ApolloError {
  constructor(message: string, extensions?: Record<string, any>) {
    super(message, 'FORBIDDEN', extensions);

    Object.defineProperty(this, 'name', {value: 'ForbiddenError'});
  }
}

export class UserInputError extends ApolloError {
  constructor(message: string, extensions?: Record<string, any>) {
    super(message, 'BAD_USER_INPUT', extensions);

    Object.defineProperty(this, 'name', {value: 'UserInputError'});
  }
}
