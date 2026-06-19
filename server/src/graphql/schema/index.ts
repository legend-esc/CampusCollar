import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import gql from 'graphql-tag';

const __dirname = dirname(fileURLToPath(import.meta.url));

const userSchema = readFileSync(join(__dirname, 'user.graphql'), 'utf-8');
const jobSchema = readFileSync(join(__dirname, 'job.graphql'), 'utf-8');
const paymentSchema = readFileSync(join(__dirname, 'payment.graphql'), 'utf-8');
const badgeSchema = readFileSync(join(__dirname, 'badge.graphql'), 'utf-8');

export const typeDefs = gql`
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
  ${userSchema}
  ${jobSchema}
  ${paymentSchema}
  ${badgeSchema}
`;
