import * as E from "fp-ts/lib/Either.js"
import * as O from "fp-ts/lib/Option.js"
import {
  CreateUser,
  Europe,
  FieldsNotEmpty,
  FindGender,
  FindRegion,
  firstNameIso,
  Gender,
  lastNameIso,
  NorthAmerica,
  Other,
  Region,
  User,
  UserRegistrationDto,
  ValidateAge,
  ValidateGender,
  ValidateNotGerman,
} from "./domain.js"
import { prismPositiveInteger } from "newtype-ts/lib/PositiveInteger.js"
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray.js"
import { pipe } from "fp-ts/lib/function.js"
import { sequenceT } from "fp-ts/lib/Apply.js"

type Validation = (e: UserRegistrationDto) => E.Either<NonEmptyArray<string>, UserRegistrationDto>

type Response = {
  status: number
  message: string
}

const fieldsNotEmptyV: Validation = (e) => {
  return e.firstName && e.lastName && e.age && e.sex && e.country
    ? E.right(e)
    : E.left(["Not all required fields were filled in."])
}

const validateAgeV: Validation = (e) => {
  return e.age >= 18 && e.age < 150 ? E.right(e) : E.left([`Received an invalid age of ${e.age}`])
}

const validateGenderV: Validation = (e) => {
  return e.sex === "M" || e.sex === "F" ? E.right(e) : E.left([`Received an invalid sex of ${e.sex}`])
}

const fieldsNotEmpty: FieldsNotEmpty = (e) => {
  return e.firstName && e.lastName && e.age && e.sex && e.country
    ? E.right(e)
    : E.left("Not all required fields were filled in.")
}

const validateAge: ValidateAge = (e) => {
  return e.age >= 18 && e.age < 150 ? E.right(e) : E.left(`Received an invalid age of ${e.age}`)
}

const validateGender: ValidateGender = (e) => {
  return e.sex === "M" || e.sex === "F" ? E.right(e) : E.left(`Received an invalid sex of ${e.sex}`)
}

const validateNotGerman: ValidateNotGerman = (e) => {
  return e.country !== "Germany" ? E.right(e) : E.left("We don't like your kind around here.")
}

const america: NorthAmerica = { _type: "NorthAmerica" }

const europe: Europe = { _type: "Europe" }

const other: Other = { _type: "Other" }

const countryMappings: Record<string, Region> = {
  Belgium: europe,
  Usa: america,
  Germany: europe,
  China: other,
}

const addStatus = (user: User): User => ({
  ...user,
  customerType: user.gender !== "M" ? "VIP" : "Normal",
})

const createUser: CreateUser = (firstName, lastName, age, gender, region) => ({
  firstName,
  lastName,
  age,
  gender,
  region,
})

const findRegion: FindRegion = (country) => {
  return countryMappings[country] ? O.some(countryMappings[country]) : O.none
}

const findGender: FindGender = (sex) => {
  return sex === "M" || sex === "F" ? O.some(sex) : O.none
}

const createdResponse = (message: string): Response => ({
  status: 201,
  message,
})

const badRequest = (exception: string): Response => ({
  status: 400,
  message: exception,
})

const internalServerError = (): Response => ({
  status: 500,
  message: "Failed to create",
})

const sequenceForOption = sequenceT(O.option)

function userResponse(user: UserRegistrationDto) {
  return pipe(
    user,
    (e) =>
      sequenceForOption(
        O.some(firstNameIso.wrap(e.firstName)),
        O.some(lastNameIso.wrap(e.lastName)),
        prismPositiveInteger.getOption(e.age),
        findGender(e.sex),
        findRegion(e.country),
      ),
    O.map(([firstName, lastName, age, gender, country]) => createUser(firstName, lastName, age, gender, country)),
    O.map(addStatus),
    O.map((user) => {
      console.log(`Created ${JSON.stringify(user)}. Could now save in db.`)
      return createdResponse(`Created ${JSON.stringify(user)}`)
    }),
    O.getOrElse(internalServerError),
  )
}

function flow(user: UserRegistrationDto) {
  return pipe(
    fieldsNotEmpty(user),
    E.chain(validateAge),
    E.chain(validateGender),
    E.chain(validateNotGerman),
    E.map(userResponse),
    E.getOrElse(badRequest),
  )
}
