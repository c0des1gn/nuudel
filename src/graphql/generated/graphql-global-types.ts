/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum ConditionArg {
  New = 'New',
  Used = 'Used',
  OpenBox = 'OpenBox',
  Refurbished = 'Refurbished',
  Parts = 'Parts',
}

export enum User_status {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  INACTIVE = 'INACTIVE',
}

export interface ProductImageCreateWithoutProductInput {
  _id?: string | null;
  image: string;
  updatedAt?: any | null;
  createdAt?: string | null;
}

export interface ProductOrderByInput {
  ''?: string | null;
  '{}': string | null;
  'Price.value'?: string | null;
  '-Price.value'?: string | null;
  expired?: string | null;
  createdAt?: string | null;
}

export interface CoreInput {
  _id?: string | null;
  updatedAt?: any | null;
  createdAt?: string | null;
  _createdby?: string | null;
  _modifiedby?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
