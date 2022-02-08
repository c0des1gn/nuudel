import { useRouter } from 'next/router';
import { QueryParamKeys, defaultNumberOfTableRows } from '../constants';
import {
  ConditionArg,
  ProductOrderByInput,
  CoreInput,
} from '../../graphql/generated/graphql-global-types';

export type TableOrderBy = ProductOrderByInput | CoreInput;

// Converts a union type to an intersectino type: https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
type UnionToIntersection<U> = (U extends any
? (k: U) => void
: never) extends (k: infer I) => void
  ? I
  : never;

export type SortByQueryParamKeys = keyof UnionToIntersection<TableOrderBy>;

export type PaginationQuery = {
  page: number;
  pageSize: number;
  orderBy: SortByQueryParamKeys;
  condition: string; //ConditionArg[]
  seller: string;
};

/**
 * Hook to be used to manage pagination related URL queries
 */
export const usePaginationQuery = ({
  page: defaultPage = 1,
  pageSize: defaultPageSize = defaultNumberOfTableRows,
  orderBy: defaultOrderBy = '',
  condition: defaultCondition = '',
  seller: defaultSeller = '',
}: Partial<PaginationQuery>): PaginationQuery & {
  setQuery: ({
    page,
    pageSize,
    orderBy,
    condition,
    seller,
  }: Partial<PaginationQuery>) => void;
} => {
  const router = useRouter();
  const page =
    parseInt(router.query[QueryParamKeys.PAGE] as string, 10) || defaultPage;

  const pageSize =
    parseInt(router.query[QueryParamKeys.PAGE_SIZE] as string, 10) ||
    defaultPageSize;
  const orderBy =
    (router.query[QueryParamKeys.ORDER_BY] as SortByQueryParamKeys) ||
    defaultOrderBy;

  const condition =
    (router.query[QueryParamKeys.CONDITION] as string) || defaultCondition;

  const seller =
    (router.query[QueryParamKeys.SELLER] as string) || defaultSeller;

  const setQuery = (newQuery: Partial<PaginationQuery>): void => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        ...newQuery,
      },
    });
  };

  return {
    page,
    pageSize,
    orderBy,
    condition,
    seller,
    setQuery,
  };
};
