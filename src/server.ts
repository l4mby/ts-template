import express from "express"
import { graphqlHTTP } from "express-graphql"
import { GQLSchema, RootQuery } from "./schema.js"

const app = express()
const port = 4000

app.use(
  "/graphql",
  graphqlHTTP({
    schema: GQLSchema,
    rootValue: RootQuery,
    graphiql: true,
  }),
)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`)
})
