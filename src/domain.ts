import { iso, Newtype } from "newtype-ts"
import { PositiveInteger } from "newtype-ts/lib/PositiveInteger.js"
import * as E from "fp-ts/lib/Either.js"
import * as O from "fp-ts/lib/Option.js"
import { pipe } from "fp-ts/lib/function.js"

export type FieldsNotEmpty = (e: UserRegistrationDto) => E.Either<string, UserRegistrationDto>
export type ValidateAge = FieldsNotEmpty
export type ValidateGender = FieldsNotEmpty
export type ValidateNotGerman = FieldsNotEmpty

export interface FirstName extends Newtype<{ readonly FirstName: unique symbol }, string> {}
export interface LastName extends Newtype<{ readonly LastName: unique symbol }, string> {}

export const firstNameIso = iso<FirstName>()
export const lastNameIso = iso<LastName>()

export type Gender = "M" | "F"

export type Europe = { readonly _type: "Europe" }

export type NorthAmerica = { readonly _type: "NorthAmerica" }

export type Other = { readonly _type: "Other" }

export type Region = Europe | NorthAmerica | Other

export type CustomerType = "Normal" | "VIP"

export type UserRegistrationDto = {
  firstName: string
  lastName: string
  age: number
  sex: string
  country: string
}

export type BasicUser = {
  firstName: FirstName
  lastName: LastName
  age: PositiveInteger
  gender: Gender
  region: Region
}

export type User = {
  firstName: FirstName
  lastName: LastName
  age: PositiveInteger
  gender: Gender
  region: Region
  customerType: CustomerType
}

export type CreateUser = (
  firstName: FirstName,
  lastName: LastName,
  age: PositiveInteger,
  gender: Gender,
  region: Region,
) => BasicUser

export type FindRegion = (country: string) => O.Option<Region>

export type FindGender = (sex: string) => O.Option<Gender>
