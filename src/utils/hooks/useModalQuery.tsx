import {
  useRouter,
  useParams,
  usePathname,
  useSearchParams,
} from 'next/navigation';
import {stringify_params} from 'nuudel-utils';
import {useCallback} from 'react';
import {QueryParamKeys} from '../constants';

/**
 * Hook to be used for modals that need a query to persist in the URL
 */
export const useModalQuery = (
  query: QueryParamKeys,
  id?: string,
): {
  isOpen: boolean;
  onOpen: (options?: {
    queryToExclude?: QueryParamKeys;
    newlyCreatedId?: string;
    additionalQueries?: Partial<{
      [query in QueryParamKeys]: string;
    }>;
  }) => Promise<boolean>;
  onClose: (additionalQuery?: {[key: string]: string}) => Promise<boolean>;
} => {
  const router = useRouter(),
    pathname = usePathname(),
    searchParams = useSearchParams();
  let routerQuery: any = {};
  searchParams.forEach((value: string, key: string) => {
    routerQuery[key] = value;
  });

  const onOpen = useCallback(
    ({
      queryToExclude,
      newlyCreatedId,
      additionalQueries = {},
    }: {
      queryToExclude?: QueryParamKeys;
      newlyCreatedId?: string;
      additionalQueries?:
        | {
            [query in QueryParamKeys]: string;
          }
        | {};
    } = {}): Promise<boolean> => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {[queryToExclude ?? '']: excluded, ...existingQueries} =
        routerQuery || {};

      router.push(
        pathname +
          stringify_params(
            {
              ...existingQueries,
              ...additionalQueries,
              [query]: id ?? newlyCreatedId ?? true,
            },
            '?',
          ),
      );
      return Promise.resolve(true);
    },
    [id, query, router],
  );

  const onClose = useCallback(
    (additionalQuery: {[key: string]: string} = {}): Promise<boolean> => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {[query]: queryToRemove, ...queryWithoutJob} = routerQuery;

      router.push(
        pathname +
          stringify_params(
            {
              ...queryWithoutJob,
              ...additionalQuery,
            },
            '?',
          ),
      );
      return Promise.resolve(true);
    },
    [query, router],
  );

  return {
    isOpen: id ? routerQuery[query] === id : Boolean(routerQuery[query]),
    onOpen,
    onClose,
  };
};
