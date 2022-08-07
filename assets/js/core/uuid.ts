/**
 *
 * Wrapper on UUID library
 *
 **/

import { v4 as uuidv4 } from "uuid";

let uuid = (): string => {
  return uuidv4().toString();
};

export default uuid;
