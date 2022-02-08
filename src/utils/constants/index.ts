export enum QueryParamKeys {
  PAGE = 'page',
  ORDER_BY = 'orderBy',
  CONDITION = 'condition',
  SELLER = 'seller',
  PAGE_SIZE = 'pageSize',
}

export enum pageSizes {
  level1 = '10',
  level2 = '50',
  level3 = '100',
  level4 = '200',
}

export const pageSizesArray: {
  key: string;
  value: string;
}[] = Object.entries(pageSizes).map(([key, value]) => ({ key, value }));

export const defaultNumberOfTableRows = parseInt(pageSizes.level1, 10);
